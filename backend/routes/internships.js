const express = require('express');
const Internship = require('../models/Internship');
const router = express.Router();

// @desc    Get all active internships (public)
// @route   GET /api/internships
// @access  Public
router.get('/internships', async (req, res) => {
  try {
    const internships = await Internship.find({ status: 'active' }).sort({ createdAt: -1 });
    res.json({
      success: true,
      data: internships
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch internships',
      error: error.message
    });
  }
});

module.exports = router; 