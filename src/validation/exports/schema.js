const Joi = require('joi');

const ExportPlaylistsPayload = Joi.object({
  targetEmail: Joi.string().email({ tlds: true }).required(),
});

module.exports = ExportPlaylistsPayload;
