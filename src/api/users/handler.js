const autoBind = require('auto-bind');

class UsersHandler {
  constructor(service, validator) {
    this.service = service;
    this.validator = validator;

    autoBind(this);
  }

  async postUserHandler(req, h) {
    this.validator.validateUserPayload(req.payload);

    const userId = await this.service.addUser(req.payload);

    const response = h
      .response({
        status: 'success',
        data: {
          userId,
        },
      })
      .code(201);

    return response;
  }
}

module.exports = UsersHandler;
