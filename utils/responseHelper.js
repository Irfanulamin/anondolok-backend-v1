const sendErrorResponse = (res, statusCode, message, errors = null) => {
  const response = {
    success: false,
    message,
  };
  if (errors) response.errors = errors;
  return res.status(statusCode).json(response);
};

const sendSuccessResponse = (res, statusCode, message, data = null) => {
  const response = {
    success: true,
    message,
  };
  if (data) Object.assign(response, data);
  return res.status(statusCode).json(response);
};

module.exports = {
  sendErrorResponse,
  sendSuccessResponse,
};
