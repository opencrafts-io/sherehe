// import jwt from 'jsonwebtoken';

// export const verifyToken = (req, res, next) => {
//   // --- 1. Check server configuration ---
//   if (!process.env.JWT_SECRET) {
//     console.error('JWT_SECRET is not configured');
//     return res.status(500).json('Internal server error');
//   }

//   const authHeader = req.headers.authorization;

//   if (!authHeader) {
//     return res.status(401).json('Authorization header missing');
//   }

//   if (!authHeader.startsWith('Bearer ')) {
//     return res.status(401).json('Invalid authorization format');
//   }

//   const token = authHeader.split(' ')[1];

//   if (!token) {
//     return res.status(401).json('Token missing');
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET, {
//       algorithms: ['HS256'],          // match how you sign tokens
//     });

//     if (!decoded || typeof decoded !== 'object' || !decoded.sub) {
//       return res.status(401).json('Invalid token payload');
//     }

//     req.user = decoded;

//     next();

//   } catch (err) {
//     if (err.name === 'TokenExpiredError') {
//       return res.status(401).json('Token expired');
//     }

//     if (err.name === 'JsonWebTokenError') {
//       return res.status(403).json('Invalid token');
//     }

//     console.error('JWT verification error:', err);
//     return res.status(500).json('Internal server error');
//   }
// };

import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json('You are not authenticated!');
  }

  const token = authHeader.split(' ')[1];

  const decoded = jwt.decode(token);

  req.user = decoded;
  next();

};