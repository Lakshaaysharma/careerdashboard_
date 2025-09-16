const mongoose = require('mongoose');

const teacherProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  // Institute/University Information
  instituteName: {
    type: String,
    required: false,
    trim: true,
    default: ''
  },
  // Class/Year Information
  className: {
    type: String,
    required: false,
    trim: true,
    default: ''
  },
  // Subjects the teacher teaches
  subjects: [{
    type: String,
    required: false,
    trim: true
  }],
  // Section Information
  section: {
    type: String,
    required: false,
    trim: true,
    default: ''
  },
  // Courses Information
  courses: [{
    name: {
      type: String,
      required: false,
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
      default: 'Beginner'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Batch Year Information
  batchYear: {
    type: String,
    required: false,
    trim: true,
    default: ''
  },
  // Profile completion status
  isProfileComplete: {
    type: Boolean,
    default: false
  },
  // Profile completion date
  profileCompletedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for better query performance
teacherProfileSchema.index({ instituteName: 1 });
teacherProfileSchema.index({ subjects: 1 });

// Static method to find or create teacher profile
teacherProfileSchema.statics.findOrCreateProfile = async function(userId) {
  try {
    // Check the user's role before creating a profile
    const User = require('./User');
    const user = await User.findById(userId);
    if (!user || user.role !== 'teacher') {
      throw new Error('Cannot create TeacherProfile: user is not a teacher');
    }
    
    let profile = await this.findOne({ userId });
    if (!profile) {
      profile = await this.create({
        userId,
        instituteName: '',
        className: '',
        subjects: [],
        section: '',
        courses: [],
        batchYear: '',
        isProfileComplete: false
      });
    }
    return profile;
  } catch (error) {
    console.error('Error in findOrCreateProfile:', error);
    throw error;
  }
};

// Instance method to update profile completion status
teacherProfileSchema.methods.updateProfileCompletion = async function() {
  const requiredFields = [
    this.instituteName,
    this.className,
    this.subjects.length > 0,
    this.section,
    this.batchYear
  ];
  
  this.isProfileComplete = requiredFields.every(field => 
    field && (typeof field === 'string' ? field.trim() !== '' : field)
  );
  
  if (this.isProfileComplete && !this.profileCompletedAt) {
    this.profileCompletedAt = new Date();
  }
  
  await this.save();
  return this;
};

// Instance method to add course
teacherProfileSchema.methods.addCourse = async function(courseData) {
  const course = {
    name: courseData.name.trim(),
    description: courseData.description?.trim() || '',
    level: courseData.level || 'Beginner',
    isActive: true,
    createdAt: new Date()
  };
  
  this.courses.push(course);
  await this.save();
  await this.updateProfileCompletion();
  
  // Return the course with the generated _id
  return this.courses[this.courses.length - 1];
};

// Instance method to update course
teacherProfileSchema.methods.updateCourse = async function(courseId, courseData) {
  const courseIndex = this.courses.findIndex(course => course._id.toString() === courseId.toString());
  if (courseIndex === -1) {
    throw new Error('Course not found');
  }
  
  this.courses[courseIndex].name = courseData.name.trim();
  this.courses[courseIndex].description = courseData.description?.trim() || '';
  this.courses[courseIndex].level = courseData.level || 'Beginner';
  
  await this.save();
  await this.updateProfileCompletion();
  
  return this.courses[courseIndex];
};

// Instance method to remove course
teacherProfileSchema.methods.removeCourse = async function(courseId) {
  this.courses = this.courses.filter(course => course._id.toString() !== courseId);
  await this.save();
  await this.updateProfileCompletion();
  
  return this;
};

// Instance method to get profile statistics
teacherProfileSchema.methods.getProfileStats = function() {
  return {
    totalSubjects: this.subjects.length,
    totalCourses: this.courses.length,
    activeCourses: this.courses.filter(c => c.isActive).length,
    profileCompletion: this.isProfileComplete ? 100 : 
      Math.round(([this.instituteName, this.className, this.subjects.length, this.section, this.courses.length, this.batchYear]
        .filter(field => field && (typeof field === 'string' ? field.trim() !== '' : field)).length / 6) * 100)
  };
};

module.exports = mongoose.model('TeacherProfile', teacherProfileSchema);
