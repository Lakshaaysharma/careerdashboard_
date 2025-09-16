const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Get teacher's chats
// @route   GET /api/teacher-chats
// @access  Private (Teachers only)
router.get('/', protect, async (req, res) => {
  try {
    // Only teachers can access this endpoint
    if (req.user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers can access this endpoint'
      });
    }

    const chats = await Chat.find({
      participants: req.user._id,
      chatType: { $in: ['teacher-student', 'teacher-teacher'] }
    })
    .populate('participants', 'name email profile.avatar role')
    .populate('lastMessage.sender', 'name')
    .sort({ 'lastMessage.timestamp': -1, updatedAt: -1 });

    // Format chats for frontend
    const formattedChats = chats.map(chat => {
      const otherParticipant = chat.participants.find(p => p._id.toString() !== req.user._id.toString());
      const unreadCount = chat.unreadCounts.get(req.user._id.toString()) || 0;
      
      return {
        id: chat._id,
        name: otherParticipant ? otherParticipant.name : 'Unknown User',
        avatar: otherParticipant ? otherParticipant.profile?.avatar || '/placeholder-user.jpg' : '/placeholder-user.jpg',
        lastMessage: chat.lastMessage?.text || 'No messages yet',
        unreadCount: unreadCount,
        lastMessageTime: chat.lastMessage?.timestamp || chat.updatedAt,
        participants: chat.participants.map(p => ({
          _id: p._id,
          name: p.name,
          email: p.email,
          avatar: p.profile?.avatar || '/placeholder-user.jpg',
          role: p.role
        }))
      };
    });

    res.json({
      success: true,
      data: formattedChats
    });
  } catch (error) {
    console.error('Error fetching teacher chats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chats'
    });
  }
});

// @desc    Create new chat or get existing chat (teacher with student/teacher)
// @route   POST /api/teacher-chats
// @access  Private (Teachers only)
router.post('/', protect, async (req, res) => {
  try {
    const { participantId, chatType = 'teacher-student' } = req.body;

    // Only teachers can access this endpoint
    if (req.user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers can access this endpoint'
      });
    }

    if (!participantId) {
      return res.status(400).json({
        success: false,
        message: 'Participant ID is required'
      });
    }

    // Validate chat type
    if (!['teacher-student', 'teacher-teacher'].includes(chatType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid chat type'
      });
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
      if (chatType === 'teacher-student' && participant.role !== 'student') {
        return res.status(400).json({
          success: false,
          message: 'Can only create teacher-student chats with students'
        });
      }

      if (chatType === 'teacher-teacher' && participant.role !== 'teacher') {
        return res.status(400).json({
          success: false,
          message: 'Can only create teacher-teacher chats with teachers'
        });
      }

      // Create new chat
      chat = await Chat.create({
        participants: [req.user._id, participantId],
        chatType: chatType
      });
    }

    // Populate chat data
    await chat.populate('participants', 'name email profile.avatar role');

    // Format chat for frontend
    const otherParticipant = chat.participants.find(p => p._id.toString() !== req.user._id.toString());
    const formattedChat = {
      id: chat._id,
      name: otherParticipant ? otherParticipant.name : 'Unknown User',
      avatar: otherParticipant ? otherParticipant.profile?.avatar || '/placeholder-user.jpg' : '/placeholder-user.jpg',
      lastMessage: chat.lastMessage?.text || 'No messages yet',
      unreadCount: 0,
      lastMessageTime: chat.lastMessage?.timestamp || chat.updatedAt,
      participants: chat.participants.map(p => ({
        _id: p._id,
        name: p.name,
        email: p.email,
        avatar: p.profile?.avatar || '/placeholder-user.jpg',
        role: p.role
      }))
    };

    res.json({
      success: true,
      data: formattedChat
    });
  } catch (error) {
    console.error('Error creating teacher chat:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create chat'
    });
  }
});

// @desc    Get available users for teacher to chat with
// @route   GET /api/teacher-chats/users
// @access  Private (Teachers only)
router.get('/users', protect, async (req, res) => {
  try {
    // Only teachers can access this endpoint
    if (req.user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers can access this endpoint'
      });
    }

    // Get all students and teachers (excluding current user)
    const users = await User.find({ 
      _id: { $ne: req.user._id }
    }).select('name email profile.avatar role');

    console.log('Found users for teacher chat:', users.length);

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

    res.json({
      success: true,
      data: {
        students,
        teachers,
        all: formattedUsers
      }
    });
  } catch (error) {
    console.error('Error fetching users for teacher chat:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
});

// @desc    Get chat by ID (teacher access)
// @route   GET /api/teacher-chats/:id
// @access  Private (Teachers only)
router.get('/:id', protect, async (req, res) => {
  try {
    // Only teachers can access this endpoint
    if (req.user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers can access this endpoint'
      });
    }

    const chat = await Chat.findById(req.params.id)
      .populate('participants', 'name email profile.avatar role');

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
    console.error('Error fetching teacher chat:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat'
    });
  }
});

module.exports = router;
