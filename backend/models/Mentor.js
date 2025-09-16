const mongoose = require('mongoose');

const mentorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true
  },
  // Professional Information
  title: {
    type: String,
    required: [true, 'Professional title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  company: {
    type: String,
    required: [true, 'Company is required'],
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  experience: {
    type: String,
    required: [true, 'Years of experience is required'],
    trim: true
  },
  bio: {
    type: String,
    required: [true, 'Bio is required'],
    trim: true,
    maxlength: [1000, 'Bio cannot exceed 1000 characters']
  },
  // Expertise and Skills
  expertise: [{
    type: String,
    trim: true,
    maxlength: [50, 'Expertise item cannot exceed 50 characters']
  }],
  skills: [{
    type: String,
    trim: true,
    maxlength: [50, 'Skill cannot exceed 50 characters']
  }],
  // Availability and Pricing
  hourlyRate: {
    type: Number,
    required: [true, 'Hourly rate is required'],
    min: [0, 'Hourly rate cannot be negative']
  },
  availability: {
    type: String,
    required: [true, 'Availability is required'],
    trim: true
  },
  timezone: {
    type: String,
    required: [true, 'Timezone is required'],
    trim: true
  },
  languages: [{
    type: String,
    trim: true,
    maxlength: [20, 'Language cannot exceed 20 characters']
  }],
  // Contact and Communication
  responseTime: {
    type: String,
    required: [true, 'Response time is required'],
    trim: true
  },
  communicationMethods: [{
    type: String,
    enum: ['video', 'phone', 'chat', 'email'],
    default: ['video']
  }],
  // Profile and Media
  profileImage: {
    type: String,
    default: null
  },
  portfolio: [{
    title: String,
    description: String,
    url: String,
    image: String
  }],
  // Statistics and Performance
  stats: {
    totalSessions: {
      type: Number,
      default: 0
    },
    completedSessions: {
      type: Number,
      default: 0
    },
    cancelledSessions: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalEarnings: {
      type: Number,
      default: 0
    },
    monthlyEarnings: {
      type: Number,
      default: 0
    },
    responseRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  // Verification and Status
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  verificationDocuments: [{
    type: String, // Document type
    url: String,  // Document URL
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    }
  }],
  // Preferences
  preferences: {
    maxSessionsPerDay: {
      type: Number,
      default: 8
    },
    sessionDuration: {
      type: Number,
      default: 60 // in minutes
    },
    advanceBookingDays: {
      type: Number,
      default: 30
    },
    cancellationPolicy: {
      type: String,
      enum: ['flexible', 'moderate', 'strict'],
      default: 'moderate'
    },
    autoAcceptBookings: {
      type: Boolean,
      default: false
    }
  },
  // Reviews and Ratings
  reviews: [{
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student'
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [500, 'Review comment cannot exceed 500 characters']
    },
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Social Links
  socialLinks: {
    linkedin: String,
    twitter: String,
    github: String,
    website: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
mentorSchema.index({ userId: 1 });
mentorSchema.index({ email: 1 });
mentorSchema.index({ expertise: 1 });
mentorSchema.index({ isActive: 1 });
mentorSchema.index({ isAvailable: 1 });
mentorSchema.index({ 'stats.averageRating': -1 });
mentorSchema.index({ hourlyRate: 1 });

// Virtual for full profile URL
mentorSchema.virtual('profileUrl').get(function() {
  return `/mentors/${this._id}`;
});

// Virtual for total reviews count
mentorSchema.virtual('totalReviews').get(function() {
  if (!Array.isArray(this.reviews)) return 0;
  return this.reviews.length;
});

// Instance method to calculate average rating
mentorSchema.methods.calculateAverageRating = function() {
  if (!Array.isArray(this.reviews) || this.reviews.length === 0) return 0;
  
  const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
  return Math.round((totalRating / this.reviews.length) * 10) / 10; // Round to 1 decimal place
};

// Instance method to add review
mentorSchema.methods.addReview = function(reviewData) {
  this.reviews.push(reviewData);
  this.stats.averageRating = this.calculateAverageRating();
  return this.save();
};

// Instance method to update session stats
mentorSchema.methods.updateSessionStats = function(sessionType) {
  switch (sessionType) {
    case 'completed':
      this.stats.completedSessions += 1;
      break;
    case 'cancelled':
      this.stats.cancelledSessions += 1;
      break;
  }
  this.stats.totalSessions = this.stats.completedSessions + this.stats.cancelledSessions;
  return this.save();
};

// Static method to find mentors by expertise
mentorSchema.statics.findByExpertise = function(expertise) {
  return this.find({ 
    expertise: { $in: [expertise] },
    isActive: true,
    isAvailable: true
  });
};

// Static method to find top-rated mentors
mentorSchema.statics.findTopRated = function(limit = 10) {
  return this.find({ 
    isActive: true,
    isAvailable: true
  })
  .sort({ 'stats.averageRating': -1, 'stats.totalSessions': -1 })
  .limit(limit);
};

// Pre-save middleware to update average rating
mentorSchema.pre('save', function(next) {
  if (Array.isArray(this.reviews) && this.reviews.length > 0) {
    this.stats.averageRating = this.calculateAverageRating();
  }
  next();
});

module.exports = mongoose.model('Mentor', mentorSchema);
