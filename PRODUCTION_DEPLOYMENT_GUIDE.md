# 🚀 Production Deployment Guide

This guide will help you deploy your Career Dashboard application to production and fix the issues where features work locally but not on the live website.

## 🔍 Issues Fixed

1. **Hardcoded localhost URLs** in frontend components
2. **Environment-specific configuration** for API endpoints
3. **CORS settings** for production environment
4. **Socket.IO configuration** for production
5. **Missing environment variables** for production

## 📋 Prerequisites

- Node.js 18+ and npm/pnpm installed
- MongoDB database (local or cloud)
- Domain names for frontend and backend
- SSL certificates (recommended)

## 🛠️ Frontend Deployment

### 1. Environment Configuration

Create a `.env.local` file in your project root with your production URLs:

```env
# API Configuration for Production
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
NEXT_PUBLIC_SOCKET_URL=https://your-backend-domain.com
NEXT_PUBLIC_FRONTEND_URL=https://your-frontend-domain.com

# Google OAuth Configuration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id-here
```

### 2. Build and Deploy Frontend

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Start production server (if self-hosting)
npm start
```

### 3. Deploy to Hosting Platform

#### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

#### Netlify
1. Build command: `npm run build`
2. Publish directory: `.next`
3. Set environment variables in Netlify dashboard

#### Other platforms
- Ensure you set all environment variables
- Build command: `npm run build`
- Start command: `npm start`

## 🖥️ Backend Deployment

### 1. Environment Configuration

Copy `backend/config.env.production` to `backend/config.env` and update all values:

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Database Configuration - REPLACE WITH YOUR MONGODB URI
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/career-dashboard

# CORS Configuration - REPLACE WITH YOUR ACTUAL FRONTEND DOMAIN
CORS_ORIGIN=https://your-frontend-domain.com

# Client URL - REPLACE WITH YOUR ACTUAL FRONTEND DOMAIN
CLIENT_URL=https://your-frontend-domain.com

# JWT Configuration - CHANGE THIS SECRET
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
GOOGLE_CALLBACK_URL=https://your-backend-domain.com/api/auth/google/callback

# AI Configuration
GEMINI_API_KEY=your-gemini-api-key-here

# Stripe Configuration
STRIPE_SECRET_KEY=your-stripe-secret-key-here
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key-here
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret-here
```

### 2. Update CORS Settings

In `backend/server.js`, uncomment and update line 59:
```javascript
// Add your production frontend domains here
allowedOrigins.push('https://your-frontend-domain.com');
```

### 3. Deploy Backend

#### Railway/Render/Heroku
1. Connect your repository
2. Set build command: `cd backend && npm install`
3. Set start command: `cd backend && npm start`
4. Add all environment variables from `config.env`

#### VPS/Dedicated Server
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Install PM2 for process management
npm install -g pm2

# Start with PM2
pm2 start server.js --name "career-backend"

# Save PM2 configuration
pm2 save
pm2 startup
```

## 🔧 Configuration Updates

### 1. Update Frontend API Calls

✅ **Already Fixed**: All hardcoded `http://localhost:5000` URLs have been replaced with dynamic configuration using `@/lib/config`.

### 2. Update Backend CORS

✅ **Already Fixed**: CORS configuration now supports both development and production environments.

### 3. Environment Variables

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
NEXT_PUBLIC_SOCKET_URL=https://your-backend-domain.com
NEXT_PUBLIC_FRONTEND_URL=https://your-frontend-domain.com
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

**Backend (config.env):**
```env
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.com
CLIENT_URL=https://your-frontend-domain.com
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
```

## 🧪 Testing Production Setup

### 1. Test API Connectivity
```bash
# Test backend health
curl https://your-backend-domain.com/health

# Expected response:
# {"status":"OK","message":"CareerLaunch API is running","timestamp":"..."}
```

### 2. Test Frontend API Calls
1. Open browser developer tools
2. Navigate to your frontend
3. Check Network tab for API calls
4. Verify calls are going to your backend domain, not localhost

### 3. Test Socket.IO Connection
1. Open chat functionality
2. Check WebSocket connections in Network tab
3. Verify Socket.IO connects to your backend domain

## 🚨 Common Issues and Solutions

### Issue 1: "Network Error" on API calls
**Solution**: Check CORS configuration and ensure backend is accessible from frontend domain.

### Issue 2: Socket.IO connection fails
**Solution**: Verify `NEXT_PUBLIC_SOCKET_URL` environment variable is set correctly.

### Issue 3: 404 errors on API endpoints
**Solution**: Ensure backend is running and accessible at the configured domain.

### Issue 4: Authentication not working
**Solution**: Check JWT_SECRET is set in production and Google OAuth URLs are updated.

### Issue 5: File uploads not working
**Solution**: Ensure backend has proper file upload permissions and storage configuration.

## 📊 Monitoring

### 1. Backend Monitoring
```bash
# Check PM2 processes
pm2 status

# View logs
pm2 logs career-backend

# Monitor resources
pm2 monit
```

### 2. Frontend Monitoring
- Use Vercel Analytics (if using Vercel)
- Monitor Core Web Vitals
- Set up error tracking (Sentry, LogRocket, etc.)

## 🔐 Security Checklist

- [ ] Change JWT_SECRET from default
- [ ] Use HTTPS for both frontend and backend
- [ ] Set proper CORS origins (no wildcards in production)
- [ ] Update Google OAuth redirect URLs
- [ ] Use production MongoDB credentials
- [ ] Set up proper error handling (no sensitive data in errors)
- [ ] Enable rate limiting
- [ ] Use helmet.js security headers

## 🎯 Final Steps

1. **Test all features** in production environment
2. **Monitor logs** for any errors
3. **Set up automated backups** for database
4. **Configure domain SSL certificates**
5. **Set up monitoring and alerting**

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Check backend logs
3. Verify all environment variables are set
4. Test API endpoints directly with curl/Postman
5. Ensure CORS is properly configured

---

**✅ All major issues have been fixed in the codebase. Follow this guide to deploy successfully!**
