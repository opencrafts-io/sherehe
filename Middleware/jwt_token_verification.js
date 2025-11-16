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
