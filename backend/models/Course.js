const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  // Course basic info
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  
  // Course hierarchy for automatic enrollment
  hierarchy: {
    instituteName: {
      type: String,
      required: false, // Changed from true to false to prevent validation errors
      trim: true,
      default: ''
    },
    className: {
      type: String,
      required: false, // Changed from true to false to prevent validation errors
      trim: true,
      default: ''
    },
    section: {
      type: String,
      required: false, // Changed from true to false to prevent validation errors
      trim: true,
      default: ''
    },
    batchYear: {
      type: String,
      required: false, // Changed from true to false to prevent validation errors
      trim: true,
      default: ''
    }
  },
  
  // Auto-enrollment settings
  autoEnrollment: {
    enabled: {
      type: Boolean,
      default: true
    },
    autoEnrollNewStudents: {
      type: Boolean,
      default: true
    },
    autoEnrollExistingStudents: {
      type: Boolean,
      default: false
    }
  },
  
  // Course pricing
  pricing: {
    price: {
      type: Number,
      required: true,
      min: 0,
      default: 99
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
    originalPrice: {
      type: Number,
      min: 0
    }
  },
  
  // Course content
  modules: [{
    title: {
      type: String,
      required: true
    },
    description: String,
    duration: String, // e.g., "2 hours"
    content: String,
    order: {
      type: Number,
      default: 0
    },
    isPublished: {
      type: Boolean,
      default: true
    }
  }],
  
  // Course metadata
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  category: {
    type: String,
    default: 'Programming'
  },
  tags: [String],
  thumbnail: {
    type: String,
    default: '📚'
  },
  
  // Course stats
  totalStudents: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 4.5,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  
  // Course status
  isActive: {
    type: Boolean,
    default: true
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  
  // Course badges
  badges: {
    bestseller: {
      type: Boolean,
      default: false
    },
    popular: {
      type: Boolean,
      default: false
    },
    new: {
      type: Boolean,
      default: false
    },
    certificate: {
      type: Boolean,
      default: true
    }
  },
  
  // Course duration
  estimatedDuration: {
    type: String,
    default: '8-12 weeks'
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
courseSchema.index({ instructor: 1 });
courseSchema.index({ subject: 1 });
courseSchema.index({ isActive: 1, isPublished: 1 });
courseSchema.index({ 'pricing.isFree': 1 });
courseSchema.index({ totalStudents: -1 });
courseSchema.index({ averageRating: -1 });
// Hierarchy indexes for automatic enrollment
courseSchema.index({ 'hierarchy.instituteName': 1 });
courseSchema.index({ 'hierarchy.className': 1 });
courseSchema.index({ 'hierarchy.section': 1 });
courseSchema.index({ 'hierarchy.batchYear': 1 });
courseSchema.index({ 'hierarchy.instituteName': 1, 'hierarchy.className': 1, 'hierarchy.section': 1, 'hierarchy.batchYear': 1 });

// Pre-save middleware to update timestamps
courseSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static method to create course from teacher subject
courseSchema.statics.createFromTeacherSubject = async function(teacherId, subject) {
  const Teacher = require('./Teacher');
  const TeacherProfile = require('./TeacherProfile');
  const teacher = await Teacher.findById(teacherId).populate('userId', 'name');
  
  if (!teacher) {
    throw new Error('Teacher not found');
  }
  
  // Get teacher profile for hierarchy information
  const teacherProfile = await TeacherProfile.findOne({ userId: teacher.userId._id });
  
  if (!teacherProfile) {
    // Create course without hierarchy if teacher profile doesn't exist
    console.warn(`Teacher profile not found for ${teacher.userId.name}. Creating course without hierarchy.`);
  }
  
  const courseData = {
    title: subject.name,
    description: subject.pricing?.description || `Learn ${subject.name} from expert instructor ${teacher.userId.name}`,
    instructor: teacher.userId._id,
    teacherId: teacher._id,
    subject: subject.name,
    hierarchy: {
      instituteName: teacherProfile?.instituteName || '',
      className: teacherProfile?.className || '',
      section: teacherProfile?.section || '',
      batchYear: teacherProfile?.batchYear || ''
    },
    autoEnrollment: {
      enabled: teacherProfile ? true : false, // Disable auto-enrollment if no hierarchy
      autoEnrollNewStudents: teacherProfile ? true : false,
      autoEnrollExistingStudents: false
    },
    pricing: {
      price: subject.pricing?.isFree ? 0 : (subject.pricing?.price || 99),
      currency: subject.pricing?.currency || 'USD',
      isFree: subject.pricing?.isFree === true,
      originalPrice: subject.pricing?.isFree ? 0 : (subject.pricing?.price ? subject.pricing.price * 1.5 : 148.5)
    },
    level: 'Beginner',
    category: 'Programming',
    tags: [subject.name, 'Online Course', 'Expert Led'],
    thumbnail: '📚',
    badges: {
      bestseller: Math.random() > 0.7,
      popular: Math.random() > 0.8,
      new: Math.random() > 0.9,
      certificate: true
    },
    estimatedDuration: '8-12 weeks',
    modules: [
      {
        title: 'Introduction to ' + subject.name,
        description: 'Get started with the basics',
        duration: '2 hours',
        content: 'Introduction content...',
        order: 1
      },
      {
        title: 'Core Concepts',
        description: 'Learn the fundamental concepts',
        duration: '4 hours',
        content: 'Core concepts content...',
        order: 2
      },
      {
        title: 'Practical Applications',
        description: 'Apply what you learned',
        duration: '6 hours',
        content: 'Practical applications content...',
        order: 3
      }
    ]
  };
  
  return await this.create(courseData);
};

// Instance method to update student count
courseSchema.methods.updateStudentCount = async function() {
  const Enrollment = require('./Enrollment');
  const count = await Enrollment.countDocuments({ 
    courseId: this._id, 
    status: 'enrolled' 
  });
  this.totalStudents = count;
  await this.save();
  return this;
};

// Instance method to update rating
courseSchema.methods.updateRating = async function() {
  const Enrollment = require('./Enrollment');
  const enrollments = await Enrollment.find({ 
    courseId: this._id, 
    rating: { $exists: true, $ne: null } 
  });
  
  if (enrollments.length > 0) {
    const totalRating = enrollments.reduce((sum, enrollment) => sum + enrollment.rating, 0);
    this.averageRating = totalRating / enrollments.length;
    this.totalRatings = enrollments.length;
  }
  
  await this.save();
  return this;
};

// Instance method to automatically enroll students based on hierarchy
courseSchema.methods.autoEnrollStudents = async function() {
  if (!this.autoEnrollment.enabled) {
    return { enrolled: 0, message: 'Auto-enrollment is disabled for this course' };
  }
  
  // Check if course has complete hierarchy information
  if (!this.hierarchy || 
      !this.hierarchy.instituteName || 
      !this.hierarchy.className || 
      !this.hierarchy.section || 
      !this.hierarchy.batchYear) {
    return { 
      enrolled: 0, 
      message: 'Auto-enrollment requires complete hierarchy information (institute, class, section, batch year)' 
    };
  }
  
  const Student = require('./Student');
  const Enrollment = require('./Enrollment');
  
  // Find students matching the course hierarchy
  const matchingStudents = await Student.find({
    instituteName: this.hierarchy.instituteName,
    className: this.hierarchy.className,
    section: this.hierarchy.section,
    batchYear: this.hierarchy.batchYear
  });
  
  let enrolledCount = 0;
  const errors = [];
  
  for (const student of matchingStudents) {
    try {
      // Check if already enrolled
      const existingEnrollment = await Enrollment.findOne({
        studentId: student._id,
        courseId: this._id
      });
      
      if (!existingEnrollment) {
        // Auto-enroll the student
        await Enrollment.create({
          studentId: student._id,
          courseId: this._id,
          status: 'enrolled',
          progress: 0,
          completedModules: [],
          lastActivityAt: new Date()
        });
        enrolledCount++;
      }
    } catch (error) {
      errors.push(`Failed to enroll student ${student.name}: ${error.message}`);
    }
  }
  
  // Update course student count
  await this.updateStudentCount();
  
  return {
    enrolled: enrolledCount,
    totalMatching: matchingStudents.length,
    errors: errors,
    message: `Auto-enrolled ${enrolledCount} students out of ${matchingStudents.length} matching students`
  };
};

// Static method to auto-enroll students in all courses based on hierarchy
courseSchema.statics.autoEnrollAllStudents = async function() {
  const courses = await this.find({ 'autoEnrollment.enabled': true });
  const results = [];
  
  for (const course of courses) {
    try {
      const result = await course.autoEnrollStudents();
      results.push({
        courseId: course._id,
        courseTitle: course.title,
        ...result
      });
    } catch (error) {
      results.push({
        courseId: course._id,
        courseTitle: course.title,
        error: error.message
      });
    }
  }
  
  return results;
};

// Static method to find courses by hierarchy
courseSchema.statics.findByHierarchy = function(hierarchy) {
  // Validate that all hierarchy fields are provided
  if (!hierarchy || 
      !hierarchy.instituteName || 
      !hierarchy.className || 
      !hierarchy.section || 
      !hierarchy.batchYear) {
    return this.find({}); // Return all courses if hierarchy is incomplete
  }
  
  return this.find({
    'hierarchy.instituteName': hierarchy.instituteName,
    'hierarchy.className': hierarchy.className,
    'hierarchy.section': hierarchy.section,
    'hierarchy.batchYear': hierarchy.batchYear,
    'autoEnrollment.enabled': true
  });
};

module.exports = mongoose.model('Course', courseSchema); 