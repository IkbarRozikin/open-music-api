const autoBind = require('auto-bind');

class AlbumsHandler {
  constructor(service, validator) {
    this.service = service;
    this.validator = validator;

    autoBind(this);
  }

  async postAlbumHandler(req, h) {
    this.validator.validateAlbumPayload(req.payload);

    const albumId = await this.service.addAlbum(req.payload);

    const response = h
      .response({
        status: 'success',
        data: {
          albumId,
        },
      })
      .code(201);

    return response;
  }

  async getAlbumByIdHandler(req, h) {
    const { albumId } = req.params;

    const album = await this.service.getAlbumById(albumId);

    const response = h
      .response({
        status: 'success',
        data: {
          album,
        },
      })
      .code(200);

    return response;
  }

  async putAlbumByIdHandler(req, h) {
    this.validator.validateAlbumPayload(req.payload);

    const { id } = req.params;

    await this.service.editAlbumById(id, req.payload);

    const response = h
      .response({
        status: 'success',
        message: 'Album updated successfully',
      })
      .code(200);

    return response;
  }

  async deleteAlbumByIdHandler(req, h) {
    const { id } = req.params;

    await this.service.deleteAlbumById(id);

    const response = h
      .response({
        status: 'success',
        message: 'Album deleted successfully',
      })
      .code(200);

    return response;
  }
}

module.exports = AlbumsHandler;
