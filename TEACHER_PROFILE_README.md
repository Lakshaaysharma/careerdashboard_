# Teacher Profile System - Complete Documentation

## 🎯 Overview

The Teacher Profile System allows teachers to store comprehensive hierarchy information in MongoDB, including institute details, subjects, courses, and more. This system provides a complete solution for managing teacher profiles with full CRUD operations.

## ✨ Features

### ✅ Complete Hierarchy Information Storage
- **Institute Selection** with "Other" option for custom names
- **Class/Year Selection** (Class X, B.Tech, M.Tech, PhD, etc.)
- **Subject Selection** with "Other" option for custom subjects
- **Section Selection** (A, B, C, D, etc.)
- **Course Management** with levels and descriptions
- **Batch Year Selection** (2020-21 to 2029-30)

### 🔧 Backend Features
- **MongoDB Integration** with Mongoose schemas
- **RESTful API** endpoints for all operations
- **Authentication & Authorization** with role-based access
- **Data Validation** and error handling
- **Profile Completion Tracking** with statistics

### 🎨 Frontend Features
- **Multi-step Form** with progress indicators
- **Responsive Design** with dark theme
- **Real-time Validation** and error display
- **Custom Input Support** for institute and subjects
- **Course Management Interface** with add/edit/remove

## 🏗️ Architecture

### Backend Structure
```
backend/
├── models/
│   └── TeacherProfile.js          # MongoDB schema and methods
├── routes/
│   └── teacher-profiles.js        # API endpoints
└── server.js                      # Route registration
```

### Frontend Structure
```
components/ui/
└── teacher-hierarchy-form.tsx     # Main form component

services/
└── teacherProfileService.ts       # API service layer

app/teacher-setup/
└── page.tsx                       # Demo implementation
```

## 🚀 API Endpoints

### Base URL
```
http://localhost:5000/api/teacher-profiles
```

### Available Endpoints

#### 1. Get Teacher Profile
```http
GET /api/teacher-profiles/profile
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "profile": {
      "instituteName": "IIT Delhi",
      "className": "B.Tech 3rd Year",
      "subjects": ["Web Development", "Data Science"],
      "section": "A",
      "courses": [...],
      "batchYear": "2024-25",
      "isProfileComplete": true
    },
    "stats": {
      "totalSubjects": 2,
      "totalCourses": 3,
      "activeCourses": 3,
      "profileCompletion": 100
    }
  }
}
```

#### 2. Update Complete Profile
```http
PUT /api/teacher-profiles/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "instituteName": "IIT Delhi",
  "className": "B.Tech 3rd Year",
  "subjects": ["Web Development", "Data Science"],
  "section": "A",
  "courses": [
    {
      "name": "Introduction to Web Development",
      "description": "Learn web development basics",
      "level": "Beginner"
    }
  ],
  "batchYear": "2024-25"
}
```

#### 3. Update Specific Field
```http
PATCH /api/teacher-profiles/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "instituteName": "IIT Bombay"
}
```

#### 4. Add Course
```http
POST /api/teacher-profiles/courses
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Advanced Machine Learning",
  "description": "Deep dive into ML concepts",
  "level": "Advanced"
}
```

#### 5. Update Course
```http
PUT /api/teacher-profiles/courses/:courseId
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Course Name",
  "description": "Updated description",
  "level": "Intermediate"
}
```

#### 6. Remove Course
```http
DELETE /api/teacher-profiles/courses/:courseId
Authorization: Bearer <token>
```

## 📊 Database Schema

### TeacherProfile Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,                    // Reference to User
  instituteName: String,               // Institute/University name
  className: String,                   // Class/Year (e.g., "B.Tech 3rd Year")
  subjects: [String],                  // Array of subject names
  section: String,                     // Section (e.g., "A", "B")
  courses: [{                          // Array of course objects
    _id: ObjectId,
    name: String,                      // Course name
    description: String,               // Course description
    level: String,                     // Beginner/Intermediate/Advanced/Expert
    isActive: Boolean,                 // Course status
    createdAt: Date                    // Creation timestamp
  }],
  batchYear: String,                   // Batch year (e.g., "2024-25")
  isProfileComplete: Boolean,          // Profile completion status
  profileCompletedAt: Date,            // Completion timestamp
  createdAt: Date,                     // Document creation time
  updatedAt: Date                      // Last update time
}
```

## 🛠️ Usage Examples

### 1. Basic Form Integration
```tsx
import { TeacherHierarchyForm } from "@/components/ui/teacher-hierarchy-form"
import { teacherProfileService } from "@/services/teacherProfileService"

export default function TeacherSetup() {
  const handleSaveToDatabase = async (data) => {
    try {
      const result = await teacherProfileService.saveCompleteProfile(data)
      if (result.success) {
        console.log('Profile saved successfully!')
      }
    } catch (error) {
      console.error('Error saving profile:', error)
    }
  }

  return (
    <TeacherHierarchyForm
      onComplete={(data) => console.log('Form completed:', data)}
      onBack={() => console.log('Going back')}
      onSaveToDatabase={handleSaveToDatabase}
    />
  )
}
```

### 2. Fetching Teacher Profile
```tsx
import { teacherProfileService } from "@/services/teacherProfileService"

const fetchProfile = async () => {
  try {
    const response = await teacherProfileService.getProfile()
    if (response.success) {
      const { profile, stats } = response.data
      console.log('Profile:', profile)
      console.log('Stats:', stats)
    }
  } catch (error) {
    console.error('Error fetching profile:', error)
  }
}
```

### 3. Adding a Course
```tsx
const addCourse = async () => {
  try {
    const result = await teacherProfileService.addCourse({
      name: "New Course",
      description: "Course description",
      level: "Beginner"
    })
    if (result.success) {
      console.log('Course added:', result.data.course)
    }
  } catch (error) {
    console.error('Error adding course:', error)
  }
}
```

## 🔒 Security & Authentication

### Role-Based Access Control
- **Teachers**: Can access and modify their own profiles
- **Admins**: Can view all teacher profiles
- **Students/Others**: No access to teacher profiles

### Authentication Requirements
- All endpoints require valid JWT token
- Token must be included in Authorization header
- User role must be 'teacher' for profile operations

## 📈 Profile Completion Tracking

### Completion Criteria
Profile is marked as complete when all required fields are filled:
- ✅ Institute Name
- ✅ Class Name  
- ✅ At least one Subject
- ✅ Section
- ✅ At least one Course
- ✅ Batch Year

### Statistics Calculation
```javascript
{
  totalSubjects: 3,           // Number of subjects
  totalCourses: 5,            // Total courses
  activeCourses: 4,           // Active courses
  profileCompletion: 100      // Completion percentage
}
```

## 🧪 Testing

### Backend Testing
```bash
cd backend
node test-teacher-profile.js
```

This will test:
- Profile creation and updates
- Course management operations
- Data validation
- Profile completion calculation
- Database queries

### Frontend Testing
Navigate to `/teacher-setup` to test the complete form flow.

## 🚨 Error Handling

### Common Error Responses
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

### Error Types
- **400**: Validation errors (missing fields, invalid data)
- **401**: Unauthorized (missing/invalid token)
- **403**: Forbidden (insufficient role permissions)
- **404**: Resource not found
- **500**: Internal server error

## 🔧 Configuration

### Environment Variables
```env
MONGODB_URI=mongodb://localhost:27017/career-dashboard
JWT_SECRET=your-jwt-secret
PORT=5000
```

### Database Indexes
```javascript
// Automatic indexes for performance
{ instituteName: 1 }        // Institute name queries
{ subjects: 1 }             // Subject-based searches
{ userId: 1 }               // User profile lookups (unique)
```

## 📝 Best Practices

### Data Validation
- Always validate input data on both frontend and backend
- Use proper error handling for database operations
- Implement rate limiting for API endpoints

### Performance
- Use database indexes for frequently queried fields
- Implement pagination for large result sets
- Cache frequently accessed profile data

### Security
- Validate user permissions before operations
- Sanitize input data to prevent injection attacks
- Use HTTPS in production environments

## 🎯 Future Enhancements

### Planned Features
- **Profile Templates**: Pre-defined profile structures
- **Bulk Operations**: Import/export multiple profiles
- **Advanced Search**: Filter by multiple criteria
- **Profile Analytics**: Detailed statistics and insights
- **Integration**: Connect with other system modules

### API Improvements
- **GraphQL Support**: More flexible data queries
- **Real-time Updates**: WebSocket integration
- **File Uploads**: Profile picture and document support
- **Versioning**: Profile change history tracking

## 🤝 Contributing

### Development Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Start backend: `npm run dev` (in backend directory)
5. Start frontend: `npm run dev` (in root directory)

### Code Standards
- Follow existing code style and patterns
- Add proper error handling and validation
- Include comprehensive testing
- Update documentation for new features

## 📞 Support

For questions or issues:
1. Check the existing documentation
2. Review error logs and console output
3. Test with the provided test scripts
4. Create detailed issue reports with reproduction steps

---

**Last Updated**: December 2024
**Version**: 1.0.0
**Status**: Production Ready ✅
