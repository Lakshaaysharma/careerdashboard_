const express = require('express');
const asyncHandler = require('express-async-handler');
const { protect } = require('../middleware/auth');
const Student = require('../models/Student');
const User = require('../models/User');

const router = express.Router();

// @desc    Get student dashboard data
// @route   GET /api/students/dashboard
// @access  Private
router.get('/dashboard', protect, asyncHandler(async (req, res) => {
  // Ensure user is a student
  if (req.user.role !== 'student') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only students can access this endpoint.'
    });
  }

  // Find or create student record
  let student = await Student.findOrCreateStudent(req.user._id);
  
  // Update global rankings
  await Student.updateGlobalRankings();
  
  // Get updated student data with rankings
  student = await Student.findOne({ userId: req.user._id });
  
  // Get global leaderboard
  const leaderboard = await Student.getGlobalRankings(5);
  
  // Calculate weekly progress
  student.updateWeeklyProgress();
  
  res.json({
    success: true,
    data: {
      student: {
        level: student.level,
        totalPoints: student.totalPoints,
        nextLevelPoints: student.nextLevelPoints,
        completedAssignments: student.completedAssignments,
        totalAssignments: student.totalAssignments,
        currentStreak: student.currentStreak,
        longestStreak: student.longestStreak,
        weeklyGoal: student.weeklyGoal,
        completedThisWeek: student.completedThisWeek,
        globalRank: student.globalRank,
        classRank: student.classRank,
        progressPercentage: student.getProgressPercentage(),
        levelProgress: student.getLevelProgress(),
        lastActivityDate: student.lastActivityDate
      },
      leaderboard: leaderboard.map((item, index) => ({
        rank: index + 1,
        name: item.name,
        points: item.totalPoints,
        level: item.level,
        avatar: item.name.split(' ').map(n => n[0]).join('').toUpperCase(),
        isCurrentUser: item.email === req.user.email
      })),
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      }
    }
  });
}));

// @desc    Get student profile with detailed stats
// @route   GET /api/students/profile
// @access  Private
router.get('/profile', protect, asyncHandler(async (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only students can access this endpoint.'
    });
  }

  const student = await Student.findOne({ userId: req.user._id })
    .populate('assignmentHistory.assignmentId')
    .populate('courseEnrollments.courseId');

  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Student profile not found'
    });
  }

  res.json({
    success: true,
    data: {
      student: {
        name: student.name,
        email: student.email,
        level: student.level,
        totalPoints: student.totalPoints,
        nextLevelPoints: student.nextLevelPoints,
        completedAssignments: student.completedAssignments,
        totalAssignments: student.totalAssignments,
        currentStreak: student.currentStreak,
        longestStreak: student.longestStreak,
        weeklyGoal: student.weeklyGoal,
        completedThisWeek: student.completedThisWeek,
        globalRank: student.globalRank,
        classRank: student.classRank,
        progressPercentage: student.getProgressPercentage(),
        levelProgress: student.getLevelProgress(),
        achievements: student.achievements,
        assignmentHistory: student.assignmentHistory,
        courseEnrollments: student.courseEnrollments,
        lastActivityDate: student.lastActivityDate,

      }
    }
  });
}));

// @desc    Complete an assignment and earn points
// @route   POST /api/students/complete-assignment
// @access  Private
router.post('/complete-assignment', protect, asyncHandler(async (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only students can access this endpoint.'
    });
  }

  const { assignmentId, title, score, pointsEarned } = req.body;

  if (!title || score === undefined || !pointsEarned) {
    return res.status(400).json({
      success: false,
      message: 'Please provide assignment title, score, and points earned'
    });
  }

  let student = await Student.findOrCreateStudent(req.user._id);
  
  // Complete the assignment
  await student.completeAssignment(assignmentId, title, score, pointsEarned);
  
  // Update global rankings
  await Student.updateGlobalRankings();
  
  // Get updated student data
  student = await Student.findOne({ userId: req.user._id });

  res.json({
    success: true,
    message: 'Assignment completed successfully!',
    data: {
      level: student.level,
      totalPoints: student.totalPoints,
      nextLevelPoints: student.nextLevelPoints,
      pointsEarned,
      newStreak: student.currentStreak,
      globalRank: student.globalRank,
      levelProgress: student.getLevelProgress()
    }
  });
}));

// @desc    Add points to student (for various activities)
// @route   POST /api/students/add-points
// @access  Private
router.post('/add-points', protect, asyncHandler(async (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only students can access this endpoint.'
    });
  }

  const { points, reason } = req.body;

  if (!points || points <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Please provide valid points to add'
    });
  }

  let student = await Student.findOrCreateStudent(req.user._id);
  
  // Add points
  await student.addPoints(points, reason || 'Activity completion');
  
  // Update global rankings
  await Student.updateGlobalRankings();
  
  // Get updated student data
  student = await Student.findOne({ userId: req.user._id });

  res.json({
    success: true,
    message: `Earned ${points} points!`,
    data: {
      level: student.level,
      totalPoints: student.totalPoints,
      nextLevelPoints: student.nextLevelPoints,
      pointsEarned: points,
      newStreak: student.currentStreak,
      globalRank: student.globalRank,
      levelProgress: student.getLevelProgress()
    }
  });
}));

// @desc    Get global leaderboard
// @route   GET /api/students/leaderboard
// @access  Public
router.get('/leaderboard', asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;
  
  const leaderboard = await Student.getGlobalRankings(parseInt(limit));
  
  res.json({
    success: true,
    data: leaderboard.map((item, index) => ({
      rank: index + 1,
      name: item.name,
      points: item.totalPoints,
      level: item.level,
      avatar: item.name.split(' ').map(n => n[0]).join('').toUpperCase(),
      streak: item.currentStreak
    }))
  });
}));

// @desc    Update weekly goal
// @route   PUT /api/students/weekly-goal
// @access  Private
router.put('/weekly-goal', protect, asyncHandler(async (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only students can access this endpoint.'
    });
  }

  const { weeklyGoal } = req.body;

  if (!weeklyGoal || weeklyGoal < 1) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid weekly goal (minimum 1)'
    });
  }

  let student = await Student.findOrCreateStudent(req.user._id);
  student.weeklyGoal = weeklyGoal;
  await student.save();

  res.json({
    success: true,
    message: 'Weekly goal updated successfully',
    data: {
      weeklyGoal: student.weeklyGoal
    }
  });
}));

// @desc    Get student achievements
// @route   GET /api/students/achievements
// @access  Private
router.get('/achievements', protect, asyncHandler(async (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only students can access this endpoint.'
    });
  }

  const student = await Student.findOne({ userId: req.user._id });

  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Student profile not found'
    });
  }

  res.json({
    success: true,
    data: {
      achievements: student.achievements,
      totalAchievements: student.achievements.length,
      totalAchievementPoints: student.achievements.reduce((sum, achievement) => sum + achievement.points, 0)
    }
  });
}));

// @desc    Add achievement to student
// @route   POST /api/students/achievements
// @access  Private
router.post('/achievements', protect, asyncHandler(async (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only students can access this endpoint.'
    });
  }

  const { name, description, points } = req.body;

  if (!name || !description || !points) {
    return res.status(400).json({
      success: false,
      message: 'Please provide achievement name, description, and points'
    });
  }

  let student = await Student.findOrCreateStudent(req.user._id);
  
  // Check if achievement already exists
  const existingAchievement = student.achievements.find(a => a.name === name);
  if (existingAchievement) {
    return res.status(400).json({
      success: false,
      message: 'Achievement already earned'
    });
  }

  // Add achievement
  student.achievements.push({
    name,
    description,
    points,
    earnedAt: new Date()
  });

  // Add points for achievement
  await student.addPoints(points, `Achievement: ${name}`);
  
  await student.save();

  res.json({
    success: true,
    message: `Achievement unlocked: ${name}!`,
    data: {
      achievement: {
        name,
        description,
        points,
        earnedAt: new Date()
      },
      totalPoints: student.totalPoints,
      level: student.level
    }
  });
}));

// @desc    Get available assignments for student
// @route   GET /api/students/assignments/available
// @access  Private
router.get('/assignments/available', protect, asyncHandler(async (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only students can access this endpoint.'
    });
  }

  try {
    // Get student's enrolled courses
    const Enrollment = require('../models/Enrollment');
    const Course = require('../models/Course');
    
    // First get the student record for this user
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return res.json({
        success: true,
        data: {
          assignments: []
        }
      });
    }
    
    const enrollments = await Enrollment.find({ studentId: student._id })
      .populate('courseId')
      .populate('studentId');

    // Get subjects from enrolled courses
    const enrolledSubjects = enrollments.map(enrollment => enrollment.courseId.title);
    
    console.log('Student enrolled subjects:', enrolledSubjects);
    console.log('Enrollments data:', enrollments.map(e => ({
      courseName: e.courseId.title,
      courseId: e.courseId._id,
      studentId: e.studentId._id
    })));
    
    // If no enrollments, don't show any assignments
    if (enrolledSubjects.length === 0) {
      console.log('No enrollments found, showing no assignments');
      return res.json({
        success: true,
        data: {
          assignments: []
        }
      });
    }

    // Get all active assignments from teachers
    const Teacher = require('../models/Teacher');
    const teachers = await Teacher.find({ 'assignments.status': 'active' })
      .populate('userId', 'name')
      .select('assignments userId');
    
    // Log all available subjects from assignments for comparison
    const allAssignmentSubjects = new Set();
    teachers.forEach(teacher => {
      teacher.assignments.forEach(assignment => {
        allAssignmentSubjects.add(assignment.subject);
      });
    });
    console.log('All assignment subjects available:', Array.from(allAssignmentSubjects));

    // Get student's completed assignments to filter them out
    const completedAssignmentIds = student?.assignmentHistory?.map(assignment => 
      assignment.assignmentId.toString()
    ) || [];

    const availableAssignments = [];
    
    teachers.forEach(teacher => {
      console.log(`Teacher ${teacher.userId.name} has ${teacher.assignments.length} assignments`);
      
      teacher.assignments
        .filter(assignment => assignment.status === 'active')
        .filter(assignment => !completedAssignmentIds.includes(assignment._id.toString()))
        .forEach(assignment => {
          // Show assignment only if student is enrolled in the subject AND with the specific teacher
          // Modified logic: Only show assignments from the teacher whose course the student is enrolled in
          const isEnrolled = enrollments.some(enrollment => {
            const subjectMatch = enrollment.courseId.title.toLowerCase() === assignment.subject.toLowerCase() ||
              enrollment.courseId.title.toLowerCase().includes(assignment.subject.toLowerCase()) ||
              assignment.subject.toLowerCase().includes(enrollment.courseId.title.toLowerCase());
            
            const teacherMatch = enrollment.courseId.teacherId.toString() === teacher._id.toString();
            
            return subjectMatch && teacherMatch;
          });
          
          // Enhanced debugging for assignment matching
          if (!isEnrolled) {
            console.log(`   🔍 Debug: Assignment "${assignment.title}" not showing because:`);
            console.log(`      Assignment subject: "${assignment.subject}"`);
            console.log(`      Assignment teacher: "${teacher.userId.name}" (${teacher._id})`);
            console.log(`      Student enrollments:`);
            enrollments.forEach(enrollment => {
              const subjectMatch = enrollment.courseId.title.toLowerCase() === assignment.subject.toLowerCase() ||
                enrollment.courseId.title.toLowerCase().includes(assignment.subject.toLowerCase()) ||
                assignment.subject.toLowerCase().includes(enrollment.courseId.title.toLowerCase());
              const teacherMatch = enrollment.courseId.teacherId.toString() === teacher._id.toString();
              console.log(`        - Course: "${enrollment.courseId.title}" (Teacher: ${enrollment.courseId.teacherId})`);
              console.log(`          Subject match: ${subjectMatch ? '✅' : '❌'}, Teacher match: ${teacherMatch ? '✅' : '❌'}`);
            });
          } else {
            console.log(`   ✅ Assignment "${assignment.title}" will be shown (subject + teacher match)`);
          }
          
          // Special logging for AI-related assignments
          if (assignment.subject.toLowerCase().includes('ai') || assignment.title.toLowerCase().includes('ai')) {
            console.log(`AI Assignment Debug: "${assignment.title}" (Subject: "${assignment.subject}")`);
            console.log(`  - Enrolled subjects: [${enrolledSubjects.join(', ')}]`);
            console.log(`  - Subject match: ${isEnrolled}`);
            console.log(`  - Case comparison: "${assignment.subject.toLowerCase()}" vs enrolled subjects`);
          }
          
          if (isEnrolled) {
            availableAssignments.push({
              id: assignment._id,
              title: assignment.title,
              description: assignment.description,
              subject: assignment.subject,
              dueDate: assignment.dueDate,
              points: assignment.points,
              type: assignment.type,
              questions: assignment.questions || [],
              timeLimit: assignment.timeLimit || 1800, // 30 minutes default
              teacherName: teacher.userId.name,
              teacherEmail: teacher.email, // Add teacher email
              createdAt: assignment.createdAt
            });
          }
        });
    });

    console.log(`Found ${availableAssignments.length} available assignments for enrolled subjects`);

    res.json({
      success: true,
      data: {
        assignments: availableAssignments
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available assignments'
    });
  }
}));

// @desc    Submit assignment
// @route   POST /api/students/assignments/submit
// @access  Private
router.post('/assignments/submit', protect, asyncHandler(async (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only students can access this endpoint.'
    });
  }

  const { assignmentId, title, score, pointsEarned, type = 'assignment', submission, answers } = req.body;

  if (!assignmentId || !title || score === undefined || !pointsEarned) {
    return res.status(400).json({
      success: false,
      message: 'Please provide assignment ID, title, score, and points earned'
    });
  }

  let student = await Student.findOrCreateStudent(req.user._id);
  
  // Complete the assignment
  await student.completeAssignment(assignmentId, title, score, pointsEarned, type, answers);
  
  // Update global rankings
  await Student.updateGlobalRankings();
  
  // Get updated student data
  student = await Student.findOne({ userId: req.user._id });

  res.json({
    success: true,
    message: 'Assignment submitted successfully!',
    data: {
      level: student.level,
      totalPoints: student.totalPoints,
      nextLevelPoints: student.nextLevelPoints,
      pointsEarned,
      newStreak: student.currentStreak,
      globalRank: student.globalRank,
      levelProgress: student.getLevelProgress()
    }
  });
}));

// @desc    Submit homework with file upload
// @route   POST /api/students/assignments/submit-homework
// @access  Private
router.post('/assignments/submit-homework', protect, asyncHandler(async (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only students can access this endpoint.'
    });
  }

  const { assignmentId, title, type, points } = req.body;

  if (!assignmentId || !title || !type || !points) {
    return res.status(400).json({
      success: false,
      message: 'Please provide assignment ID, title, type, and points'
    });
  }

  // Check if files were uploaded
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Please upload at least one file'
    });
  }

  try {
    let student = await Student.findOrCreateStudent(req.user._id);
    
    // Process uploaded files
    const uploadedFiles = [];
    let files = [];
    
    // Handle different ways files might be sent
    if (req.files.files) {
      files = Array.isArray(req.files.files) ? req.files.files : [req.files.files];
    } else if (req.files.file) {
      files = Array.isArray(req.files.file) ? req.files.file : [req.files.file];
    } else {
      // If no specific key, use the first file
      const fileKeys = Object.keys(req.files);
      if (fileKeys.length > 0) {
        files = Array.isArray(req.files[fileKeys[0]]) ? req.files[fileKeys[0]] : [req.files[fileKeys[0]]];
      }
    }
    
    console.log('Files received:', {
      filesCount: files.length,
      fileNames: files.map(f => f.name),
      reqFiles: Object.keys(req.files),
      fileKeys: Object.keys(req.files)
    });
    
    for (const file of files) {
      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileExtension = file.name.split('.').pop();
      const fileName = `${timestamp}_${randomString}.${fileExtension}`;
      
      // Move file to uploads directory
      const uploadPath = `./uploads/homework/${fileName}`;
      
      // Create directory if it doesn't exist
      const fs = require('fs');
      const path = require('path');
      const uploadDir = path.dirname(uploadPath);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      await file.mv(uploadPath);
      
      uploadedFiles.push({
        originalName: file.name,
        fileName: fileName,
        filePath: uploadPath,
        fileSize: file.size,
        mimeType: file.mimetype
      });
    }
    
    // Complete the assignment with file information
    await student.completeAssignment(assignmentId, title, 100, parseInt(points), null, uploadedFiles);
    
    // Update global rankings
    await Student.updateGlobalRankings();
    
    // Get updated student data
    student = await Student.findOne({ userId: req.user._id });

    res.json({
      success: true,
      message: 'Homework submitted successfully!',
      data: {
        level: student.level,
        totalPoints: student.totalPoints,
        nextLevelPoints: student.nextLevelPoints,
        pointsEarned: parseInt(points),
        newStreak: student.currentStreak,
        globalRank: student.globalRank,
        levelProgress: student.getLevelProgress(),
        filesUploaded: uploadedFiles.length
      }
    });
  } catch (error) {
    console.error('Homework submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit homework',
      error: error.message
    });
  }
}));

// @desc    Get assignment history
// @route   GET /api/students/assignments/history
// @access  Private
router.get('/assignments/history', protect, asyncHandler(async (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only students can access this endpoint.'
    });
  }

  const student = await Student.findOne({ userId: req.user._id });

  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Student profile not found'
    });
  }

  res.json({
    success: true,
    data: {
      assignments: student.assignmentHistory.map(assignment => ({
        id: assignment.assignmentId,
        title: assignment.title,
        score: assignment.score,
        pointsEarned: assignment.pointsEarned,
        completedAt: assignment.completedAt
      }))
    }
  });
  }));
  
  // @desc    Update student profile information
  // @route   PUT /api/students/profile
  // @access  Private
  router.put('/profile', protect, asyncHandler(async (req, res) => {
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only students can access this endpoint.'
      });
    }

    const { name, email, hierarchyData } = req.body;

    try {
      // Find or create student record
      let student = await Student.findOrCreateStudent(req.user._id);

      // Update name and email if provided
      if (name && name !== student.name) {
        student.name = name;
      }

      if (email && email !== student.email) {
        student.email = email;
      }

      // Update hierarchy information if provided
      if (hierarchyData) {
        student.instituteName = hierarchyData.instituteName || student.instituteName;
        student.className = hierarchyData.className || student.className;
        student.section = hierarchyData.section || student.section;
        student.batchYear = hierarchyData.batchYear || student.batchYear;
      }

      await student.save();

      res.json({
        success: true,
        message: 'Student profile updated successfully',
        data: {
          student: {
            id: student._id,
            name: student.name,
            email: student.email,
            instituteName: student.instituteName,
            className: student.className,
            section: student.section,
            batchYear: student.batchYear
          }
        }
      });
    } catch (error) {
      console.error('Error updating student profile:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update student profile'
      });
    }
  }));
  
  // @desc    Update student hierarchy information
// @route   POST /api/students/update-hierarchy
// @access  Private
router.post('/update-hierarchy', protect, asyncHandler(async (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only students can access this endpoint.'
    });
  }

  const { hierarchyData } = req.body;

  if (!hierarchyData) {
    return res.status(400).json({
      success: false,
      message: 'Hierarchy data is required'
    });
  }

  try {
    // Find or create student record
    let student = await Student.findOrCreateStudent(req.user._id);
    
    // Update student with hierarchy information
    student.instituteName = hierarchyData.instituteName;
    student.className = hierarchyData.className;
    student.section = hierarchyData.section;
    student.batchYear = hierarchyData.batchYear;
    
    await student.save();

    // Trigger automatic enrollment in matching courses
    let autoEnrollmentResult = null;
    if (student.instituteName && student.className && student.section && student.batchYear) {
      try {
        autoEnrollmentResult = await student.autoEnrollInMatchingCourses();
      } catch (error) {
        console.error('Auto-enrollment failed:', error);
        autoEnrollmentResult = { error: error.message };
      }
    }

    res.json({
      success: true,
      message: 'Student hierarchy information updated successfully',
      data: {
        student: {
          id: student._id,
          instituteName: student.instituteName,
          className: student.className,
          section: student.section,
          batchYear: student.batchYear
        },
        autoEnrollment: autoEnrollmentResult
      }
    });
  } catch (error) {
    console.error('Error updating student hierarchy:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update student hierarchy information'
    });
  }
}));

// @desc    Get all available courses from teachers
// @route   GET /api/students/courses/available
// @access  Private
router.get('/courses/available', protect, asyncHandler(async (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only students can access this endpoint.'
    });
  }

  try {
    // Import models
    const Course = require('../models/Course');
    const Teacher = require('../models/Teacher');
    
    // Get student hierarchy information
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    // Get all teachers with their subjects
    const teachers = await Teacher.find({})
      .populate('userId', 'name email')
      .select('subjects userId');

    // Create courses from teacher subjects if they don't exist
    const allCourses = [];
    
    for (const teacher of teachers) {
      if (teacher.subjects && teacher.subjects.length > 0) {
        for (const subject of teacher.subjects) {
          if (subject.isActive) {
            // Check if course already exists
            let course = await Course.findOne({
              teacherId: teacher._id,
              subject: subject.name
            });

            // Create course if it doesn't exist
            if (!course) {
              try {
                course = await Course.createFromTeacherSubject(teacher._id, subject);
              } catch (error) {
                console.error(`Error creating course for ${subject.name}:`, error);
                continue; // Skip this course if creation fails
              }
            }

            // Add to all courses
            allCourses.push({
              id: course._id,
              title: course.title,
              instructor: teacher.userId.name,
              instructorId: teacher.userId._id,
              teacherId: teacher._id,
              description: course.description,
              price: course.pricing.price,
              currency: course.pricing.currency,
              isFree: course.pricing.isFree,
              level: course.level,
              rating: course.averageRating,
              students: course.totalStudents,
              duration: course.estimatedDuration,
              modules: course.modules.length,
              certificate: course.badges.certificate,
              thumbnail: course.thumbnail,
              bestseller: course.badges.bestseller,
              popular: course.badges.popular,
              new: course.badges.new,
              originalPrice: course.pricing.originalPrice,
              category: course.category,
              tags: course.tags,
              hierarchy: course.hierarchy,
              autoEnrollment: course.autoEnrollment
            });
          }
        }
      }
    }

    // Filter courses based on student hierarchy
    let availableCourses = allCourses;
    let hierarchyFiltered = false;

    // If student has complete hierarchy information, filter courses
    if (student.instituteName && student.className && student.section && student.batchYear) {
      const matchingCourses = allCourses.filter(course => 
        course.hierarchy &&
        course.hierarchy.instituteName &&
        course.hierarchy.className &&
        course.hierarchy.section &&
        course.hierarchy.batchYear &&
        course.hierarchy.instituteName === student.instituteName &&
        course.hierarchy.className === student.className &&
        course.hierarchy.section === student.section &&
        course.hierarchy.batchYear === student.batchYear
      );

      if (matchingCourses.length > 0) {
        availableCourses = matchingCourses;
        hierarchyFiltered = true;
      } else {
        console.log(`No courses found matching student hierarchy: ${student.instituteName} - ${student.className} ${student.section} (${student.batchYear})`);
      }
    } else {
      console.log('Student hierarchy incomplete, showing all available courses');
    }

    // Add enrollment status for each course
    const Enrollment = require('../models/Enrollment');
    const coursesWithEnrollmentStatus = await Promise.all(
      availableCourses.map(async (course) => {
        const enrollment = await Enrollment.findOne({
          studentId: student._id,
          courseId: course.id
        });

        return {
          ...course,
          isEnrolled: !!enrollment,
          enrollmentStatus: enrollment ? enrollment.status : null,
          progress: enrollment ? enrollment.progress : 0
        };
      })
    );

    res.json({
      success: true,
      data: {
        courses: coursesWithEnrollmentStatus,
        totalCourses: coursesWithEnrollmentStatus.length,
        hierarchyFiltered: hierarchyFiltered,
        studentHierarchy: {
          instituteName: student.instituteName,
          className: student.className,
          section: student.section,
          batchYear: student.batchYear
        },
        message: hierarchyFiltered 
          ? `Showing ${coursesWithEnrollmentStatus.length} courses matching your hierarchy`
          : `Showing all ${coursesWithEnrollmentStatus.length} available courses`
      }
    });
  } catch (error) {
    console.error('Error fetching available courses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available courses'
    });
  }
}));




module.exports = router; 