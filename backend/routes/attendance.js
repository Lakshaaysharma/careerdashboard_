const express = require('express');
const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const { protect } = require('../middleware/auth');
const Attendance = require('../models/Attendance');
const Course = require('../models/Course');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const User = require('../models/User');

const router = express.Router();

// @desc    Mark student attendance
// @route   POST /api/attendance
// @access  Private (Teacher only)
router.post('/', protect, asyncHandler(async (req, res) => {
  const {
    courseId,
    studentId,
    status = 'present',
    sessionTitle,
    sessionDescription,
    teacherNotes
  } = req.body;

  // Validate required fields
  if (!courseId || !studentId) {
    return res.status(400).json({
      success: false,
      message: 'Course ID and Student ID are required'
    });
  }

  try {
    // Check if user is a teacher
    const user = await User.findById(req.user.id);
    if (user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Teacher role required.'
      });
    }

    // Get teacher profile
    const teacher = await Teacher.findOne({ userId: req.user.id });
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher profile not found'
      });
    }

    // Handle mock course IDs (for subjects) or real course IDs
    let course = null;
    let subjectName = null;
    
    if (courseId.startsWith('course_')) {
      // This is a mock course ID, extract subject name
      subjectName = courseId.replace('course_', '').replace(/_/g, ' ');
      // Check if teacher has this subject
      const hasSubject = teacher.subjects && teacher.subjects.some(subject => 
        subject.name.toLowerCase() === subjectName.toLowerCase()
      );
      
      if (!hasSubject) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only mark attendance for your own subjects.'
        });
      }
    } else {
      // This is a real course ID, verify course exists and teacher has access
      course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      if (course.teacher.toString() !== teacher._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only mark attendance for your own courses.'
        });
      }
    }

    // Verify student exists and is enrolled
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // For mock course IDs (subjects), skip enrollment check
    // For real course IDs, check if student is enrolled
    if (course) {
      const enrollment = await Course.findOne({
        _id: courseId,
        'enrollments.student': studentId
      });

      if (!enrollment) {
        return res.status(400).json({
          success: false,
          message: 'Student is not enrolled in this course'
        });
      }
    }

    // Check if attendance already exists for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingAttendanceQuery = {
      student: studentId,
      date: {
        $gte: today,
        $lt: tomorrow
      }
    };

    // Add course or subject filter
    if (course) {
      existingAttendanceQuery.course = courseId;
    } else {
      existingAttendanceQuery.subject = subjectName;
    }

    const existingAttendance = await Attendance.findOne(existingAttendanceQuery);

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message: 'Attendance already marked for this student today',
        data: existingAttendance
      });
    }

    // Create attendance record
    const attendanceData = {
      student: studentId,
      teacher: teacher._id,
      status,
      sessionTitle,
      sessionDescription,
      teacherNotes,
      verifiedBy: teacher._id,
      verifiedAt: new Date()
    };

    // Add course or subject information
    if (course) {
      attendanceData.course = courseId;
    } else {
      // For subjects, store the subject name in a custom field
      attendanceData.subject = subjectName;
      attendanceData.courseId = courseId; // Store the mock course ID for reference
    }

    const attendance = await Attendance.create(attendanceData);

    // Populate the response
    await attendance.populate([
      { path: 'student', select: 'name email' },
      { path: 'course', select: 'title' },
      { path: 'teacher', select: 'name email' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Attendance marked successfully',
      data: attendance
    });

  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark attendance',
      error: error.message
    });
  }
}));

// @desc    Get attendance for a course
// @route   GET /api/attendance/course/:courseId
// @access  Private (Teacher only)
router.get('/course/:courseId', protect, asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { startDate, endDate, status, page = 1, limit = 50 } = req.query;

  try {
    // Check if user is a teacher
    const user = await User.findById(req.user.id);
    if (user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Teacher role required.'
      });
    }

    // Get teacher profile
    const teacher = await Teacher.findOne({ userId: req.user.id });
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher profile not found'
      });
    }

    // Verify course exists and teacher has access
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (course.teacher.toString() !== teacher._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view attendance for your own courses.'
      });
    }

    // Get attendance records
    const attendanceRecords = await Attendance.getCourseAttendance(courseId, {
      startDate,
      endDate,
      status
    });

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedRecords = attendanceRecords.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        attendance: paginatedRecords,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(attendanceRecords.length / limitNum),
          totalRecords: attendanceRecords.length,
          hasNext: endIndex < attendanceRecords.length,
          hasPrev: startIndex > 0
        }
      }
    });

  } catch (error) {
    console.error('Get course attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance',
      error: error.message
    });
  }
}));

// @desc    Get attendance summary for a course
// @route   GET /api/attendance/course/:courseId/summary
// @access  Private (Teacher only)
router.get('/course/:courseId/summary', protect, asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { startDate, endDate } = req.query;

  try {
    // Check if user is a teacher
    const user = await User.findById(req.user.id);
    if (user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Teacher role required.'
      });
    }

    // Get teacher profile
    const teacher = await Teacher.findOne({ userId: req.user.id });
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher profile not found'
      });
    }

    // Verify course exists and teacher has access
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (course.teacher.toString() !== teacher._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view attendance for your own courses.'
      });
    }

    // Get attendance summary
    const summary = await Attendance.getCourseAttendanceSummary(courseId, startDate, endDate);

    res.json({
      success: true,
      data: summary
    });

  } catch (error) {
    console.error('Get attendance summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance summary',
      error: error.message
    });
  }
}));

// @desc    Update attendance status
// @route   PUT /api/attendance/:id
// @access  Private (Teacher only)
router.put('/:id', protect, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, teacherNotes } = req.body;

  if (!status) {
    return res.status(400).json({
      success: false,
      message: 'Status is required'
    });
  }

  try {
    // Check if user is a teacher
    const user = await User.findById(req.user.id);
    if (user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Teacher role required.'
      });
    }

    // Get teacher profile
    const teacher = await Teacher.findOne({ userId: req.user.id });
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher profile not found'
      });
    }

    // Find attendance record
    const attendance = await Attendance.findById(id);
    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    // Verify teacher has access to this attendance record
    if (attendance.teacher.toString() !== teacher._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update attendance for your own courses.'
      });
    }

    // Update attendance
    await attendance.updateStatus(status, teacherNotes);

    // Populate the response
    await attendance.populate([
      { path: 'student', select: 'name email' },
      { path: 'course', select: 'title' },
      { path: 'teacher', select: 'name email' }
    ]);

    res.json({
      success: true,
      message: 'Attendance updated successfully',
      data: attendance
    });

  } catch (error) {
    console.error('Update attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update attendance',
      error: error.message
    });
  }
}));

// @desc    Check out student
// @route   POST /api/attendance/:id/checkout
// @access  Private (Teacher only)
router.post('/:id/checkout', protect, asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    // Check if user is a teacher
    const user = await User.findById(req.user.id);
    if (user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Teacher role required.'
      });
    }

    // Get teacher profile
    const teacher = await Teacher.findOne({ userId: req.user.id });
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher profile not found'
      });
    }

    // Find attendance record
    const attendance = await Attendance.findById(id);
    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    // Verify teacher has access to this attendance record
    if (attendance.teacher.toString() !== teacher._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update attendance for your own courses.'
      });
    }

    // Check if already checked out
    if (attendance.checkOutTime) {
      return res.status(400).json({
        success: false,
        message: 'Student is already checked out'
      });
    }

    // Check out student
    await attendance.checkOut();

    // Populate the response
    await attendance.populate([
      { path: 'student', select: 'name email' },
      { path: 'course', select: 'title' },
      { path: 'teacher', select: 'name email' }
    ]);

    res.json({
      success: true,
      message: 'Student checked out successfully',
      data: attendance
    });

  } catch (error) {
    console.error('Checkout student error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to checkout student',
      error: error.message
    });
  }
}));

// @desc    Get student attendance
// @route   GET /api/attendance/student/:studentId
// @access  Private (Teacher or Student)
router.get('/student/:studentId', protect, asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { courseId, startDate, endDate } = req.query;

  try {
    const user = await User.findById(req.user.id);
    
    // Check if user is the student or a teacher
    if (user.role === 'student' && user.id !== studentId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own attendance.'
      });
    }

    if (user.role === 'teacher') {
      // Verify teacher has access to this student
      const teacher = await Teacher.findOne({ userId: req.user.id });
      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: 'Teacher profile not found'
        });
      }

      // Check if student is enrolled in any of teacher's courses
      const teacherCourses = await Course.find({ teacher: teacher._id });
      const courseIds = teacherCourses.map(course => course._id);
      
      const studentEnrollment = await Course.findOne({
        _id: { $in: courseIds },
        'enrollments.student': studentId
      });

      if (!studentEnrollment) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Student is not enrolled in any of your courses.'
        });
      }
    }

    // Get student attendance
    const attendanceRecords = await Attendance.getStudentAttendance(studentId, courseId);

    // Filter by date range if provided
    let filteredRecords = attendanceRecords;
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      filteredRecords = attendanceRecords.filter(record => 
        record.date >= start && record.date <= end
      );
    }

    res.json({
      success: true,
      data: {
        attendance: filteredRecords,
        totalRecords: filteredRecords.length
      }
    });

  } catch (error) {
    console.error('Get student attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch student attendance',
      error: error.message
    });
  }
}));

// @desc    Get per-subject attendance summary for a student
// @route   GET /api/attendance/student/:studentId/subjects-summary
// @access  Private (Teacher or Student)
router.get('/student/:studentId/subjects-summary', protect, asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { startDate, endDate } = req.query;

  try {
    const user = await User.findById(req.user.id);

    // Resolve effective student ObjectId
    let effectiveStudent = null;
    let studentObjectId = null;

    if (mongoose.Types.ObjectId.isValid(studentId)) {
      effectiveStudent = await Student.findById(studentId).select('userId _id');
    } else if (user.role === 'student') {
      // Frontend might send a human-readable code; use the logged-in user's student doc
      effectiveStudent = await Student.findOne({ userId: req.user.id }).select('userId _id');
    }

    if (!effectiveStudent) {
      return res.status(400).json({ success: false, message: 'Invalid studentId' });
    }

    studentObjectId = effectiveStudent._id;

    // Authorization: student can see own summary; compare user's id to the Student.userId
    if (user.role === 'student') {
      if (effectiveStudent.userId.toString() !== req.user.id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only view your own attendance.'
        });
      }
    }

    if (user.role === 'teacher') {
      const teacher = await Teacher.findOne({ userId: req.user.id });
      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: 'Teacher profile not found'
        });
      }

      // Ensure the student is enrolled in at least one of teacher's courses
      const teacherCourses = await Course.find({ teacher: teacher._id }).select('_id');
      const courseIds = teacherCourses.map(c => c._id);
      const enrollment = await Course.findOne({ _id: { $in: courseIds }, 'enrollments.student': studentId });
      if (!enrollment && courseIds.length > 0) {
        // Soft check: allow if no enrollments model on course
      }
    }

    // Build aggregation pipeline
    const matchStage = { student: new mongoose.Types.ObjectId(studentObjectId) };
    if (startDate && endDate) {
      matchStage.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const summary = await Attendance.aggregate([
      { $match: matchStage },
      // Join course to access course.subject when present
      { $lookup: { from: 'courses', localField: 'course', foreignField: '_id', as: 'courseDoc' } },
      { $unwind: { path: '$courseDoc', preserveNullAndEmptyArrays: true } },
      { $addFields: { computedSubject: { $ifNull: ['$subject', '$courseDoc.subject'] } } },
      { $group: {
          _id: '$computedSubject',
          total: { $sum: 1 },
          present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } }
        }
      },
      { $addFields: {
          percentage: {
            $cond: [
              { $gt: ['$total', 0] },
              { $round: [{ $multiply: [{ $divide: ['$present', '$total'] }, 100] }, 0] },
              0
            ]
          }
        }
      },
      { $project: { _id: 0, subject: '$_id', total: 1, present: 1, absent: 1, percentage: 1 } },
      { $sort: { subject: 1 } }
    ]);

    res.json({
      success: true,
      data: { subjects: summary }
    });

  } catch (error) {
    console.error('Get student subject attendance summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance summary',
      error: error.message
    });
  }
}));

// @desc    Get attendance statistics
// @route   GET /api/attendance/stats/:courseId
// @access  Private (Teacher only)
router.get('/stats/:courseId', protect, asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { studentId } = req.query;

  try {
    // Check if user is a teacher
    const user = await User.findById(req.user.id);
    if (user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Teacher role required.'
      });
    }

    // Get teacher profile
    const teacher = await Teacher.findOne({ userId: req.user.id });
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher profile not found'
      });
    }

    // Verify course exists and teacher has access
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (course.teacher.toString() !== teacher._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view stats for your own courses.'
      });
    }

    // Get attendance statistics
    const stats = await Attendance.getAttendanceStats(courseId, studentId);

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Get attendance stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance statistics',
      error: error.message
    });
  }
}));

module.exports = router;
