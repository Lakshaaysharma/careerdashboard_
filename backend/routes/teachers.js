const express = require('express');
const asyncHandler = require('express-async-handler');
const { protect } = require('../middleware/auth');
const Teacher = require('../models/Teacher');
const User = require('../models/User');
const geminiService = require('../services/geminiService');

const router = express.Router();

// @desc    Get teacher dashboard data
// @route   GET /api/teachers/dashboard
// @access  Private
router.get('/dashboard', protect, asyncHandler(async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only teachers can access this endpoint.'
      });
    }

    console.log('Creating teacher for user ID:', req.user._id);
    let teacher = await Teacher.findOrCreateTeacher(req.user._id);
    console.log('Teacher created/found:', teacher._id);
    await teacher.updateStatistics();
    
    // Update student counts for all subjects
    await teacher.updateSubjectStudentCounts();

    // Get recent assignments (last 5)
    const recentAssignments = teacher.assignments
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    // Get subject-wise statistics
    const subjectStats = {};
    teacher.subjects.forEach(subject => {
      if (subject.isActive) {
        subjectStats[subject.name] = teacher.getSubjectStatistics(subject.name);
      }
    });

    res.json({
      success: true,
      data: {
        teacher: {
          name: teacher.name || req.user.name, // Use teacher name if available, fallback to user name
          subjects: teacher.subjects.filter(s => s.isActive),
          statistics: {
            totalStudents: teacher.totalStudents,
            activeAssignments: teacher.activeAssignments,
            completedAssignments: teacher.completedAssignments,
            averageScore: teacher.averageScore
          },
          subjectStats,
          recentAssignments
        }
      }
    });
  } catch (error) {
    console.error('Teacher dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}));

// @desc    Create new assignment
// @route   POST /api/teachers/assignments
// @access  Private
router.post('/assignments', protect, asyncHandler(async (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only teachers can access this endpoint.'
    });
  }

  const { title, description, subject, dueDate, points, type, assignToAll, selectedStudents, questions } = req.body;
  
  console.log('Creating assignment with data:', {
    title,
    description,
    subject,
    dueDate,
    points,
    type,
    assignToAll,
    selectedStudents,
    questions
  });

  if (!title || !description || !subject || !dueDate || !points) {
    return res.status(400).json({
      success: false,
      message: 'Please provide all required fields: title, description, subject, dueDate, points'
    });
  }

  // Validate quiz questions
  if (req.body.type === 'quiz' && req.body.questions && Array.isArray(req.body.questions)) {
    if (req.body.questions.length === 0) {
      return res.status(400).json({ success: false, message: 'Quiz must have at least one question' });
    }

    for (const question of req.body.questions) {
      if (!question.question || !question.type || !question.points) {
        return res.status(400).json({ success: false, message: 'Each question must have question text, type, and points' });
      }

      if (question.type === 'multiple-choice') {
        if (!question.options || question.options.length < 2) {
          return res.status(400).json({ success: false, message: 'Multiple choice questions must have at least 2 options' });
        }
        const correctOptions = question.options.filter(opt => opt.isCorrect);
        if (correctOptions.length !== 1) {
          return res.status(400).json({ success: false, message: 'Multiple choice questions must have exactly one correct option' });
        }
      } else if (question.type === 'true-false') {
        if (!question.correctAnswer || !['true', 'false'].includes(question.correctAnswer.toLowerCase())) {
          return res.status(400).json({ success: false, message: 'True/false questions must have correct answer of "true" or "false"' });
        }
      }
    }
  }

  // Validate student assignment
  if (assignToAll === false && (!selectedStudents || selectedStudents.length === 0)) {
    return res.status(400).json({
      success: false,
      message: 'Please select at least one student or assign to all students'
    });
  }

  let teacher = await Teacher.findOrCreateTeacher(req.user._id);
  console.log('Teacher found/created for assignment creation:', teacher._id);
  console.log('Teacher current assignments count:', teacher.assignments.length);
  
  // Verify teacher teaches this subject
  const teachesSubject = teacher.subjects.some(s => s.name === subject && s.isActive);
  if (!teachesSubject) {
    return res.status(403).json({
      success: false,
      message: `You are not authorized to create assignments for ${subject}`
    });
  }

  // Create assignment
  try {
    const assignment = await teacher.createAssignment({
      title,
      description,
      subject,
      dueDate,
      points,
      type: type || 'homework',
      questions: type === 'quiz' ? questions : undefined
    });

    console.log('Assignment created successfully:', assignment);
    console.log('Teacher assignments count after creation:', teacher.assignments.length);

    res.json({
      success: true,
      message: `Assignment created successfully for ${subject}`,
      data: {
        assignment
      }
    });
  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create assignment',
      error: error.message
    });
  }
}));

// @desc    Get assignments by subject
// @route   GET /api/teachers/subjects/:subject/assignments
// @access  Private
router.get('/subjects/:subject/assignments', protect, asyncHandler(async (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only teachers can access this endpoint.'
    });
  }

  const { subject } = req.params;
  const teacher = await Teacher.findOne({ userId: req.user._id });
  
  if (!teacher) {
    return res.status(404).json({
      success: false,
      message: 'Teacher profile not found'
    });
  }

  const assignments = teacher.getAssignmentsBySubject(subject);
  const statistics = teacher.getSubjectStatistics(subject);

  res.json({
    success: true,
    data: {
      subject,
      assignments,
      statistics
    }
  });
}));

// @desc    Get all subjects taught by teacher
// @route   GET /api/teachers/subjects
// @access  Private
router.get('/subjects', protect, asyncHandler(async (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only teachers can access this endpoint.'
    });
  }

  const teacher = await Teacher.findOne({ userId: req.user._id });
  
  if (!teacher) {
    return res.status(404).json({
      success: false,
      message: 'Teacher profile not found'
    });
  }

  const activeSubjects = teacher.subjects.filter(s => s.isActive);

  res.json({
    success: true,
    data: {
      subjects: activeSubjects
    }
  });
}));

// @desc    Get all assignments for teacher
// @route   GET /api/teachers/assignments
// @access  Private
router.get('/assignments', protect, asyncHandler(async (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only teachers can access this endpoint.'
    });
  }

  const teacher = await Teacher.findOne({ userId: req.user._id });
  
  if (!teacher) {
    return res.status(404).json({
      success: false,
      message: 'Teacher profile not found'
    });
  }

  res.json({
    success: true,
    data: {
      assignments: teacher.assignments
    }
  });
}));

// @desc    Get all assignments by teacher
// @route   GET /api/teachers/assignments/all
// @access  Private
router.get('/assignments/all', protect, asyncHandler(async (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only teachers can access this endpoint.'
    });
  }

  console.log('Fetching assignments for teacher with user ID:', req.user._id);
  const teacher = await Teacher.findOne({ userId: req.user._id });
  console.log('Teacher found:', teacher ? teacher._id : 'NOT FOUND');
  
  if (!teacher) {
    return res.status(404).json({
      success: false,
      message: 'Teacher profile not found'
    });
  }

  console.log('Teacher assignments count:', teacher.assignments.length);
  console.log('Teacher assignments:', teacher.assignments);

  res.json({
    success: true,
    data: {
      assignments: teacher.assignments
    }
  });
}));

// @desc    Update assignment
// @route   PUT /api/teachers/assignments/:assignmentId
// @access  Private
router.put('/assignments/:assignmentId', protect, asyncHandler(async (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only teachers can access this endpoint.'
    });
  }

  const { assignmentId } = req.params;
  const { title, description, subject, dueDate, points, type, status } = req.body;

  const teacher = await Teacher.findOne({ userId: req.user._id });
  
  if (!teacher) {
    return res.status(404).json({
      success: false,
      message: 'Teacher profile not found'
    });
  }

  const assignment = teacher.assignments.id(assignmentId);
  
  if (!assignment) {
    return res.status(404).json({
      success: false,
      message: 'Assignment not found'
    });
  }

  // Update assignment fields
  if (title) assignment.title = title;
  if (description) assignment.description = description;
  if (subject) assignment.subject = subject;
  if (dueDate) assignment.dueDate = new Date(dueDate);
  if (points) assignment.points = parseInt(points);
  if (type) assignment.type = type;
  if (status) assignment.status = status;

  await teacher.save();
  await teacher.updateStatistics();

  res.json({
    success: true,
    message: 'Assignment updated successfully',
    data: {
      assignment
    }
  });
}));

// @desc    Delete assignment
// @route   DELETE /api/teachers/assignments/:assignmentId
// @access  Private
router.delete('/assignments/:assignmentId', protect, asyncHandler(async (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only teachers can access this endpoint.'
    });
  }

  const { assignmentId } = req.params;

  const teacher = await Teacher.findOne({ userId: req.user._id });
  
  if (!teacher) {
    return res.status(404).json({
      success: false,
      message: 'Teacher profile not found'
    });
  }

  const assignment = teacher.assignments.id(assignmentId);
  
  if (!assignment) {
    return res.status(404).json({
      success: false,
      message: 'Assignment not found'
    });
  }

  assignment.remove();
  await teacher.save();
  await teacher.updateStatistics();

  res.json({
    success: true,
    message: 'Assignment deleted successfully'
  });
}));

// @desc    Get assignment submissions
// @route   GET /api/teachers/assignments/:assignmentId/submissions
// @access  Private
router.get('/assignments/:assignmentId/submissions', protect, asyncHandler(async (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only teachers can access this endpoint.'
    });
  }

  const { assignmentId } = req.params;

  // Get all students who completed this assignment
  const Student = require('../models/Student');
  const students = await Student.find({
    'assignmentHistory.assignmentId': assignmentId
  }).populate('userId', 'name email');

  const submissions = [];
  
  students.forEach(student => {
    const assignmentHistory = student.assignmentHistory.find(
      history => history.assignmentId.toString() === assignmentId
    );
    
    if (assignmentHistory) {
      submissions.push({
        studentId: student.userId._id,
        studentName: student.userId.name,
        studentEmail: student.userId.email,
        score: assignmentHistory.score,
        pointsEarned: assignmentHistory.pointsEarned,
        completedAt: assignmentHistory.completedAt
      });
    }
  });

  res.json({
    success: true,
    data: {
      submissions
    }
  });
}));

// @desc    Get enrolled students for teacher
// @route   GET /api/teachers/students
// @access  Private
router.get('/students', protect, asyncHandler(async (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only teachers can access this endpoint.'
    });
  }

  try {
    // Get teacher
    const teacher = await Teacher.findOne({ userId: req.user._id });
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    // Get all courses for this teacher
    const Course = require('../models/Course');
    const courses = await Course.find({ teacherId: teacher._id });
    
    if (courses.length === 0) {
      return res.json({
        success: true,
        data: {
          students: [],
          total: 0
        }
      });
    }

    // Get all enrollments for teacher's courses
    const Enrollment = require('../models/Enrollment');
    const Student = require('../models/Student');
    
    const enrollments = await Enrollment.find({ 
      courseId: { $in: courses.map(course => course._id) },
      status: { $in: ['enrolled', 'completed'] }
    }).populate({
      path: 'studentId',
      populate: {
        path: 'userId',
        select: 'name email'
      }
    }).populate('courseId', 'subject');

    console.log('Found enrollments:', enrollments.length);

    // Create separate entries for each subject enrollment
    const formattedStudents = [];
    
    enrollments.forEach(enrollment => {
      if (enrollment.studentId && enrollment.studentId.userId && enrollment.courseId) {
        formattedStudents.push({
          _id: enrollment.studentId._id,
          name: enrollment.studentId.userId.name || 'Unknown Student',
          email: enrollment.studentId.userId.email || 'No email',
          level: enrollment.studentId.level || 1,
          points: enrollment.studentId.totalPoints || 0,
          enrolledSubject: enrollment.courseId.subject,
          enrollmentId: enrollment._id,
          enrolledAt: enrollment.enrolledAt,
          progress: enrollment.progress,
          status: enrollment.status
        });
      }
    });

    console.log('Enrolled students found:', formattedStudents.length);
    console.log('First enrolled student:', formattedStudents[0]);

    res.json({
      success: true,
      data: {
        students: formattedStudents,
        total: formattedStudents.length
      }
    });
  } catch (error) {
    console.error('Error fetching enrolled students:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enrolled students',
      error: error.message
    });
  }
}));

// @desc    Create test student (temporary for debugging)
// @route   POST /api/teachers/create-test-student
// @access  Private
router.post('/create-test-student', protect, asyncHandler(async (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only teachers can access this endpoint.'
    });
  }

  try {
    const User = require('../models/User');
    const Student = require('../models/Student');

    // Create a test user with student role
    const testUser = new User({
      name: 'Test Student',
      email: 'teststudent@example.com',
      password: 'password123',
      role: 'student'
    });

    await testUser.save();

    // Create a student profile
    const testStudent = new Student({
      userId: testUser._id,
      level: 1,
      totalPoints: 50
    });

    await testStudent.save();

    res.json({
      success: true,
      message: 'Test student created successfully',
      data: {
        user: testUser,
        student: testStudent
      }
    });
  } catch (error) {
    console.error('Error creating test student:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create test student',
      error: error.message
    });
  }
}));

// @desc    Create test enrollment (temporary for debugging)
// @route   POST /api/teachers/create-test-enrollment
// @access  Private
router.post('/create-test-enrollment', protect, asyncHandler(async (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only teachers can access this endpoint.'
    });
  }

  try {
    const teacher = await Teacher.findOne({ userId: req.user._id });
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    // Get teacher's first subject
    const firstSubject = teacher.subjects[0];
    if (!firstSubject) {
      return res.status(400).json({
        success: false,
        message: 'Teacher has no subjects. Please add subjects first.'
      });
    }

    // Find or create course for this subject
    const Course = require('../models/Course');
    let course = await Course.findOne({ 
      teacherId: teacher._id, 
      subject: firstSubject.name 
    });
    
    if (!course) {
      course = await Course.createFromTeacherSubject(teacher._id, firstSubject);
    }

    // Find a student to enroll
    const Student = require('../models/Student');
    const student = await Student.findOne({}).populate('userId', 'name email');
    
    if (!student) {
      return res.status(400).json({
        success: false,
        message: 'No students found. Please create a student first.'
      });
    }

    // Create enrollment
    const Enrollment = require('../models/Enrollment');
    const enrollment = await Enrollment.enrollStudent(student._id, course._id);

    res.json({
      success: true,
      message: 'Test enrollment created successfully',
      data: {
        student: {
          name: student.userId.name,
          email: student.userId.email
        },
        course: {
          subject: course.subject,
          title: course.title
        },
        enrollment: {
          status: enrollment.status,
          enrolledAt: enrollment.enrolledAt
        }
      }
    });
  } catch (error) {
    console.error('Error creating test enrollment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create test enrollment',
      error: error.message
    });
  }
}));

// @desc    Debug endpoint to show teacher's courses and enrollments
// @route   GET /api/teachers/debug/courses
// @access  Private
router.get('/debug/courses', protect, asyncHandler(async (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only teachers can access this endpoint.'
    });
  }

  try {
    const teacher = await Teacher.findOne({ userId: req.user._id });
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    const Course = require('../models/Course');
    const Enrollment = require('../models/Enrollment');
    
    // Get all courses for this teacher
    const courses = await Course.find({ teacherId: teacher._id });
    
    // Get enrollments for each course
    const coursesWithEnrollments = await Promise.all(
      courses.map(async (course) => {
        const enrollments = await Enrollment.find({ 
          courseId: course._id,
          status: { $in: ['enrolled', 'completed'] }
        }).populate({
          path: 'studentId',
          populate: {
            path: 'userId',
            select: 'name email'
          }
        });
        
        return {
          course: {
            _id: course._id,
            subject: course.subject,
            title: course.title,
            totalStudents: course.totalStudents
          },
          enrollments: enrollments.map(enrollment => ({
            studentId: enrollment.studentId._id,
            studentName: enrollment.studentId.userId?.name || 'Unknown Student',
            studentEmail: enrollment.studentId.userId?.email || 'No email',
            status: enrollment.status,
            enrolledAt: enrollment.enrolledAt
          }))
        };
      })
    );

    res.json({
      success: true,
      data: {
        teacher: {
          _id: teacher._id,
          name: teacher.name,
          subjects: teacher.subjects
        },
        courses: coursesWithEnrollments,
        totalCourses: courses.length,
        totalEnrollments: coursesWithEnrollments.reduce((sum, course) => sum + course.enrollments.length, 0)
      }
    });
  } catch (error) {
    console.error('Error fetching debug data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch debug data',
      error: error.message
    });
  }
}));

// @desc    Get students enrolled in a specific subject
// @route   GET /api/teachers/subjects/:subjectName/students
// @access  Private
router.get('/subjects/:subjectName/students', protect, asyncHandler(async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only teachers can access this endpoint.'
      });
    }

    const { subjectName } = req.params;
    
    // Get teacher
    const teacher = await Teacher.findOne({ userId: req.user._id });
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    // Check if teacher teaches this subject
    const subject = teacher.subjects.find(s => s.name === subjectName);
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    // Get course for this subject
    const Course = require('../models/Course');
    const course = await Course.findOne({ 
      teacherId: teacher._id, 
      subject: subjectName 
    });

    if (!course) {
      return res.json({
        success: true,
        data: {
          students: [],
          total: 0
        }
      });
    }

    // Get enrollments for this course
    const Enrollment = require('../models/Enrollment');
    const Student = require('../models/Student');
    
    const enrollments = await Enrollment.find({ 
      courseId: course._id,
      status: { $in: ['enrolled', 'completed'] }
    }).populate({
      path: 'studentId',
      populate: {
        path: 'userId',
        select: 'name email'
      }
    });

    console.log('Found enrollments:', enrollments.length);
    console.log('First enrollment:', enrollments[0]);

    const students = enrollments
      .filter(enrollment => enrollment.studentId && enrollment.studentId.userId) // Filter out enrollments with null studentId
      .map(enrollment => ({
        _id: enrollment.studentId._id,
        name: enrollment.studentId.userId.name || 'Unknown Student',
        email: enrollment.studentId.userId.email || 'No email',
        enrolledSubject: subjectName, // Since this is subject-specific
        enrollmentId: enrollment._id,
        enrolledAt: enrollment.enrolledAt,
        progress: enrollment.progress,
        status: enrollment.status
      }));

    console.log('Processed students:', students.length);
    console.log('First student:', students[0]);

    res.json({
      success: true,
      data: {
        students,
        total: students.length
      }
    });
  } catch (error) {
    console.error('Error fetching subject students:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}));

// @desc    Update teacher name
// @route   PUT /api/teachers/name
// @access  Private
router.put('/name', protect, asyncHandler(async (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only teachers can access this endpoint.'
    });
  }

  const { name } = req.body;
  
  console.log('Updating teacher name with data:', name);

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid name (at least 2 characters)'
    });
  }

  try {
    let teacher = await Teacher.findOrCreateTeacher(req.user._id);
    
    // Update teacher name
    teacher.name = name.trim();
    await teacher.save();
    
    // Also update the User model name
    const User = require('../models/User');
    await User.findByIdAndUpdate(req.user._id, { name: name.trim() });
    
    console.log('Teacher name updated successfully');

    res.json({
      success: true,
      message: 'Name updated successfully',
      data: {
        name: teacher.name
      }
    });
  } catch (error) {
    console.error('Error updating teacher name:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update name',
      error: error.message
    });
  }
}));

// @desc    Update subject pricing
// @route   PUT /api/teachers/subjects/pricing
// @access  Private
router.put('/subjects/pricing', protect, asyncHandler(async (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only teachers can access this endpoint.'
    });
  }

  const { subjectName, pricing } = req.body;
  
  console.log('Updating subject pricing with data:', { subjectName, pricing });

  if (!subjectName || !pricing) {
    return res.status(400).json({
      success: false,
      message: 'Please provide subject name and pricing data'
    });
  }

  if (typeof pricing.price !== 'number' || pricing.price < 0) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid price (non-negative number)'
    });
  }

  try {
    let teacher = await Teacher.findOrCreateTeacher(req.user._id);
    
    // Find the subject and update its pricing
    const subjectIndex = teacher.subjects.findIndex(subject => subject.name === subjectName);
    
    if (subjectIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    // Update the subject's pricing
    teacher.subjects[subjectIndex].pricing = {
      price: pricing.price,
      currency: pricing.currency || 'USD',
      isFree: pricing.price === 0,
      description: pricing.description || ''
    };

    await teacher.save();
    console.log('Subject pricing updated successfully');

    res.json({
      success: true,
      message: 'Subject pricing updated successfully',
      data: {
        subject: teacher.subjects[subjectIndex]
      }
    });
  } catch (error) {
    console.error('Error updating subject pricing:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update subject pricing',
      error: error.message
    });
  }
}));

// @desc    Update teacher subjects
// @route   PUT /api/teachers/subjects
// @access  Private
router.put('/subjects', protect, asyncHandler(async (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only teachers can access this endpoint.'
    });
  }

  const { subjects } = req.body;
  
  console.log('Updating subjects with data:', subjects);

  if (!subjects || !Array.isArray(subjects)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid subjects array'
    });
  }

  try {
    let teacher = await Teacher.findOrCreateTeacher(req.user._id);
    
    // Update teacher subjects
    teacher.subjects = subjects.map(subject => ({
      name: subject.name,
      isActive: subject.isActive !== undefined ? subject.isActive : true,
      pricing: {
        price: subject.pricing?.price || 0,
        currency: subject.pricing?.currency || 'USD',
        isFree: subject.pricing?.price === 0 || true,
        description: subject.pricing?.description || ''
      }
    }));

    await teacher.save();
    console.log('Teacher subjects updated successfully');

    // Create courses for new subjects
    const Course = require('../models/Course');
    for (const subject of teacher.subjects) {
      if (subject.isActive) {
        // Check if course already exists for this subject
        const existingCourse = await Course.findOne({ 
          teacherId: teacher._id, 
          subject: subject.name 
        });
        
        if (!existingCourse) {
          // Create new course for this subject
          await Course.createFromTeacherSubject(teacher._id, subject);
          console.log(`Created course for subject: ${subject.name}`);
        }
      }
    }

    res.json({
      success: true,
      message: 'Subjects updated successfully',
      data: {
        subjects: teacher.subjects
      }
    });
  } catch (error) {
    console.error('Error updating teacher subjects:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update subjects',
      error: error.message
    });
  }
}));

// @desc    Setup teacher profile
// @route   POST /api/teachers/setup
// @access  Private
router.post('/setup', protect, asyncHandler(async (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only teachers can access this endpoint.'
    });
  }

  const { instituteName, className, subjects, section, courses, batchYear } = req.body;
  
  console.log('Setting up teacher profile with data:', {
    instituteName,
    className,
    subjects,
    section,
    courses,
    batchYear
  });

  if (!instituteName || !className || !subjects || !Array.isArray(subjects) || subjects.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Please provide all required fields: instituteName, className, subjects (array)'
    });
  }

  try {
    let teacher = await Teacher.findOrCreateTeacher(req.user._id);
    
    // Update teacher profile with hierarchy data
    teacher.instituteName = instituteName;
    teacher.className = className;
    teacher.section = section;
    teacher.batchYear = batchYear;
    
    // Set up subjects from the subjects array
    teacher.subjects = subjects.map(subjectName => ({
      name: subjectName,
      isActive: true,
      pricing: {
        price: 0,
        currency: 'USD',
        isFree: true,
        description: ''
      }
    }));

    // Add courses if provided
    if (courses && Array.isArray(courses) && courses.length > 0) {
      teacher.courses = courses.map(course => ({
        name: course.name,
        description: course.description || '',
        level: course.level || 'Beginner'
      }));
    }

    await teacher.save();
    console.log('Teacher profile setup completed successfully');

    res.json({
      success: true,
      message: 'Teacher profile setup completed successfully',
      data: {
        teacher: {
          _id: teacher._id,
          instituteName: teacher.instituteName,
          className: teacher.className,
          subjects: teacher.subjects,
          section: teacher.section,
          batchYear: teacher.batchYear,
          courses: teacher.courses
        }
      }
    });
  } catch (error) {
    console.error('Error setting up teacher profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to setup teacher profile',
      error: error.message
    });
  }
}));

// @desc    Generate quiz questions using Gemini AI
// @route   POST /api/teachers/generate-quiz
// @access  Private
router.post('/generate-quiz', protect, asyncHandler(async (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only teachers can access this endpoint.'
    });
  }

  const { subject, topic, difficulty, questionCount, generationType } = req.body;
  
  console.log('Generating quiz with AI:', {
    subject,
    topic,
    difficulty,
    questionCount,
    generationType
  });

  if (!subject) {
    return res.status(400).json({
      success: false,
      message: 'Subject is required for quiz generation'
    });
  }

  try {
    let generatedQuestions;
    
    if (generationType === 'topic' && topic) {
      // Generate quiz based on specific topic
      generatedQuestions = await geminiService.generateQuizByTopic(
        topic, 
        subject, 
        difficulty || 'intermediate', 
        questionCount || 5
      );
    } else {
      // Generate quiz based on subject
      generatedQuestions = await geminiService.generateQuizBySubject(
        subject, 
        difficulty || 'intermediate', 
        questionCount || 5
      );
    }

    console.log(`AI generated ${generatedQuestions.length} questions for ${subject}`);

    res.json({
      success: true,
      message: `Successfully generated ${generatedQuestions.length} quiz questions`,
      data: {
        questions: generatedQuestions,
        subject,
        topic: topic || 'General subject concepts',
        difficulty: difficulty || 'intermediate',
        totalPoints: generatedQuestions.reduce((sum, q) => sum + q.points, 0)
      }
    });

  } catch (error) {
    console.error('Error generating quiz with AI:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate quiz questions',
      error: error.message
    });
  }
}));

module.exports = router; 