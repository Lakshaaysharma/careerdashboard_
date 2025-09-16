# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for your Career Dashboard application.

## Prerequisites

1. A Google account
2. Access to Google Cloud Console

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API (if not already enabled)

## Step 2: Configure OAuth Consent Screen

1. In the Google Cloud Console, go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type (unless you have a Google Workspace)
3. Fill in the required information:
   - App name: "Career Dashboard"
   - User support email: Your email
   - Developer contact information: Your email
4. Add scopes:
   - `openid`
   - `email`
   - `profile`
5. Add test users (your email addresses for testing)

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Set the following:
   - Name: "Career Dashboard Web Client"
   - Authorized JavaScript origins:
     - `http://localhost:3000` (for development)
     - `https://yourdomain.com` (for production)
   - Authorized redirect URIs:
     - `http://localhost:3000` (for development)
     - `https://yourdomain.com` (for production)
5. Click "Create"
6. Copy the Client ID and Client Secret

## Step 4: Configure Environment Variables

### Backend Configuration

Update your `backend/config.env` file:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

### Frontend Configuration

1. Copy the example environment file:
   ```bash
   cp env.example .env.local
   ```

2. Edit `.env.local` and add your Google Client ID:
   ```env
   # Google OAuth Configuration
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id-here
   ```

**Important**: Only use the Client ID in the frontend, never the Client Secret!

## Step 5: Install Dependencies

### Backend Dependencies

The following packages have been added to `backend/package.json`:

```json
{
  "google-auth-library": "^9.0.0",
  "passport": "^0.7.0",
  "passport-google-oauth20": "^2.0.0"
}
```

Install them by running:

```bash
cd backend
npm install
```

## Step 6: Test the Implementation

1. Start your backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Start your frontend development server:
   ```bash
   npm run dev
   ```

3. Navigate to the login or signup page
4. You should see the Google OAuth option at the top
5. Select your role and click "Continue with Google"
6. Complete the Google OAuth flow

## Features Implemented

### Backend Features

1. **Google OAuth Route**: `POST /api/auth/google`
2. **Token Verification**: Verifies Google ID tokens server-side
3. **User Management**: 
   - Creates new users from Google profiles
   - Links existing accounts to Google
   - Updates user roles
4. **Enhanced User Model**: 
   - Added Google-specific fields
   - Support for both local and Google authentication
   - Automatic profile picture import

### Frontend Features

1. **Google OAuth Component**: Reusable component for Google authentication
2. **Integration**: Added to both login and signup pages
3. **Role Selection**: Built into the Google OAuth component
4. **Error Handling**: Proper error messages for failed authentication
5. **Loading States**: Visual feedback during authentication process
6. **Immediate Visibility**: Google OAuth appears at the top of both forms

## How It Works

1. **User clicks "Continue with Google"**: The Google OAuth component loads the Google Identity Services script
2. **Role Selection**: User selects their role (User, Teacher, or Employer)
3. **Google Authentication**: Google handles the authentication flow
4. **Token Verification**: The frontend sends the Google ID token to your backend
5. **Backend Processing**: 
   - Verifies the token with Google
   - Creates or links user account
   - Returns JWT token and user data
6. **Redirect**: User is redirected to their appropriate dashboard

## Security Considerations

1. **Token Verification**: All Google tokens are verified server-side
2. **Environment Variables**: Sensitive data stored in environment files
3. **CORS Configuration**: Proper CORS settings for security
4. **Input Validation**: All requests are validated before processing
5. **Client Secret Protection**: Client secret only used on backend

## Troubleshooting

### Common Issues

1. **"Invalid Google token" error**:
   - Check that your Google Client ID is correct
   - Ensure the OAuth consent screen is properly configured
   - Verify that your domain is in the authorized origins

2. **"Google script not loading"**:
   - Check your internet connection
   - Ensure the Google OAuth script is not blocked by ad blockers
   - Verify the script URL is accessible

3. **"CORS error"**:
   - Check that your backend CORS configuration includes your frontend URL
   - Ensure the frontend is running on the correct port

4. **"Please select a role before continuing"**:
   - Make sure to select a role from the dropdown before clicking Google OAuth

### Debug Mode

To enable debug logging, add this to your backend:

```javascript
// In server.js
if (process.env.NODE_ENV === 'development') {
  console.log('Google OAuth Debug Mode Enabled');
}
```

## Production Deployment

1. **Update Environment Variables**: Use production Google Client IDs
2. **Update Authorized Origins**: Add your production domain
3. **HTTPS**: Ensure your production site uses HTTPS
4. **Security Headers**: Verify all security headers are properly set

## Support

If you encounter any issues:

1. Check the browser console for JavaScript errors
2. Check the backend server logs for API errors
3. Verify all environment variables are set correctly
4. Ensure Google Cloud Console settings match your configuration
5. Make sure you've created the `.env.local` file with your Google Client ID 