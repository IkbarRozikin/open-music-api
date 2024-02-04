const Joi = require('joi');

const currentYear = new Date().getFullYear();

const SongsPayloadSchema = Joi.object({
  title: Joi.string().max(50).required(),
  year: Joi.number().integer().min(1000).max(currentYear)
    .required(),
  genre: Joi.string().max(50).required(),
  performer: Joi.string().max(50).required(),
  duration: Joi.number(),
  albumId: Joi.string(),
});

module.exports = SongsPayloadSchema;
