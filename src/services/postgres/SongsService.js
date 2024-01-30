const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class SongsService {
  constructor() {
    this.pool = new Pool();
  }

  async addSong({ title, year, genre, performer, duration, albumId }) {
    const id = `song-${nanoid(16)}`;
    const createdAt = new Date().toISOString();

    const query = {
      text: 'INSERT INTO songs (id, title, year, genre, performer, duration, album_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8) RETURNING id',
      values: [id, title, year, genre, performer, duration, albumId, createdAt],
    };

    const result = await this.pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Songs failed to be added');
    }

    return result.rows[0].id;
  }

  async getSongs(title, performer) {
    const query = {
      text: 'SELECT id, title, performer FROM songs WHERE ($1::text IS NULL OR title ILIKE $1::text) AND ($2::text IS NULL OR performer ILIKE $2::text)',
      values: [
        title ? `%${title}%` : null,
        performer ? `%${performer}%` : null,
      ],
    };

    const result = await this.pool.query(query);

    return result.rows;
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT id, title, year, genre, performer, duration, album_id FROM songs WHERE id = $1',
      values: [id],
    };

    const result = await this.pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Id not found');
    }

    return result.rows[0];
  }

  async putSongById(id, { title, year, genre, performer, duration, albumId }) {
    const updatedAt = new Date().toISOString();

    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, genre = $3, performer = $4, duration = $5, album_id = $6, updated_at = $7 WHERE id = $8 RETURNING id',
      values: [title, year, genre, performer, duration, albumId, updatedAt, id],
    };

    const result = await this.pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Cannot edit album. Id not found');
    }
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this.pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Songs cannot be deleted, Id not found');
    }
  }
}

module.exports = SongsService;
