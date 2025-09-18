const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  // Teacher's name
  name: {
    type: String,
    required: true
  },
  // What subjects this teacher teaches
  subjects: [{
    name: String, // "Web Development", "Data Science", etc.
    isActive: {
      type: Boolean,
      default: true
    },
    // Student count for this specific subject
    studentCount: {
      type: Number,
      default: 0,
      min: 0
    },
    // Pricing information for course enrollment
    pricing: {
      price: {
        type: Number,
        default: 99,
        min: 0
      },
      currency: {
        type: String,
        default: 'USD',
        enum: ['USD', 'EUR', 'GBP', 'INR']
      },
      isFree: {
        type: Boolean,
        default: false
      },
      description: {
        type: String,
        default: ''
      }
    }
  }],
  // Teacher's assignments
  assignments: [{
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    subject: {
      type: String,
      required: true
    }, // Which subject this assignment is for
    dueDate: {
      type: Date,
      required: true
    },
    points: {
      type: Number,
      required: true
    },
    type: {
      type: String,
      enum: ['quiz', 'homework'],
      default: 'homework'
    }, // "quiz", "homework"
    // Questions for quiz assignments
    questions: [{
      question: {
        type: String,
        required: function() { return this.parent().type === 'quiz'; }
      },
      type: {
        type: String,
        enum: ['multiple-choice', 'true-false', 'short-answer'],
        default: 'multiple-choice'
      },
      options: [{
        text: String,
        isCorrect: {
          type: Boolean,
          default: false
        }
      }],
      correctAnswer: mongoose.Schema.Types.Mixed, // For true/false or other answer types
      points: {
        type: Number,
        default: 1
      },
      maxLength: Number // For short answer questions
    }],
    // Time limit for quiz in seconds
    timeLimit: {
      type: Number,
      default: 1800 // 30 minutes default
    },
    status: {
      type: String,
      enum: ['active', 'completed'],
      default: 'active'
    }, // "active", "completed"
    totalStudents: {
      type: Number,
      default: 0
    },
    submittedCount: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      default: 0
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Basic stats
  totalStudents: {
    type: Number,
    default: 0
  },
  activeAssignments: {
    type: Number,
    default: 0
  },
  completedAssignments: {
    type: Number,
    default: 0
  },
  averageScore: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for better query performance
teacherSchema.index({ userId: 1 });

// Static method to find or create teacher
teacherSchema.statics.findOrCreateTeacher = async function(userId) {
  try {
    // Check the user's role before creating a teacher
    const User = require('./User');
    const user = await User.findById(userId);
    if (!user || user.role !== 'teacher') {
      throw new Error('Cannot create Teacher: user is not a teacher');
    }
    console.log('findOrCreateTeacher called with userId:', userId);
    let teacher = await this.findOne({ userId });
    console.log('Existing teacher found:', teacher ? teacher._id : 'none');
    if (!teacher) {
      console.log('Creating new teacher record...');
      teacher = await this.create({
        userId,
        name: user.name, // Get teacher's name from User model
        subjects: []
      });
      console.log('New teacher created:', teacher._id);
    }
    return teacher;
  } catch (error) {
    console.error('Error in findOrCreateTeacher:', error);
    throw error;
  }
};

// Instance method to update statistics
teacherSchema.methods.updateStatistics = async function() {
  this.activeAssignments = this.assignments.filter(a => a.status === 'active').length;
  this.completedAssignments = this.assignments.filter(a => a.status === 'completed').length;
  
  // Calculate average score
  const scoredAssignments = this.assignments.filter(a => a.averageScore > 0);
  this.averageScore = scoredAssignments.length > 0 
    ? Math.round(scoredAssignments.reduce((sum, a) => sum + a.averageScore, 0) / scoredAssignments.length)
    : 0;
  
  await this.save();
  return this;
};

// Instance method to create assignment
teacherSchema.methods.createAssignment = async function(assignmentData) {
  try {
    console.log('Creating assignment with data:', assignmentData);
    
    const assignment = {
      title: assignmentData.title,
      description: assignmentData.description,
      subject: assignmentData.subject,
      dueDate: new Date(assignmentData.dueDate),
      points: parseInt(assignmentData.points),
      type: assignmentData.type || 'homework',
      questions: assignmentData.questions || [],
      timeLimit: assignmentData.timeLimit || 1800, // 30 minutes default
      status: 'active',
      totalStudents: 0,
      submittedCount: 0,
      averageScore: 0,
      createdAt: new Date()
    };
    
    console.log('Assignment object to push:', assignment);
    
    this.assignments.push(assignment);
    console.log('Assignment pushed to array. Current assignments count:', this.assignments.length);
    
    await this.save();
    console.log('Teacher saved successfully');
    
    await this.updateStatistics();
    console.log('Statistics updated');
    
    return this.assignments[this.assignments.length - 1];
  } catch (error) {
    console.error('Error in createAssignment:', error);
    throw error;
  }
};

// Instance method to get assignments by subject
teacherSchema.methods.getAssignmentsBySubject = function(subject) {
  return this.assignments.filter(assignment => assignment.subject === subject);
};

// Instance method to get subject statistics
teacherSchema.methods.getSubjectStatistics = function(subject) {
  const subjectAssignments = this.getAssignmentsBySubject(subject);
  
  return {
    assignments: subjectAssignments.length,
    activeAssignments: subjectAssignments.filter(a => a.status === 'active').length,
    completedAssignments: subjectAssignments.filter(a => a.status === 'completed').length,
    averageScore: subjectAssignments.length > 0 
      ? Math.round(subjectAssignments.reduce((sum, a) => sum + a.averageScore, 0) / subjectAssignments.length)
      : 0
  };
};

// Instance method to update subject student counts
teacherSchema.methods.updateSubjectStudentCounts = async function() {
  const Enrollment = require('./Enrollment');
  const Course = require('./Course');
  
  for (const subject of this.subjects) {
    if (subject.isActive) {
      // Find the course for this subject
      const course = await Course.findOne({ 
        teacherId: this._id, 
        subject: subject.name 
      });
      
      if (course) {
        // Count active enrollments for this subject
        const enrollmentCount = await Enrollment.countDocuments({ 
          courseId: course._id, 
          status: { $in: ['enrolled', 'completed'] }
        });
        
        // Update the subject's student count
        subject.studentCount = enrollmentCount;
      }
    }
  }
  
  // Update total student count
  this.totalStudents = this.subjects.reduce((sum, subject) => sum + (subject.studentCount || 0), 0);
  
  await this.save();
  return this;
};

module.exports = mongoose.model('Teacher', teacherSchema); 