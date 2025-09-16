const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email address'
    ]
  },
  level: {
    type: Number,
    default: 1,
    min: 1
  },
  totalPoints: {
    type: Number,
    default: 0,
    min: 0
  },
  nextLevelPoints: {
    type: Number,
    default: 100
  },
  completedAssignments: {
    type: Number,
    default: 0
  },
  totalAssignments: {
    type: Number,
    default: 0
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  lastActivityDate: {
    type: Date,
    default: Date.now
  },
  weeklyGoal: {
    type: Number,
    default: 5
  },
  completedThisWeek: {
    type: Number,
    default: 0
  },
  weekStartDate: {
    type: Date,
    default: Date.now
  },
  globalRank: {
    type: Number,
    default: 0
  },
  classRank: {
    type: Number,
    default: 0
  },

  // Hierarchy information
  instituteName: {
    type: String,
    default: ""
  },
  className: {
    type: String,
    default: ""
  },
  section: {
    type: String,
    default: ""
  },
  batchYear: {
    type: String,
    default: ""
  },
  // Add assignments field for students to access assignments
  assignments: [{
    title: String,
    description: String,
    subject: String,
    dueDate: Date,
    points: Number,
    type: String,
    status: String,
    totalStudents: Number,
    submittedCount: Number,
    averageScore: Number,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  achievements: [{
    name: String,
    description: String,
    earnedAt: {
      type: Date,
      default: Date.now
    },
    points: Number
  }],
  assignmentHistory: [{
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment'
    },
    title: String,
    score: Number,
    completedAt: {
      type: Date,
      default: Date.now
    },
    pointsEarned: Number,
    answers: mongoose.Schema.Types.Mixed,
    uploadedFiles: [{
      originalName: String,
      fileName: String,
      filePath: String,
      fileSize: Number,
      mimeType: String
    }]
  }],
  courseEnrollments: [{
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    },
    enrolledAt: {
      type: Date,
      default: Date.now
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    completedModules: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module'
    }]
  }]
}, {
  timestamps: true
});

// Index for better query performance
studentSchema.index({ userId: 1 });
studentSchema.index({ totalPoints: -1 }); // For ranking
studentSchema.index({ level: -1 });
studentSchema.index({ name: 1 }); // For name searches
studentSchema.index({ email: 1 }); // For email searches

// Pre-save middleware to update level based on points
studentSchema.pre('save', function(next) {
  // Calculate level based on total points
  // Level 1: 0-99 points
  // Level 2: 100-299 points
  // Level 3: 300-599 points
  // Level 4: 600-999 points
  // Level 5: 1000-1499 points
  // And so on...
  
  const newLevel = Math.floor(Math.sqrt(this.totalPoints / 100)) + 1;
  const newNextLevelPoints = Math.pow(newLevel, 2) * 100;
  
  if (newLevel !== this.level) {
    this.level = newLevel;
    this.nextLevelPoints = newNextLevelPoints;
  }
  
  next();
});

// Instance method to add points
studentSchema.methods.addPoints = async function(points, reason = 'Assignment completion') {
  this.totalPoints += points;
  
  // Update streak if activity is today
  const today = new Date().toDateString();
  const lastActivity = new Date(this.lastActivityDate).toDateString();
  
  if (today === lastActivity) {
    // Already logged activity today
  } else if (new Date(this.lastActivityDate).getTime() + 24 * 60 * 60 * 1000 >= new Date().getTime()) {
    // Activity within 24 hours, increment streak
    this.currentStreak += 1;
    if (this.currentStreak > this.longestStreak) {
      this.longestStreak = this.currentStreak;
    }
  } else {
    // Break in streak, reset to 1
    this.currentStreak = 1;
  }
  
  this.lastActivityDate = new Date();
  
  // Update weekly progress
  this.updateWeeklyProgress();
  
  await this.save();
  return this;
};

// Instance method to complete assignment
studentSchema.methods.completeAssignment = async function(assignmentId, title, score, pointsEarned, type = 'assignment', answers = null, uploadedFiles = null) {
  this.completedAssignments += 1;
  this.totalAssignments += 1;
  this.completedThisWeek += 1;
  
  this.assignmentHistory.push({
    assignmentId,
    title,
    score,
    pointsEarned,
    type,
    answers,
    uploadedFiles,
    completedAt: new Date()
  });
  
  await this.addPoints(pointsEarned, `Assignment: ${title}`);
  return this;
};

// Instance method to update weekly progress
studentSchema.methods.updateWeeklyProgress = function() {
  const now = new Date();
  const weekStart = new Date(this.weekStartDate);
  const daysDiff = Math.floor((now - weekStart) / (1000 * 60 * 60 * 24));
  
  if (daysDiff >= 7) {
    // New week, reset counters
    this.completedThisWeek = 0;
    this.weekStartDate = now;
  }
};

// Instance method to get progress percentage
studentSchema.methods.getProgressPercentage = function() {
  if (this.totalAssignments === 0) return 0;
  return Math.round((this.completedAssignments / this.totalAssignments) * 100);
};

// Instance method to get level progress
studentSchema.methods.getLevelProgress = function() {
  const currentLevelPoints = Math.pow(this.level - 1, 2) * 100;
  const pointsInCurrentLevel = this.totalPoints - currentLevelPoints;
  const pointsNeededForLevel = this.nextLevelPoints - currentLevelPoints;
  
  return Math.min(100, Math.round((pointsInCurrentLevel / pointsNeededForLevel) * 100));
};

// Static method to get global rankings
studentSchema.statics.getGlobalRankings = async function(limit = 10) {
  return await this.find()
    .sort({ totalPoints: -1, level: -1 })
    .limit(limit)
    .select('name email level totalPoints currentStreak');
};

// Static method to update global rankings
studentSchema.statics.updateGlobalRankings = async function() {
  const students = await this.find().sort({ totalPoints: -1, level: -1 });
  
  for (let i = 0; i < students.length; i++) {
    students[i].globalRank = i + 1;
    await students[i].save();
  }
};

// Static method to find or create student
studentSchema.statics.findOrCreateStudent = async function(userId) {
  try {
    // Check the user's role before creating a student
    const User = require('./User');
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    if (user.role !== 'student') {
      throw new Error(`Cannot create Student: user ${user.email} has role '${user.role}', expected 'student'`);
    }
    
    if (!user.name || !user.email) {
      throw new Error(`User ${userId} is missing required fields: name=${user.name}, email=${user.email}`);
    }
    
    let student = await this.findOne({ userId });
    if (!student) {
      // Create student with name and email from user
      console.log(`Creating new student for user: ${user.name} (${user.email})`);
      student = await this.create({ 
        userId,
        name: user.name,
        email: user.email
      });
      console.log(`Student created successfully with ID: ${student._id}`);
    } else {
      // Update existing student's name and email if they're missing or have changed
      if (!student.name || !student.email || student.name !== user.name || student.email !== user.email) {
        console.log(`Updating student ${student._id}: name="${student.name || 'MISSING'}"->"${user.name}", email="${student.email || 'MISSING'}"->"${user.email}"`);
        student.name = user.name;
        student.email = user.email;
        await student.save();
        console.log(`Student updated successfully`);
      }
    }
    return student;
  } catch (error) {
    console.error('Error in findOrCreateStudent:', error);
    throw error;
  }
};

// Static method to sync student name and email with user
studentSchema.statics.syncWithUser = async function(userId) {
  const User = require('./User');
  const user = await User.findById(userId);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  const student = await this.findOne({ userId });
  if (student && (student.name !== user.name || student.email !== user.email)) {
    student.name = user.name;
    student.email = user.email;
    await student.save();
    return student;
  }
  
  return student;
};

// Instance method to auto-enroll in matching courses
studentSchema.methods.autoEnrollInMatchingCourses = async function() {
  const Course = require('./Course');
  const Enrollment = require('./Enrollment');
  
  // Find courses that match this student's hierarchy
  const matchingCourses = await Course.findByHierarchy({
    instituteName: this.instituteName,
    className: this.className,
    section: this.section,
    batchYear: this.batchYear
  });
  
  let enrolledCount = 0;
  const errors = [];
  
  for (const course of matchingCourses) {
    try {
      // Check if already enrolled
      const existingEnrollment = await Enrollment.findOne({
        studentId: this._id,
        courseId: course._id
      });
      
      if (!existingEnrollment) {
        // Auto-enroll the student
        await Enrollment.create({
          studentId: this._id,
          courseId: course._id,
          status: 'enrolled',
          progress: 0,
          completedModules: [],
          lastActivityAt: new Date()
        });
        enrolledCount++;
        
        // Update course student count
        await course.updateStudentCount();
      }
    } catch (error) {
      errors.push(`Failed to enroll in course ${course.title}: ${error.message}`);
    }
  }
  
  return {
    enrolled: enrolledCount,
    totalMatching: matchingCourses.length,
    errors: errors,
    message: `Auto-enrolled in ${enrolledCount} courses out of ${matchingCourses.length} matching courses`
  };
};

// Pre-save middleware to auto-enroll when hierarchy changes
studentSchema.pre('save', async function(next) {
  // Check if hierarchy fields have changed
  if (this.isModified('instituteName') || this.isModified('className') || 
      this.isModified('section') || this.isModified('batchYear')) {
    
    // Only auto-enroll if all hierarchy fields are filled
    if (this.instituteName && this.className && this.section && this.batchYear) {
      try {
        // Auto-enroll in matching courses after saving
        this.autoEnrollInMatchingCourses().catch(error => {
          console.error('Auto-enrollment failed:', error);
        });
      } catch (error) {
        console.error('Error in auto-enrollment middleware:', error);
      }
    }
  }
  next();
});

module.exports = mongoose.model('Student', studentSchema); 