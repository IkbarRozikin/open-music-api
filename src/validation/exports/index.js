const InvariantError = require('../../exceptions/InvariantError');
const ExportPlaylistsPayload = require('./schema');

const ExportsValidator = {
  validateExportsPlaylistsPayload: (payload) => {
    const validationResult = ExportPlaylistsPayload.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = ExportsValidator;
