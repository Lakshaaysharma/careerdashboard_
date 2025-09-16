const mongoose = require('mongoose');

const startupIdeaSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  industry: {
    type: String,
    required: true,
    enum: ['technology', 'healthcare', 'fintech', 'education', 'sustainability', 'other']
  },
  fundingNeeded: {
    type: String,
    required: false,
    enum: ['under-50k', '50k-100k', '100k-500k', '500k-1m', 'over-1m']
  },
  timeline: {
    type: String,
    required: false,
    enum: ['3-months', '6-months', '1-year', 'over-1-year']
  },
  founder: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    default: 'seeking-funding',
    enum: ['seeking-funding', 'in-development', 'funded']
  },
  fundingRaised: {
    type: String,
    default: '$0'
  },
  teamSize: {
    type: String,
    required: true
  },
  prototype: {
    type: Boolean,
    default: false
  },
  marketSize: {
    type: String,
    required: true
  },
  likes: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  comments: {
    type: Number,
    default: 0
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  contactEmail: {
    type: String,
    required: true
  },
  contactPhone: {
    type: String
  },
  website: {
    type: String
  },
  pitchDeck: {
    type: String // URL to uploaded file
  },
  tags: [{
    type: String,
    trim: true
  }],
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

// Index for search functionality
startupIdeaSchema.index({ title: 'text', description: 'text', founder: 'text' });

module.exports = mongoose.model('StartupIdea', startupIdeaSchema);
