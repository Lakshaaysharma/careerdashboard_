const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  // Student and Course references
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  
  // Enrollment status
  status: {
    type: String,
    enum: ['enrolled', 'completed', 'dropped', 'refunded'],
    default: 'enrolled'
  },
  
  // Enrollment dates
  enrolledAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  droppedAt: Date,
  
  // Progress tracking
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  // Module completion tracking
  completedModules: [{
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    completedAt: {
      type: Date,
      default: Date.now
    },
    score: {
      type: Number,
      min: 0,
      max: 100
    }
  }],
  
  // Course rating and review
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  reviewedAt: Date,
  
  // Payment information
  payment: {
    amount: {
      type: Number,
      required: false, // Make it optional
      min: 0
    },
    currency: {
      type: String,
      default: 'USD'
    },
    paymentMethod: String,
    transactionId: String,
    paidAt: {
      type: Date,
      default: Date.now
    }
  },
  
  // Certificate
  certificate: {
    issued: {
      type: Boolean,
      default: false
    },
    issuedAt: Date,
    certificateId: String
  },
  
  // Last activity
  lastActivityAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
enrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });
enrollmentSchema.index({ studentId: 1, status: 1 });
enrollmentSchema.index({ courseId: 1, status: 1 });
enrollmentSchema.index({ enrolledAt: -1 });

// Pre-save middleware to update last activity
enrollmentSchema.pre('save', function(next) {
  this.lastActivityAt = new Date();
  next();
});

// Static method to enroll student in course
enrollmentSchema.statics.enrollStudent = async function(studentId, courseId, paymentInfo = null) {
  // Check if already enrolled
  const existingEnrollment = await this.findOne({ studentId, courseId });
  if (existingEnrollment) {
    throw new Error('Student is already enrolled in this course');
  }
  
  // Get course details
  const Course = require('./Course');
  const course = await Course.findById(courseId);
  if (!course) {
    throw new Error('Course not found');
  }
  
  // Create enrollment
  const enrollmentData = {
    studentId,
    courseId,
    status: 'enrolled',
    progress: 0,
    completedModules: [],
    lastActivityAt: new Date()
  };
  
  // Add payment info if course is not free
  if (!course.pricing.isFree && paymentInfo) {
    enrollmentData.payment = {
      amount: course.pricing.price,
      currency: course.pricing.currency,
      paymentMethod: paymentInfo.method,
      transactionId: paymentInfo.transactionId,
      paidAt: new Date()
    };
  } else if (!course.pricing.isFree) {
    // For paid courses without payment info, set amount to 0
    enrollmentData.payment = {
      amount: 0,
      currency: course.pricing.currency,
      paidAt: new Date()
    };
  }
  // For free courses, no payment field is added
  
  const enrollment = await this.create(enrollmentData);
  
  // Update course student count
  await course.updateStudentCount();
  
  // Update teacher subject student count
  await this.updateTeacherSubjectStudentCount(course.teacherId, course.subject);
  
  return enrollment;
};

// Static method to update teacher subject student count
enrollmentSchema.statics.updateTeacherSubjectStudentCount = async function(teacherId, subjectName) {
  const Teacher = require('./Teacher');
  const Course = require('./Course');
  
  // Count active enrollments for this subject
  const course = await Course.findOne({ teacherId, subject: subjectName });
  if (!course) {
    return;
  }
  
  const enrollmentCount = await this.countDocuments({ 
    courseId: course._id, 
    status: { $in: ['enrolled', 'completed'] }
  });
  
  // Update teacher's subject student count
  await Teacher.updateOne(
    { 
      _id: teacherId,
      'subjects.name': subjectName 
    },
    { 
      $set: { 'subjects.$.studentCount': enrollmentCount }
    }
  );
  
  // Also update teacher's total student count
  const teacher = await Teacher.findById(teacherId);
  if (teacher) {
    const totalStudents = teacher.subjects.reduce((sum, subject) => sum + subject.studentCount, 0);
    teacher.totalStudents = totalStudents;
    await teacher.save();
  }
};

// Instance method to update progress
enrollmentSchema.methods.updateProgress = async function() {
  const Course = require('./Course');
  const course = await Course.findById(this.courseId);
  
  if (!course) {
    throw new Error('Course not found');
  }
  
  // Calculate progress based on completed modules
  const totalModules = course.modules.filter(module => module.isPublished).length;
  const completedModules = this.completedModules.length;
  
  this.progress = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;
  
  // Mark as completed if all modules are done
  if (this.progress >= 100 && this.status === 'enrolled') {
    this.status = 'completed';
    this.completedAt = new Date();
    
    // Issue certificate
    this.certificate = {
      issued: true,
      issuedAt: new Date(),
      certificateId: `CERT-${this._id.toString().slice(-8).toUpperCase()}`
    };
  }
  
  await this.save();
  return this;
};

// Instance method to complete a module
enrollmentSchema.methods.completeModule = async function(moduleId, score = null) {
  // Check if module is already completed
  const existingCompletion = this.completedModules.find(
    completion => completion.moduleId.toString() === moduleId.toString()
  );
  
  if (existingCompletion) {
    throw new Error('Module already completed');
  }
  
  // Add module completion
  this.completedModules.push({
    moduleId,
    completedAt: new Date(),
    score: score || 100
  });
  
  // Update progress
  await this.updateProgress();
  
  return this;
};

// Instance method to add rating and review
enrollmentSchema.methods.addReview = async function(rating, review) {
  if (rating < 1 || rating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }
  
  this.rating = rating;
  this.review = review;
  this.reviewedAt = new Date();
  
  await this.save();
  
  // Update course rating
  const Course = require('./Course');
  const course = await Course.findById(this.courseId);
  if (course) {
    await course.updateRating();
  }
  
  return this;
};

// Instance method to drop course
enrollmentSchema.methods.dropCourse = async function() {
  if (this.status === 'completed') {
    throw new Error('Cannot drop completed course');
  }
  
  this.status = 'dropped';
  this.droppedAt = new Date();
  
  await this.save();
  
  // Update course student count
  const Course = require('./Course');
  const course = await Course.findById(this.courseId);
  if (course) {
    await course.updateStudentCount();
  }
  
  return this;
};

module.exports = mongoose.model('Enrollment', enrollmentSchema); 