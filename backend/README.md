# CareerLaunch Backend API

A complete Node.js/Express backend for the CareerLaunch platform with authentication, user management, and role-based access control.

## 🚀 Features

- **Authentication System**: JWT-based login/signup with role-based access
- **User Management**: Complete user CRUD operations with profile management
- **Security**: Password hashing, rate limiting, CORS, and input validation
- **Database**: MongoDB with Mongoose ODM
- **Validation**: Request validation using Joi
- **Error Handling**: Comprehensive error handling and logging

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

## 🛠️ Installation

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Setup**
   ```bash
   # Copy the config file
   cp config.env.example config.env
   
   # Edit the configuration
   nano config.env
   ```

3. **Database Setup**
   - Install MongoDB locally or use MongoDB Atlas
   - Update `MONGODB_URI` in `config.env`

4. **Start the Server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 🔧 Configuration

### Environment Variables (`config.env`)

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/career-launch

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Security
BCRYPT_ROUNDS=12
```

## 📡 API Endpoints

### Authentication

#### POST `/api/auth/login`
Login with email, password, and role.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "role": "student"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "name": "User Name",
      "email": "user@example.com",
      "role": "student"
    },
    "redirectUrl": "/dashboard/student"
  }
}
```

#### POST `/api/auth/signup`
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123",
  "role": "student"
}
```

#### GET `/api/auth/profile`
Get current user profile (requires authentication).

#### PUT `/api/auth/profile`
Update user profile (requires authentication).

#### POST `/api/auth/logout`
Logout user (requires authentication).

#### GET `/api/auth/me`
Check authentication status (requires authentication).

#### POST `/api/auth/create-demo-users`
Create demo users for development (development only).

### Health Check

#### GET `/health`
Check server status.

## 🔐 Authentication

### JWT Token Usage

Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Role-Based Access

- **Student**: Access to student dashboard and features
- **Teacher**: Access to teacher dashboard and features

## 🛡️ Security Features

- **Password Hashing**: bcrypt with configurable rounds
- **JWT Tokens**: Secure token-based authentication
- **Rate Limiting**: Prevents brute force attacks
- **Input Validation**: Request validation using Joi
- **CORS Protection**: Configurable CORS settings
- **Helmet**: Security headers
- **Error Handling**: Secure error responses

## 📊 Database Schema

### User Model

```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  role: String (enum: ['student', 'teacher']),
  profile: {
    avatar: String,
    bio: String,
    location: String,
    phone: String
  },
  preferences: {
    emailNotifications: Boolean,
    pushNotifications: Boolean,
    theme: String
  },
  stats: {
    lastLogin: Date,
    loginCount: Number,
    coursesEnrolled: Number,
    testsCompleted: Number
  },
  isActive: Boolean,
  isVerified: Boolean
}
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📝 Development

### Creating Demo Users

For development, you can create demo users using the API:

```bash
curl -X POST http://localhost:5000/api/auth/create-demo-users
```

This creates:
- **Student**: `student@demo.com` / `demo123`
- **Teacher**: `teacher@demo.com` / `demo123`

### File Structure

```
backend/
├── config/
│   └── database.js          # Database configuration
├── middleware/
│   └── auth.js              # Authentication middleware
├── models/
│   └── User.js              # User model
├── routes/
│   └── auth.js              # Authentication routes
├── utils/
│   └── validation.js        # Request validation
├── config.env               # Environment variables
├── package.json             # Dependencies
├── server.js                # Main server file
└── README.md                # This file
```

## 🚀 Deployment

### Production Checklist

1. **Environment Variables**
   - Set `NODE_ENV=production`
   - Use strong `JWT_SECRET`
   - Configure production `MONGODB_URI`

2. **Security**
   - Enable HTTPS
   - Configure proper CORS origins
   - Set up rate limiting
   - Use environment variables for secrets

3. **Database**
   - Use MongoDB Atlas or production MongoDB
   - Set up database backups
   - Configure connection pooling

4. **Monitoring**
   - Set up logging
   - Monitor server health
   - Set up error tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

For support, please contact the development team or create an issue in the repository. 