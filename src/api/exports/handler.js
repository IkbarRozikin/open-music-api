const autoBind = require('auto-bind');

class ExportsHandler {
  constructor(ProducerService, playlistsService, validator) {
    this._ProducerService = ProducerService;
    this._playlistsService = playlistsService;
    this._validator = validator;

    autoBind(this);
  }

  async postExportPlaylistsHandler(req, h) {
    this._validator.validateExportsPlaylistsPayload(req.payload);

    const { playlistId } = req.params;

    const { id: owner } = req.auth.credentials;

    const message = {
      playlistId,
      targetEmail: req.payload.targetEmail,
    };

    await this._playlistsService.verifyPlaylistsOwner(playlistId, owner);

    await this._ProducerService.sendMessage(
      'export:playlists',
      JSON.stringify(message),
    );

    const response = h
      .response({
        status: 'success',
        message: 'Your request is in the queue',
      })
      .code(201);

    return response;
  }
}

module.exports = ExportsHandler;
