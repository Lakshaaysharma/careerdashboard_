const express = require('express');
const router = express.Router();
const geminiService = require('../services/geminiService');

// GET /api/quiz?subject=...&topic=...&difficulty=intermediate&count=5
router.get('/quiz', async (req, res) => {
  try {
    const subject = (req.query.subject || '').toString().trim();
    const topic = (req.query.topic || '').toString().trim();
    const difficulty = (req.query.difficulty || 'intermediate').toString();
    const count = parseInt(req.query.count, 10) || 5;

    if (!subject && !topic) {
      return res.status(400).json({ error: 'Please provide subject or topic' });
    }

    let questions;
    if (topic) {
      questions = await geminiService.generateQuizByTopic(topic, subject || 'general', difficulty, count);
    } else {
      questions = await geminiService.generateQuizBySubject(subject, difficulty, count);
    }

    return res.status(200).json({ success: true, questions, meta: { subject, topic, difficulty, count } });
  } catch (error) {
    console.error('Quiz generation error:', error);
    return res.status(500).json({ success: false, error: 'Failed to generate quiz' });
  }
});

module.exports = router;





