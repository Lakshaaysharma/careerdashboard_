const express = require('express');
const asyncHandler = require('express-async-handler');
const Mentor = require('../models/Mentor');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all mentors
// @route   GET /api/mentors
// @access  Public
router.get('/', asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    expertise,
    minRating,
    maxPrice,
    search,
    sortBy = 'rating'
  } = req.query;

  // Build query
  let query = { isActive: true };

  // Filter by expertise
  if (expertise) {
    query.expertise = { $in: [expertise] };
  }

  // Filter by minimum rating
  if (minRating) {
    query['stats.averageRating'] = { $gte: parseFloat(minRating) };
  }

  // Filter by maximum price
  if (maxPrice) {
    query.hourlyRate = { $lte: parseFloat(maxPrice) };
  }

  // Optional filter: only include available mentors when requested
  if (req.query.onlyAvailable === 'true') {
    query.isAvailable = true;
  }

  // Search by name, title, company, or bio
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { title: { $regex: search, $options: 'i' } },
      { company: { $regex: search, $options: 'i' } },
      { bio: { $regex: search, $options: 'i' } }
    ];
  }

  // Build sort object
  let sort = {};
  switch (sortBy) {
    case 'rating':
      sort = { 'stats.averageRating': -1, 'stats.totalSessions': -1 };
      break;
    case 'price_low':
      sort = { hourlyRate: 1 };
      break;
    case 'price_high':
      sort = { hourlyRate: -1 };
      break;
    case 'experience':
      sort = { experience: -1 };
      break;
    case 'sessions':
      sort = { 'stats.totalSessions': -1 };
      break;
    default:
      sort = { 'stats.averageRating': -1 };
  }

  // Execute query
  const pageNum = Number(page) || 1;
  const limitNum = Math.min(Number(limit) || 10, 1000);
  const mentors = await Mentor.find(query)
    .sort(sort)
    .limit(limitNum)
    .skip((pageNum - 1) * limitNum)
    .select('-reviews -verificationDocuments -socialLinks');

  const total = await Mentor.countDocuments(query);

  res.json({
    success: true,
    data: {
      mentors,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalMentors: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    }
  });
}));

// @desc    Get current mentor profile (by authenticated user)
// @route   GET /api/mentors/me
// @access  Private (Mentor only)
router.get('/me', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (user.role !== 'mentor') {
    return res.status(403).json({ success: false, message: 'Access denied. Mentor role required.' });
  }

  const mentor = await Mentor.findOne({ userId: req.user.id });
  if (!mentor) {
    return res.status(404).json({ success: false, message: 'Mentor profile not found' });
  }

  res.json({ success: true, data: mentor });
}));

// @desc    Update current mentor profile (by authenticated user)
// @route   PUT /api/mentors/me
// @access  Private (Mentor only)
router.put('/me', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (user.role !== 'mentor') {
    return res.status(403).json({ success: false, message: 'Access denied. Mentor role required.' });
  }

  const allowed = ['company', 'experience', 'bio', 'expertise', 'skills', 'hourlyRate', 'availability', 'timezone', 'languages', 'responseTime', 'communicationMethods', 'title'];
  const update = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) update[key] = req.body[key];
  }

  const mentor = await Mentor.findOneAndUpdate(
    { userId: req.user.id },
    update,
    { new: true, runValidators: true }
  );

  if (!mentor) {
    return res.status(404).json({ success: false, message: 'Mentor profile not found' });
  }

  res.json({ success: true, message: 'Mentor profile updated successfully', data: mentor });
}));

// @desc    Get single mentor
// @route   GET /api/mentors/:id
// @access  Public
router.get('/:id', asyncHandler(async (req, res) => {
  const mentor = await Mentor.findOne({ 
    _id: req.params.id, 
    isActive: true 
  }).populate('reviews.studentId', 'name email');

  if (!mentor) {
    return res.status(404).json({
      success: false,
      message: 'Mentor not found'
    });
  }

  res.json({
    success: true,
    data: mentor
  });
}));

// @desc    Create mentor profile
// @route   POST /api/mentors
// @access  Private (Mentor only)
router.post('/', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  
  if (user.role !== 'mentor') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Mentor role required.'
    });
  }

  // Check if mentor profile already exists
  const existingMentor = await Mentor.findOne({ userId: req.user.id });
  if (existingMentor) {
    return res.status(400).json({
      success: false,
      message: 'Mentor profile already exists'
    });
  }

  const mentorData = {
    userId: req.user.id,
    name: user.name,
    email: user.email,
    ...req.body
  };

  const mentor = await Mentor.create(mentorData);

  res.status(201).json({
    success: true,
    message: 'Mentor profile created successfully',
    data: mentor
  });
}));

// @desc    Update mentor profile
// @route  PUT /api/mentors/:id
// @access  Private (Mentor only)
router.put('/:id', protect, asyncHandler(async (req, res) => {
  const mentor = await Mentor.findById(req.params.id);

  if (!mentor) {
    return res.status(404).json({
      success: false,
      message: 'Mentor profile not found'
    });
  }

  // Check if user owns this mentor profile
  if (mentor.userId.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only update your own profile.'
    });
  }

  const updatedMentor = await Mentor.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    message: 'Mentor profile updated successfully',
    data: updatedMentor
  });
}));

// @desc    Delete mentor profile
// @route   DELETE /api/mentors/:id
// @access  Private (Mentor only)
router.delete('/:id', protect, asyncHandler(async (req, res) => {
  const mentor = await Mentor.findById(req.params.id);

  if (!mentor) {
    return res.status(404).json({
      success: false,
      message: 'Mentor profile not found'
    });
  }

  // Check if user owns this mentor profile
  if (mentor.userId.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only delete your own profile.'
    });
  }

  await Mentor.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Mentor profile deleted successfully'
  });
}));

// @desc    Get mentor's reviews
// @route   GET /api/mentors/:id/reviews
// @access  Public
router.get('/:id/reviews', asyncHandler(async (req, res) => {
  const mentor = await Mentor.findById(req.params.id)
    .populate('reviews.studentId', 'name email')
    .select('reviews');

  if (!mentor) {
    return res.status(404).json({
      success: false,
      message: 'Mentor not found'
    });
  }

  res.json({
    success: true,
    data: mentor.reviews
  });
}));

// @desc    Add review to mentor
// @route   POST /api/mentors/:id/reviews
// @access  Private (Student only)
router.post('/:id/reviews', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  
  if (user.role !== 'student') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Student role required.'
    });
  }

  const mentor = await Mentor.findById(req.params.id);

  if (!mentor) {
    return res.status(404).json({
      success: false,
      message: 'Mentor not found'
    });
  }

  const reviewData = {
    studentId: req.user.id,
    ...req.body
  };

  await mentor.addReview(reviewData);

  res.status(201).json({
    success: true,
    message: 'Review added successfully',
    data: mentor.reviews[mentor.reviews.length - 1]
  });
}));

// @desc    Get mentor dashboard stats
// @route   GET /api/mentors/dashboard/stats
// @access  Private (Mentor only)
router.get('/dashboard/stats', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  
  if (user.role !== 'mentor') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Mentor role required.'
    });
  }

  const mentor = await Mentor.findOne({ userId: req.user.id });

  if (!mentor) {
    return res.status(404).json({
      success: false,
      message: 'Mentor profile not found'
    });
  }

  // Calculate additional stats
  const stats = {
    ...mentor.stats,
    totalReviews: mentor.reviews.length,
    responseRate: mentor.stats.responseRate,
    profileCompletion: calculateProfileCompletion(mentor)
  };

  res.json({
    success: true,
    data: stats
  });
}));

// Helper function to calculate profile completion percentage
function calculateProfileCompletion(mentor) {
  const fields = [
    'title', 'company', 'experience', 'bio', 'expertise', 'skills',
    'hourlyRate', 'availability', 'timezone', 'languages', 'responseTime'
  ];
  
  let completedFields = 0;
  fields.forEach(field => {
    if (mentor[field] && (Array.isArray(mentor[field]) ? mentor[field].length > 0 : mentor[field])) {
      completedFields++;
    }
  });
  
  return Math.round((completedFields / fields.length) * 100);
}

module.exports = router;
