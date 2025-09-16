const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// MCQ Generation Service
const geminiAIService = {
  // Generate MCQs from command
  generateMCQs: async (command) => {
    try {
      console.log('Gemini API Key:', process.env.GEMINI_API_KEY ? 'Present' : 'Missing');
      console.log('Command received:', command);
      
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
             const prompt = `Generate multiple choice questions based on this command: "${command}"

IMPORTANT: Respond ONLY with a valid JSON array. Do not include any text before or after the JSON.

Format your response exactly like this example:
[
  {
    "question": "What is the correct way to declare a variable in JavaScript?",
    "options": [
      {"id": "a", "text": "var x = 5;", "isCorrect": true},
      {"id": "b", "text": "variable x = 5;", "isCorrect": false},
      {"id": "c", "text": "let x = 5;", "isCorrect": false},
      {"id": "d", "text": "const x = 5;", "isCorrect": false}
    ],
    "explanation": "var is the traditional way to declare variables in JavaScript.",
    "points": 5
  }
]

CRITICAL RULES:
- Generate the EXACT number of questions requested in the command
- If the command says "10 MCQs", generate exactly 10 questions
- If the command says "5 questions", generate exactly 5 questions
- Each question must have exactly 4 options (A, B, C, D)
- Only one option should be correct (isCorrect: true)
- Include clear explanations for correct answers
- Make questions relevant to the topic mentioned in the command
- Vary difficulty levels (easy, medium, hard)
- Ensure all options are plausible distractors
- Respond with ONLY the JSON array, no additional text
- If no specific number is mentioned, generate 5 questions by default`;
      
      console.log('Sending prompt to Gemini...');
      let result, response;
      try {
        result = await model.generateContent(prompt);
        response = result.response.text();
        console.log('Gemini response received:', response.substring(0, 200) + '...');
      } catch (geminiError) {
        console.error('Gemini AI Error:', geminiError);
        console.error('Error details:', geminiError.message);
        
        // Return fallback questions when Gemini is unavailable
        console.log('Gemini unavailable - providing fallback questions');
        return {
          success: true,
          questions: generateFallbackQuestions(command),
          command: command,
          fallback: true
        };
      }
      
      // Parse JSON response
      try {
        // Try to extract JSON from the response (in case AI added extra text)
        let jsonResponse = response.trim();
        
        // Find the first [ and last ] to extract JSON array
        const startIndex = jsonResponse.indexOf('[');
        const endIndex = jsonResponse.lastIndexOf(']');
        
        if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
          jsonResponse = jsonResponse.substring(startIndex, endIndex + 1);
        }
        
        const questions = JSON.parse(jsonResponse);
        console.log('Successfully parsed questions:', questions.length);
        
        // Validate the structure
        if (!Array.isArray(questions)) {
          throw new Error('Response is not an array');
        }
        
                 // Add type field to each question if missing
         const questionsWithType = questions.map(question => ({
           ...question,
           type: question.type || 'multiple_choice'
         }));
         
         return {
           success: true,
           questions: questionsWithType,
           command: command
         };
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        console.error('Raw response:', response);
        
                 // If parsing fails, return demo questions
         console.log('Parsing failed - providing demo questions');
         
         // Generate more demo questions based on the command
         const demoQuestions = [
           {
             question: "What is the correct way to declare a variable in JavaScript?",
             type: "multiple_choice",
             options: [
               { id: "a", text: "var x = 5;", isCorrect: true },
               { id: "b", text: "variable x = 5;", isCorrect: false },
               { id: "c", text: "let x = 5;", isCorrect: false },
               { id: "d", text: "const x = 5;", isCorrect: false }
             ],
             explanation: "var is the traditional way to declare variables in JavaScript.",
             points: 5
           },
           {
             question: "Which method is used to add an element to the end of an array?",
             type: "multiple_choice",
             options: [
               { id: "a", text: "push()", isCorrect: true },
               { id: "b", text: "pop()", isCorrect: false },
               { id: "c", text: "shift()", isCorrect: false },
               { id: "d", text: "unshift()", isCorrect: false }
             ],
             explanation: "push() adds one or more elements to the end of an array.",
             points: 5
           },
           {
             question: "What does the 'typeof' operator return?",
             type: "multiple_choice",
             options: [
               { id: "a", text: "The value of a variable", isCorrect: false },
               { id: "b", text: "The type of a variable as a string", isCorrect: true },
               { id: "c", text: "The size of a variable", isCorrect: false },
               { id: "d", text: "The memory address of a variable", isCorrect: false }
             ],
             explanation: "typeof returns a string indicating the type of the operand.",
             points: 5
           },
           {
             question: "How do you write a comment in JavaScript?",
             type: "multiple_choice",
             options: [
               { id: "a", text: "<!-- comment -->", isCorrect: false },
               { id: "b", text: "// comment", isCorrect: true },
               { id: "c", text: "/* comment */", isCorrect: false },
               { id: "d", text: "** comment **", isCorrect: false }
             ],
             explanation: "// is used for single-line comments in JavaScript.",
             points: 5
           },
           {
             question: "What is the output of console.log(typeof null)?",
             type: "multiple_choice",
             options: [
               { id: "a", text: "null", isCorrect: false },
               { id: "b", text: "undefined", isCorrect: false },
               { id: "c", text: "object", isCorrect: true },
               { id: "d", text: "number", isCorrect: false }
             ],
             explanation: "typeof null returns 'object' due to a JavaScript bug.",
             points: 5
           },
           {
             question: "Which method removes the last element from an array?",
             type: "multiple_choice",
             options: [
               { id: "a", text: "push()", isCorrect: false },
               { id: "b", text: "pop()", isCorrect: true },
               { id: "c", text: "shift()", isCorrect: false },
               { id: "d", text: "unshift()", isCorrect: false }
             ],
             explanation: "pop() removes and returns the last element from an array.",
             points: 5
           },
           {
             question: "What is the correct way to check if a variable is an array?",
             type: "multiple_choice",
             options: [
               { id: "a", text: "typeof arr === 'array'", isCorrect: false },
               { id: "b", text: "Array.isArray(arr)", isCorrect: true },
               { id: "c", text: "arr instanceof Array", isCorrect: false },
               { id: "d", text: "arr.constructor === Array", isCorrect: false }
             ],
             explanation: "Array.isArray() is the most reliable way to check if a variable is an array.",
             points: 5
           },
           {
             question: "What does the '===' operator do?",
             type: "multiple_choice",
             options: [
               { id: "a", text: "Compares values and types", isCorrect: true },
               { id: "b", text: "Compares only values", isCorrect: false },
               { id: "c", text: "Assigns a value", isCorrect: false },
               { id: "d", text: "Checks if values are equal", isCorrect: false }
             ],
             explanation: "=== is the strict equality operator that compares both value and type.",
             points: 5
           },
           {
             question: "Which keyword is used to declare a constant variable?",
             type: "multiple_choice",
             options: [
               { id: "a", text: "var", isCorrect: false },
               { id: "b", text: "let", isCorrect: false },
               { id: "c", text: "const", isCorrect: true },
               { id: "d", text: "constant", isCorrect: false }
             ],
             explanation: "const is used to declare variables that cannot be reassigned.",
             points: 5
           },
           {
             question: "What is the purpose of the 'use strict' directive?",
             type: "multiple_choice",
             options: [
               { id: "a", text: "To enable strict mode", isCorrect: true },
               { id: "b", text: "To disable strict mode", isCorrect: false },
               { id: "c", text: "To declare variables", isCorrect: false },
               { id: "d", text: "To import modules", isCorrect: false }
             ],
             explanation: "'use strict' enables strict mode which catches common coding mistakes.",
             points: 5
           }
         ];

         // Return the requested number of questions (or all if less than requested)
         const requestedCount = geminiAIService.parseCommand(command).count;
         const selectedQuestions = demoQuestions.slice(0, Math.min(requestedCount, demoQuestions.length));

         return {
           success: true,
           questions: selectedQuestions,
           command: command,
           demo: true
         };
      }
      
    } catch (error) {
      console.error('Gemini AI Error:', error);
      console.error('Error details:', error.message);
      
             // If rate limited, provide sample MCQs for demo
       if (error.message.includes('429') || error.message.includes('quota')) {
         console.log('Rate limited - providing sample MCQs for demo');
         
         // Use the same demo questions array
         const demoQuestions = [
           {
             question: "What is the correct way to declare a variable in JavaScript?",
             type: "multiple_choice",
             options: [
               { id: "a", text: "var x = 5;", isCorrect: true },
               { id: "b", text: "variable x = 5;", isCorrect: false },
               { id: "c", text: "let x = 5;", isCorrect: false },
               { id: "d", text: "const x = 5;", isCorrect: false }
             ],
             explanation: "var is the traditional way to declare variables in JavaScript.",
             points: 5
           },
           {
             question: "Which method is used to add an element to the end of an array?",
             type: "multiple_choice",
             options: [
               { id: "a", text: "push()", isCorrect: true },
               { id: "b", text: "pop()", isCorrect: false },
               { id: "c", text: "shift()", isCorrect: false },
               { id: "d", text: "unshift()", isCorrect: false }
             ],
             explanation: "push() adds one or more elements to the end of an array.",
             points: 5
           },
           {
             question: "What does the 'typeof' operator return?",
             type: "multiple_choice",
             options: [
               { id: "a", text: "The value of a variable", isCorrect: false },
               { id: "b", text: "The type of a variable as a string", isCorrect: true },
               { id: "c", text: "The size of a variable", isCorrect: false },
               { id: "d", text: "The memory address of a variable", isCorrect: false }
             ],
             explanation: "typeof returns a string indicating the type of the operand.",
             points: 5
           },
           {
             question: "How do you write a comment in JavaScript?",
             type: "multiple_choice",
             options: [
               { id: "a", text: "<!-- comment -->", isCorrect: false },
               { id: "b", text: "// comment", isCorrect: true },
               { id: "c", text: "/* comment */", isCorrect: false },
               { id: "d", text: "** comment **", isCorrect: false }
             ],
             explanation: "// is used for single-line comments in JavaScript.",
             points: 5
           },
           {
             question: "What is the output of console.log(typeof null)?",
             type: "multiple_choice",
             options: [
               { id: "a", text: "null", isCorrect: false },
               { id: "b", text: "undefined", isCorrect: false },
               { id: "c", text: "object", isCorrect: true },
               { id: "d", text: "number", isCorrect: false }
             ],
             explanation: "typeof null returns 'object' due to a JavaScript bug.",
             points: 5
           },
           {
             question: "Which method removes the last element from an array?",
             type: "multiple_choice",
             options: [
               { id: "a", text: "push()", isCorrect: false },
               { id: "b", text: "pop()", isCorrect: true },
               { id: "c", text: "shift()", isCorrect: false },
               { id: "d", text: "unshift()", isCorrect: false }
             ],
             explanation: "pop() removes and returns the last element from an array.",
             points: 5
           },
           {
             question: "What is the correct way to check if a variable is an array?",
             type: "multiple_choice",
             options: [
               { id: "a", text: "typeof arr === 'array'", isCorrect: false },
               { id: "b", text: "Array.isArray(arr)", isCorrect: true },
               { id: "c", text: "arr instanceof Array", isCorrect: false },
               { id: "d", text: "arr.constructor === Array", isCorrect: false }
             ],
             explanation: "Array.isArray() is the most reliable way to check if a variable is an array.",
             points: 5
           },
           {
             question: "What does the '===' operator do?",
             type: "multiple_choice",
             options: [
               { id: "a", text: "Compares values and types", isCorrect: true },
               { id: "b", text: "Compares only values", isCorrect: false },
               { id: "c", text: "Assigns a value", isCorrect: false },
               { id: "d", text: "Checks if values are equal", isCorrect: false }
             ],
             explanation: "=== is the strict equality operator that compares both value and type.",
             points: 5
           },
           {
             question: "Which keyword is used to declare a constant variable?",
             type: "multiple_choice",
             options: [
               { id: "a", text: "var", isCorrect: false },
               { id: "b", text: "let", isCorrect: false },
               { id: "c", text: "const", isCorrect: true },
               { id: "d", text: "constant", isCorrect: false }
             ],
             explanation: "const is used to declare variables that cannot be reassigned.",
             points: 5
           },
           {
             question: "What is the purpose of the 'use strict' directive?",
             type: "multiple_choice",
             options: [
               { id: "a", text: "To enable strict mode", isCorrect: true },
               { id: "b", text: "To disable strict mode", isCorrect: false },
               { id: "c", text: "To declare variables", isCorrect: false },
               { id: "d", text: "To import modules", isCorrect: false }
             ],
             explanation: "'use strict' enables strict mode which catches common coding mistakes.",
             points: 5
           }
         ];

         // Return the requested number of questions (or all if less than requested)
         const requestedCount = geminiAIService.parseCommand(command).count;
         const selectedQuestions = demoQuestions.slice(0, Math.min(requestedCount, demoQuestions.length));

         return {
           success: true,
           questions: selectedQuestions,
           command: command,
           demo: true
         };
       }
      
      return {
        success: false,
        error: 'Failed to generate MCQs',
        details: error.message
      };
    }
  },

  // Validate command format
  validateCommand: (command) => {
    const patterns = [
      /create\s+\d+\s+mcqs?\s+(?:about|on|for)\s+.+/i,
      /make\s+a\s+test\s+(?:on|about)\s+.+?\s+with\s+\d+\s+questions/i,
      /generate\s+\d+\s+(easy|medium|hard)\s+.+?\s+questions/i
    ];
    
    return patterns.some(pattern => pattern.test(command));
  },

  // Extract parameters from command
  parseCommand: (command) => {
    const countMatch = command.match(/(\d+)/);
    const topicMatch = command.match(/(?:about|on|for)\s+(.+?)(?:\s+with|\s*$)/i);
    const difficultyMatch = command.match(/(easy|medium|hard)/i);
    
    return {
      count: countMatch ? parseInt(countMatch[1]) : 5,
      topic: topicMatch ? topicMatch[1].trim() : 'general knowledge',
      difficulty: difficultyMatch ? difficultyMatch[1].toLowerCase() : 'medium'
    };
  }
};

// Generate fallback questions when Gemini is unavailable
const generateFallbackQuestions = (command) => {
  const { count, topic } = geminiAIService.parseCommand(command);
  
  // Generate topic-specific questions based on the command
  const topicLower = topic.toLowerCase();
  
     if (topicLower.includes('javascript') || topicLower.includes('js')) {
     return [
       {
         question: "What is the output of console.log(typeof null)?",
         type: "multiple_choice",
         options: [
           { id: "a", text: "null", isCorrect: false },
           { id: "b", text: "object", isCorrect: true },
           { id: "c", text: "undefined", isCorrect: false },
           { id: "d", text: "number", isCorrect: false }
         ],
         explanation: "A known quirk in JavaScript, typeof null returns 'object'.",
         points: 5
       },
       {
         question: "Which statement is used to stop a loop prematurely?",
         type: "multiple_choice",
         options: [
           { id: "a", text: "continue", isCorrect: false },
           { id: "b", text: "break", isCorrect: true },
           { id: "c", text: "return", isCorrect: false },
           { id: "d", text: "exit", isCorrect: false }
         ],
         explanation: "The break statement immediately terminates the loop.",
         points: 5
       },
       {
         question: "What does NaN stand for in JavaScript?",
         type: "multiple_choice",
         options: [
           { id: "a", text: "Not a Number", isCorrect: true },
           { id: "b", text: "Number and Null", isCorrect: false },
           { id: "c", text: "New Array Number", isCorrect: false },
           { id: "d", text: "Null and Number", isCorrect: false }
         ],
         explanation: "NaN represents a value that is not a valid number.",
         points: 5
       },
       {
         question: "What is the purpose of the === operator?",
         type: "multiple_choice",
         options: [
           { id: "a", text: "Compares values only", isCorrect: false },
           { id: "b", text: "Compares values and types", isCorrect: true },
           { id: "c", text: "Assigns a value", isCorrect: false },
           { id: "d", text: "Checks if values are equal", isCorrect: false }
         ],
         explanation: "=== checks for both value and type equality.",
         points: 5
       },
       {
         question: "How do you create a function in JavaScript?",
         type: "multiple_choice",
         options: [
           { id: "a", text: "function myFunction() {}", isCorrect: true },
           { id: "b", text: "def myFunction() {}", isCorrect: false },
           { id: "c", text: "func myFunction() {}", isCorrect: false },
           { id: "d", text: "method myFunction() {}", isCorrect: false }
         ],
         explanation: "The keyword function followed by the function name and parentheses defines a function.",
         points: 5
       },
       {
         question: "What is the difference between let, const, and var?",
         type: "multiple_choice",
         options: [
           { id: "a", text: "let and const are block-scoped, var is function-scoped", isCorrect: true },
           { id: "b", text: "var is block-scoped, let and const are function-scoped", isCorrect: false },
           { id: "c", text: "All three are function-scoped", isCorrect: false },
           { id: "d", text: "All three are block-scoped", isCorrect: false }
         ],
         explanation: "let and const have block scope, while var has function scope.",
         points: 5
       },
       {
         question: "What is closure in JavaScript?",
         type: "multiple_choice",
         options: [
           { id: "a", text: "A function that has access to variables in its outer scope", isCorrect: true },
           { id: "b", text: "A way to close a function", isCorrect: false },
           { id: "c", text: "A method to end a loop", isCorrect: false },
           { id: "d", text: "A type of variable declaration", isCorrect: false }
         ],
         explanation: "Closures allow functions to access variables from their outer scope.",
         points: 5
       },
       {
         question: "What is the purpose of the map() method?",
         type: "multiple_choice",
         options: [
           { id: "a", text: "To transform each element in an array", isCorrect: true },
           { id: "b", text: "To filter elements in an array", isCorrect: false },
           { id: "c", text: "To sort elements in an array", isCorrect: false },
           { id: "d", text: "To reverse elements in an array", isCorrect: false }
         ],
         explanation: "map() creates a new array with the results of calling a function on every element.",
         points: 5
       },
       {
         question: "What is the event loop in JavaScript?",
         type: "multiple_choice",
         options: [
           { id: "a", text: "A mechanism that handles asynchronous operations", isCorrect: true },
           { id: "b", text: "A type of loop structure", isCorrect: false },
           { id: "c", text: "A way to handle errors", isCorrect: false },
           { id: "d", text: "A method to create events", isCorrect: false }
         ],
         explanation: "The event loop manages the execution of asynchronous code in JavaScript.",
         points: 5
       },
       {
         question: "What is the purpose of the Promise object?",
         type: "multiple_choice",
         options: [
           { id: "a", text: "To handle asynchronous operations", isCorrect: true },
           { id: "b", text: "To create loops", isCorrect: false },
           { id: "c", text: "To declare variables", isCorrect: false },
           { id: "d", text: "To handle errors only", isCorrect: false }
         ],
         explanation: "Promises represent the eventual completion or failure of an asynchronous operation.",
         points: 5
       }
     ].slice(0, count);
     } else if (topicLower.includes('react')) {
     return [
       {
         question: "What is a React component?",
         type: "multiple_choice",
         options: [
           { id: "a", text: "A JavaScript function that returns JSX", isCorrect: true },
           { id: "b", text: "A CSS class", isCorrect: false },
           { id: "c", text: "A database table", isCorrect: false },
           { id: "d", text: "An HTML element", isCorrect: false }
         ],
         explanation: "React components are JavaScript functions that return JSX to describe the UI.",
         points: 5
       },
       {
         question: "What hook is used for side effects in React?",
         type: "multiple_choice",
         options: [
           { id: "a", text: "useState", isCorrect: false },
           { id: "b", text: "useEffect", isCorrect: true },
           { id: "c", text: "useContext", isCorrect: false },
           { id: "d", text: "useReducer", isCorrect: false }
         ],
         explanation: "useEffect is used to perform side effects in functional components.",
         points: 5
       },
       {
         question: "What is JSX?",
         type: "multiple_choice",
         options: [
           { id: "a", text: "A JavaScript extension for XML", isCorrect: true },
           { id: "b", text: "A CSS framework", isCorrect: false },
           { id: "c", text: "A database language", isCorrect: false },
           { id: "d", text: "An HTML template", isCorrect: false }
         ],
         explanation: "JSX is a syntax extension for JavaScript that allows you to write HTML-like code.",
         points: 5
       },
       {
         question: "What is the purpose of useState hook?",
         type: "multiple_choice",
         options: [
           { id: "a", text: "To manage component state", isCorrect: true },
           { id: "b", text: "To perform side effects", isCorrect: false },
           { id: "c", text: "To share data between components", isCorrect: false },
           { id: "d", text: "To handle form submissions", isCorrect: false }
         ],
         explanation: "useState allows functional components to manage local state.",
         points: 5
       },
       {
         question: "What is the Virtual DOM in React?",
         type: "multiple_choice",
         options: [
           { id: "a", text: "A lightweight copy of the actual DOM", isCorrect: true },
           { id: "b", text: "A database for storing components", isCorrect: false },
           { id: "c", text: "A CSS framework", isCorrect: false },
           { id: "d", text: "A JavaScript library", isCorrect: false }
         ],
         explanation: "Virtual DOM is a lightweight representation of the actual DOM for efficient updates.",
         points: 5
       },
       {
         question: "What is a prop in React?",
         type: "multiple_choice",
         options: [
           { id: "a", text: "Data passed from parent to child component", isCorrect: true },
           { id: "b", text: "A CSS property", isCorrect: false },
           { id: "c", text: "A JavaScript function", isCorrect: false },
           { id: "d", text: "A database query", isCorrect: false }
         ],
         explanation: "Props are read-only data passed from parent to child components.",
         points: 5
       },
       {
         question: "What is the difference between state and props?",
         type: "multiple_choice",
         options: [
           { id: "a", text: "State is mutable, props are immutable", isCorrect: true },
           { id: "b", text: "Props are mutable, state is immutable", isCorrect: false },
           { id: "c", text: "Both are mutable", isCorrect: false },
           { id: "d", text: "Both are immutable", isCorrect: false }
         ],
         explanation: "State can be changed by the component, while props are read-only.",
         points: 5
       },
       {
         question: "What is the purpose of useContext hook?",
         type: "multiple_choice",
         options: [
           { id: "a", text: "To share data between components without prop drilling", isCorrect: true },
           { id: "b", text: "To manage local state", isCorrect: false },
           { id: "c", text: "To perform side effects", isCorrect: false },
           { id: "d", text: "To handle form inputs", isCorrect: false }
         ],
         explanation: "useContext allows components to consume values from React context.",
         points: 5
       },
       {
         question: "What is a controlled component in React?",
         type: "multiple_choice",
         options: [
           { id: "a", text: "A component whose value is controlled by React state", isCorrect: true },
           { id: "b", text: "A component that controls other components", isCorrect: false },
           { id: "c", text: "A component with no state", isCorrect: false },
           { id: "d", text: "A component that only renders once", isCorrect: false }
         ],
         explanation: "Controlled components have their value controlled by React state.",
         points: 5
       },
       {
         question: "What is the purpose of useRef hook?",
         type: "multiple_choice",
         options: [
           { id: "a", text: "To persist values between renders without causing re-renders", isCorrect: true },
           { id: "b", text: "To manage component state", isCorrect: false },
           { id: "c", text: "To perform side effects", isCorrect: false },
           { id: "d", text: "To share data between components", isCorrect: false }
         ],
         explanation: "useRef creates a mutable object that persists across renders.",
         points: 5
       }
     ].slice(0, count);
     } else {
     // Generic questions for any topic
     return [
       {
         question: `What is the main concept of ${topic}?`,
         type: "multiple_choice",
         options: [
           { id: "a", text: "A fundamental principle", isCorrect: true },
           { id: "b", text: "A programming language", isCorrect: false },
           { id: "c", text: "A database system", isCorrect: false },
           { id: "d", text: "An operating system", isCorrect: false }
         ],
         explanation: "This is a basic concept that forms the foundation of the topic.",
         points: 5
       },
       {
         question: `Which of the following is related to ${topic}?`,
         type: "multiple_choice",
         options: [
           { id: "a", text: "Core functionality", isCorrect: true },
           { id: "b", text: "Unrelated concept", isCorrect: false },
           { id: "c", text: "Different technology", isCorrect: false },
           { id: "d", text: "Opposite approach", isCorrect: false }
         ],
         explanation: "This represents a key aspect of the topic being studied.",
         points: 5
       },
       {
         question: `What is the primary purpose of ${topic}?`,
         type: "multiple_choice",
         options: [
           { id: "a", text: "To solve specific problems", isCorrect: true },
           { id: "b", text: "To create confusion", isCorrect: false },
           { id: "c", text: "To replace other technologies", isCorrect: false },
           { id: "d", text: "To increase complexity", isCorrect: false }
         ],
         explanation: "The primary purpose is to provide solutions to specific problems.",
         points: 5
       },
       {
         question: `How does ${topic} improve efficiency?`,
         type: "multiple_choice",
         options: [
           { id: "a", text: "By streamlining processes", isCorrect: true },
           { id: "b", text: "By adding more steps", isCorrect: false },
           { id: "c", text: "By increasing complexity", isCorrect: false },
           { id: "d", text: "By removing features", isCorrect: false }
         ],
         explanation: "Efficiency is improved by optimizing and streamlining processes.",
         points: 5
       },
       {
         question: `What is a key benefit of learning ${topic}?`,
         type: "multiple_choice",
         options: [
           { id: "a", text: "Enhanced problem-solving skills", isCorrect: true },
           { id: "b", text: "Increased confusion", isCorrect: false },
           { id: "c", text: "Reduced productivity", isCorrect: false },
           { id: "d", text: "More complexity", isCorrect: false }
         ],
         explanation: "Learning this topic enhances problem-solving and analytical skills.",
         points: 5
       },
       {
         question: `Which approach is best for mastering ${topic}?`,
         type: "multiple_choice",
         options: [
           { id: "a", text: "Practice and hands-on experience", isCorrect: true },
           { id: "b", text: "Memorization only", isCorrect: false },
           { id: "c", text: "Avoiding practical application", isCorrect: false },
           { id: "d", text: "Theoretical study only", isCorrect: false }
         ],
         explanation: "Practical application and hands-on experience are essential for mastery.",
         points: 5
       },
       {
         question: `What is the relationship between ${topic} and modern technology?`,
         type: "multiple_choice",
         options: [
           { id: "a", text: "It adapts to modern needs", isCorrect: true },
           { id: "b", text: "It remains unchanged", isCorrect: false },
           { id: "c", text: "It becomes obsolete", isCorrect: false },
           { id: "d", text: "It resists change", isCorrect: false }
         ],
         explanation: "This topic evolves and adapts to meet modern technological needs.",
         points: 5
       },
       {
         question: `How does ${topic} contribute to innovation?`,
         type: "multiple_choice",
         options: [
           { id: "a", text: "By enabling new solutions", isCorrect: true },
           { id: "b", text: "By limiting possibilities", isCorrect: false },
           { id: "c", text: "By maintaining status quo", isCorrect: false },
           { id: "d", text: "By avoiding change", isCorrect: false }
         ],
         explanation: "Innovation is driven by enabling new solutions and approaches.",
         points: 5
       },
       {
         question: `What is the future outlook for ${topic}?`,
         type: "multiple_choice",
         options: [
           { id: "a", text: "Continued growth and development", isCorrect: true },
           { id: "b", text: "Immediate obsolescence", isCorrect: false },
           { id: "c", text: "No change", isCorrect: false },
           { id: "d", text: "Declining relevance", isCorrect: false }
         ],
         explanation: "The topic shows promise for continued growth and development.",
         points: 5
       },
       {
         question: `Why is ${topic} important in today's world?`,
         type: "multiple_choice",
         options: [
           { id: "a", text: "It addresses current challenges", isCorrect: true },
           { id: "b", text: "It creates problems", isCorrect: false },
           { id: "c", text: "It's outdated", isCorrect: false },
           { id: "d", text: "It's irrelevant", isCorrect: false }
         ],
         explanation: "This topic is important because it addresses current challenges and needs.",
         points: 5
       }
     ].slice(0, count);
  }
};

module.exports = geminiAIService; 