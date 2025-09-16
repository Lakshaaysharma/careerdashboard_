const express = require('express');
const asyncHandler = require('express-async-handler');
const { protect } = require('../middleware/auth');
const Job = require('../models/Job');
const Application = require('../models/Application');
const InternshipApplication = require('../models/InternshipApplication');
const User = require('../models/User');
const Internship = require('../models/Internship');

const router = express.Router();

// @desc    Get employer dashboard data
// @route   GET /api/employers/dashboard
// @access  Private
router.get('/dashboard', protect, asyncHandler(async (req, res) => {
  // Ensure user is an employer
  if (req.user.role !== 'employer') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only employers can access this endpoint.'
    });
  }

  try {
    // Get employer's jobs
    const jobs = await Job.find({ employer: req.user._id });
    
    // Get employer's internships
    const internships = await Internship.find({ employer: req.user._id });
    
    // Get application statistics
    const applicationStats = await Application.getStats(req.user._id);
    
    // Calculate dashboard statistics
    const totalJobs = jobs.length;
    const activeJobs = jobs.filter(job => job.status === 'active').length;
    const totalInternships = internships.length;
    const activeInternships = internships.filter(internship => internship.status === 'active').length;
    const totalApplications = jobs.reduce((sum, job) => sum + job.applications, 0) + 
                             internships.reduce((sum, internship) => sum + internship.applications, 0);
    const totalViews = jobs.reduce((sum, job) => sum + job.views, 0) + 
                      internships.reduce((sum, internship) => sum + internship.views, 0);
    
    // Convert application stats to object
    const statsByStatus = {};
    applicationStats.forEach(stat => {
      statsByStatus[stat._id] = stat.count;
    });

    res.json({
      success: true,
      data: {
        employer: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role
        },
        statistics: {
          totalJobs,
          activeJobs,
          totalInternships,
          activeInternships,
          totalApplications,
          totalViews,
          applicationsByStatus: statsByStatus
        },
        recentJobs: jobs.slice(0, 5).map(job => ({
          id: job._id,
          title: job.title,
          company: job.company,
          location: job.location,
          status: job.status,
          applications: job.applications,
          views: job.views,
          createdAt: job.createdAt
        })),
        recentInternships: internships.slice(0, 5).map(internship => ({
          id: internship._id,
          title: internship.title,
          company: internship.company,
          location: internship.location,
          status: internship.status,
          applications: internship.applications,
          views: internship.views,
          stipend: internship.stipend,
          createdAt: internship.createdAt
        }))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: error.message
    });
  }
}));

// @desc    Create a new job posting
// @route   POST /api/employers/jobs
// @access  Private
router.post('/jobs', protect, asyncHandler(async (req, res) => {
  if (req.user.role !== 'employer') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only employers can access this endpoint.'
    });
  }

  const {
    title,
    description,
    location,
    salary,
    experience,
    skills,
    qualification,
    phone,
    email,
    jobType = 'full-time',
    remote = 'on-site'
  } = req.body;

  // Validate required fields
  if (!title || !description || !location) {
    return res.status(400).json({
      success: false,
      message: 'Title, description, and location are required'
    });
  }

  try {
    // Parse salary range
    let salaryData = {};
    if (salary) {
      const salaryMatch = salary.match(/\$?([\d,]+)\s*-\s*\$?([\d,]+)/);
      if (salaryMatch) {
        salaryData = {
          min: parseInt(salaryMatch[1].replace(/,/g, '')),
          max: parseInt(salaryMatch[2].replace(/,/g, '')),
          currency: 'USD',
          period: 'yearly'
        };
      } else {
        // Single salary value
        const singleMatch = salary.match(/\$?([\d,]+)/);
        if (singleMatch) {
          salaryData = {
            min: parseInt(singleMatch[1].replace(/,/g, '')),
            currency: 'USD',
            period: 'yearly'
          };
        }
      }
    }

    // Parse experience
    let experienceData = {};
    if (experience) {
      const expMatch = experience.match(/(\d+)/);
      if (expMatch) {
        experienceData = {
          min: parseInt(expMatch[1]),
          unit: 'years'
        };
      }
    }

    // Parse skills
    const skillsArray = skills ? skills.split(',').map(skill => skill.trim()) : [];

    // Create job
    const job = await Job.create({
      title,
      company: req.user.name, // Use employer name as company
      description,
      location,
      salary: salaryData,
      experience: experienceData,
      skills: skillsArray,
      requirements: [qualification].filter(Boolean),
      jobType,
      remote,
      source: 'internal',
      employer: req.user._id,
      applicationEmail: email,
      tags: skillsArray,
      status: 'active' // Ensure job is always active on creation
    });

    res.status(201).json({
      success: true,
      message: 'Job posted successfully!',
      data: {
        job: {
          id: job._id,
          title: job.title,
          company: job.company,
          location: job.location,
          status: job.status,
          applications: job.applications,
          views: job.views,
          createdAt: job.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Job creation error:', error); // <-- Added error logging
    res.status(500).json({
      success: false,
      message: 'Failed to create job posting',
      error: error.message
    });
  }
}));

// @desc    Get employer's jobs
// @route   GET /api/employers/jobs
// @access  Private
router.get('/jobs', protect, asyncHandler(async (req, res) => {
  if (req.user.role !== 'employer') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only employers can access this endpoint.'
    });
  }

  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const query = { employer: req.user._id };
    if (status) {
      query.status = status;
    }

    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Job.countDocuments(query);

    res.json({
      success: true,
      data: {
        jobs: jobs.map(job => ({
          id: job._id,
          title: job.title,
          company: job.company,
          location: job.location,
          description: job.description,
          salary: job.salary,
          experience: job.experience,
          skills: job.skills,
          status: job.status,
          applications: job.applications,
          views: job.views,
          createdAt: job.createdAt,
          updatedAt: job.updatedAt
        })),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalJobs: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch jobs',
      error: error.message
    });
  }
}));

// @desc    Get a specific job
// @route   GET /api/employers/jobs/:id
// @access  Private
router.get('/jobs/:id', protect, asyncHandler(async (req, res) => {
  if (req.user.role !== 'employer') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only employers can access this endpoint.'
    });
  }

  try {
    const job = await Job.findOne({ _id: req.params.id, employer: req.user._id });
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.json({
      success: true,
      data: {
        job: {
          id: job._id,
          title: job.title,
          company: job.company,
          location: job.location,
          description: job.description,
          salary: job.salary,
          experience: job.experience,
          skills: job.skills,
          requirements: job.requirements,
          status: job.status,
          applications: job.applications,
          views: job.views,
          createdAt: job.createdAt,
          updatedAt: job.updatedAt
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch job',
      error: error.message
    });
  }
}));

// @desc    Update a job
// @route   PUT /api/employers/jobs/:id
// @access  Private
router.put('/jobs/:id', protect, asyncHandler(async (req, res) => {
  if (req.user.role !== 'employer') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only employers can access this endpoint.'
    });
  }

  try {
    const job = await Job.findOne({ _id: req.params.id, employer: req.user._id });
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Update allowed fields
    const allowedUpdates = ['title', 'description', 'location', 'salary', 'experience', 'skills', 'requirements', 'status', 'jobType', 'remote'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Job updated successfully!',
      data: {
        job: {
          id: updatedJob._id,
          title: updatedJob.title,
          company: updatedJob.company,
          location: updatedJob.location,
          status: updatedJob.status,
          applications: updatedJob.applications,
          views: updatedJob.views,
          updatedAt: updatedJob.updatedAt
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update job',
      error: error.message
    });
  }
}));

// @desc    Delete a job
// @route   DELETE /api/employers/jobs/:id
// @access  Private
router.delete('/jobs/:id', protect, asyncHandler(async (req, res) => {
  if (req.user.role !== 'employer') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only employers can access this endpoint.'
    });
  }

  try {
    const job = await Job.findOne({ _id: req.params.id, employer: req.user._id });
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Delete the job
    await Job.findByIdAndDelete(req.params.id);

    // Also delete all applications for this job
    await Application.deleteMany({ job: req.params.id });

    res.json({
      success: true,
      message: 'Job deleted successfully!'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete job',
      error: error.message
    });
  }
}));

// @desc    Create a new internship posting
// @route   POST /api/employers/internships
// @access  Private
router.post('/internships', protect, async (req, res) => {
  if (req.user.role !== 'employer') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only employers can access this endpoint.'
    });
  }

  const {
    title,
    description,
    location,
    stipend,
    experience,
    skills,
    qualification,
    email
  } = req.body;

  if (!title || !description || !location) {
    return res.status(400).json({
      success: false,
      message: 'Title, description, and location are required'
    });
  }

  try {
    // Parse stipend range
    let stipendData = {};
    if (stipend) {
      const stipendMatch = stipend.match(/\$?([\d,]+)\s*-\s*\$?([\d,]+)/);
      if (stipendMatch) {
        stipendData = {
          min: parseInt(stipendMatch[1].replace(/,/g, '')),
          max: parseInt(stipendMatch[2].replace(/,/g, '')),
          currency: 'USD',
          period: 'monthly'
        };
      } else {
        // Single stipend value
        const singleMatch = stipend.match(/\$?([\d,]+)/);
        if (singleMatch) {
          stipendData = {
            min: parseInt(singleMatch[1].replace(/,/g, '')),
            currency: 'USD',
            period: 'monthly'
          };
        }
      }
    }

    // Parse experience
    let experienceData = {};
    if (experience) {
      const expMatch = experience.match(/(\d+)/);
      if (expMatch) {
        experienceData = {
          min: parseInt(expMatch[1]),
          unit: 'months'
        };
      }
    }

    // Parse skills
    const skillsArray = skills ? skills.split(',').map(skill => skill.trim()) : [];

    // Create internship
    const internship = await Internship.create({
      title,
      company: req.user.name,
      description,
      location,
      stipend: stipendData,
      experience: experienceData,
      skills: skillsArray,
      requirements: [qualification].filter(Boolean),
      employer: req.user._id,
      applicationEmail: email,
      tags: skillsArray
    });

    res.status(201).json({
      success: true,
      message: 'Internship posted successfully!',
      data: {
        internship: {
          id: internship._id,
          title: internship.title,
          company: internship.company,
          location: internship.location,
          status: internship.status,
          applications: internship.applications,
          views: internship.views,
          createdAt: internship.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Internship creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create internship',
      error: error.message
    });
  }
});

// @desc    Get employer's internships
// @route   GET /api/employers/internships
// @access  Private
router.get('/internships', protect, async (req, res) => {
  if (req.user.role !== 'employer') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only employers can access this endpoint.'
    });
  }

  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { employer: req.user._id };
    if (status) {
      query.status = status;
    }
    const internships = await Internship.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    const total = await Internship.countDocuments(query);
    res.json({
      success: true,
      data: {
        internships: internships.map(internship => ({
          id: internship._id,
          title: internship.title,
          company: internship.company,
          location: internship.location,
          description: internship.description,
          stipend: internship.stipend,
          experience: internship.experience,
          skills: internship.skills,
          status: internship.status,
          applications: internship.applications,
          views: internship.views,
          createdAt: internship.createdAt,
          updatedAt: internship.updatedAt
        })),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalInternships: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch internships',
      error: error.message
    });
  }
});

// @desc    Get a specific internship
// @route   GET /api/employers/internships/:id
// @access  Private
router.get('/internships/:id', protect, async (req, res) => {
  if (req.user.role !== 'employer') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only employers can access this endpoint.'
    });
  }
  try {
    const internship = await Internship.findOne({ _id: req.params.id, employer: req.user._id });
    if (!internship) {
      return res.status(404).json({
        success: false,
        message: 'Internship not found'
      });
    }
    res.json({
      success: true,
      data: {
        internship: {
          id: internship._id,
          title: internship.title,
          company: internship.company,
          location: internship.location,
          description: internship.description,
          stipend: internship.stipend,
          experience: internship.experience,
          skills: internship.skills,
          requirements: internship.requirements,
          status: internship.status,
          applications: internship.applications,
          views: internship.views,
          createdAt: internship.createdAt,
          updatedAt: internship.updatedAt
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch internship',
      error: error.message
    });
  }
});

// @desc    Update an internship
// @route   PUT /api/employers/internships/:id
// @access  Private
router.put('/internships/:id', protect, async (req, res) => {
  if (req.user.role !== 'employer') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only employers can access this endpoint.'
    });
  }
  try {
    const internship = await Internship.findOne({ _id: req.params.id, employer: req.user._id });
    if (!internship) {
      return res.status(404).json({
        success: false,
        message: 'Internship not found'
      });
    }
    // Update allowed fields
    const allowedUpdates = ['title', 'description', 'location', 'stipend', 'experience', 'skills', 'requirements', 'status'];
    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });
    const updatedInternship = await Internship.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );
    res.json({
      success: true,
      message: 'Internship updated successfully!',
      data: {
        internship: {
          id: updatedInternship._id,
          title: updatedInternship.title,
          company: updatedInternship.company,
          location: updatedInternship.location,
          status: updatedInternship.status,
          applications: updatedInternship.applications,
          views: updatedInternship.views,
          updatedAt: updatedInternship.updatedAt
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update internship',
      error: error.message
    });
  }
});

// @desc    Delete an internship
// @route   DELETE /api/employers/internships/:id
// @access  Private
router.delete('/internships/:id', protect, async (req, res) => {
  if (req.user.role !== 'employer') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only employers can access this endpoint.'
    });
  }
  try {
    const internship = await Internship.findOne({ _id: req.params.id, employer: req.user._id });
    if (!internship) {
      return res.status(404).json({
        success: false,
        message: 'Internship not found'
      });
    }
    await Internship.findByIdAndDelete(req.params.id);
    res.json({
      success: true,
      message: 'Internship deleted successfully!'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete internship',
      error: error.message
    });
  }
});

// @desc    Get applications for employer's jobs
// @route   GET /api/employers/applications
// @access  Private
router.get('/applications', protect, asyncHandler(async (req, res) => {
  if (req.user.role !== 'employer') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only employers can access this endpoint.'
    });
  }

  try {
    const { status, jobId, page = 1, limit = 10 } = req.query;
    
    const options = {};
    if (status) options.status = status;
    if (jobId) options.jobId = jobId;

    const applications = await Application.findByEmployer(req.user._id, options)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Application.countDocuments({ employer: req.user._id, ...options });

    // Automated fit/unfit logic
    const fitApplications = await Promise.all(applications.map(async app => {
      // Fetch full job data if not already populated
      const job = await Job.findById(app.job);
      const requiredSkills = job.skills || [];
      const minExperience = job.experience?.min || 0;
      const applicantSkills = app.skills || [];
      const applicantExperience = (app.experience?.years || 0) + ((app.experience?.months || 0) / 12);
      const hasAllSkills = requiredSkills.every(skill => applicantSkills.includes(skill));
      const enoughExperience = applicantExperience >= minExperience;
      const fitStatus = (hasAllSkills && enoughExperience) ? 'fit' : 'unfit';
      const safeApplicant = app.applicant && app.applicant.name ? app.applicant : (app.applicantName || app.applicantEmail ? { name: app.applicantName, email: app.applicantEmail } : null);
      return {
        id: app._id,
        job: app.job,
        applicant: safeApplicant,
        applicantName: (app.applicant && app.applicant.name) || app.applicantName,
        applicantEmail: (app.applicant && app.applicant.email) || app.applicantEmail,
        applicantPhone: app.applicantPhone,
        status: app.status,
        coverLetter: app.coverLetter,
        expectedSalary: app.expectedSalary,
        experience: app.experience,
        skills: app.skills,
        resume: app.resume,
        appliedAt: app.appliedAt,
        interview: app.interview,
        employerNotes: app.employerNotes,
        score: app.score,
        fitStatus
      };
    }));

    res.json({
      success: true,
      data: {
        applications: fitApplications,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalApplications: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications',
      error: error.message
    });
  }
}));

// @desc    Update application status
// @route   PUT /api/employers/applications/:id
// @access  Private
router.put('/applications/:id', protect, asyncHandler(async (req, res) => {
  if (req.user.role !== 'employer') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only employers can access this endpoint.'
    });
  }

  const { status, employerNotes, interview } = req.body;

  try {
    const application = await Application.findOne({ 
      _id: req.params.id, 
      employer: req.user._id 
    });
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    const update = {};
    if (status) update.status = status;
    if (employerNotes !== undefined) update.employerNotes = employerNotes;
    if (interview) update.interview = interview;

    const updatedApplication = await Application.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    ).populate('job', 'title company')
     .populate('applicant', 'name email');

    res.json({
      success: true,
      message: 'Application updated successfully!',
      data: {
        application: {
          id: updatedApplication._id,
          job: updatedApplication.job,
          applicant: updatedApplication.applicant,
          status: updatedApplication.status,
          employerNotes: updatedApplication.employerNotes,
          interview: updatedApplication.interview,
          updatedAt: updatedApplication.updatedAt
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update application',
      error: error.message
    });
  }
}));

// @desc    Get application statistics
// @route   GET /api/employers/applications/stats
// @access  Private
router.get('/applications/stats', protect, asyncHandler(async (req, res) => {
  if (req.user.role !== 'employer') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only employers can access this endpoint.'
    });
  }

  try {
    const stats = await Application.getStats(req.user._id);
    
    // Convert to object format
    const statsByStatus = {};
    stats.forEach(stat => {
      statsByStatus[stat._id] = stat.count;
    });

    res.json({
      success: true,
      data: {
        applicationsByStatus: statsByStatus,
        totalApplications: stats.reduce((sum, stat) => sum + stat.count, 0)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch application statistics',
      error: error.message
    });
  }
}));

// @desc    Get internship applications for employer's internships
// @route   GET /api/employers/internship-applications
// @access  Private
router.get('/internship-applications', protect, asyncHandler(async (req, res) => {
  if (req.user.role !== 'employer') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only employers can access this endpoint.'
    });
  }

  try {
    const { status, internshipId, page = 1, limit = 10 } = req.query;
    
    const options = {};
    if (status) options.status = status;
    if (internshipId) options.internshipId = internshipId;

    const applications = await InternshipApplication.findByEmployer(req.user._id, options)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await InternshipApplication.countDocuments({ employer: req.user._id, ...options });

    // Automated fit/unfit logic for internships
    const fitApplications = await Promise.all(applications.map(async app => {
      // Fetch full internship data if not already populated
      const internship = await Internship.findById(app.internship);
      const requiredSkills = internship.skills || [];
      const minExperience = internship.experience?.min || 0;
      const applicantSkills = app.skills || [];
      const applicantExperience = (app.experience?.years || 0) + ((app.experience?.months || 0) / 12);
      const hasAllSkills = requiredSkills.every(skill => applicantSkills.includes(skill));
      const enoughExperience = applicantExperience >= minExperience;
      const fitStatus = (hasAllSkills && enoughExperience) ? 'fit' : 'unfit';
      const safeApplicant = app.applicant && app.applicant.name ? app.applicant : (app.applicantName || app.applicantEmail ? { name: app.applicantName, email: app.applicantEmail } : null);
      return {
        id: app._id,
        internship: app.internship,
        applicant: safeApplicant,
        applicantName: (app.applicant && app.applicant.name) || app.applicantName,
        applicantEmail: (app.applicant && app.applicant.email) || app.applicantEmail,
        applicantPhone: app.applicantPhone,
        status: app.status,
        coverLetter: app.coverLetter,
        expectedStipend: app.expectedStipend,
        experience: app.experience,
        skills: app.skills,
        resume: app.resume,
        appliedAt: app.appliedAt,
        interview: app.interview,
        employerNotes: app.employerNotes,
        score: app.score,
        tags: app.tags,
        source: app.source,
        fitStatus
      };
    }));

    res.json({
      success: true,
      data: {
        applications: fitApplications,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch internship applications',
      error: error.message
    });
  }
}));

module.exports = router; 