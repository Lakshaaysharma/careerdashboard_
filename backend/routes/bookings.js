const express = require('express');
const asyncHandler = require('express-async-handler');
const { protect } = require('../middleware/auth');
const Session = require('../models/Session');
const Mentor = require('../models/Mentor');
const User = require('../models/User');
const StripeService = require('../services/stripeService');

const router = express.Router();

// @desc    Create a new session booking
// @route   POST /api/bookings
// @access  Private
router.post('/', protect, asyncHandler(async (req, res) => {
  const {
    mentorId,
    title,
    description,
    scheduledDate,
    duration,
    timezone,
    communicationMethod = 'video'
  } = req.body;

  // Validate required fields
  if (!mentorId || !title || !scheduledDate || !duration) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: mentorId, title, scheduledDate, duration'
    });
  }

  try {
    // Get mentor details
    const mentor = await Mentor.findById(mentorId);
    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: 'Mentor not found'
      });
    }

    if (!mentor.isActive || !mentor.isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Mentor is not available for booking'
      });
    }

    // Check if student is trying to book their own session
    if (mentor.userId.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot book a session with yourself'
      });
    }

    // Calculate total amount
    const hourlyRate = mentor.hourlyRate;
    const totalAmount = (duration / 60) * hourlyRate;

    // Create session record
    const session = await Session.create({
      mentor: mentorId,
      student: req.user.id,
      title,
      description,
      scheduledDate: new Date(scheduledDate),
      duration,
      timezone,
      communicationMethod,
      hourlyRate,
      totalAmount,
      currency: 'USD',
      paymentStatus: 'pending'
    });

    // Create Stripe checkout session
    const stripeResult = await StripeService.createCheckoutSession(
      totalAmount,
      'USD',
      {
        sessionId: session._id.toString(),
        mentorId: mentorId,
        studentId: req.user.id,
        sessionTitle: title,
        sessionDescription: description
      }
    );

    if (!stripeResult.success) {
      // Delete the session if Stripe fails
      await Session.findByIdAndDelete(session._id);
      return res.status(500).json({
        success: false,
        message: 'Failed to create payment session',
        error: stripeResult.error
      });
    }

    // Update session with Stripe session ID
    session.stripeSessionId = stripeResult.sessionId;
    await session.save();

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: {
        session: {
          id: session._id,
          title: session.title,
          scheduledDate: session.scheduledDate,
          duration: session.duration,
          totalAmount: session.totalAmount,
          currency: session.currency,
          status: session.status
        },
        payment: {
          sessionId: stripeResult.sessionId,
          url: stripeResult.url
        }
      }
    });
  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create booking',
      error: error.message
    });
  }
}));

// @desc    Get user's bookings
// @route   GET /api/bookings
// @access  Private
router.get('/', protect, asyncHandler(async (req, res) => {
  const { status, type = 'all' } = req.query;
  
  try {
    let sessions;
    
    if (type === 'mentor') {
      // Get sessions where user is the mentor
      const mentor = await Mentor.findOne({ userId: req.user.id });
      if (!mentor) {
        return res.status(404).json({
          success: false,
          message: 'Mentor profile not found'
        });
      }
      sessions = await Session.findByMentor(mentor._id, { status });
    } else {
      // Get sessions where user is the student
      sessions = await Session.findByStudent(req.user.id, { status });
    }

    res.json({
      success: true,
      data: {
        sessions,
        count: sessions.length
      }
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: error.message
    });
  }
}));

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
router.get('/:id', protect, asyncHandler(async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('mentor', 'name title company hourlyRate')
      .populate('student', 'name email');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user has access to this booking
    const mentor = await Mentor.findOne({ userId: req.user.id });
    const isStudent = session.student._id.toString() === req.user.id;
    const isMentor = mentor && session.mentor._id.toString() === mentor._id.toString();

    if (!isStudent && !isMentor) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking',
      error: error.message
    });
  }
}));

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private
router.put('/:id/status', protect, asyncHandler(async (req, res) => {
  const { status, notes } = req.body;

  if (!status) {
    return res.status(400).json({
      success: false,
      message: 'Status is required'
    });
  }

  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user has permission to update this booking
    const mentor = await Mentor.findOne({ userId: req.user.id });
    const isStudent = session.student.toString() === req.user.id;
    const isMentor = mentor && session.mentor.toString() === mentor._id.toString();

    if (!isStudent && !isMentor) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Update session status
    session.status = status;
    
    if (notes) {
      if (isMentor) {
        session.mentorNotes = notes;
      } else {
        session.studentNotes = notes;
      }
    }

    if (status === 'completed') {
      session.completedAt = new Date();
    } else if (status === 'cancelled') {
      session.cancelledAt = new Date();
      session.cancelledBy = req.user.id;
      
      // Calculate refund if payment was made
      if (session.paymentStatus === 'paid') {
        const refundAmount = session.calculateRefundAmount();
        if (refundAmount > 0) {
          // Create refund
          const refundResult = await StripeService.createRefund(
            session.stripePaymentIntentId,
            refundAmount
          );
          
          if (refundResult.success) {
            session.refundAmount = refundAmount;
            session.paymentStatus = refundAmount === session.totalAmount ? 'refunded' : 'partially_refunded';
          }
        }
      }
    }

    await session.save();

    res.json({
      success: true,
      message: 'Booking status updated successfully',
      data: session
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking status',
      error: error.message
    });
  }
}));

// @desc    Cancel booking
// @route   POST /api/bookings/:id/cancel
// @access  Private
router.post('/:id/cancel', protect, asyncHandler(async (req, res) => {
  const { reason } = req.body;

  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user has permission to cancel this booking
    const mentor = await Mentor.findOne({ userId: req.user.id });
    const isStudent = session.student.toString() === req.user.id;
    const isMentor = mentor && session.mentor.toString() === mentor._id.toString();

    if (!isStudent && !isMentor) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if booking can be cancelled
    if (!session.canBeCancelled()) {
      return res.status(400).json({
        success: false,
        message: 'Booking cannot be cancelled at this time'
      });
    }

    // Update session status
    session.status = 'cancelled';
    session.cancelledAt = new Date();
    session.cancelledBy = req.user.id;
    session.cancellationReason = reason;

    // Calculate refund if payment was made
    if (session.paymentStatus === 'paid') {
      const refundAmount = session.calculateRefundAmount();
      if (refundAmount > 0) {
        // Create refund
        const refundResult = await StripeService.createRefund(
          session.stripePaymentIntentId,
          refundAmount
        );
        
        if (refundResult.success) {
          session.refundAmount = refundAmount;
          session.paymentStatus = refundAmount === session.totalAmount ? 'refunded' : 'partially_refunded';
        }
      }
    }

    await session.save();

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: {
        refundAmount: session.refundAmount,
        refundStatus: session.paymentStatus
      }
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel booking',
      error: error.message
    });
  }
}));

// @desc    Webhook endpoint for Stripe events
// @route   POST /api/bookings/webhook
// @access  Public (Stripe webhook)
router.post('/webhook', express.raw({ type: 'application/json' }), asyncHandler(async (req, res) => {
  const signature = req.headers['stripe-signature'];
  
  try {
    const result = StripeService.verifyWebhookSignature(req.body, signature);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    const event = result.event;

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: error.message });
  }
}));

// Helper functions for webhook handling
async function handleCheckoutSessionCompleted(session) {
  try {
    const booking = await Session.findOne({ stripeSessionId: session.id });
    if (booking) {
      booking.paymentStatus = 'paid';
      booking.stripePaymentIntentId = session.payment_intent;
      await booking.save();
    }
  } catch (error) {
    console.error('Error handling checkout session completed:', error);
  }
}

async function handlePaymentIntentSucceeded(paymentIntent) {
  try {
    const booking = await Session.findOne({ stripePaymentIntentId: paymentIntent.id });
    if (booking) {
      booking.paymentStatus = 'paid';
      await booking.save();
    }
  } catch (error) {
    console.error('Error handling payment intent succeeded:', error);
  }
}

async function handlePaymentIntentFailed(paymentIntent) {
  try {
    const booking = await Session.findOne({ stripePaymentIntentId: paymentIntent.id });
    if (booking) {
      booking.paymentStatus = 'failed';
      await booking.save();
    }
  } catch (error) {
    console.error('Error handling payment intent failed:', error);
  }
}

module.exports = router;
