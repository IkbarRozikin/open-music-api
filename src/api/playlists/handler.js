const autoBind = require('auto-bind');

class PlaylistsHandler {
  constructor(service, validator) {
    this.service = service;
    this.validator = validator;

    autoBind(this);
  }

  async postPlaylistHandler(req, h) {
    this.validator.validatePlaylistsPayload(req.payload);

    const { name } = req.payload;

    const { id: owner } = req.auth.credentials;

    const playlistId = await this.service.addPlaylist({
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
    const playlists = await this.service.getPlaylists(owner);

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

  async deletePlaylistHandler(req, h) {
    const { playlistId } = req.params;

    const { id: owner } = req.auth.credentials;

    await this.service.verifyPlaylistsOwner(playlistId, owner);

    this.service.deletePlaylistById(playlistId);

    return {
      status: 'success',
      message: 'Playlist deleted successfully',
    };
  }

  async postPlaylistSongsHandler(req, h) {
    this.validator.validatePlaylistsSongsPayload(req.payload);

    const { playlistId } = req.params;
    const { songId } = req.payload;
    const { id: owner } = req.auth.credentials;
    let { method: action } = req;

    if (action === 'post') {
      action = 'add';
    }

    await this.service.verifyPlaylistAccess(playlistId, owner);
    await this.service.addPlaylistsSongs(playlistId, songId, owner, action);

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

    await this.service.verifyPlaylistAccess(playlistId, owner);

    const playlist = await this.service.getPlaylistsSongs(playlistId);

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

  async deletePlaylistSongsHandler(req, h) {
    this.validator.validatePlaylistsSongsPayload(req.payload);

    const { playlistId } = req.params;
    const { songId } = req.payload;
    const { id: owner } = req.auth.credentials;
    const { method: action } = req;

    await this.service.verifyPlaylistAccess(playlistId, owner);

    await this.service.deletePlaylistSongById(
      playlistId,
      songId,
      owner,
      action
    );

    return {
      status: 'success',
      message: 'Songs deleted successfully',
    };
  }

  async getPlaylistActivitiesHandler(req, h) {
    const { playlistId } = req.params;
    const { id: owner } = req.auth.credentials;

    await this.service.verifyPlaylistAccess(playlistId, owner);
    const activities = await this.service.getPlaylistActivities(playlistId);

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
