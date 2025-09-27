"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { 
  Send, 
  Search, 
  MoreVertical, 
  Phone, 
  Video, 
  UserPlus,
  MessageCircle,
  Users,
  Settings,
  ArrowLeft,
  X,
  Plus,
  FileText,
  Download
} from "lucide-react"
import { io, Socket } from 'socket.io-client'
import { apiCall, config } from '@/lib/config'

interface Message {
  _id?: string
  id?: string
  text?: string
  sender: string
  senderName?: string
  senderAvatar?: string
  timestamp?: Date
  createdAt?: Date
  isRead: boolean
  messageType?: 'text' | 'image' | 'file' | 'system'
  file?: {
    filename: string
    originalName: string
    mimeType: string
    size: number
    path: string
    url: string
  }
}

interface ChatUser {
  id: string
  name: string
  avatar: string
  status: 'online' | 'offline' | 'away'
  lastSeen?: string
  unreadCount: number
  lastMessage?: string
  isGroupChat?: boolean
  participants?: any[]
}

interface User {
  _id: string
  name: string
  email: string
  avatar?: string
  role: string
}

interface ChatDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ChatDialog({ open, onOpenChange }: ChatDialogProps) {
  const [selectedChat, setSelectedChat] = useState<ChatUser | null>(null)
  const [message, setMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [chats, setChats] = useState<ChatUser[]>([])
  const [users, setUsers] = useState<{
    students: User[];
    teachers: User[];
    all: User[];
  }>({ students: [], teachers: [], all: [] })
  const [loading, setLoading] = useState(false)
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadingFile, setUploadingFile] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Get current user ID from localStorage (you should implement proper auth)
  const getCurrentUserId = () => {
    if (typeof window !== 'undefined') {
      // Try to get userId directly first
      let userId = localStorage.getItem('userId')
      
      // If not found, try to get it from the user object
      if (!userId) {
        const userStr = localStorage.getItem('user')
        if (userStr) {
          try {
            const user = JSON.parse(userStr)
            userId = user._id || user.id
            console.log('Got user ID from user object:', userId)
          } catch (e) {
            console.error('Error parsing user object:', e)
          }
        }
      }
      
      // If still no userId, try to get it from the token
      if (!userId) {
        const token = localStorage.getItem('token')
        if (token) {
          try {
            // Decode JWT token to get user ID
            const payload = JSON.parse(atob(token.split('.')[1]))
            userId = payload.id || payload.userId || payload._id
            console.log('Got user ID from token:', userId)
          } catch (e) {
            console.error('Error decoding token:', e)
          }
        }
      }
      
      // Ensure we return a string and log it
      const finalUserId = userId?.toString() || 'current-user-id'
      console.log('Final current user ID:', finalUserId)
      return finalUserId
    }
    return 'current-user-id'
  }

  // Fetch chats from backend
  const fetchChats = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      console.log('Auth token:', token ? 'Present' : 'Missing')
      if (!token) {
        console.error('No auth token found')
        return
      }

      const response = await apiCall('/api/chats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Chats response:', data)
        setChats(data.data || [])
      } else {
        console.error('Failed to fetch chats:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error fetching chats:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch users list (students and teachers)
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      console.log('Fetching users from API...')
      const response = await apiCall('/api/chats/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('Users API response status:', response.status)
      if (response.ok) {
        const data = await response.json()
        console.log('Users API response data:', data)
        console.log('Setting users:', data.data)
        setUsers(data.data || { students: [], teachers: [], all: [] })
      } else {
        console.error('Failed to fetch users:', response.status, response.statusText)
        const errorText = await response.text()
        console.error('Error response:', errorText)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  // Fetch messages for a chat
  const fetchMessages = async (chatId: string) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      console.log('Fetching messages for chat:', chatId)

      const response = await apiCall(`/api/messages/${chatId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Messages response:', data)
        console.log('Individual messages:', data.data)
        // Log each message's sender info
        if (data.data && Array.isArray(data.data)) {
          data.data.forEach((msg: any, index: number) => {
            console.log(`Message ${index}:`, {
              id: msg.id || msg._id,
              text: msg.text,
              sender: msg.sender,
              senderType: typeof msg.sender,
              timestamp: msg.timestamp || msg.createdAt
            })
          })
        }
        console.log('Setting messages:', data.data);
        setMessages(data.data || [])
        
        // Join chat room for real-time updates
        if (socket) {
          socket.emit('join-chat', chatId);
        }
      } else {
        console.error('Failed to fetch messages:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  // Handle chat selection
  const handleChatSelect = (chat: ChatUser) => {
    setSelectedChat(chat);
    fetchMessages(chat.id);
  };

  // Create new chat
  const createChat = async (participantId: string, chatType: 'student' | 'student-teacher' = 'student') => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await apiCall('/api/chats', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ participantId, chatType })
      })

      if (response.ok) {
        const data = await response.json()
        console.log('New chat created, response data:', data.data)
        console.log('New chat ID:', data.data.id)
        
        // Add new chat to list
        setChats(prev => [data.data, ...prev])
        // Select the new chat
        setSelectedChat({
          id: data.data.id,
          name: data.data.participants.find((p: any) => p._id !== getCurrentUserId())?.name || 'Unknown',
          avatar: data.data.participants.find((p: any) => p._id !== getCurrentUserId())?.avatar || '/placeholder.svg',
          status: 'online',
          unreadCount: 0
        })
        
        console.log('Selected chat set to:', {
          id: data.data.id,
          name: data.data.participants.find((p: any) => p._id !== getCurrentUserId())?.name || 'Unknown'
        })
      }
    } catch (error) {
      console.error('Error creating chat:', error)
    }
  }

  // Filter chats and users
  const filteredChats = chats.filter(chat =>
    chat?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false
  )

  const filteredUsers = users.all.filter(user =>
    user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false
  )

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Initialize socket connection
  useEffect(() => {
    if (open) {
      const newSocket = io(config.socketUrl);
      setSocket(newSocket);

      // Join with user ID
      const userId = getCurrentUserId();
      if (userId) {
        newSocket.emit('join', userId);
      }

      // Listen for new messages
      newSocket.on('new-message', (data) => {
        if (data.chatId === selectedChat?.id) {
          // Don't add messages sent by the current user (they're already in local state)
          const currentUserId = getCurrentUserId();
          if (data.sender !== currentUserId) {
            setMessages(prev => [...prev, data]);
          }
        }
      });

      // Listen for typing indicators
      newSocket.on('user-typing', (data) => {
        if (data.chatId === selectedChat?.id) {
          if (data.isTyping) {
            setTypingUsers(prev => [...prev, data.userId]);
          } else {
            setTypingUsers(prev => prev.filter(id => id !== data.userId));
          }
        }
      });

      return () => {
        newSocket.close();
      };
    }
  }, [open, selectedChat?.id]);

  // Fetch data when component opens
  useEffect(() => {
    if (open) {
      console.log('Chat dialog opened, current user ID:', getCurrentUserId());
      fetchChats();
      fetchUsers();
    }
  }, [open]);

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedChat) return

    try {
      const token = localStorage.getItem('token')
      if (!token) return

      console.log('Sending message with selectedChat:', selectedChat)
      console.log('Chat ID being sent:', selectedChat.id)

      const response = await apiCall('/api/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chatId: selectedChat.id,
          text: message.trim()
        })
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Message sent response:', data)
        // Add message to local state
        const newMessage = {
          ...data.data,
          id: data.data._id || data.data.id, // Ensure we have an id field
          timestamp: data.data.createdAt || data.data.timestamp // Ensure we have a timestamp field
        }
        setMessages(prev => [...prev, newMessage])
        setMessage("")
        
        // Emit to socket for real-time broadcasting (don't save to DB again)
        if (socket) {
          socket.emit('send-message', {
            chatId: selectedChat.id,
            message: { text: message.trim() },
            senderId: getCurrentUserId(),
            messageId: newMessage.id, // Send the message ID for broadcasting
            messageType: 'text'
          })
        }
      } else {
        console.error('Failed to send message:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleTyping = () => {
    if (socket && selectedChat) {
      socket.emit('typing', {
        chatId: selectedChat.id,
        userId: getCurrentUserId(),
        isTyping: true
      });
      
      // Stop typing after 2 seconds
      setTimeout(() => {
        if (socket && selectedChat) {
          socket.emit('typing', {
            chatId: selectedChat.id,
            userId: getCurrentUserId(),
            isTyping: false
          });
        }
      }, 2000);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online": return "bg-green-500"
      case "away": return "bg-yellow-500"
      case "offline": return "bg-gray-500"
      default: return "bg-gray-500"
    }
  }

  const formatTime = (date: Date | undefined | null) => {
    if (!date || !(date instanceof Date)) {
      return '--:--'
    }
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Helper function to check if message is from current user
  const isMyMessage = (message: Message) => {
    const currentUserId = getCurrentUserId()
    
    // Get message sender ID - ensure it's a string
    let messageSenderId: string = ''
    
    if (typeof message.sender === 'string') {
      messageSenderId = message.sender
    } else if (message.sender && typeof message.sender === 'object' && '_id' in message.sender) {
      messageSenderId = (message.sender as any)._id.toString()
    }
    
    // Convert both to strings and compare
    const currentUserIdStr = currentUserId.toString()
    const messageSenderIdStr = messageSenderId.toString()
    
    const isMine = currentUserIdStr === messageSenderIdStr
    
    console.log('Message sender check:', { 
      messageSenderId, 
      messageSenderIdStr,
      currentUserId, 
      currentUserIdStr, 
      isMine,
      messageText: message.text
    })
    
    return isMine
  }

  // Helper function to get sender name
  const getSenderName = (message: Message) => {
    if (isMyMessage(message)) {
      return 'You'
    }
    
    // Try to get sender name from different possible sources
    if (message.senderName) {
      return message.senderName
    }
    
    // If sender is an object with name property
    if (message.sender && typeof message.sender === 'object' && 'name' in message.sender) {
      return (message.sender as any).name
    }
    
    // Try to find sender in selected chat participants
    if (selectedChat?.participants) {
      const senderId = typeof message.sender === 'string' ? message.sender : 
                      (message.sender && typeof message.sender === 'object' && '_id' in message.sender) ? 
                      (message.sender as any)._id : null
      
      if (senderId) {
        const participant = selectedChat.participants.find((p: any) => 
          p._id === senderId || p.id === senderId
        )
        if (participant?.name) {
          return participant.name
        }
      }
    }
    
    // Fallback to email if available
    if (message.sender && typeof message.sender === 'object' && 'email' in message.sender) {
      return (message.sender as any).email.split('@')[0] // Just the username part
    }
    
    return 'Unknown User'
  }

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      alert('File type not allowed. Only images (JPEG, PNG, GIF) and PDFs are supported.')
      return
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      alert('File too large. Maximum size is 10MB.')
      return
    }

    setSelectedFile(file)
    setUploadingFile(true)

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        alert('Authentication required')
        return
      }

      const formData = new FormData()
      formData.append('file', file)
      formData.append('chatId', selectedChat?.id || '')

      const response = await apiCall('/api/messages/file', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        console.log('File message sent response:', data)
        
        // Add message to local state
        const newMessage = {
          ...data.data,
          id: data.data._id || data.data.id,
          timestamp: data.data.createdAt || data.data.timestamp
        }
        setMessages(prev => [...prev, newMessage])
        
        // Emit to socket for real-time broadcasting
        if (socket) {
          socket.emit('send-message', {
            chatId: selectedChat?.id,
            message: { file: newMessage.file },
            senderId: getCurrentUserId(),
            messageId: newMessage.id,
            messageType: newMessage.messageType
          })
        }
        
        // Reset file state
        setSelectedFile(null)
        setUploadingFile(false)
        
        // Clear the file input
        const fileInput = document.getElementById('file-upload') as HTMLInputElement
        if (fileInput) fileInput.value = ''
        
      } else {
        const errorData = await response.json()
        alert(`Failed to send file: ${errorData.message || 'Unknown error'}`)
        setUploadingFile(false)
      }
    } catch (error) {
      console.error('Error sending file:', error)
      alert('Failed to send file. Please try again.')
      setUploadingFile(false)
    }
  }

  // If not open, don't render anything
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-gray-900 overflow-hidden">
      {/* Header */}
      <div className="h-12 sm:h-14 md:h-16 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-3 sm:px-4 md:px-6 shadow-lg">
        <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 flex-1 min-w-0">
          {selectedChat && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedChat(null)}
              className="text-gray-400 hover:text-white md:hidden flex-shrink-0 p-2"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          )}
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <MessageCircle className="w-5 h-5 md:w-6 md:h-6 text-blue-500 flex-shrink-0" />
            <h1 className="text-base sm:text-lg md:text-xl font-semibold text-white truncate">Chat</h1>
            <div className="hidden lg:block text-xs text-gray-400 ml-2 flex-shrink-0">
              User ID: {getCurrentUserId()}
            </div>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onOpenChange(false)}
          className="text-gray-400 hover:text-white flex-shrink-0 p-2"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>
      </div>
      
      <div className="flex h-[calc(100vh-3rem)] sm:h-[calc(100vh-3.5rem)] md:h-[calc(100vh-4rem)]">
        {/* Left Sidebar - Chat List */}
        <div className={`${
          selectedChat 
            ? 'hidden md:block md:w-80' 
            : 'block w-full md:w-80'
        } border-r border-gray-700 bg-gray-800 flex flex-col`}>
          {/* Search */}
          <div className="p-2 sm:p-3 md:p-4 border-b border-gray-700 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400 text-sm h-9 sm:h-10"
              />
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
               {loading ? (
                 <div className="p-4 text-center text-gray-400">
                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                   Loading chats...
                 </div>
               ) : filteredChats.length === 0 ? (
                 <div className="p-4 text-center text-gray-400">
                   <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                   <p>No chats yet</p>
                   <p className="text-sm text-gray-500">Start a conversation below</p>
                 </div>
               ) : (
            filteredChats.map((chat) => (
              <div
                key={chat?.id || `chat-${Math.random()}`}
                onClick={() => handleChatSelect(chat)}
                className={`p-2 sm:p-3 md:p-4 cursor-pointer hover:bg-gray-700 active:bg-gray-600 transition-colors touch-manipulation border-b border-gray-700/50 ${
                  selectedChat?.id === chat?.id ? 'bg-gray-700' : ''
                }`}
              >
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="relative flex-shrink-0">
                    <Avatar className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12">
                      <AvatarImage src={chat?.avatar || '/placeholder.svg'} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-xs sm:text-sm md:text-base">
                        {chat?.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 rounded-full border-2 border-gray-800 ${getStatusColor(chat?.status || 'offline')}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-white font-medium truncate text-sm sm:text-base">{chat?.name || 'Unknown User'}</h3>
                      {chat?.unreadCount > 0 && (
                        <Badge className="bg-blue-500 text-white text-xs px-1.5 py-0.5 min-w-[20px] h-5 flex items-center justify-center">
                          {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-400 text-xs sm:text-sm truncate leading-tight">
                      {chat?.lastMessage || 'No messages yet'}
                    </p>
                  </div>
                </div>
              </div>
               ))
               )}
               
          {/* Users List for New Chats */}
          <div className="border-t border-gray-700 pt-2 sm:pt-3 md:pt-4 flex-shrink-0">
            <div className="px-2 sm:px-3 md:px-4 pb-2">
              <h4 className="text-xs sm:text-sm font-medium text-gray-400 mb-2">
                Start New Chat ({(() => {
                  const availableStudents = users.students.filter(student => 
                    !chats.some(chat => 
                      chat.participants?.some((p: any) => p._id === student._id)
                    )
                  );
                  const availableTeachers = users.teachers.filter(teacher => 
                    !chats.some(chat => 
                      chat.participants?.some((p: any) => p._id === teacher._id)
                    )
                  );
                  return availableStudents.length + availableTeachers.length;
                })()})
              </h4>
            </div>
                
                {(() => {
                  // Filter out users who already have chats
                  const availableStudents = users.students.filter(student => 
                    !chats.some(chat => 
                      chat.participants?.some((p: any) => p._id === student._id)
                    )
                  );
                  const availableTeachers = users.teachers.filter(teacher => 
                    !chats.some(chat => 
                      chat.participants?.some((p: any) => p._id === teacher._id)
                    )
                  );
                  
                  const allAvailableUsers = [...availableStudents, ...availableTeachers];
                  
                  if (allAvailableUsers.length === 0) {
                    return (
                      <div className="p-4 text-center text-gray-400">
                        <p className="text-sm text-gray-500">All users already have chats</p>
                      </div>
                    );
                  }
                  
                  return allAvailableUsers.map((user) => (
                    <div
                      key={user._id}
                      onClick={() => createChat(user._id, user.role === 'student' ? 'student' : 'student-teacher')}
                      className="p-2 sm:p-3 md:p-4 cursor-pointer hover:bg-gray-700 active:bg-gray-600 transition-colors border-b border-gray-700/50 last:border-b-0 touch-manipulation"
                    >
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <Avatar className="w-9 h-9 sm:w-10 sm:h-10 md:w-10 md:h-10 flex-shrink-0">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback className={`text-xs sm:text-sm ${
                            user.role === 'student' 
                              ? 'bg-gradient-to-r from-green-500 to-blue-500' 
                              : 'bg-gradient-to-r from-purple-500 to-pink-500'
                          }`}>
                            {user.name?.split(' ').map((n: string) => n[0]).join('') || (user.role === 'student' ? 'S' : 'T')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-white font-medium truncate text-sm sm:text-base">{user.name}</h3>
                            <Badge className={`text-xs px-1.5 py-0.5 ${
                              user.role === 'student' 
                                ? 'bg-green-600 text-white' 
                                : 'bg-purple-600 text-white'
                            }`}>
                              {user.role === 'student' ? 'S' : 'T'}
                            </Badge>
                          </div>
                          <p className="text-gray-400 text-xs sm:text-sm truncate leading-tight">{user.email}</p>
                        </div>
                        <Plus className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      </div>
                    </div>
                  ));
                })()}
               </div>
            </div>
        </div>

        {/* Right Side - Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="p-2 sm:p-3 md:p-4 border-b border-gray-700 bg-gray-800 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                    <Avatar className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 flex-shrink-0">
                      <AvatarImage src={selectedChat.avatar} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-xs sm:text-sm md:text-base">
                        {selectedChat.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-white font-medium text-sm sm:text-base truncate">{selectedChat.name}</h3>
                      <p className="text-gray-400 text-xs sm:text-sm truncate">
                        {selectedChat.status === "online" ? "Online" : 
                         selectedChat.status === "away" ? "Away" : 
                         selectedChat.lastSeen ? `Last seen ${selectedChat.lastSeen}` : "Offline"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hidden sm:flex p-2">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hidden sm:flex p-2">
                      <Video className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2">
                      <UserPlus className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-2 sm:p-3 md:p-4 space-y-2 sm:space-y-3 md:space-y-4 bg-gray-900">
                                     {loading ? (
                     <div className="flex items-center justify-center h-full">
                       <div className="text-gray-400">Loading messages...</div>
                     </div>
                   ) : messages.length === 0 ? (
                     <div className="flex items-center justify-center h-full">
                       <div className="text-center text-gray-400">
                         <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-600" />
                         <p>No messages yet</p>
                         <p className="text-sm text-gray-500">Start the conversation!</p>
                       </div>
                     </div>
                   ) : (
                     <>
                       {messages.map((msg: Message) => {
                         console.log('Rendering message:', msg);
                         console.log('Message type:', msg?.messageType);
                         console.log('Message file:', msg?.file);
                         const isMine = isMyMessage(msg);
                         console.log('Is my message:', isMine);
                         
                         return msg && (msg.id || msg._id) ? (
                           <div
                             key={msg.id || msg._id}
                             className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                           >
                             <div className={`max-w-[90%] sm:max-w-[80%] md:max-w-xs lg:max-w-md px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-2 rounded-lg ${
                               isMine
                                 ? 'bg-blue-600 text-white' 
                                 : 'bg-gray-700 text-white'
                             }`}>
                               {/* Sender indicator */}
                               <div className={`text-xs mb-1 ${
                                 isMine ? 'text-blue-200 text-right' : 'text-gray-400 text-left'
                               }`}>
                                 {!isMine && getSenderName(msg)}
                               </div>
                               
                               {/* Message content based on type */}
                               {msg?.messageType === 'image' ? (
                                 <div className="space-y-2">
                                   <img 
                                     src={`${config.apiUrl}${msg.file?.url}`} 
                                     alt="Shared image"
                                     className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                     onClick={() => window.open(`${config.apiUrl}${msg.file?.url}`, '_blank')}
                                   />
                                   <p className="text-xs text-gray-300">{msg.file?.originalName}</p>
                                 </div>
                               ) : msg?.messageType === 'file' ? (
                                 <div className="space-y-2">
                                   <div className="flex items-center space-x-2 p-2 bg-gray-600 rounded-lg">
                                     <FileText className="w-5 h-5 text-blue-400" />
                                     <div className="flex-1 min-w-0">
                                       <p className="text-sm font-medium truncate">{msg.file?.originalName}</p>
                                       <p className="text-xs text-gray-300">
                                         {(msg.file?.size || 0) / 1024 / 1024 < 1 
                                           ? `${Math.round((msg.file?.size || 0) / 1024)} KB`
                                           : `${Math.round((msg.file?.size || 0) / 1024 / 1024 * 10) / 10} MB`
                                         }
                                       </p>
                                     </div>
                                     <Button
                                       size="sm"
                                       variant="ghost"
                                       onClick={() => window.open(`${config.apiUrl}${msg.file?.url}`, '_blank')}
                                       className="text-blue-400 hover:text-blue-300"
                                     >
                                       <Download className="w-4 h4" />
                                     </Button>
                                   </div>
                                 </div>
                               ) : (
                                 <p className="text-sm sm:text-base break-words leading-relaxed">{msg?.text || 'Empty message'}</p>
                               )}
                               <p className={`text-xs mt-1 ${
                                 isMine ? 'text-blue-200' : 'text-gray-400'
                               }`}>
                                 {formatTime(msg?.timestamp || msg?.createdAt)}
                                 {isMine && (
                                   <span className="ml-2">
                                     {msg?.isRead ? '✓✓' : '✓'}
                                   </span>
                                 )}
                               </p>
                             </div>
                           </div>
                         ) : null;
                       })}
                   <div ref={messagesEndRef} />
                   
                   {/* Typing Indicator */}
                   {typingUsers.length > 0 && (
                     <div className="flex justify-start">
                       <div className="bg-gray-700 text-white px-4 py-2 rounded-lg">
                         <p className="text-sm text-gray-300">Someone is typing...</p>
                       </div>
                     </div>
                   )}
                   
                   </>
                 )}
                 </div>

              {/* Message Input */}
              <div className="p-2 sm:p-3 md:p-4 border-t border-gray-700 bg-gray-800 flex-shrink-0">
                <div className="flex space-x-2">
                  {/* File Upload Button */}
                  <div className="relative flex-shrink-0">
                    <input
                      type="file"
                      id="file-upload"
                      accept="image/*,.pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => document.getElementById('file-upload')?.click()}
                      className="text-gray-400 hover:text-white bg-gray-700 hover:bg-gray-600 touch-manipulation p-2 h-9 sm:h-10"
                      title="Attach file (Images & PDFs)"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <Input
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value)
                      handleTyping()
                    }}
                    onKeyPress={handleKeyPress}
                    className="flex-1 bg-gray-700 border-gray-600 text-white placeholder-gray-400 text-sm h-9 sm:h-10"
                  />
                  
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    className="bg-blue-600 hover:bg-blue-700 flex-shrink-0 touch-manipulation p-2 h-9 sm:h-10"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* File Upload Progress */}
                {uploadingFile && (
                  <div className="mt-2 text-sm text-gray-400">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                      <span>Uploading {selectedFile?.name}...</span>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* No Chat Selected */
            <div className="flex-1 flex items-center justify-center bg-gray-900 p-4">
              <div className="text-center text-gray-400 max-w-xs sm:max-w-sm">
                <MessageCircle className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto mb-3 sm:mb-4 text-gray-600" />
                <h3 className="text-base sm:text-lg md:text-xl font-medium mb-2">Select a chat to start messaging</h3>
                <p className="text-gray-500 text-xs sm:text-sm md:text-base leading-relaxed">Choose from your contacts on the left</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
