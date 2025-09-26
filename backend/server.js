const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const fileUpload = require('express-fileupload');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config({ path: './config.env' });

const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const teacherRoutes = require('./routes/teachers');
const teacherProfileRoutes = require('./routes/teacher-profiles');
const employerRoutes = require('./routes/employers');
const jobsRoutes = require('./routes/jobs');
const internshipsRoutes = require('./routes/internships');
const enrollmentRoutes = require('./routes/enrollments');
const chatRoutes = require('./routes/chats');
const messageRoutes = require('./routes/messages');
const teacherChatRoutes = require('./routes/teacher-chats');
const quizRoutes = require('./routes/quiz');
const startupIdeasRoutes = require('./routes/startup-ideas');
const mentorsRoutes = require('./routes/mentors');
const applicationsRoutes = require('./routes/applications');
const internshipApplicationsRoutes = require('./routes/internship-applications');
const bookingsRoutes = require('./routes/bookings');
const attendanceRoutes = require('./routes/attendance');
const User = require('./models/User');
const { connectDB } = require('./config/database');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// CORS configuration
const allowedOrigins = [
  process.env.CORS_ORIGIN || 'http://localhost:3000',
  'http://localhost:3000'
];

// Add additional origins for production
if (process.env.NODE_ENV === 'production') {
  // Add your production frontend domains here
  allowedOrigins.push('https://shapingcareer.com');
  allowedOrigins.push('https://careerdashboard.vercel.app');
  allowedOrigins.push('https://career-dashboard.vercel.app');
  allowedOrigins.push('https://careerdashboard-vwue.onrender.com');
  // Add common Vercel deployment patterns
  allowedOrigins.push(/https:\/\/.*\.vercel\.app$/);
  allowedOrigins.push(/https:\/\/career-dashboard.*\.vercel\.app$/);
} else {
  // Development origins
  allowedOrigins.push('http://localhost:3000');
  allowedOrigins.push('http://127.0.0.1:3000');
}

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true
  }
});

// Security middleware
app.use(helmet());

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// File upload middleware
app.use(fileUpload({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  abortOnLimit: true,
  createParentPath: true
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Shaping Career API is running',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/teacher-profiles', teacherProfileRoutes);
app.use('/api/employers', employerRoutes);
app.use('/api', jobsRoutes);
app.use('/api', internshipsRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/teacher-chats', teacherChatRoutes);
app.use('/api', quizRoutes);
app.use('/api/startup-ideas', startupIdeasRoutes);
app.use('/api/mentors', mentorsRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/internship-applications', internshipApplicationsRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/attendance', attendanceRoutes);

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Handle Mongo duplicate key errors (e.g., unique index violations)
  if (err && (err.code === 11000 || err.name === 'MongoServerError' && err.code === 11000)) {
    const duplicatedFields = Object.keys(err.keyValue || {});
    return res.status(409).json({
      error: 'Duplicate Key',
      message: duplicatedFields.length
        ? `Duplicate value for field(s): ${duplicatedFields.join(', ')}`
        : 'Duplicate key error',
      details: process.env.NODE_ENV === 'development' ? err.keyValue : undefined
    });
  }
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: err.message,
      details: err.details
    });
  }
  
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid Token',
      message: 'Please provide a valid authentication token'
    });
  }
  
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Socket.IO event handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join user to their personal room
  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined room: user_${userId}`);
  });

  // Handle joining chat room
  socket.on('join-chat', (chatId) => {
    socket.leaveAll();
    socket.join(`chat_${chatId}`);
    console.log(`User joined chat room: chat_${chatId}`);
  });

  // Handle new message (for real-time broadcasting only)
  socket.on('send-message', async (data) => {
    try {
      const { chatId, message, senderId, messageId, messageType } = data;
      
      // Don't save to database here - messages are already saved via HTTP API
      // Just broadcast to other users in the chat
      const broadcastData = {
        _id: messageId,
        id: messageId, // Add id field for frontend compatibility
        sender: senderId,
        timestamp: new Date(),
        chatId
      };

      // Handle different message types
      if (messageType === 'text') {
        broadcastData.text = message.text;
      } else if (messageType === 'image' || messageType === 'file') {
        broadcastData.messageType = messageType;
        broadcastData.file = message.file;
      }

      io.to(`chat_${chatId}`).emit('new-message', broadcastData);

      console.log(`Message broadcasted in chat ${chatId}:`, messageType || 'text');
    } catch (error) {
      console.error('Error broadcasting message:', error);
    }
  });

  // Handle typing indicator
  socket.on('typing', (data) => {
    const { chatId, userId, isTyping } = data;
    socket.to(`chat_${chatId}`).emit('user-typing', { userId, isTyping });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Ensure indexes are correct for email + role multi-account support
    await ensureUserIndexes();
    
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`);
      console.log(`💬 Chat API: http://localhost:${PORT}/api/chats`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app; 

// Ensures the users collection has the intended indexes
async function ensureUserIndexes() {
  try {
    const collection = User.collection;
    const indexes = await collection.indexes();
    const emailOnly = indexes.find((idx) => idx.key && idx.key.email === 1 && !idx.key.role);
    // Drop legacy unique email index if present
    if (emailOnly && emailOnly.unique) {
      try {
        await collection.dropIndex(emailOnly.name);
        console.log(`🧹 Dropped legacy unique index ${emailOnly.name} on users.email`);
      } catch (dropErr) {
        console.warn('Could not drop legacy email index:', dropErr.message);
      }
    }

    // Ensure compound unique index on (email, role)
    await collection.createIndex({ email: 1, role: 1 }, { unique: true, name: 'email_role_unique' });
    // Ensure non-unique helper index on email for faster lookups
    await collection.createIndex({ email: 1 }, { name: 'email_non_unique' });
    console.log('✅ Ensured users indexes: email_role_unique (unique), email_non_unique');
  } catch (idxErr) {
    console.warn('Index ensure failed (will continue):', idxErr.message);
  }
}