const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  // Basic job information
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: [200, 'Job title cannot exceed 200 characters']
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Job description is required'],
    maxlength: [5000, 'Job description cannot exceed 5000 characters']
  },
  salary: {
    min: {
      type: Number,
      min: 0
    },
    max: {
      type: Number,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'INR']
    },
    period: {
      type: String,
      default: 'yearly',
      enum: ['hourly', 'daily', 'weekly', 'monthly', 'yearly']
    }
  },
  experience: {
    min: {
      type: Number,
      default: 0,
      min: 0
    },
    max: {
      type: Number,
      min: 0
    },
    unit: {
      type: String,
      default: 'years',
      enum: ['months', 'years']
    }
  },
  jobType: {
    type: String,
    required: [true, 'Job type is required'],
    enum: ['full-time', 'part-time', 'contract', 'internship', 'freelance'],
    default: 'full-time'
  },
  remote: {
    type: String,
    enum: ['on-site', 'remote', 'hybrid'],
    default: 'on-site'
  },
  
  // Skills and requirements
  skills: [{
    type: String,
    trim: true
  }],
  requirements: [{
    type: String,
    trim: true
  }],
  
  // Application details
  applicationUrl: {
    type: String,
    trim: true
  },
  applicationEmail: {
    type: String,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
  },
  
  // Job status and visibility
  status: {
    type: String,
    enum: ['active', 'paused', 'closed', 'expired'],
    default: 'active'
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  // Source information (for external jobs)
  source: {
    type: String,
    enum: ['internal', 'linkedin', 'indeed', 'glassdoor', 'internshala', 'angelist'],
    default: 'internal'
  },
  externalId: {
    type: String,
    sparse: true // Allows multiple null values
  },
  externalUrl: {
    type: String,
    trim: true
  },
  lastFetched: {
    type: Date,
    default: Date.now
  },
  
  // Employer information (for internal jobs)
  employer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return this.source === 'internal';
    }
  },
  
  // Analytics
  views: {
    type: Number,
    default: 0
  },
  applications: {
    type: Number,
    default: 0
  },
  
  // Metadata
  tags: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    trim: true
  },
  industry: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
jobSchema.index({ title: 'text', description: 'text', company: 'text' });
jobSchema.index({ status: 1, source: 1 });
jobSchema.index({ location: 1 });
jobSchema.index({ jobType: 1 });
jobSchema.index({ remote: 1 });
jobSchema.index({ 'salary.min': 1, 'salary.max': 1 });
jobSchema.index({ createdAt: -1 });
// Index for external jobs (without unique constraint to avoid issues)
jobSchema.index({ externalId: 1, source: 1 });

// Virtual for salary range display
jobSchema.virtual('salaryRange').get(function() {
  if (!this.salary.min && !this.salary.max) return null;
  
  const formatSalary = (amount) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount}`;
  };
  
  if (this.salary.min && this.salary.max) {
    return `${formatSalary(this.salary.min)} - ${formatSalary(this.salary.max)}`;
  } else if (this.salary.min) {
    return `${formatSalary(this.salary.min)}+`;
  } else if (this.salary.max) {
    return `Up to ${formatSalary(this.salary.max)}`;
  }
  
  return null;
});

// Virtual for experience range display
jobSchema.virtual('experienceRange').get(function() {
  if (!this.experience.min && !this.experience.max) return null;
  
  if (this.experience.min && this.experience.max) {
    return `${this.experience.min}-${this.experience.max} ${this.experience.unit}`;
  } else if (this.experience.min) {
    return `${this.experience.min}+ ${this.experience.unit}`;
  } else if (this.experience.max) {
    return `Up to ${this.experience.max} ${this.experience.unit}`;
  }
  
  return null;
});

// Static method to find jobs by source
jobSchema.statics.findBySource = function(source) {
  return this.find({ source, status: 'active' });
};

// Static method to find external jobs
jobSchema.statics.findExternalJobs = function() {
  return this.find({ 
    source: { $ne: 'internal' }, 
    status: 'active' 
  }).sort({ lastFetched: -1 });
};

// Static method to update job views
jobSchema.statics.incrementViews = function(jobId) {
  return this.findByIdAndUpdate(jobId, { $inc: { views: 1 } });
};

// Instance method to get public job data
jobSchema.methods.getPublicData = function() {
  const jobObject = this.toObject();
  delete jobObject.__v;
  return jobObject;
};

module.exports = mongoose.model('Job', jobSchema); 