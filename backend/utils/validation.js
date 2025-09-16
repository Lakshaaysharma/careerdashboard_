const Joi = require('joi');

// Validation schemas
const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please enter a valid email address',
      'any.required': 'Email is required'
    }),
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters long',
      'any.required': 'Password is required'
    }),
  role: Joi.string()
    .valid('student', 'teacher', 'employer', 'mentor')
    .required()
    .messages({
      'any.only': 'Role must be either student, teacher, employer, or mentor',
      'any.required': 'Role is required'
    })
});

const signupSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 50 characters',
      'any.required': 'Name is required'
    }),
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please enter a valid email address',
      'any.required': 'Email is required'
    }),
  password: Joi.string()
    .min(6)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters long',
      'string.pattern.base': 'Password must contain uppercase, lowercase, and number',
      'any.required': 'Password is required'
    }),
  role: Joi.string()
    .valid('student', 'teacher', 'employer', 'mentor')
    .required()
    .messages({
      'any.only': 'Role must be either student, teacher, employer, or mentor',
      'any.required': 'Role is required'
    })
});

// Google OAuth validation schema
const googleAuthSchema = Joi.object({
  idToken: Joi.string()
    .required()
    .messages({
      'any.required': 'Google ID token is required'
    }),
  role: Joi.string()
    .valid('student', 'teacher', 'employer', 'mentor')
    .required()
    .messages({
      'any.only': 'Role must be either student, teacher, employer, or mentor',
      'any.required': 'Role is required'
    })
});

// Validation middleware
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      const errorMessage = error.details[0].message;
      return res.status(400).json({
        success: false,
        message: errorMessage
      });
    }
    
    next();
  };
};

// Export validation functions
module.exports = {
  validateLogin: validateRequest(loginSchema),
  validateSignup: validateRequest(signupSchema),
  validateGoogleAuth: validateRequest(googleAuthSchema),
  loginSchema,
  signupSchema,
  googleAuthSchema
}; 