const autoBind = require('auto-bind');

class CollaborationsHandler {
  constructor(collaborationsService, playlistsService, validator) {
    this._collaborationsService = collaborationsService;
    this.playlistsService = playlistsService;
    this.validator = validator;

    autoBind(this);
  }

  async postCollaborationHandler(req, h) {
    this.validator.validateCollaborationPayload(req.payload);

    const { id: credentialId } = req.auth.credentials;
    const { playlistId, userId } = req.payload;

    await this.playlistsService.verifyPlaylistsOwner(playlistId, credentialId);

    const collaborationId = await this._collaborationsService.addCollaboration(
      playlistId,
      userId,
    );

    const response = h.response({
      status: 'success',
      message: 'Collaboration has been successfully added',
      data: {
        collaborationId,
      },
    });
    response.code(201);
    return response;
  }

  async deleteCollaborationHandler(req) {
    this.validator.validateCollaborationPayload(req.payload);

    const { id: credentialId } = req.auth.credentials;
    const { playlistId, userId } = req.payload;

    await this.playlistsService.verifyPlaylistsOwner(playlistId, credentialId);
    await this._collaborationsService.deleteCollaboration(playlistId, userId);

    return {
      status: 'success',
      message: 'Collaboration has been successfully removed',
    };
  }
}

module.exports = CollaborationsHandler;
