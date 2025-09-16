const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class GeminiService {
  constructor() {
    this.model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  async generateQuizQuestions(topic, subject, difficulty = 'intermediate', questionCount = 5) {
    try {
      const prompt = this.buildQuizPrompt(topic, subject, difficulty, questionCount);
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse the AI response and convert to quiz format
      return this.parseQuizResponse(text, questionCount);
    } catch (error) {
      console.error('Error generating quiz with Gemini AI:', error);
      throw new Error('Failed to generate quiz questions. Please try again.');
    }
  }

  buildQuizPrompt(topic, subject, difficulty, questionCount) {
    return `Generate ${questionCount} quiz questions about "${topic}" in the subject "${subject}" at ${difficulty} difficulty level.
Requirements:
- Mix of question types: multiple choice and true/false ONLY (no short answer questions)
- Each question should be clear and educational
- Multiple choice questions should have 4 options with only one correct answer
- True/false questions should be unambiguous
- Include explanations for correct answers
- Questions should be appropriate for ${difficulty} level students
Format the response as a JSON array with this structure:
[
  {
    "question": "Question text here?",
    "type": "multiple-choice",
    "options": [
      {"text": "Option A", "isCorrect": false},
      {"text": "Option B", "isCorrect": true},
      {"text": "Option C", "isCorrect": false},
      {"text": "Option D", "isCorrect": false}
    ],
    "correctAnswer": "",
    "points": 20,
    "explanation": "Explanation why this answer is correct"
  },
  {
    "question": "True or false statement here.",
    "type": "true-false",
    "options": [],
    "correctAnswer": "true",
    "points": 15,
    "explanation": "Explanation for the correct answer"
  }
]
Make sure the response is valid JSON and follows the exact structure above. Do NOT include any short answer questions.`;
  }

  parseQuizResponse(response, expectedCount) {
    try {
      // Clean the response to extract JSON
      let jsonStart = response.indexOf('[');
      let jsonEnd = response.lastIndexOf(']') + 1;
      
      if (jsonStart === -1 || jsonEnd === 0) {
        throw new Error('Invalid response format from AI');
      }
      
      const jsonString = response.substring(jsonStart, jsonEnd);
      const questions = JSON.parse(jsonString);
      
      // Validate the parsed questions
      if (!Array.isArray(questions)) {
        throw new Error('AI response is not an array');
      }
      
      // Ensure we have the expected number of questions
      if (questions.length < expectedCount) {
        console.warn(`AI generated ${questions.length} questions, expected ${expectedCount}`);
      }
      
      // Validate each question structure
      const validatedQuestions = questions.map((q, index) => {
        if (!q.question || !q.type || !q.points) {
          throw new Error(`Question ${index + 1} is missing required fields`);
        }
        
        // Set default values and validate structure
        return {
          question: q.question.trim(),
          type: q.type,
          options: q.type === 'multiple-choice' ? (q.options || []) : [],
          correctAnswer: q.type !== 'multiple-choice' ? (q.correctAnswer || '') : '',
          points: parseInt(q.points) || 20,
          explanation: q.explanation || ''
        };
      });
      
      return validatedQuestions;
      
    } catch (error) {
      console.error('Error parsing AI response:', error);
      throw new Error('Failed to parse AI-generated quiz. Please try again.');
    }
  }

  async generateQuizBySubject(subject, difficulty = 'intermediate', questionCount = 5) {
    const topic = `fundamental concepts and key principles of ${subject}`;
    return this.generateQuizQuestions(topic, subject, difficulty, questionCount);
  }

  async generateQuizByTopic(topic, subject, difficulty = 'intermediate', questionCount = 5) {
    return this.generateQuizQuestions(topic, subject, difficulty, questionCount);
  }
}

module.exports = new GeminiService();
