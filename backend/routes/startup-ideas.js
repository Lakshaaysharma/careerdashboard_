const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const StartupIdea = require('../models/StartupIdea');
const { protect } = require('../middleware/auth');

// GET /api/startup-ideas - Get all startup ideas (public)
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      industry, 
      funding, 
      timeline, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    if (industry && industry !== 'all') filter.industry = industry;
    if (funding && funding !== 'all') filter.fundingNeeded = funding;
    if (timeline && timeline !== 'all') filter.timeline = timeline;

    // Build search query
    if (search) {
      filter.$text = { $search: search };
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const ideas = await StartupIdea.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-submittedBy -contactPhone -website -pitchDeck -tags');

    // Get total count for pagination
    const total = await StartupIdea.countDocuments(filter);

    res.json({
      ideas,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching startup ideas:', error);
    res.status(500).json({ message: 'Error fetching startup ideas' });
  }
});

// GET /api/startup-ideas/:id - Get specific startup idea (public)
router.get('/:id', async (req, res) => {
  try {
    const idea = await StartupIdea.findById(req.params.id)
      .select('-submittedBy -contactPhone -website -pitchDeck -tags');

    if (!idea) {
      return res.status(404).json({ message: 'Startup idea not found' });
    }

    // Increment view count
    idea.views += 1;
    await idea.save();

    res.json(idea);
  } catch (error) {
    console.error('Error fetching startup idea:', error);
    res.status(500).json({ message: 'Error fetching startup idea' });
  }
});

// POST /api/startup-ideas - Submit new startup idea (public for now)
router.post('/', async (req, res) => {
  try {
    const {
      title,
      description,
      industry,
      fundingNeeded,
      timeline,
      founder,
      location,
      teamSize,
      prototype,
      marketSize,
      contactEmail,
      contactPhone,
      website,
      tags
    } = req.body;

    // Validate minimal required fields; make others optional
    if (!title || !description || !industry || !founder || !contactEmail) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Create new startup idea
    const startupIdea = new StartupIdea({
      title,
      description,
      industry,
      // fundingNeeded optional
      // timeline optional
      founder,
      location: location || 'Not specified',
      teamSize: teamSize || '1',
      prototype: prototype || false,
      marketSize: marketSize || '',
      contactEmail,
      contactPhone,
      website,
      tags: tags || [],
      submittedBy: new mongoose.Types.ObjectId() // Generate a temporary ID for now
    });

    await startupIdea.save();

    res.status(201).json({
      message: 'Startup idea submitted successfully',
      idea: startupIdea
    });
  } catch (error) {
    console.error('Error submitting startup idea:', error);
    res.status(500).json({ message: 'Error submitting startup idea' });
  }
});

// PUT /api/startup-ideas/:id - Update startup idea (owner only)
router.put('/:id', protect, async (req, res) => {
  try {
    const idea = await StartupIdea.findById(req.params.id);
    
    if (!idea) {
      return res.status(404).json({ message: 'Startup idea not found' });
    }

    // Check if user owns the idea
    if (idea.submittedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this idea' });
    }

    // Update fields
    const updatedIdea = await StartupIdea.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Startup idea updated successfully',
      idea: updatedIdea
    });
  } catch (error) {
    console.error('Error updating startup idea:', error);
    res.status(500).json({ message: 'Error updating startup idea' });
  }
});

// DELETE /api/startup-ideas/:id - Delete startup idea (owner only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const idea = await StartupIdea.findById(req.params.id);
    
    if (!idea) {
      return res.status(404).json({ message: 'Startup idea not found' });
    }

    // Check if user owns the idea
    if (idea.submittedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this idea' });
    }

    await StartupIdea.findByIdAndDelete(req.params.id);

    res.json({ message: 'Startup idea deleted successfully' });
  } catch (error) {
    console.error('Error deleting startup idea:', error);
    res.status(500).json({ message: 'Error deleting startup idea' });
  }
});

// POST /api/startup-ideas/:id/like - Like a startup idea
router.post('/:id/like', async (req, res) => {
  try {
    const idea = await StartupIdea.findById(req.params.id);
    
    if (!idea) {
      return res.status(404).json({ message: 'Startup idea not found' });
    }

    idea.likes += 1;
    await idea.save();

    res.json({ message: 'Idea liked successfully', likes: idea.likes });
  } catch (error) {
    console.error('Error liking startup idea:', error);
    res.status(500).json({ message: 'Error liking startup idea' });
  }
});

// GET /api/startup-ideas/stats/overview - Get overview statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const totalIdeas = await StartupIdea.countDocuments();
    const fundedIdeas = await StartupIdea.countDocuments({ status: 'funded' });
    const totalFunding = await StartupIdea.aggregate([
      { $match: { status: 'funded' } },
      { $group: { _id: null, total: { $sum: 1 } } }
    ]);
    const totalTeamMembers = await StartupIdea.aggregate([
      { $group: { _id: null, total: { $sum: { $toInt: '$teamSize' } } } }
    ]);

    res.json({
      totalIdeas,
      fundedIdeas,
      totalFunding: totalFunding.length > 0 ? totalFunding[0].total : 0,
      totalTeamMembers: totalTeamMembers.length > 0 ? totalTeamMembers[0].total : 0
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Error fetching statistics' });
  }
});

module.exports = router;
