const errorHandler = (error, req, res, next) => {
  const statusCode = res.statusCode ? res.statusCode : 500;
  let message = error.message;
  res.status(statusCode).json({
    message,
    stack: process.env.NODE_ENV === "development" ? error.stack : null,
  });
  next();
};

export default errorHandler;
