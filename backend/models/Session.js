const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  // Session participants
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mentor',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Session details
  title: {
    type: String,
    required: [true, 'Session title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  
  // Scheduling
  scheduledDate: {
    type: Date,
    required: [true, 'Scheduled date is required']
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [15, 'Minimum duration is 15 minutes'],
    max: [480, 'Maximum duration is 8 hours']
  },
  timezone: {
    type: String,
    required: [true, 'Timezone is required'],
    trim: true
  },
  
  // Communication method
  communicationMethod: {
    type: String,
    enum: ['video', 'phone', 'chat', 'email'],
    default: 'video'
  },
  meetingLink: {
    type: String,
    trim: true
  },
  
  // Pricing and payment
  hourlyRate: {
    type: Number,
    required: [true, 'Hourly rate is required'],
    min: [0, 'Hourly rate cannot be negative']
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'INR']
  },
  
  // Payment information
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
    default: 'pending'
  },
  paymentId: {
    type: String,
    trim: true
  },
  paymentMethod: {
    type: String,
    trim: true
  },
  stripePaymentIntentId: {
    type: String,
    trim: true
  },
  stripeSessionId: {
    type: String,
    trim: true
  },
  
  // Session status
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'],
    default: 'scheduled'
  },
  
  // Cancellation
  cancelledAt: {
    type: Date
  },
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cancellationReason: {
    type: String,
    trim: true,
    maxlength: [500, 'Cancellation reason cannot exceed 500 characters']
  },
  refundAmount: {
    type: Number,
    default: 0,
    min: [0, 'Refund amount cannot be negative']
  },
  
  // Session completion
  completedAt: {
    type: Date
  },
  mentorNotes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Mentor notes cannot exceed 1000 characters']
  },
  studentNotes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Student notes cannot exceed 1000 characters']
  },
  
  // Rating and feedback
  mentorRating: {
    type: Number,
    min: 1,
    max: 5
  },
  studentRating: {
    type: Number,
    min: 1,
    max: 5
  },
  mentorFeedback: {
    type: String,
    trim: true,
    maxlength: [500, 'Mentor feedback cannot exceed 500 characters']
  },
  studentFeedback: {
    type: String,
    trim: true,
    maxlength: [500, 'Student feedback cannot exceed 500 characters']
  },
  
  // Reminders and notifications
  remindersSent: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'push'],
      required: true
    },
    sentAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'failed'],
      default: 'sent'
    }
  }],
  
  // Metadata
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
sessionSchema.index({ mentor: 1, scheduledDate: 1 });
sessionSchema.index({ student: 1, scheduledDate: 1 });
sessionSchema.index({ status: 1, scheduledDate: 1 });
sessionSchema.index({ paymentStatus: 1 });
sessionSchema.index({ stripePaymentIntentId: 1 });
sessionSchema.index({ stripeSessionId: 1 });

// Virtual for session duration in hours
sessionSchema.virtual('durationHours').get(function() {
  return this.duration / 60;
});

// Virtual for formatted scheduled date
sessionSchema.virtual('formattedScheduledDate').get(function() {
  return this.scheduledDate.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: this.timezone
  });
});

// Virtual for session status color
sessionSchema.virtual('statusColor').get(function() {
  const colors = {
    scheduled: 'blue',
    confirmed: 'green',
    in_progress: 'purple',
    completed: 'green',
    cancelled: 'red',
    no_show: 'orange'
  };
  return colors[this.status] || 'gray';
});

// Instance method to check if session can be cancelled
sessionSchema.methods.canBeCancelled = function() {
  const now = new Date();
  const sessionTime = new Date(this.scheduledDate);
  const hoursUntilSession = (sessionTime - now) / (1000 * 60 * 60);
  
  // Can be cancelled if more than 24 hours before session
  return hoursUntilSession > 24 && ['scheduled', 'confirmed'].includes(this.status);
};

// Instance method to check if session can be rescheduled
sessionSchema.methods.canBeRescheduled = function() {
  const now = new Date();
  const sessionTime = new Date(this.scheduledDate);
  const hoursUntilSession = (sessionTime - now) / (1000 * 60 * 60);
  
  // Can be rescheduled if more than 2 hours before session
  return hoursUntilSession > 2 && ['scheduled', 'confirmed'].includes(this.status);
};

// Instance method to calculate refund amount
sessionSchema.methods.calculateRefundAmount = function() {
  if (this.paymentStatus !== 'paid') return 0;
  
  const now = new Date();
  const sessionTime = new Date(this.scheduledDate);
  const hoursUntilSession = (sessionTime - now) / (1000 * 60 * 60);
  
  // Full refund if cancelled more than 24 hours before
  if (hoursUntilSession > 24) {
    return this.totalAmount;
  }
  
  // 50% refund if cancelled between 2-24 hours before
  if (hoursUntilSession > 2) {
    return this.totalAmount * 0.5;
  }
  
  // No refund if cancelled less than 2 hours before
  return 0;
};

// Static method to find sessions by mentor
sessionSchema.statics.findByMentor = function(mentorId, options = {}) {
  const query = { mentor: mentorId };
  
  if (options.status) {
    query.status = options.status;
  }
  
  if (options.startDate && options.endDate) {
    query.scheduledDate = {
      $gte: new Date(options.startDate),
      $lte: new Date(options.endDate)
    };
  }
  
  return this.find(query)
    .populate('student', 'name email')
    .sort({ scheduledDate: -1 });
};

// Static method to find sessions by student
sessionSchema.statics.findByStudent = function(studentId, options = {}) {
  const query = { student: studentId };
  
  if (options.status) {
    query.status = options.status;
  }
  
  if (options.startDate && options.endDate) {
    query.scheduledDate = {
      $gte: new Date(options.startDate),
      $lte: new Date(options.endDate)
    };
  }
  
  return this.find(query)
    .populate('mentor', 'name title company hourlyRate')
    .sort({ scheduledDate: -1 });
};

// Static method to get session statistics
sessionSchema.statics.getStats = function(mentorId) {
  return this.aggregate([
    { $match: { mentor: new mongoose.Types.ObjectId(mentorId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalRevenue: { $sum: '$totalAmount' }
      }
    }
  ]);
};

// Pre-save middleware to calculate total amount
sessionSchema.pre('save', function(next) {
  if (this.isModified('duration') || this.isModified('hourlyRate')) {
    this.totalAmount = (this.duration / 60) * this.hourlyRate;
  }
  next();
});

module.exports = mongoose.model('Session', sessionSchema);
