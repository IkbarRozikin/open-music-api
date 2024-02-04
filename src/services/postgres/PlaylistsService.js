const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const AuthorizationError = require('../../exceptions/AuthorizationError');
const NotFoundError = require('../../exceptions/NotFoundError');
const InvariantError = require('../../exceptions/InvariantError');
const { mapDBToModelPlaylists } = require('../../utils/index');

class PlaylistsService {
  constructor(collaborationsService) {
    this.pool = new Pool();

    this._collaborationsService = collaborationsService;
  }

  async verifyPlaylistsOwner(playlistId, owner) {
    const query = {
      text: 'SELECT owner FROM playlists WHERE id = $1',
      values: [playlistId],
    };

    const result = await this.pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlists not found');
    }

    const playlist = result.rows[0];

    if (playlist.owner !== owner) {
      throw new AuthorizationError(
        'You are not authorized to access this resource',
      );
    }
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;
    const createdAt = new Date().toISOString();

    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3, $3, $4) RETURNING id',
      values: [id, name, createdAt, owner],
    };

    const result = await this.pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Playlist failed to add');
    }

    return result.rows[0].id;
  }

  async getPlaylists(owner) {
    const query = {
      text: 'SELECT playlists.id, playlists.name, users.username AS owner FROM playlists LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id LEFT JOIN users ON playlists.owner = users.id WHERE playlists.owner = $1 OR collaborations.user_id = $1 GROUP BY playlists.id, users.username',
      values: [owner],
    };

    const result = await this.pool.query(query);

    return result.rows.map(mapDBToModelPlaylists);
  }

  async deletePlaylistById(playlistId) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [playlistId],
    };

    const result = await this.pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlist cannot delete. Id Not found');
    }
  }

  async addPlaylistsSongs(playlistId, songId, owner, action) {
    const checkSongQuery = {
      text: 'SELECT id FROM songs WHERE id = $1',
      values: [songId],
    };

    const checkSongResult = await this.pool.query(checkSongQuery);
    if (checkSongResult.rows.length === 0) {
      throw new NotFoundError(
        'Playlist failed to be added, the song was not found',
      );
    }

    const id = `playlist_song-${nanoid(16)}`;
    const idActivity = `activity-${nanoid(16)}`;
    const createdAt = new Date().toISOString();
    const actionActivity = action;

    const query = {
      text: 'INSERT INTO playlists_songs VALUES($1, $2, $3, $4, $4) RETURNING id',
      values: [id, playlistId, songId, createdAt],
    };

    const queryActivities = {
      text: 'INSERT INTO playlists_activities VALUES($1, $2, $3, $4, $5, $6, $6) RETURNING id',
      values: [
        idActivity,
        playlistId,
        songId,
        owner,
        actionActivity,
        createdAt,
      ],
    };

    const result = await this.pool.query(query);
    const resultActivities = await this.pool.query(queryActivities);

    if (!resultActivities.rows[0].id) {
      throw new InvariantError('Playlist Activity failed added');
    }

    if (!result.rows[0].id) {
      throw new InvariantError('Playlist failed added');
    }

    return result.rows[0].id;
  }

  async getPlaylistsSongs(playlistId) {
    const queryPlaylist = {
      text:
        'SELECT playlists.id, playlists.name, users.username AS owner '
        + 'FROM playlists '
        + 'JOIN users ON playlists.owner = users.id '
        + 'WHERE playlists.id = $1',
      values: [playlistId],
    };

    const playlistResult = await this.pool.query(queryPlaylist);
    const playlistData = playlistResult.rows.map(mapDBToModelPlaylists)[0];

    const querySongs = {
      text: 'SELECT id, title, performer FROM songs WHERE id IN (SELECT songs_id FROM playlists_songs WHERE playlist_id = $1)',
      values: [playlistId],
    };

    const songsResult = await this.pool.query(querySongs);
    const songsData = songsResult.rows;

    playlistData.songs = songsData;

    return playlistData;
  }

  async deletePlaylistSongById(playlistId, songId, owner, action) {
    const idActivity = `activity-${nanoid(16)}`;
    const createdAt = new Date().toISOString();
    const actionActivities = action;

    const checkSongQuery = {
      text: 'SELECT songs_id FROM playlists_songs WHERE playlist_id = $1 AND songs_id = $2',
      values: [playlistId, songId],
    };

    const checkSongResult = await this.pool.query(checkSongQuery);
    if (checkSongResult.rows.length === 0) {
      throw new NotFoundError('Songs in the playlist were not found');
    }

    const deleteQuery = {
      text: 'DELETE FROM playlists_songs WHERE playlist_id = $1 AND songs_id = $2',
      values: [playlistId, songId],
    };

    const queryActivities = {
      text: 'INSERT INTO playlists_activities VALUES($1, $2, $3, $4, $5, $6, $6) RETURNING id',
      values: [
        idActivity,
        playlistId,
        songId,
        owner,
        actionActivities,
        createdAt,
      ],
    };

    const resultActivities = await this.pool.query(queryActivities);

    if (!resultActivities.rows[0].id) {
      throw new InvariantError('Failed to add Playlist Activity');
    }

    const result = await this.pool.query(deleteQuery);

    if (result.rowCount === 0) {
      throw new NotFoundError(
        'Failed to remove the song from the playlist. ID not found',
      );
    }
  }

  async getPlaylistActivities(playlistId) {
    const query = {
      text: `
        SELECT 
          users.username, 
          songs.title, 
          playlists_activities.action, 
          playlists_activities.created_at AS time 
        FROM 
          playlists_activities 
          LEFT JOIN users ON playlists_activities.user_id = users.id 
          LEFT JOIN songs ON playlists_activities.songs_id = songs.id 
        WHERE 
          playlists_activities.playlist_id = $1 
        ORDER BY 
          playlists_activities.created_at ASC
      `,
      values: [playlistId],
    };

    const result = await this.pool.query(query);

    return result.rows;
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistsOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      try {
        await this._collaborationsService.verifyCollaborator(
          playlistId,
          userId,
        );
      } catch {
        throw error;
      }
    }
  }
}

module.exports = PlaylistsService;
