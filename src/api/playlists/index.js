const PlaylistsHandler = require('./handler');
const router = require('./routes');

module.exports = {
  name: 'playlists',
  version: '1.0.0',
  register: async (server, { service, validator }) => {
    const playlistsHandler = new PlaylistsHandler(service, validator);
    server.route(router(playlistsHandler));
  },
};
