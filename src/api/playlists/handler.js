const autoBind = require('auto-bind');

class PlaylistsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async postPlaylistHandler(req, h) {
    this._validator.validatePlaylistsPayload(req.payload);

    const { name } = req.payload;

    const { id: owner } = req.auth.credentials;

    const playlistId = await this._service.addPlaylist({
      name,
      owner,
    });

    const response = h
      .response({
        status: 'success',
        data: {
          playlistId,
        },
      })
      .code(201);

    return response;
  }

  async getPlaylistsHandler(req, h) {
    const { id: owner } = req.auth.credentials;
    const playlists = await this._service.getPlaylists(owner);

    const response = h
      .response({
        status: 'success',
        data: {
          playlists,
        },
      })
      .code(200);

    return response;
  }

  async deletePlaylistHandler(req) {
    const { playlistId } = req.params;

    const { id: owner } = req.auth.credentials;

    await this._service.verifyPlaylistsOwner(playlistId, owner);

    this._service.deletePlaylistById(playlistId);

    return {
      status: 'success',
      message: 'Playlist deleted successfully',
    };
  }

  async postPlaylistSongsHandler(req, h) {
    this._validator.validatePlaylistsSongsPayload(req.payload);

    const { playlistId } = req.params;
    const { songId } = req.payload;
    const { id: owner } = req.auth.credentials;
    let { method: action } = req;

    if (action === 'post') {
      action = 'add';
    }

    await this._service.verifyPlaylistAccess(playlistId, owner);
    await this._service.addPlaylistsSongs(playlistId, songId, owner, action);

    const response = h
      .response({
        status: 'success',
        message: 'Playlists added successfully',
      })
      .code(201);

    return response;
  }

  async getPlaylistSongsHandler(req, h) {
    const { playlistId } = req.params;
    const { id: owner } = req.auth.credentials;

    await this._service.verifyPlaylistAccess(playlistId, owner);

    const playlist = await this._service.getPlaylistsSongs(playlistId);

    const response = h
      .response({
        status: 'success',
        data: {
          playlist,
        },
      })
      .code(200);

    return response;
  }

  async deletePlaylistSongsHandler(req) {
    this._validator.validatePlaylistsSongsPayload(req.payload);

    const { playlistId } = req.params;
    const { songId } = req.payload;
    const { id: owner } = req.auth.credentials;
    const { method: action } = req;

    await this._service.verifyPlaylistAccess(playlistId, owner);

    await this._service.deletePlaylistSongById(
      playlistId,
      songId,
      owner,
      action,
    );

    return {
      status: 'success',
      message: 'Songs deleted successfully',
    };
  }

  async getPlaylistActivitiesHandler(req) {
    const { playlistId } = req.params;
    const { id: owner } = req.auth.credentials;

    await this._service.verifyPlaylistAccess(playlistId, owner);
    const activities = await this._service.getPlaylistActivities(playlistId);

    return {
      status: 'success',
      data: {
        playlistId,
        activities,
      },
    };
  }
}

module.exports = PlaylistsHandler;
