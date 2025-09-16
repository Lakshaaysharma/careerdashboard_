 const express = require('express');
const asyncHandler = require('express-async-handler');
const { protect } = require('../middleware/auth');
const TeacherProfile = require('../models/TeacherProfile');
const Course = require('../models/Course');
const User = require('../models/User');

const router = express.Router();

// @desc    Get teacher profile
// @route   GET /api/teacher-profiles/profile
// @access  Private
router.get('/profile', protect, asyncHandler(async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only teachers can access this endpoint.'
      });
    }

    let profile = await TeacherProfile.findOrCreateProfile(req.user._id);
    const stats = profile.getProfileStats();

    // Fetch actual Course data with hierarchy information
    const actualCourses = await Course.find({ 
      teacherId: req.user._id 
    }).select('title description subject hierarchy pricing modules isActive createdAt');

    res.json({
      success: true,
      data: {
        profile: {
          instituteName: profile.instituteName,
          className: profile.className,
          subjects: profile.subjects,
          section: profile.section,
          courses: actualCourses, // Use actual Course data instead of simplified profile courses
          batchYear: profile.batchYear,
          isProfileComplete: profile.isProfileComplete,
          profileCompletedAt: profile.profileCompletedAt
        },
        stats
      }
    });
  } catch (error) {
    console.error('Get teacher profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}));

// @desc    Update teacher profile (complete hierarchy setup)
// @route   PUT /api/teacher-profiles/profile
// @access  Private
router.put('/profile', protect, asyncHandler(async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only teachers can access this endpoint.'
      });
    }

    const {
      instituteName,
      className,
      subjects,
      section,
      courses,
      batchYear
    } = req.body;

    // Validation - make fields optional but validate what's provided
    if (!instituteName || !className || !subjects || !section || !batchYear) {
      return res.status(400).json({
        success: false,
        message: 'Required fields: instituteName, className, subjects, section, batchYear'
      });
    }

    if (!Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one subject is required'
      });
    }

    // Make courses optional - allow empty array or undefined
    if (courses && !Array.isArray(courses)) {
      return res.status(400).json({
        success: false,
        message: 'Courses must be an array if provided'
      });
    }

    let profile = await TeacherProfile.findOrCreateProfile(req.user._id);

    // Update profile data
    profile.instituteName = instituteName.trim();
    profile.className = className.trim();
    profile.subjects = subjects
      .map(s => {
        if (typeof s === 'string') return s.trim();
        if (s && typeof s === 'object' && typeof s.name === 'string') return s.name.trim();
        return '';
      })
      .filter(s => s !== '');
    profile.section = section.trim();
    profile.courses = courses ? courses.map(course => ({
      name: course.name.trim(),
      description: course.description?.trim() || '',
      level: course.level || 'Beginner',
      isActive: true,
      createdAt: new Date()
    })) : []; // Only update courses if they are provided
    profile.batchYear = batchYear.trim();

    // Update completion status
    await profile.updateProfileCompletion();

    const stats = profile.getProfileStats();

    res.json({
      success: true,
      message: 'Teacher profile updated successfully',
      data: {
        profile: {
          instituteName: profile.instituteName,
          className: profile.className,
          subjects: profile.subjects,
          section: profile.section,
          courses: profile.courses,
          batchYear: profile.batchYear,
          isProfileComplete: profile.isProfileComplete,
          profileCompletedAt: profile.profileCompletedAt
        },
        stats
      }
    });
  } catch (error) {
    console.error('Update teacher profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}));

// @desc    Update specific profile field
// @route   PATCH /api/teacher-profiles/profile
// @access  Private
router.patch('/profile', protect, asyncHandler(async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only teachers can access this endpoint.'
      });
    }

    const allowedFields = ['instituteName', 'className', 'subjects', 'section', 'batchYear'];
    const updateData = {};

    // Only allow specific fields to be updated
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        if (key === 'subjects' && Array.isArray(req.body[key])) {
          updateData[key] = req.body[key].map(s => s.trim()).filter(s => s !== '');
        } else if (typeof req.body[key] === 'string') {
          updateData[key] = req.body[key].trim();
        }
      }
    });

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    let profile = await TeacherProfile.findOrCreateProfile(req.user._id);

    // Update only the provided fields
    Object.assign(profile, updateData);

    // Update completion status
    await profile.updateProfileCompletion();

    const stats = profile.getProfileStats();

    res.json({
      success: true,
      message: 'Profile field updated successfully',
      data: {
        profile: {
          instituteName: profile.instituteName,
          className: profile.className,
          subjects: profile.subjects,
          section: profile.section,
          courses: profile.courses,
          batchYear: profile.batchYear,
          isProfileComplete: profile.isProfileComplete,
          profileCompletedAt: profile.profileCompletedAt
        },
        stats
      }
    });
  } catch (error) {
    console.error('Update profile field error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}));

// @desc    Add course to teacher profile
// @route   POST /api/teacher-profiles/courses
// @access  Private
router.post('/courses', protect, asyncHandler(async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only teachers can access this endpoint.'
      });
    }

    const { name, description, level } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Course name is required'
      });
    }

    let profile = await TeacherProfile.findOrCreateProfile(req.user._id);
    const newCourse = await profile.addCourse({ name, description, level });

    res.json({
      success: true,
      message: 'Course added successfully',
      data: {
        course: newCourse,
        stats: profile.getProfileStats()
      }
    });
  } catch (error) {
    console.error('Add course error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}));

// @desc    Update course in teacher profile
// @route   PUT /api/teacher-profiles/courses/:courseId
// @access  Private
router.put('/courses/:courseId', protect, asyncHandler(async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only teachers can access this endpoint.'
      });
    }

    const { courseId } = req.params;
    const { name, description, level } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Course name is required'
      });
    }

    let profile = await TeacherProfile.findOrCreateProfile(req.user._id);
    const updatedCourse = await profile.updateCourse(courseId, { name, description, level });

    res.json({
      success: true,
      message: 'Course updated successfully',
      data: {
        course: updatedCourse,
        stats: profile.getProfileStats()
      }
    });
  } catch (error) {
    console.error('Update course error:', error);
    if (error.message === 'Course not found') {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}));

// @desc    Remove course from teacher profile
// @route   DELETE /api/teacher-profiles/courses/:courseId
// @access  Private
router.delete('/courses/:courseId', protect, asyncHandler(async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only teachers can access this endpoint.'
      });
    }

    const { courseId } = req.params;
    let profile = await TeacherProfile.findOrCreateProfile(req.user._id);
    
    await profile.removeCourse(courseId);

    res.json({
      success: true,
      message: 'Course removed successfully',
      data: {
        stats: profile.getProfileStats()
      }
    });
  } catch (error) {
    console.error('Remove course error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}));

// @desc    Get all teacher profiles (admin only)
// @route   GET /api/teacher-profiles
// @access  Private (Admin)
router.get('/', protect, asyncHandler(async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only admins can access this endpoint.'
      });
    }

    const profiles = await TeacherProfile.find()
      .populate('userId', 'name email role')
      .select('-__v');

    res.json({
      success: true,
      count: profiles.length,
      data: profiles
    });
  } catch (error) {
    console.error('Get all teacher profiles error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}));

// @desc    Get teacher profile by ID (admin only)
// @route   GET /api/teacher-profiles/:id
// @access  Private (Admin)
router.get('/:id', protect, asyncHandler(async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only admins can access this endpoint.'
      });
    }

    const profile = await TeacherProfile.findById(req.params.id)
      .populate('userId', 'name email role')
      .select('-__v');

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Teacher profile not found'
      });
    }

    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Get teacher profile by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}));

module.exports = router;
