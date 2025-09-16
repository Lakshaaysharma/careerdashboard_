const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Verify Google ID token
const verifyGoogleToken = async (idToken) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    return {
      success: true,
      data: payload
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Extract user data from Google profile
const extractGoogleUserData = (googleProfile) => {
  return {
    googleId: googleProfile.sub,
    email: googleProfile.email,
    name: googleProfile.name,
    picture: googleProfile.picture,
    locale: googleProfile.locale,
    email_verified: googleProfile.email_verified
  };
};

module.exports = {
  verifyGoogleToken,
  extractGoogleUserData
}; 