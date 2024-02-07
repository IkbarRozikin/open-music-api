const path = require('path');

const routes = (handler) => [
  {
    method: 'POST',
    path: '/albums',
    handler: handler.postAlbumHandler,
  },
  {
    method: 'GET',
    path: '/albums/{albumId}',
    handler: handler.getAlbumByIdHandler,
  },
  {
    method: 'GET',
    path: '/src/api/uploads/{file*}',
    handler: {
      directory: {
        path: path.resolve('src/api/uploads'),
      },
    },
  },
  {
    method: 'PUT',
    path: '/albums/{id}',
    handler: handler.putAlbumByIdHandler,
  },
  {
    method: 'DELETE',
    path: '/albums/{id}',
    handler: handler.deleteAlbumByIdHandler,
  },
  {
    method: 'POST',
    path: '/albums/{albumId}/covers',
    handler: handler.postAlbumCoverHandler,
    options: {
      payload: {
        allow: 'multipart/form-data',
        multipart: true,
        output: 'stream',
        maxBytes: 512000,
      },
    },
  },
  {
    method: 'POST',
    path: '/albums/{albumId}/likes',
    handler: handler.postLikeAlbum,
    options: {
      auth: 'playlists_jwt',
    },
  },
  {
    method: 'GET',
    path: '/albums/{albumId}/likes',
    handler: handler.getLikeAlbum,
  },
  {
    method: 'DELETE',
    path: '/albums/{albumId}/likes',
    handler: handler.deleteLikeAlbum,
    options: {
      auth: 'playlists_jwt',
    },
  },
];

module.exports = routes;
