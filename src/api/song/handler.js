const autoBind = require('auto-bind');

class SongsHandler {
  constructor(service, validator) {
    this.service = service;
    this.validator = validator;

    autoBind(this);
  }

  async postSongHandler(req, h) {
    this.validator.validateSongPayload(req.payload);

    const songId = await this.service.addSong(req.payload);

    const response = h
      .response({
        status: 'success',
        data: {
          songId,
        },
      })
      .code(201);

    return response;
  }

  async getSongsHandler(req) {
    const { title, performer } = req.query;

    const songs = await this.service.getSongs(title, performer);

    return {
      status: 'success',
      data: {
        songs,
      },
    };
  }

  async getSongByIdHandler(req, h) {
    const { songId } = req.params;

    const song = await this.service.getSongById(songId);

    const response = h
      .response({
        status: 'success',
        data: {
          song,
        },
      })
      .code(200);

    return response;
  }

  async putSongByIdHandler(req, h) {
    this.validator.validateSongPayload(req.payload);

    const { id } = req.params;

    await this.service.putSongById(id, req.payload);

    const response = h
      .response({
        status: 'success',
        message: 'Song updated successfully',
      })
      .code(200);

    return response;
  }

  async deletedSongByIdHandler(req, h) {
    const { id } = req.params;

    await this.service.deleteSongById(id);

    const response = h
      .response({
        status: 'success',
        message: 'Song deleted successfully',
      })
      .code(200);

    return response;
  }
}

module.exports = SongsHandler;
