/**
 * Authentication Middleware
 * Optional token verification untuk MQTT endpoints
 */

export const authenticateToken = (req, res, next) => {
  // Check for optional token
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (token) {
    // Validate token jika ada (optional)
    try {
      // Token validation logic di sini jika diperlukan
      next();
    } catch (error) {
      return res.status(403).json({ error: 'Invalid token' });
    }
  } else {
    // Allow without token untuk development
    // Di production, uncomment line di bawah untuk enforce auth
    // return res.status(401).json({ error: 'No token provided' });
    
    next(); // Allow untuk sekarang
  }
};

export default authenticateToken;
