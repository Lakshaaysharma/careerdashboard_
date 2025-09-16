const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Get user's chats
// @route   GET /api/chats
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user._id,
      chatType: { $in: req.user.role === 'student' ? ['student', 'student-teacher'] : ['teacher-student', 'teacher-teacher'] }
    })
    .populate('participants', 'name email avatar role')
    .populate('lastMessage.sender', 'name')
    .sort({ 'lastMessage.timestamp': -1, updatedAt: -1 });

    // Format chats for frontend
    const formattedChats = chats.map(chat => {
      const otherParticipant = chat.participants.find(p => p._id.toString() !== req.user._id.toString());
      const unreadCount = chat.unreadCounts.get(req.user._id.toString()) || 0;
      
      return {
        id: chat._id,
        name: otherParticipant ? otherParticipant.name : 'Unknown User',
        avatar: otherParticipant ? otherParticipant.avatar : '/placeholder-user.jpg',
        lastMessage: chat.lastMessage?.text || 'No messages yet',
        unreadCount: unreadCount,
        lastMessageTime: chat.lastMessage?.timestamp || chat.updatedAt,
        participants: chat.participants.map(p => ({
          _id: p._id,
          name: p.name,
          email: p.email,
          avatar: p.avatar,
          role: p.role
        }))
      };
    });

    res.json({
      success: true,
      data: formattedChats
    });
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chats'
    });
  }
});

// @desc    Create new chat or get existing chat
// @route   POST /api/chats
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { participantId, chatType = 'student' } = req.body;
    console.log('[POST /api/chats] participantId:', participantId, 'chatType:', chatType);

    if (!participantId) {
      return res.status(400).json({
        success: false,
        message: 'Participant ID is required'
      });
    }

    // Validate chat type based on user role
    if (req.user.role === 'student') {
      if (!['student', 'student-teacher'].includes(chatType)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid chat type for student'
        });
      }
    } else if (req.user.role === 'teacher') {
      if (!['teacher-student', 'teacher-teacher'].includes(chatType)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid chat type for teacher'
        });
      }
    }

    // Check if chat already exists
    let chat = await Chat.findOne({
      participants: { $all: [req.user._id, participantId] },
      chatType: chatType
    });

    if (!chat) {
      // Verify participant exists and has correct role
      const participant = await User.findById(participantId);
      if (!participant) {
        return res.status(400).json({
          success: false,
          message: 'Participant not found'
        });
      }

      // Validate participant role based on chat type
      if (chatType === 'student' && participant.role !== 'student') {
        return res.status(400).json({
          success: false,
          message: 'Can only create student-student chats with students'
        });
      }

      if (chatType === 'student-teacher' && participant.role !== 'teacher') {
        return res.status(400).json({
          success: false,
          message: 'Can only create student-teacher chats with teachers'
        });
      }

      // Create new chat
      chat = await Chat.create({
        participants: [req.user._id, participantId],
        chatType: chatType
      });
    }

    // Populate chat data
    await chat.populate('participants', 'name email avatar role');

    // Format chat for frontend
    const otherParticipant = chat.participants.find(p => p._id.toString() !== req.user._id.toString());
    const formattedChat = {
      id: chat._id,
      name: otherParticipant ? otherParticipant.name : 'Unknown User',
      avatar: otherParticipant ? otherParticipant.avatar : '/placeholder-user.jpg',
      lastMessage: chat.lastMessage?.text || 'No messages yet',
      unreadCount: 0,
      lastMessageTime: chat.lastMessage?.timestamp || chat.updatedAt,
      participants: chat.participants.map(p => ({
        _id: p._id,
        name: p.name,
        email: p.email,
        avatar: p.avatar,
        role: p.role
      }))
    };

    res.json({
      success: true,
      data: formattedChat
    });
  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create chat'
    });
  }
});

// @desc    Get available users for student to chat with
// @route   GET /api/chats/users
// @access  Private
router.get('/users', protect, async (req, res) => {
  try {
    console.log('[GET /api/chats/users] Request from user:', req.user._id, 'Role:', req.user.role);
    
    // Only students can access this endpoint
    if (req.user.role !== 'student') {
      console.log('Access denied: User role is not student');
      return res.status(403).json({
        success: false,
        message: 'Only students can access this endpoint'
      });
    }

    // Get all students and teachers (excluding current user)
    const users = await User.find({ 
      _id: { $ne: req.user._id }
    }).select('name email profile role');

    console.log('Found users for student chat:', users.length);

    // Format users for frontend
    const formattedUsers = users.map(user => ({
      _id: user._id,
      name: user.name || 'Unknown User',
      email: user.email || 'No email',
      avatar: user.profile?.avatar || '/placeholder-user.jpg',
      role: user.role
    }));

    // Separate students and teachers
    const students = formattedUsers.filter(user => user.role === 'student');
    const teachers = formattedUsers.filter(user => user.role === 'teacher');

    console.log('Sending formatted users - Students:', students.length, 'Teachers:', teachers.length);
    res.json({
      success: true,
      data: {
        students,
        teachers,
        all: formattedUsers
      }
    });
  } catch (error) {
    console.error('Error fetching users for student chat:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
});

// @desc    Get available students for chat (legacy endpoint)
// @route   GET /api/chats/students
// @access  Private
router.get('/students', protect, async (req, res) => {
  try {
    console.log('[GET /api/chats/students] Request from user:', req.user._id, 'Role:', req.user.role);
    
    // Only students can access this endpoint
    if (req.user.role !== 'student') {
      console.log('Access denied: User role is not student');
      return res.status(403).json({
        success: false,
        message: 'Only students can access this endpoint'
      });
    }

    const students = await User.find({ 
      role: 'student',
      _id: { $ne: req.user._id }
    }).select('name email profile');

    console.log('Found students:', students.length);
    students.forEach((student, index) => {
      console.log(`Student ${index + 1}:`, {
        _id: student._id,
        name: student.name,
        email: student.email,
        role: student.role
      });
    });

    const formattedStudents = students.map(student => ({
      _id: student._id,
      name: student.name || 'Unknown Student',
      email: student.email || 'No email',
      avatar: student.profile?.avatar || '/placeholder-user.jpg',
      role: 'student'
    }));

    console.log('Sending formatted students:', formattedStudents.length);
    res.json({
      success: true,
      data: formattedStudents
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch students',
      error: error.message
    });
  }
});

// @desc    Get chat by ID
// @route   GET /api/chats/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id)
      .populate('participants', 'name email avatar role');

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Check if user is participant
    if (!chat.participants.some(p => p._id.toString() === req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Mark messages as read for this user
    await chat.markAsRead(req.user._id);

    res.json({
      success: true,
      data: chat
    });
  } catch (error) {
    console.error('Error fetching chat:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat'
    });
  }
});

// Helper function to format time ago
function formatTimeAgo(date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return date.toLocaleDateString();
}

module.exports = router;
