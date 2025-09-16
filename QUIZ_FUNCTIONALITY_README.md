# 🧪 Quiz Functionality - Multiple Choice Questions

This document describes the enhanced quiz functionality that allows teachers to create assignments with multiple choice questions, true/false questions, and short answer questions.

## ✨ Features

### **1. Question Types Supported**
- **Multiple Choice**: Questions with 2+ options, one or more correct answers
- **True/False**: Simple true or false questions
- **Short Answer**: Text-based questions with expected answers

### **2. Question Structure**
Each question includes:
- Question text
- Question type
- Points value
- Correct answer(s)
- Optional explanation
- For multiple choice: options array with correct/incorrect flags

### **3. Validation**
- Quiz assignments must have at least one question
- Multiple choice questions require at least 2 options
- At least one option must be marked as correct
- True/False questions must have valid answers
- Short answer questions must have correct answers

## 🔧 Backend Implementation

### **Updated Teacher Model (`backend/models/Teacher.js`)**

#### **Assignment Schema Enhancement**
```javascript
assignments: [{
  // ... existing fields ...
  questions: [{
    question: { type: String, required: function() { return this.parent().type === 'quiz'; } },
    type: { type: String, enum: ['multiple-choice', 'true-false', 'short-answer'], default: 'multiple-choice' },
    options: [{
      text: String,
      isCorrect: Boolean
    }],
    correctAnswer: String, // For true-false and short-answer
    points: { type: Number, default: 1 },
    explanation: String // Optional explanation
  }]
}]
```

#### **Enhanced createAssignment Method**
```javascript
teacherSchema.methods.createAssignment = async function(assignmentData) {
  // ... existing logic ...
  
  // Add quiz questions if this is a quiz assignment
  if (assignmentData.type === 'quiz' && assignmentData.questions && Array.isArray(assignmentData.questions)) {
    assignment.questions = assignmentData.questions.map(q => ({
      question: q.question,
      type: q.type || 'multiple-choice',
      options: q.type === 'multiple-choice' ? q.options : [],
      correctAnswer: q.type !== 'multiple-choice' ? q.correctAnswer : '',
      points: q.points || 1,
      explanation: q.explanation || ''
    }));
  }
  
  // ... rest of the method
};
```

### **Updated API Route (`backend/routes/teachers.js`)**

#### **Enhanced Assignment Creation Endpoint**
```javascript
router.post('/assignments', protect, asyncHandler(async (req, res) => {
  const { title, description, subject, dueDate, points, type, assignToAll, selectedStudents, questions } = req.body;
  
  // Quiz validation
  if (type === 'quiz') {
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Quiz assignments must include at least one question'
      });
    }
    
    // Validate each question based on type
    // ... detailed validation logic
  }
  
  // Create assignment with questions
  const assignment = await teacher.createAssignment({
    title, description, subject, dueDate, points,
    type: type || 'homework',
    questions: type === 'quiz' ? questions : undefined
  });
}));
```

## 🎨 Frontend Implementation

### **Enhanced State Management**
```javascript
const [newAssignment, setNewAssignment] = useState({
  title: "",
  description: "",
  subject: "",
  dueDate: "",
  points: "",
  type: "homework",
  assignToAll: true,
  selectedStudents: [],
  questions: [] // New field for quiz questions
})

const [currentQuestion, setCurrentQuestion] = useState({
  question: "",
  type: "multiple-choice",
  options: [
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false }
  ],
  correctAnswer: "",
  points: 1,
  explanation: ""
})
```

### **Question Management Functions**
- `addQuestion()`: Validates and adds a question to the assignment
- `removeQuestion(index)`: Removes a question by index
- `updateQuestionOption(optionIndex, field, value)`: Updates option properties
- `addOption()`: Adds a new option to multiple choice questions
- `removeOption(optionIndex)`: Removes an option

### **UI Components**

#### **Question Builder Interface**
- Question text input (textarea)
- Question type selector (multiple-choice, true/false, short-answer)
- Points input
- Type-specific input fields:
  - **Multiple Choice**: Options with radio buttons for correct answers
  - **True/False**: Dropdown for correct answer
  - **Short Answer**: Text input for correct answer
- Optional explanation field
- Add question button

#### **Questions List Display**
- Shows all added questions
- Displays question type, points, and summary
- Remove question functionality
- Visual indicators for question types

## 🚀 Usage

### **Creating a Quiz Assignment**

1. **Set Assignment Type**: Choose "Quiz" from the type dropdown
2. **Add Questions**: Use the question builder interface
3. **Configure Questions**:
   - **Multiple Choice**: Add 2+ options, mark correct ones
   - **True/False**: Select correct answer
   - **Short Answer**: Enter expected answer
4. **Set Points**: Assign points per question
5. **Add Explanation**: Optional explanation for correct answers
6. **Create Assignment**: Submit the quiz

### **Example Quiz Structure**
```javascript
{
  title: "JavaScript Fundamentals Quiz",
  type: "quiz",
  questions: [
    {
      question: "What is the correct way to declare a variable?",
      type: "multiple-choice",
      options: [
        { text: "var x = 5;", isCorrect: true },
        { text: "variable x = 5;", isCorrect: false },
        { text: "v x = 5;", isCorrect: false }
      ],
      points: 25,
      explanation: "var, let, and const are correct ways to declare variables"
    }
  ]
}
```

## 🧪 Testing

### **Test Script**
Run the test script to verify quiz functionality:
```bash
cd backend
node test-quiz-creation.js
```

This script:
- Creates a sample quiz with multiple question types
- Validates the creation process
- Displays the created quiz structure
- Updates teacher statistics

## 🔍 Validation Rules

### **Quiz Requirements**
- Must have at least one question
- All questions must have valid text
- Points must be positive numbers

### **Multiple Choice Questions**
- Minimum 2 options
- At least one correct option
- All options must have text

### **True/False Questions**
- Correct answer must be 'true' or 'false'

### **Short Answer Questions**
- Must have a correct answer text

## 📊 Benefits

1. **Flexible Assessment**: Support for multiple question types
2. **Rich Content**: Explanations and detailed feedback
3. **Point System**: Granular scoring per question
4. **Validation**: Comprehensive input validation
5. **User Experience**: Intuitive question builder interface
6. **Scalability**: Easy to add new question types

## 🔮 Future Enhancements

1. **Question Templates**: Pre-built question sets
2. **Question Banks**: Reusable question libraries
3. **Advanced Scoring**: Partial credit, negative points
4. **Question Randomization**: Shuffle question and option order
5. **Time Limits**: Quiz duration settings
6. **Attempt Limits**: Maximum quiz attempts
7. **Auto-grading**: Automatic scoring for objective questions

## 🛠️ Technical Notes

- Questions are stored as embedded documents in the assignment
- Validation occurs both on frontend and backend
- Question types are extensible through the enum
- Points calculation is flexible per question
- All quiz data is included in the assignment object

---

**The quiz functionality is now fully implemented and ready for use!** 🎉





