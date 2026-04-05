import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  // --- 1. Check server configuration ---
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not configured');
    return res.status(500).json('Internal server error');
  }

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json('Authorization header missing');
  }

  const [scheme, token] = authHeader.trim().split(/\s+/, 2);

  if (!scheme || scheme.toLowerCase() !== 'bearer') {
    return res.status(401).json('Invalid authorization format');
  }
  if (!token) {
    return res.status(401).json('Token missing');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],          // match how you sign tokens
    });

    if (!decoded || typeof decoded !== 'object' || !decoded.sub) {
      return res.status(401).json('Invalid token payload');
    }

    req.user = decoded;

    next();

  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json('Token expired');
    }

    if (err.name === 'JsonWebTokenError') {
      res.set('WWW-Authenticate', 'Bearer');
      return res.status(401).json('Invalid token');
    }

    console.error('JWT verification error:', err);
    return res.status(500).json('Internal server error');
  }
};