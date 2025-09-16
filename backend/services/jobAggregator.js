const axios = require('axios');
const Parser = require('rss-parser');
const puppeteer = require('puppeteer');
const Job = require('../models/Job');

class JobAggregator {
  constructor() {
    this.parser = new Parser();
    this.sources = {
      indeed: {
        rss: 'https://rss.indeed.com/rss',
        api: process.env.INDEED_API_KEY,
        enabled: true
      },
      glassdoor: {
        api: process.env.GLASSDOOR_API_KEY,
        partnerId: process.env.GLASSDOOR_PARTNER_ID,
        enabled: true
      },
      linkedin: {
        api: process.env.LINKEDIN_API_KEY,
        enabled: false // Requires approval
      },
      internshala: {
        enabled: true,
        baseUrl: 'https://internshala.com'
      }
    };
  }

  // Fetch jobs from RSS feeds (Indeed, etc.)
  async fetchFromRSS(source, keywords = 'software engineer', location = 'remote') {
    try {
      const url = `${this.sources[source].rss}?q=${encodeURIComponent(keywords)}&l=${encodeURIComponent(location)}`;
      const feed = await this.parser.parseURL(url);
      
      const jobs = feed.items.slice(0, 20).map(item => ({
        title: this.extractTitle(item.title),
        company: this.extractCompany(item.title),
        location: this.extractLocation(item.title),
        description: item.contentSnippet || item.content,
        externalUrl: item.link,
        externalId: this.generateExternalId(item.link),
        source: source,
        lastFetched: new Date(),
        status: 'active'
      }));

      return jobs;
    } catch (error) {
      console.error(`Error fetching from ${source} RSS:`, error.message);
      return [];
    }
  }

  // Fetch jobs from Glassdoor API
  async fetchFromGlassdoor(keywords = 'software engineer', location = 'remote') {
    try {
      const { api, partnerId } = this.sources.glassdoor;
      if (!api || !partnerId) {
        console.log('Glassdoor API credentials not configured');
        return [];
      }

      const response = await axios.get('https://api.glassdoor.com/api/api.htm', {
        params: {
          v: 1,
          format: 'json',
          't.p': partnerId,
          't.k': api,
          action: 'jobs-prog',
          jobTitle: keywords,
          location: location
        }
      });

      if (response.data.response && response.data.response.results) {
        return response.data.response.results.map(job => ({
          title: job.jobTitle,
          company: job.companyName,
          location: job.location,
          description: job.jobDescription,
          externalUrl: job.jobUrl,
          externalId: job.jobId.toString(),
          source: 'glassdoor',
          lastFetched: new Date(),
          status: 'active'
        }));
      }

      return [];
    } catch (error) {
      console.error('Error fetching from Glassdoor API:', error.message);
      return [];
    }
  }

  // Scrape jobs from Internshala (example)
  async scrapeInternshala(keywords = 'software engineer') {
    try {
      const browser = await puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      
      const url = `${this.sources.internshala.baseUrl}/internships/search?keywords=${encodeURIComponent(keywords)}`;
      await page.goto(url, { waitUntil: 'networkidle2' });
      
      const jobs = await page.evaluate(() => {
        const jobCards = document.querySelectorAll('.internship_meta');
        return Array.from(jobCards).slice(0, 10).map(card => {
          const titleElement = card.querySelector('.profile');
          const companyElement = card.querySelector('.company_name');
          const locationElement = card.querySelector('.location_link');
          
          return {
            title: titleElement ? titleElement.textContent.trim() : '',
            company: companyElement ? companyElement.textContent.trim() : '',
            location: locationElement ? locationElement.textContent.trim() : '',
            description: '',
            externalUrl: titleElement ? titleElement.href : '',
            externalId: '',
            source: 'internshala',
            lastFetched: new Date(),
            status: 'active'
          };
        });
      });
      
      await browser.close();
      return jobs;
    } catch (error) {
      console.error('Error scraping Internshala:', error.message);
      return [];
    }
  }

  // Main aggregation method
  async aggregateJobs(keywords = 'software engineer', location = 'remote') {
    const allJobs = [];
    
    // Fetch from RSS sources
    if (this.sources.indeed.enabled) {
      const indeedJobs = await this.fetchFromRSS('indeed', keywords, location);
      allJobs.push(...indeedJobs);
    }
    
    // Fetch from APIs
    if (this.sources.glassdoor.enabled) {
      const glassdoorJobs = await this.fetchFromGlassdoor(keywords, location);
      allJobs.push(...glassdoorJobs);
    }
    
    // Scrape from websites
    if (this.sources.internshala.enabled) {
      const internshalaJobs = await this.scrapeInternshala(keywords);
      allJobs.push(...internshalaJobs);
    }
    
    return allJobs;
  }

  // Save aggregated jobs to database
  async saveAggregatedJobs(jobs) {
    const savedJobs = [];
    
    for (const job of jobs) {
      try {
        // Check if job already exists
        const existingJob = await Job.findOne({ 
          externalId: job.externalId, 
          source: job.source 
        });
        
        if (!existingJob) {
          const newJob = new Job(job);
          await newJob.save();
          savedJobs.push(newJob);
        } else {
          // Update existing job
          existingJob.lastFetched = new Date();
          await existingJob.save();
        }
      } catch (error) {
        console.error('Error saving job:', error.message);
      }
    }
    
    return savedJobs;
  }

  // Clean up old external jobs
  async cleanupOldJobs(daysOld = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    const result = await Job.deleteMany({
      source: { $ne: 'internal' },
      lastFetched: { $lt: cutoffDate }
    });
    
    console.log(`Cleaned up ${result.deletedCount} old external jobs`);
    return result.deletedCount;
  }

  // Helper methods for extracting data
  extractTitle(title) {
    // Remove company name and location from title
    return title.split(' at ')[0].split(' - ')[0].trim();
  }

  extractCompany(title) {
    const parts = title.split(' at ');
    if (parts.length > 1) {
      return parts[1].split(' - ')[0].trim();
    }
    return 'Unknown Company';
  }

  extractLocation(title) {
    const parts = title.split(' - ');
    if (parts.length > 1) {
      return parts[parts.length - 1].trim();
    }
    return 'Remote';
  }

  generateExternalId(url) {
    // Generate a unique ID from URL
    return Buffer.from(url).toString('base64').substring(0, 20);
  }

  // Get jobs with filters
  async getJobs(filters = {}) {
    const {
      search,
      location,
      jobType,
      remote,
      source,
      page = 1,
      limit = 20
    } = filters;

    const query = { status: 'active' };
    
    if (search) {
      query.$text = { $search: search };
    }
    
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    
    if (jobType) {
      query.jobType = jobType;
    }
    
    if (remote) {
      query.remote = remote;
    }
    
    if (source) {
      query.source = source;
    }

    const skip = (page - 1) * limit;
    
    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('employer', 'name email profile');

    const total = await Job.countDocuments(query);
    
    return {
      jobs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }
}

module.exports = new JobAggregator(); 