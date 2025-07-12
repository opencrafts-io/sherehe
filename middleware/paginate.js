export const paginate = (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  if (page < 1 || limit < 1) {
    return res.status(400).json({ message: 'Page and limit must be positive integers.' });
  }

  const offset = (page - 1) * limit;

  // Attach pagination info to the request object
  req.pagination = {
    page,
    limit,
    offset,
    limitPlusOne: limit + 1,
  };

  next(); // pass control to the controller
};
