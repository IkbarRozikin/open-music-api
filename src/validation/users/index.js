const validateUserPayload = require('./schema');

const UsersValidator = {
  validateUserPayload: (payload) => {
    const validationResult = validateUserPayload.validate(payload);
    if (validationResult.error) {
      throw new Error(validationResult.error.message);
    }
  },
};

module.exports = UsersValidator;
