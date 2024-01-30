const autoBind = require('auto-bind');

class ExportsHandler {
  constructor(service, validator) {
    this.service = service;
    this.validator = validator;

    autoBind(this);
  }

  async postExportPlaylistsHandler(req, h) {
    this.validator.validateExportsPlaylistsPayload(req.payload);

    const message = {
      owner: req.auth.credentials.id,
      targetEmail: req.payload.targetEmail,
    };

    await this.service.sendMessage('export:playlists', JSON.stringify(message));

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
