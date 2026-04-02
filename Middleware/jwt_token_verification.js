import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  // --- 1. Check server configuration ---
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not configured');
    return res.status(500).json('Internal server error');
  }

  const authHeader = req.headers.authorization;

  // --- 2. Check header existence ---
  if (!authHeader) {
    return res.status(401).json('Authorization header missing');
  }

  // --- 3. Validate Bearer format ---
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json('Invalid authorization format');
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json('Token missing');
  }

  try {
    // --- 4. Verify token with explicit constraints ---
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],          // match how you sign tokens
      // issuer: 'your-app-name',     // optional but recommended
      // audience: 'your-users',      // optional but recommended
    });

    // --- 5. Validate token structure ---
    if (!decoded || typeof decoded !== 'object' || !decoded.sub) {
      return res.status(401).json('Invalid token payload');
    }

    // Optional: normalize user object
    req.user = decoded;

    next();

  } catch (err) {
    // --- 6. Proper error classification ---
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json('Token expired');
    }

    if (err.name === 'JsonWebTokenError') {
      return res.status(403).json('Invalid token');
    }

    console.error('JWT verification error:', err);
    return res.status(500).json('Internal server error');
  }
};