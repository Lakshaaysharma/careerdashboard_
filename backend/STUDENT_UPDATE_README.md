# Student Model Update: Name and Email Fields

## Overview
This update adds `name` and `email` fields directly to the Student model in MongoDB, in addition to the existing reference to the User model. This provides faster access to student information without requiring joins/population.

## Changes Made

### 1. Student Model Schema Updates
- Added `name` field (String, required, 2-50 characters)
- Added `email` field (String, required, validated email format)
- Added database indexes for `name` and `email` fields

### 2. Updated Methods
- **`findOrCreateStudent`**: Now populates name and email from User model
- **`getGlobalRankings`**: No longer requires User population
- **`syncWithUser`**: New method to sync student data with user updates

### 3. Route Updates
- **Dashboard route**: Uses student name/email directly
- **Leaderboard route**: Uses student name/email directly
- **Profile route**: Returns student name/email
- **New PUT /profile route**: Allows updating student profile information

## Database Migration

### Option 1: Run the Migration Script
```bash
cd backend
node update-student-names-emails.js
```

### Option 2: Manual Update
The system will automatically populate name and email when:
- A new student is created
- An existing student accesses their dashboard
- The `findOrCreateStudent` method is called

## Benefits

1. **Performance**: Faster queries without User model joins
2. **Redundancy**: Student data is self-contained
3. **Consistency**: Automatic sync with User model
4. **Flexibility**: Can update student info independently

## API Endpoints

### GET /api/students/dashboard
Now returns student name and email directly from Student model.

### GET /api/students/profile
Returns student profile including name and email.

### PUT /api/students/profile
New endpoint to update student profile information:
```json
{
  "name": "New Name",
  "email": "newemail@example.com",
  "hierarchyData": {
    "instituteName": "University Name",
    "className": "Class Name",
    "section": "Section",
    "batchYear": "2024"
  }
}
```

### GET /api/students/leaderboard
Returns leaderboard with student names directly from Student model.

## Testing

Run the test script to verify functionality:
```bash
cd backend
node test-student-fields.js
```

## Notes

- Name and email are automatically synced with User model
- Existing students will be updated when they next access the system
- The User model reference (`userId`) is still maintained for authentication
- All existing functionality remains intact

## Schema Changes Summary

```javascript
// Before
const studentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  // ... other fields
});

// After
const studentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
  email: { type: String, required: true, lowercase: true, trim: true, match: [emailRegex] },
  // ... other fields
});
```
