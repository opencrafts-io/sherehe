import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json('You are not authenticated!');
  }

  const token = authHeader.split(' ')[1];

  const decoded = jwt.decode(token);

  if (decoded.user_role !== 'client') {
        req.user = decoded;
    next();
    // return res.status(401).json('You are not authenticated!');
  }else{
    req.user = decoded;
    next();
  }

  // jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
  //   // if (err) return res.status(403).json('Token is not valid!');
  //   console.log(user)
  //   if (user.user_role !== 'client') return res.status(403).json('You are not authorized!');
    
  //   req.user = user;
  //   next();
  // });
};
