const autoBind = require('auto-bind');

class AlbumsHandler {
  constructor(albumsService, storageService, validator) {
    this.albumsService = albumsService;
    this.storageService = storageService;
    this.validator = validator;

    autoBind(this);
  }

  async postAlbumHandler(req, h) {
    this.validator.validateAlbumPayload(req.payload);

    const albumId = await this.albumsService.addAlbum(req.payload);

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

    const album = await this.albumsService.getAlbumById(albumId);

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

    await this.albumsService.editAlbumById(id, req.payload);

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

    await this.albumsService.deleteAlbumById(id);

    const response = h
      .response({
        status: 'success',
        message: 'Album deleted successfully',
      })
      .code(200);

    return response;
  }

  async postAlbumCoverHandler(req, h) {
    const { cover } = req.payload;

    this.validator.validateImageHeaders(cover.hapi.headers);

    const filename = await this.storageService.writeFile(cover, cover.hapi);

    const fileLocation = `http://${process.env.HOST}:${process.env.PORT}/upload/images/${filename}`;

    const { albumId } = req.params;

    await this.albumsService.addAlbumCoverById(albumId, fileLocation);

    const response = h
      .response({
        status: 'success',
        message: 'Cover album successfully uploaded',
        data: {
          fileLocation,
        },
      })
      .code(201);

    return response;
  }

  // async postLikeAlbum() {}
}

module.exports = AlbumsHandler;
