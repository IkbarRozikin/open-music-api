const autoBind = require('auto-bind');

class AuthenticationsHandler {
  constructor(authenticationsService, usersService, tokenManager, validator) {
    this._authenticationsService = authenticationsService;
    this._usersService = usersService;
    this._tokenManager = tokenManager;
    this._validator = validator;

    autoBind(this);
  }

  async postAuthenticationHandler(req, h) {
    this._validator.validatePostAuthenticationPayload(req.payload);

    const { id, username } = await this._usersService.verifyUserCredential(
      req.payload
    );

    const accessToken = this._tokenManager.generateAccessToken({
      id,
      username,
    });
    const refreshToken = this._tokenManager.generateRefreshToken({
      id,
      username,
    });

    await this._authenticationsService.addRefreshToken(refreshToken);

    const response = h
      .response({
        status: 'success',
        message: 'Authentication added successfully',
        data: {
          accessToken,
          refreshToken,
        },
      })
      .code(201);
    return response;
  }

  async putAuthenticationHandler(req, h) {
    this._validator.validatePutAuthenticationPayload(req.payload);

    const { refreshToken } = req.payload;

    await this._authenticationsService.verifyRefreshToken(refreshToken);
    const { id } = this._tokenManager.verifyRefreshToken(refreshToken);

    const accessToken = this._tokenManager.generateAccessToken({ id });

    const response = h
      .response({
        status: 'success',
        message: 'Access Token berhasil diperbarui',
        data: {
          accessToken,
        },
      })
      .code(200);
    return response;
  }

  async deleteAuthenticationHandler(req, h) {
    this._validator.validateDeleteAuthenticationPayload(req.payload);

    const { refreshToken } = req.payload;
    await this._authenticationsService.verifyRefreshToken(refreshToken);
    await this._authenticationsService.deleteRefreshToken(refreshToken);

    const response = h
      .response({
        status: 'success',
        message: 'Refresh token berhasil dihapus',
      })
      .code(200);
    return response;
  }
}

module.exports = AuthenticationsHandler;
