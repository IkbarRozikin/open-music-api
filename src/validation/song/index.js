const UserPayloadSchema = require('./schema');

const SongsValidator = {
  validateSongPayload: (payload) => {
    const validationResult = UserPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new Error(validationResult.error.message);
    }
  },
};

module.exports = SongsValidator;
