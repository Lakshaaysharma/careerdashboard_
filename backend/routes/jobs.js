const express = require('express');
const Job = require('../models/Job');
const router = express.Router();

// @desc    Get all active jobs (public)
// @route   GET /api/jobs
// @access  Public
router.get('/jobs', async (req, res) => {
  try {
    const jobs = await Job.find({ status: 'active' }).sort({ createdAt: -1 });
    res.json({
      success: true,
      data: jobs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch jobs',
      error: error.message
    });
  }
});

module.exports = router; 