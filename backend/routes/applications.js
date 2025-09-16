const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Application = require('../models/Application');
const Job = require('../models/Job');

// POST /api/applications  (guest or authenticated)
router.post('/', async (req, res) => {
  try {
    const jobId = (req.body.jobId || req.query.jobId || '').toString();
    if (!jobId) return res.status(400).json({ success: false, message: 'jobId is required' });

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

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

    const application = await Application.create({
      job: job._id,
      applicant: req.user ? req.user._id : new mongoose.Types.ObjectId(),
      applicantName,
      applicantEmail,
      applicantPhone,
      employer: job.employer,
      coverLetter: req.body.coverLetter || '',
      experience: { years: 0, months: 0 },
      skills: [],
      resume: resumeMeta,
      source: 'website'
    });

    await Job.findByIdAndUpdate(job._id, { $inc: { applications: 1 } });

    res.status(201).json({ success: true, message: 'Application submitted', data: { id: application._id } });
  } catch (error) {
    console.error('Applications POST error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to submit application' });
  }
});

module.exports = router;


