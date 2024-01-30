const routes = (handler) => [
  {
    method: 'POST',
    path: '/export/playlists',
    handler: handler.postExportPlaylistsHandler,
    options: {
      auth: 'playlists_jwt',
    },
  },
];

module.exports = routes;
