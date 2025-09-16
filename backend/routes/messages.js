const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Message = require('../models/Message');
const Chat = require('../models/Chat');

// @desc    Get messages for a chat
// @route   GET /api/messages/:chatId
// @access  Private
router.get('/:chatId', protect, async (req, res) => {
  try {
    const { chatId } = req.params;
    console.log('[GET /api/messages/:chatId] chatId:', chatId);

    // Verify chat exists and user is participant
    const chat = await Chat.findById(chatId);
    if (!chat) {
      console.warn('Chat not found for chatId:', chatId);
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    console.log('Participants:', chat.participants.map(p => p.toString()));
    console.log('Requester userId:', req.user._id.toString());
    if (!chat.participants.some(p => p.toString() === req.user._id.toString())) {
      console.warn('Access denied. User is not a participant of this chat');
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get messages
    const messages = await Message.find({ 
      chatId: chatId,
      isDeleted: false 
    })
    .populate('sender', 'name email avatar')
    .sort({ createdAt: 1 });

    // Format messages for frontend
    const formattedMessages = messages.map(msg => ({
      id: msg._id,
      text: msg.text,
      messageType: msg.messageType,
      file: msg.file,
      sender: msg.sender._id.toString(), // Ensure consistent string format
      senderName: msg.sender.name || 'Unknown User',
      timestamp: msg.createdAt,
      createdAt: msg.createdAt,
      isRead: false // Default to false for now
    }));

    res.json({
      success: true,
      data: formattedMessages
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages'
    });
  }
});

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { chatId, text } = req.body;
    console.log('[POST /api/messages] chatId:', chatId, 'text:', text);

    if (!chatId || !text) {
      return res.status(400).json({
        success: false,
        message: 'Chat ID and message text are required'
      });
    }

    // Verify chat exists and user is participant
    const chat = await Chat.findById(chatId);
    if (!chat) {
      console.warn('Chat not found for chatId:', chatId);
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    console.log('Participants:', chat.participants.map(p => p.toString()));
    console.log('Requester userId:', req.user._id.toString());
    if (!chat.participants.some(p => p.toString() === req.user._id.toString())) {
      console.warn('Access denied. User is not a participant of this chat');
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Create message
    const message = await Message.create({
      chatId: chatId,
      sender: req.user._id,
      text: text.trim()
    });

    // Populate sender info
    await message.populate('sender', 'name email avatar');

    // Update chat's last message
    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: {
        text: text.trim(),
        sender: req.user._id,
        timestamp: new Date()
      }
    });

    // Increment unread count for other participants
    const otherParticipants = chat.participants.filter(p => p.toString() !== req.user._id.toString());
    for (const participantId of otherParticipants) {
      await chat.incrementUnread(participantId);
    }

    // Format message for frontend
    const formattedMessage = {
      id: message._id,
      text: message.text,
      sender: req.user._id.toString(), // Use the original sender ID, not the populated one
      senderName: message.sender.name || 'Unknown User',
      timestamp: message.createdAt,
      createdAt: message.createdAt,
      isRead: false
    };

    res.json({
      success: true,
      data: formattedMessage
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
});

// @desc    Mark messages as read
// @route   PUT /api/messages/:chatId/read
// @access  Private
router.put('/:chatId/read', protect, async (req, res) => {
  try {
    const { chatId } = req.params;

    // Verify chat exists and user is participant
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    if (!chat.participants.some(p => p.toString() === req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Mark all unread messages as read
    await Message.updateMany(
      { 
        chatId: chatId,
        sender: { $ne: req.user._id },
        'readBy.user': { $ne: req.user._id }
      },
      { 
        $push: { 
          readBy: { 
            user: req.user._id, 
            readAt: new Date() 
          } 
        } 
      }
    );

    // Mark chat as read for this user
    await chat.markAsRead(req.user._id);

    res.json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark messages as read'
    });
  }
});

// @desc    Send a file message (image, PDF, etc.)
// @route   POST /api/messages/file
// @access  Private
router.post('/file', protect, async (req, res) => {
  try {
    const { chatId } = req.body;

    if (!chatId) {
      return res.status(400).json({
        success: false,
        message: 'Chat ID is required'
      });
    }

    // Check if files were uploaded
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    // Verify chat exists and user is participant
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    if (!chat.participants.some(p => p.toString() === req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get the uploaded file
    const uploadedFile = req.files.file;
    if (!uploadedFile) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(uploadedFile.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'File type not allowed. Only images (JPEG, PNG, GIF) and PDFs are supported.'
      });
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (uploadedFile.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10MB.'
      });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = uploadedFile.name.split('.').pop();
    const filename = `chat_${chatId}_${timestamp}_${Math.random().toString(36).substring(7)}.${fileExtension}`;
    
    // Determine upload directory based on file type
    const uploadDir = uploadedFile.mimetype.startsWith('image/') ? 'uploads/chat-images' : 'uploads/chat-files';
    const uploadPath = `${uploadDir}/${filename}`;

    // Ensure directory exists
    const fs = require('fs');
    const path = require('path');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Move file to upload directory
    await uploadedFile.mv(uploadPath);

    // Determine message type
    const messageType = uploadedFile.mimetype.startsWith('image/') ? 'image' : 'file';

    // Create message with file info
    const message = await Message.create({
      chatId: chatId,
      sender: req.user._id,
      messageType: messageType,
      file: {
        filename: filename,
        originalName: uploadedFile.name,
        mimeType: uploadedFile.mimetype,
        size: uploadedFile.size,
        path: uploadPath,
        url: `/uploads/${messageType === 'image' ? 'chat-images' : 'chat-files'}/${filename}`
      }
    });

    // Populate sender info
    await message.populate('sender', 'name email avatar');

    // Update chat's last message
    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: {
        text: `Sent a ${messageType}`,
        sender: req.user._id,
        timestamp: new Date()
      }
    });

    // Increment unread count for other participants
    const otherParticipants = chat.participants.filter(p => p.toString() !== req.user._id.toString());
    for (const participantId of otherParticipants) {
      await chat.incrementUnread(participantId);
    }

    // Format message for frontend
    const formattedMessage = {
      id: message._id,
      messageType: message.messageType,
      file: message.file,
      sender: req.user._id.toString(),
      senderName: message.sender.name || 'Unknown User',
      timestamp: message.createdAt,
      createdAt: message.createdAt,
      isRead: false
    };

    res.json({
      success: true,
      data: formattedMessage
    });
  } catch (error) {
    console.error('Error sending file message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send file message'
    });
  }
});

module.exports = router;
