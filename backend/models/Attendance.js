const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  // Course and student information
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: false // Made optional to support subjects
  },
  // For subjects (when course is not available)
  subject: {
    type: String,
    trim: true
  },
  courseId: {
    type: String, // Store mock course ID for reference
    trim: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  
  // Attendance details
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'excused'],
    required: true,
    default: 'present'
  },
  
  // Session information
  sessionTitle: {
    type: String,
    trim: true,
    maxlength: [200, 'Session title cannot exceed 200 characters']
  },
  sessionDescription: {
    type: String,
    trim: true,
    maxlength: [500, 'Session description cannot exceed 500 characters']
  },
  
  // Time tracking
  checkInTime: {
    type: Date,
    default: Date.now
  },
  checkOutTime: {
    type: Date
  },
  duration: {
    type: Number, // in minutes
    default: 0
  },
  
  // Notes and comments
  teacherNotes: {
    type: String,
    trim: true,
    maxlength: [500, 'Teacher notes cannot exceed 500 characters']
  },
  studentNotes: {
    type: String,
    trim: true,
    maxlength: [500, 'Student notes cannot exceed 500 characters']
  },
  
  // Attendance verification
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher'
  },
  verifiedAt: {
    type: Date
  },
  
  // Metadata
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Validation to ensure either course or subject is provided
attendanceSchema.pre('validate', function(next) {
  if (!this.course && !this.subject) {
    return next(new Error('Either course or subject must be provided'));
  }
  next();
});

// Indexes for better query performance
attendanceSchema.index({ course: 1, student: 1, date: 1 });
attendanceSchema.index({ teacher: 1, date: 1 });
attendanceSchema.index({ student: 1, date: 1 });
attendanceSchema.index({ status: 1, date: 1 });
attendanceSchema.index({ course: 1, date: 1 });

// Compound index to prevent duplicate attendance records
attendanceSchema.index({ course: 1, student: 1, date: 1 }, { unique: true });

// Virtual for formatted date
attendanceSchema.virtual('formattedDate').get(function() {
  return this.date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Virtual for attendance status color
attendanceSchema.virtual('statusColor').get(function() {
  const colors = {
    present: 'green',
    absent: 'red',
    late: 'orange',
    excused: 'blue'
  };
  return colors[this.status] || 'gray';
});

// Virtual for duration in hours and minutes
attendanceSchema.virtual('formattedDuration').get(function() {
  if (!this.duration) return '0 min';
  
  const hours = Math.floor(this.duration / 60);
  const minutes = this.duration % 60;
  
  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  return `${minutes}m`;
});

// Instance method to check out student
attendanceSchema.methods.checkOut = function() {
  this.checkOutTime = new Date();
  if (this.checkInTime) {
    this.duration = Math.floor((this.checkOutTime - this.checkInTime) / (1000 * 60)); // Convert to minutes
  }
  return this.save();
};

// Instance method to update status
attendanceSchema.methods.updateStatus = function(newStatus, notes = '') {
  this.status = newStatus;
  if (notes) {
    this.teacherNotes = notes;
  }
  return this.save();
};

// Static method to get attendance for a course
attendanceSchema.statics.getCourseAttendance = function(courseId, options = {}) {
  const query = { course: courseId };
  
  if (options.startDate && options.endDate) {
    query.date = {
      $gte: new Date(options.startDate),
      $lte: new Date(options.endDate)
    };
  }
  
  if (options.status) {
    query.status = options.status;
  }
  
  return this.find(query)
    .populate('student', 'name email')
    .populate('teacher', 'name email')
    .sort({ date: -1 });
};

// Static method to get student attendance
attendanceSchema.statics.getStudentAttendance = function(studentId, courseId = null) {
  const query = { student: studentId };
  
  if (courseId) {
    query.course = courseId;
  }
  
  return this.find(query)
    .populate('course', 'title')
    .populate('teacher', 'name')
    .sort({ date: -1 });
};

// Static method to get attendance statistics
attendanceSchema.statics.getAttendanceStats = function(courseId, studentId = null) {
  const matchQuery = { course: courseId };
  
  if (studentId) {
    matchQuery.student = studentId;
  }
  
  return this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

// Static method to get attendance summary for a course
attendanceSchema.statics.getCourseAttendanceSummary = async function(courseId, startDate, endDate) {
  const query = { course: courseId };
  
  if (startDate && endDate) {
    query.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  // Get all attendance records for the course
  const attendanceRecords = await this.find(query)
    .populate('student', 'name email')
    .sort({ date: -1 });
  
  // Get unique students
  const students = [...new Set(attendanceRecords.map(record => record.student._id.toString()))];
  
  // Calculate statistics for each student
  const studentStats = students.map(studentId => {
    const studentRecords = attendanceRecords.filter(record => 
      record.student._id.toString() === studentId
    );
    
    const totalDays = studentRecords.length;
    const presentDays = studentRecords.filter(record => record.status === 'present').length;
    const absentDays = studentRecords.filter(record => record.status === 'absent').length;
    const lateDays = studentRecords.filter(record => record.status === 'late').length;
    const excusedDays = studentRecords.filter(record => record.status === 'excused').length;
    
    const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
    
    return {
      student: studentRecords[0].student,
      totalDays,
      presentDays,
      absentDays,
      lateDays,
      excusedDays,
      attendancePercentage
    };
  });
  
  return {
    totalStudents: students.length,
    totalDays: attendanceRecords.length,
    studentStats: studentStats.sort((a, b) => b.attendancePercentage - a.attendancePercentage)
  };
};

// Pre-save middleware to set verification
attendanceSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status !== 'present') {
    this.verifiedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Attendance', attendanceSchema);
