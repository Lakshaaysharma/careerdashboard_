const express = require('express');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const User = require('../models/User');
const Mentor = require('../models/Mentor');
const { protect } = require('../middleware/auth');
const { validateLogin, validateSignup, validateGoogleAuth } = require('../utils/validation');
const { verifyGoogleToken, extractGoogleUserData } = require('../utils/googleAuth');

const router = express.Router();

// Helper function to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// Helper function to get redirect URL based on role
const getRedirectUrl = (role) => {
  switch (role) {
    case 'student':
      return '/dashboard/student';
    case 'teacher':
      return '/dashboard/teacher';
    case 'employer':
      return '/dashboard/employer';
    case 'mentor':
      return '/dashboard/mentor';
    default:
      return '/dashboard/student';
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', validateLogin, asyncHandler(async (req, res) => {
  const { email, password, role } = req.body;

  // Find user by email and role
  const user = await User.findOne({ 
    email: email.toLowerCase(), 
    role: role 
  }).select('+password');

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email, password, or role'
    });
  }

  // Check if user is active
  if (!user.isActive) {
    return res.status(401).json({
      success: false,
      message: 'Account is deactivated. Please contact support.'
    });
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email, password, or role'
    });
  }

  // Update login stats
  user.stats.lastLogin = new Date();
  user.stats.loginCount += 1;
  await user.save();

  // Generate token
  const token = generateToken(user._id);

  // Prepare user data (without password)
  const userData = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    profile: user.profile,
    preferences: user.preferences,
    stats: user.stats
  };

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      token,
      user: userData,
      redirectUrl: getRedirectUrl(user.role)
    }
  });
}));

// @desc    Google OAuth authentication
// @route   POST /api/auth/google
// @access  Public
router.post('/google', validateGoogleAuth, asyncHandler(async (req, res) => {
  const { idToken, role } = req.body;

  try {
    // Verify Google ID token
    const verificationResult = await verifyGoogleToken(idToken);
    
    if (!verificationResult.success) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Google token'
      });
    }

    const googleProfile = verificationResult.data;
    
    // Find or create user with specified role
    const user = await User.findOrCreateGoogleUser(googleProfile, role);

    // If user is mentor, ensure Mentor profile exists (idempotent)
    if (user.role === 'mentor') {
      const existingMentor = await Mentor.findOne({ userId: user._id });
      if (!existingMentor) {
        await Mentor.create({
          userId: user._id,
          name: user.name,
          email: user.email,
          title: 'Mentor',
          company: 'N/A',
          experience: '0 years',
          bio: 'New mentor profile',
          expertise: [],
          skills: [],
          hourlyRate: 0,
          availability: 'TBD',
          timezone: 'UTC',
          languages: ['English'],
          responseTime: '< 24 hours',
          communicationMethods: ['video']
        });
      }
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // Update login stats
    user.stats.lastLogin = new Date();
    user.stats.loginCount += 1;
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Prepare user data
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profile: user.profile,
      preferences: user.preferences,
      stats: user.stats,
      authMethod: user.authMethod
    };

    res.json({
      success: true,
      message: 'Google authentication successful',
      data: {
        token,
        user: userData,
        redirectUrl: getRedirectUrl(user.role)
      }
    });

  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Google authentication failed'
    });
  }
}));

// @desc    Register new user
// @route   POST /api/auth/signup
// @access  Public
router.post('/signup', validateSignup, asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  // Check if user already exists with same email and role
  const existingUser = await User.findOne({ 
    email: email.toLowerCase(), 
    role: role 
  });
  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: `User with this email already exists as a ${role}`
    });
  }

  // Create user
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    role
  });

  // If user is a mentor, create a basic mentor profile (idempotent behavior)
  if (role === 'mentor') {
    const existingMentor = await Mentor.findOne({ userId: user._id });
    if (!existingMentor) {
      await Mentor.create({
        userId: user._id,
        name: user.name,
        email: user.email,
        title: 'Mentor',
        company: 'N/A',
        experience: '0 years',
        bio: 'New mentor profile',
        expertise: [],
        skills: [],
        hourlyRate: 0,
        availability: 'TBD',
        timezone: 'UTC',
        languages: ['English'],
        responseTime: '< 24 hours',
        communicationMethods: ['video']
      });
    }
  }

  // If user is a student, create student profile and enroll in default courses
  if (role === 'student') {
    const Student = require('../models/Student');
    
    // Create student profile
    const student = await Student.create({
      userId: user._id,
      name: user.name,
      email: user.email,
      level: 1,
      totalPoints: 0,
      completedAssignments: 0,
      totalAssignments: 0,
      currentStreak: 0,
      weeklyGoal: 5,
      completedThisWeek: 0,
      globalRank: 0,
      classRank: 0,
      progressPercentage: 0,
      levelProgress: 0,
      attendance: 85
    });

    // Default courses for new students
    const defaultCourses = [
      {
        title: "Mathematics Fundamentals",
        instructor: "Dr. Sarah Johnson",
        price: 0,
        originalPrice: 199,
        rating: 4.8,
        students: 2500,
        duration: "8 hours",
        level: "Beginner",
        thumbnail: "📐",
        description: "Master essential mathematical concepts including algebra, geometry, and basic calculus.",
        modules: 6,
        certificate: true,
        bestseller: true,
        progress: 0,
        studentId: student._id.toString(),
        purchaseDate: new Date().toISOString()
      },
      {
        title: "Science Essentials",
        instructor: "Prof. Michael Chen",
        price: 0,
        originalPrice: 249,
        rating: 4.9,
        students: 1800,
        duration: "10 hours",
        level: "Beginner",
        thumbnail: "🔬",
        description: "Explore fundamental scientific principles in physics, chemistry, and biology.",
        modules: 8,
        certificate: true,
        popular: true,
        progress: 0,
        studentId: student._id.toString(),
        purchaseDate: new Date().toISOString()
      }
    ];

    // Store default courses in localStorage (this will be handled by the frontend)
    // For now, we'll add them to the student's courseEnrollments
    student.courseEnrollments = defaultCourses.map(course => ({
      courseId: new mongoose.Types.ObjectId(), // Generate a unique ID for each course
      enrolledAt: new Date(),
      progress: 0,
      completedModules: []
    }));

    await student.save();
  }

  // Generate token
  const token = generateToken(user._id);

  // Prepare user data (without password)
  const userData = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    profile: user.profile,
    preferences: user.preferences,
    stats: user.stats
  };

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: {
      token,
      user: userData,
      redirectUrl: getRedirectUrl(user.role)
    }
  });
}));

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
router.get('/profile', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  
  res.json({
    success: true,
    data: user
  });
}));

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, asyncHandler(async (req, res) => {
  const { name, profile, preferences } = req.body;

  const user = await User.findById(req.user._id);

  if (name) user.name = name;
  if (profile) user.profile = { ...user.profile, ...profile };
  if (preferences) user.preferences = { ...user.preferences, ...preferences };

  const updatedUser = await user.save();

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: updatedUser.getPublicProfile()
  });
}));

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', protect, asyncHandler(async (req, res) => {
  // In a real application, you might want to blacklist the token
  // For now, we'll just return a success message
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
}));

// @desc    Check if user is authenticated
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      isAuthenticated: true
    }
  });
}));

// @desc    Create demo users (for development)
// @route   POST /api/auth/create-demo-users
// @access  Public (only in development)
router.post('/create-demo-users', asyncHandler(async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      message: 'This endpoint is not available in production'
    });
  }

  try {
    // Check if demo users already exist
    const existingDemoStudent = await User.findOne({ email: 'student@demo.com' });
    const existingDemoTeacher = await User.findOne({ email: 'teacher@demo.com' });

    const createdUsers = [];

    if (!existingDemoStudent) {
      const demoStudent = await User.create({
        name: 'Demo Student',
        email: 'student@demo.com',
        password: 'demo123',
        role: 'student',
        isVerified: true
      });
      createdUsers.push(demoStudent);
    }

    if (!existingDemoTeacher) {
      const demoTeacher = await User.create({
        name: 'Demo Teacher',
        email: 'teacher@demo.com',
        password: 'demo123',
        role: 'teacher',
        isVerified: true
      });
      createdUsers.push(demoTeacher);
    }

    res.json({
      success: true,
      message: 'Demo users created successfully',
      data: {
        created: createdUsers.length,
        users: createdUsers.map(user => ({
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating demo users',
      error: error.message
    });
  }
}));

module.exports = router; 