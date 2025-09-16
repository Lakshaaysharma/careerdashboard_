const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  chatType: {
    type: String,
    enum: ['student', 'student-teacher', 'teacher-student', 'teacher-teacher', 'group', 'support'],
    default: 'student'
  },
  lastMessage: {
    text: String,
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  unreadCounts: {
    type: Map,
    of: Number,
    default: new Map()
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient querying
chatSchema.index({ participants: 1 });
chatSchema.index({ 'lastMessage.timestamp': -1 });

// Method to get chat name for a specific user
chatSchema.methods.getChatName = function(userId) {
  if (this.chatType === 'group') {
    return this.name || 'Group Chat';
  }
  
  const otherParticipant = this.participants.find(p => p.toString() !== userId.toString());
  return otherParticipant ? 'Other User' : 'Unknown User';
};

// Method to mark messages as read for a user
chatSchema.methods.markAsRead = function(userId) {
  this.unreadCounts.set(userId.toString(), 0);
  return this.save();
};

// Method to increment unread count for a user
chatSchema.methods.incrementUnread = function(userId) {
  const currentCount = this.unreadCounts.get(userId.toString()) || 0;
  this.unreadCounts.set(userId.toString(), currentCount + 1);
  return this.save();
};

module.exports = mongoose.model('Chat', chatSchema);
