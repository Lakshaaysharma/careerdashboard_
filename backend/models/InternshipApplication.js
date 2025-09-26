const mongoose = require('mongoose');

const internshipApplicationSchema = new mongoose.Schema({
  // Internship reference
  internship: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Internship',
    required: true
  },
  
  // Applicant (student) reference
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Applicant contact information (stored directly for quick access)
  applicantName: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  }, 
  
  applicantEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    maxlength: [255, 'Email cannot exceed 255 characters']
  },
  
  applicantPhone: {
    type: String,
    required: true,
    trim: true,
    maxlength: [20, 'Phone number cannot exceed 20 characters']
  },
  
  // Employer reference
  employer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Application status
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'shortlisted', 'interviewed', 'accepted', 'rejected'],
    default: 'pending'
  },
  
  // Application details
  coverLetter: {
    type: String,
    maxlength: [2000, 'Cover letter cannot exceed 2000 characters']
  },
  
  // Resume/CV information
  resume: {
    filename: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },
  
  // Applicant's expected stipend
  expectedStipend: {
    amount: {
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
      default: 'monthly',
      enum: ['weekly', 'monthly', 'total']
    }
  },
  
  // Applicant's experience and skills
  experience: {
    years: {
      type: Number,
      min: 0,
      default: 0
    },
    months: {
      type: Number,
      min: 0,
      default: 0
    }
  },
  
  skills: [{
    type: String,
    trim: true
  }],
  
  // Application metadata
  appliedAt: {
    type: Date,
    default: Date.now
  },
  
  // Interview details (if applicable)
  interview: {
    scheduled: {
      type: Boolean,
      default: false
    },
    date: Date,
    time: String,
    location: String,
    type: {
      type: String,
      enum: ['phone', 'video', 'in-person'],
      default: 'video'
    },
    notes: String
  },
  
  // Employer notes and feedback
  employerNotes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  
  // Application score/rating (optional)
  score: {
    type: Number,
    min: 0,
    max: 100
  },
  
  // Tags for organization
  tags: [{
    type: String,
    trim: true
  }],
  
  // Application source
  source: {
    type: String,
    enum: ['website', 'email', 'referral', 'job-board'],
    default: 'website'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
internshipApplicationSchema.index({ internship: 1, applicant: 1 }, { unique: true }); // Prevent duplicate applications
internshipApplicationSchema.index({ employer: 1, status: 1 });
internshipApplicationSchema.index({ applicant: 1, status: 1 });
internshipApplicationSchema.index({ appliedAt: -1 });
internshipApplicationSchema.index({ status: 1, appliedAt: -1 });

// Virtual for total experience in years
internshipApplicationSchema.virtual('totalExperienceYears').get(function() {
  return this.experience.years + (this.experience.months / 12);
});

// Virtual for formatted expected stipend
internshipApplicationSchema.virtual('formattedExpectedStipend').get(function() {
  if (!this.expectedStipend.amount) return null;
  
  const formatStipend = (amount) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount}`;
  };
  
  return `${formatStipend(this.expectedStipend.amount)}/${this.expectedStipend.period}`;
});

// Static method to find applications by employer
internshipApplicationSchema.statics.findByEmployer = function(employerId, options = {}) {
  const query = { employer: employerId };
  
  if (options.status) {
    query.status = options.status;
  }
  
  if (options.internshipId) {
    query.internship = options.internshipId;
  }
  
  return this.find(query)
    .populate('internship', 'title company location')
    .populate('applicant', 'name email profile')
    .select('applicantName applicantEmail applicantPhone status coverLetter resume expectedStipend experience skills appliedAt interview employerNotes score tags source')
    .sort({ appliedAt: -1 });
};

// Static method to find applications by internship
internshipApplicationSchema.statics.findByInternship = function(internshipId, options = {}) {
  const query = { internship: internshipId };
  
  if (options.status) {
    query.status = options.status;
  }
  
  return this.find(query)
    .populate('applicant', 'name email profile')
    .select('applicantName applicantEmail applicantPhone status coverLetter resume expectedStipend experience skills appliedAt interview employerNotes score tags source')
    .sort({ appliedAt: -1 });
};

// Static method to find applications by applicant
internshipApplicationSchema.statics.findByApplicant = function(applicantId) {
  return this.find({ applicant: applicantId })
    .populate('internship', 'title company location status')
    .populate('employer', 'name')
    .select('applicantName applicantEmail applicantPhone status coverLetter resume expectedStipend experience skills appliedAt interview employerNotes score tags source')
    .sort({ appliedAt: -1 });
};

// Static method to update application status
internshipApplicationSchema.statics.updateStatus = function(applicationId, status, employerNotes = null) {
  const update = { status };
  
  if (employerNotes) {
    update.employerNotes = employerNotes;
  }
  
  return this.findByIdAndUpdate(applicationId, update, { new: true });
};

// Static method to get application statistics
internshipApplicationSchema.statics.getStats = function(employerId) {
  return this.aggregate([
    { $match: { employer: new mongoose.Types.ObjectId(employerId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

// Instance method to get public application data
internshipApplicationSchema.methods.getPublicData = function() {
  const applicationObject = this.toObject();
  delete applicationObject.__v;
  return applicationObject;
};

module.exports = mongoose.model('InternshipApplication', internshipApplicationSchema);
