const autoBind = require('auto-bind');

class AlbumsHandler {
  constructor(albumsService, storageService, validator) {
    this._albumsService = albumsService;
    this._storageService = storageService;
    this._validator = validator;

    autoBind(this);
  }

  async postAlbumHandler(req, h) {
    this._validator.validateAlbumPayload(req.payload);

    const albumId = await this._albumsService.addAlbum(req.payload);

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

    const album = await this._albumsService.getAlbumById(albumId);

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
    this._validator.validateAlbumPayload(req.payload);

    const { id } = req.params;

    await this._albumsService.editAlbumById(id, req.payload);

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

    await this._albumsService.deleteAlbumById(id);

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
    const { albumId } = req.params;

    this._validator.validateImageHeaders(cover.hapi.headers);

    const filename = await this._storageService.writeFile(cover, cover.hapi);

    const fileLocation = `http://${process.env.HOST}:${process.env.PORT}/src/api/uploads/${filename}`;

    await this._albumsService.addAlbumCoverById(albumId, fileLocation);

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

  async postLikeAlbum(req, h) {
    const { albumId } = req.params;

    const { id: userId } = req.auth.credentials;

    await this._albumsService.addLikeAlbum(albumId, userId);

    const response = h
      .response({
        status: 'success',
        message: 'Liked ',
      })
      .code(201);

    return response;
  }

  async getLikeAlbum(req, h) {
    const { albumId } = req.params;

    const { data: likes, dataSource } = await this._albumsService.getLikeAlbumCount(albumId);

    const response = h
      .response({
        status: 'success',
        data: {
          likes,
        },
      })
      .header('X-Data-Source', dataSource)
      .code(200);

    return response;
  }

  async deleteLikeAlbum(req, h) {
    const { albumId } = req.params;

    const { id: userId } = req.auth.credentials;

    await this._albumsService.unlikeAlbum(albumId, userId);

    const response = h
      .response({
        status: 'success',
        message: 'Unlike',
      })
      .code(200);

    return response;
  }
}

module.exports = AlbumsHandler;
