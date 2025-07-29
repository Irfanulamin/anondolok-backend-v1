// =============================================
// 14. MIDDLEWARE/VALIDATION.JS - Input Validation
// =============================================

const { z } = require("zod");
const { sendErrorResponse } = require("../utils/responseHelper");

const validateInput = (schema) => {
  return (req, res, next) => {
    try {
      const validatedData = schema.parse(req.body);
      req.validatedData = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendErrorResponse(res, 400, "Validation error", error.errors);
      }
      next(error);
    }
  };
};

const validateParams = (schema) => {
  return (req, res, next) => {
    try {
      const validatedParams = schema.parse(req.params);
      req.validatedParams = validatedParams;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendErrorResponse(res, 400, "Invalid parameters", error.errors);
      }
      next(error);
    }
  };
};

module.exports = {
  validateInput,
  validateParams,
};
