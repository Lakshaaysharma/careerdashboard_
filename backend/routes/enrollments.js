const express = require('express');
const asyncHandler = require('express-async-handler');
const { protect } = require('../middleware/auth');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const Student = require('../models/Student');

const router = express.Router();

// @desc    Enroll student in a course
// @route   POST /api/enrollments/enroll
// @access  Private
router.post('/enroll', protect, asyncHandler(async (req, res) => {
  const { courseId, paymentInfo } = req.body;

  // Ensure user is a student
  if (req.user.role !== 'student') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only students can enroll in courses.'
    });
  }

  try {
    // Find or create student record
    const student = await Student.findOrCreateStudent(req.user._id);
    
    // Enroll student in course
    const enrollment = await Enrollment.enrollStudent(student._id, courseId, paymentInfo);
    
    // Populate course details
    await enrollment.populate('courseId', 'title instructor pricing');
    
    res.status(201).json({
      success: true,
      message: 'Successfully enrolled in course',
      data: {
        enrollment: {
          id: enrollment._id,
          status: enrollment.status,
          progress: enrollment.progress,
          enrolledAt: enrollment.enrolledAt,
          course: enrollment.courseId
        }
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}));

// @desc    Auto-enroll students in a specific course based on hierarchy
// @route   POST /api/enrollments/auto-enroll-course/:courseId
// @access  Private (Teachers only)
router.post('/auto-enroll-course/:courseId', protect, asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  // Ensure user is a teacher
  if (req.user.role !== 'teacher') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only teachers can auto-enroll students.'
    });
  }

  try {
    const Course = require('../models/Course');
    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Ensure teacher owns this course
    if (course.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only auto-enroll students in your own courses.'
      });
    }

    // Perform auto-enrollment
    const result = await course.autoEnrollStudents();

    res.json({
      success: true,
      message: 'Auto-enrollment completed',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Auto-enrollment failed',
      error: error.message
    });
  }
}));

// @desc    Auto-enroll all students in all courses based on hierarchy
// @route   POST /api/enrollments/auto-enroll-all
// @access  Private (Teachers only)
router.post('/auto-enroll-all', protect, asyncHandler(async (req, res) => {
  // Ensure user is a teacher
  if (req.user.role !== 'teacher') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only teachers can perform bulk auto-enrollment.'
    });
  }

  try {
    const Course = require('../models/Course');
    
    // Perform auto-enrollment for all courses
    const results = await Course.autoEnrollAllStudents();

    res.json({
      success: true,
      message: 'Bulk auto-enrollment completed',
      data: {
        totalCourses: results.length,
        results: results
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Bulk auto-enrollment failed',
      error: error.message
    });
  }
}));

// @desc    Get auto-enrollment status for a course
// @route   GET /api/enrollments/auto-enroll-status/:courseId
// @access  Private (Teachers only)
router.get('/auto-enroll-status/:courseId', protect, asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  // Ensure user is a teacher
  if (req.user.role !== 'teacher') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only teachers can view auto-enrollment status.'
    });
  }

  try {
    const Course = require('../models/Course');
    const Student = require('../models/Student');
    
    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Ensure teacher owns this course
    if (course.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view auto-enrollment status for your own courses.'
      });
    }

    // Find matching students
    const matchingStudents = await Student.find({
      instituteName: course.hierarchy?.instituteName || '',
      className: course.hierarchy?.className || '',
      section: course.hierarchy?.section || '',
      batchYear: course.hierarchy?.batchYear || ''
    });

    // Get enrollment status for each matching student
    const enrollmentStatus = await Promise.all(
      matchingStudents.map(async (student) => {
        const enrollment = await Enrollment.findOne({
          studentId: student._id,
          courseId: course._id
        });

        return {
          studentId: student._id,
          studentName: student.name,
          studentEmail: student.email,
          isEnrolled: !!enrollment,
          enrollmentStatus: enrollment ? enrollment.status : null,
          enrolledAt: enrollment ? enrollment.enrolledAt : null
        };
      })
    );

    res.json({
      success: true,
      data: {
        course: {
          id: course._id,
          title: course.title,
          hierarchy: course.hierarchy || {},
          autoEnrollment: course.autoEnrollment || { enabled: false }
        },
        matchingStudents: matchingStudents.length,
        enrolledStudents: enrollmentStatus.filter(s => s.isEnrolled).length,
        enrollmentStatus: enrollmentStatus,
        hasCompleteHierarchy: !!(course.hierarchy?.instituteName && course.hierarchy?.className && course.hierarchy?.section && course.hierarchy?.batchYear)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get auto-enrollment status',
      error: error.message
    });
  }
}));

// @desc    Get student's enrolled courses
// @route   GET /api/enrollments/my-courses
// @access  Private
router.get('/my-courses', protect, asyncHandler(async (req, res) => {
  // Ensure user is a student
  if (req.user.role !== 'student') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only students can access this endpoint.'
    });
  }

  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const enrollments = await Enrollment.find({ 
      studentId: student._id,
      status: { $in: ['enrolled', 'completed'] }
    })
    .populate('courseId', 'title description instructor pricing modules badges estimatedDuration')
    .sort({ enrolledAt: -1 });

    const courses = enrollments.map(enrollment => ({
      id: enrollment._id,
      courseId: enrollment.courseId._id,
      title: enrollment.courseId.title,
      description: enrollment.courseId.description,
      instructor: enrollment.courseId.instructor,
      pricing: enrollment.courseId.pricing,
      badges: enrollment.courseId.badges,
      estimatedDuration: enrollment.courseId.estimatedDuration,
      status: enrollment.status,
      progress: enrollment.progress,
      enrolledAt: enrollment.enrolledAt,
      completedAt: enrollment.completedAt,
      certificate: enrollment.certificate,
      lastActivityAt: enrollment.lastActivityAt
    }));

    res.json({
      success: true,
      data: {
        courses,
        totalEnrolled: courses.length,
        totalCompleted: courses.filter(c => c.status === 'completed').length,
        totalInProgress: courses.filter(c => c.status === 'enrolled').length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enrolled courses'
    });
  }
}));

// @desc    Get course progress
// @route   GET /api/enrollments/:enrollmentId/progress
// @access  Private
router.get('/:enrollmentId/progress', protect, asyncHandler(async (req, res) => {
  const { enrollmentId } = req.params;

  try {
    const enrollment = await Enrollment.findById(enrollmentId)
      .populate('courseId', 'title modules')
      .populate('studentId', 'userId');

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Ensure student owns this enrollment
    if (enrollment.studentId.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const course = enrollment.courseId;
    const completedModuleIds = enrollment.completedModules.map(cm => cm.moduleId.toString());

    const modules = course.modules
      .filter(module => module.isPublished)
      .map(module => ({
        id: module._id,
        title: module.title,
        description: module.description,
        duration: module.duration,
        order: module.order,
        isCompleted: completedModuleIds.includes(module._id.toString()),
        completedAt: enrollment.completedModules.find(
          cm => cm.moduleId.toString() === module._id.toString()
        )?.completedAt
      }))
      .sort((a, b) => a.order - b.order);

    res.json({
      success: true,
      data: {
        courseTitle: course.title,
        progress: enrollment.progress,
        status: enrollment.status,
        enrolledAt: enrollment.enrolledAt,
        completedAt: enrollment.completedAt,
        modules,
        certificate: enrollment.certificate
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch course progress'
    });
  }
}));

// @desc    Complete a module
// @route   POST /api/enrollments/:enrollmentId/complete-module
// @access  Private
router.post('/:enrollmentId/complete-module', protect, asyncHandler(async (req, res) => {
  const { enrollmentId } = req.params;
  const { moduleId, score } = req.body;

  try {
    const enrollment = await Enrollment.findById(enrollmentId)
      .populate('studentId', 'userId');

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Ensure student owns this enrollment
    if (enrollment.studentId.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Complete the module
    await enrollment.completeModule(moduleId, score);

    res.json({
      success: true,
      message: 'Module completed successfully',
      data: {
        progress: enrollment.progress,
        status: enrollment.status,
        certificate: enrollment.certificate
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}));

// @desc    Add course review
// @route   POST /api/enrollments/:enrollmentId/review
// @access  Private
router.post('/:enrollmentId/review', protect, asyncHandler(async (req, res) => {
  const { enrollmentId } = req.params;
  const { rating, review } = req.body;

  try {
    const enrollment = await Enrollment.findById(enrollmentId)
      .populate('studentId', 'userId');

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Ensure student owns this enrollment
    if (enrollment.studentId.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Add review
    await enrollment.addReview(rating, review);

    res.json({
      success: true,
      message: 'Review added successfully',
      data: {
        rating: enrollment.rating,
        review: enrollment.review,
        reviewedAt: enrollment.reviewedAt
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}));

// @desc    Drop a course
// @route   POST /api/enrollments/:enrollmentId/drop
// @access  Private
router.post('/:enrollmentId/drop', protect, asyncHandler(async (req, res) => {
  const { enrollmentId } = req.params;

  try {
    const enrollment = await Enrollment.findById(enrollmentId)
      .populate('studentId', 'userId');

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Ensure student owns this enrollment
    if (enrollment.studentId.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Drop the course
    await enrollment.dropCourse();

    res.json({
      success: true,
      message: 'Course dropped successfully',
      data: {
        status: enrollment.status,
        droppedAt: enrollment.droppedAt
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}));

module.exports = router; 