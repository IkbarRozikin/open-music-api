const autoBind = require('auto-bind');

class ExportsHandler {
  constructor(ProducerService, playlistsService, validator) {
    this.ProducerService = ProducerService;
    this.playlistsService = playlistsService;
    this.validator = validator;

    autoBind(this);
  }

  async postExportPlaylistsHandler(req, h) {
    this.validator.validateExportsPlaylistsPayload(req.payload);

    const { playlistId } = req.params;

    const message = {
      owner: req.auth.credentials.id,
      targetEmail: req.payload.targetEmail,
    };

    await this.playlistsService.verifyPlaylistsOwner(playlistId, message.owner);

    await this.ProducerService.sendMessage(
      'export:playlists',
      JSON.stringify(message)
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
