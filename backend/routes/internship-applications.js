const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const InternshipApplication = require('../models/InternshipApplication');
const Internship = require('../models/Internship');

// POST /api/internship-applications  (guest or authenticated)
router.post('/', async (req, res) => {
  try {
    const internshipId = (req.body.internshipId || req.query.internshipId || '').toString();
    if (!internshipId) return res.status(400).json({ success: false, message: 'internshipId is required' });

    const internship = await Internship.findById(internshipId);
    if (!internship) return res.status(404).json({ success: false, message: 'Internship not found' });

    // Save resume file if provided (express-fileupload)
    let resumeMeta = undefined;
    if (req.files && req.files.resume) {
      const resumeFile = Array.isArray(req.files.resume) ? req.files.resume[0] : req.files.resume;
      const originalName = (resumeFile && typeof resumeFile.name === 'string') ? resumeFile.name : 'resume.pdf';
      const safeName = `${Date.now()}_${originalName.replace(/[^a-zA-Z0-9_.-]/g, '_')}`;
      const savePath = `uploads/resumes/${safeName}`;
      await new Promise((resolve, reject) => resumeFile.mv(savePath, (err) => err ? reject(err) : resolve()));
      resumeMeta = { filename: safeName, url: `/uploads/resumes/${safeName}`, uploadedAt: new Date() };
    }

    const applicantName = (req.body.name || req.query.name || '').toString().trim();
    const applicantEmail = (req.body.email || req.query.email || '').toString().trim();
    const applicantPhone = (req.body.phone || req.query.phone || '').toString().trim();

    // Validate required fields
    if (!applicantName) {
      return res.status(400).json({ success: false, message: 'Applicant name is required' });
    }
    if (!applicantEmail) {
      return res.status(400).json({ success: false, message: 'Applicant email is required' });
    }
    if (!applicantPhone) {
      return res.status(400).json({ success: false, message: 'Applicant phone number is required' });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(applicantEmail)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }

    const application = await InternshipApplication.create({
      internship: internship._id,
      applicant: req.user ? req.user._id : new mongoose.Types.ObjectId(),
      applicantName,
      applicantEmail,
      applicantPhone,
      employer: internship.employer,
      coverLetter: req.body.coverLetter || '',
      experience: { years: 0, months: 0 },
      skills: [],
      resume: resumeMeta,
      source: 'website'
    });

    await Internship.findByIdAndUpdate(internship._id, { $inc: { applications: 1 } });

    res.status(201).json({ success: true, message: 'Application submitted', data: { id: application._id } });
  } catch (error) {
    console.error('Internship Applications POST error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to submit application' });
  }
});

// GET /api/internship-applications/employer/:employerId
router.get('/employer/:employerId', async (req, res) => {
  try {
    const { employerId } = req.params;
    const { status, internshipId, page = 1, limit = 10 } = req.query;
    
    const options = {};
    if (status) options.status = status;
    if (internshipId) options.internshipId = internshipId;

    const applications = await InternshipApplication.findByEmployer(employerId, options)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await InternshipApplication.countDocuments({ employer: employerId, ...options });

    res.json({
      success: true,
      data: applications,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get internship applications error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch applications' });
  }
});

// GET /api/internship-applications/internship/:internshipId
router.get('/internship/:internshipId', async (req, res) => {
  try {
    const { internshipId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;
    
    const options = {};
    if (status) options.status = status;

    const applications = await InternshipApplication.findByInternship(internshipId, options)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await InternshipApplication.countDocuments({ internship: internshipId, ...options });

    res.json({
      success: true,
      data: applications,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get internship applications error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch applications' });
  }
});

// GET /api/internship-applications/applicant/:applicantId
router.get('/applicant/:applicantId', async (req, res) => {
  try {
    const { applicantId } = req.params;
    const applications = await InternshipApplication.findByApplicant(applicantId);

    res.json({
      success: true,
      data: applications
    });
  } catch (error) {
    console.error('Get applicant internship applications error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch applications' });
  }
});

// PUT /api/internship-applications/:applicationId/status
router.put('/:applicationId/status', async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, employerNotes } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }

    const validStatuses = ['pending', 'reviewed', 'shortlisted', 'interviewed', 'accepted', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const application = await InternshipApplication.updateStatus(applicationId, status, employerNotes);
    
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    res.json({
      success: true,
      message: 'Application status updated',
      data: application
    });
  } catch (error) {
    console.error('Update internship application status error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to update application status' });
  }
});

// GET /api/internship-applications/stats/:employerId
router.get('/stats/:employerId', async (req, res) => {
  try {
    const { employerId } = req.params;
    const stats = await InternshipApplication.getStats(employerId);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get internship application stats error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch application statistics' });
  }
});

module.exports = router;
