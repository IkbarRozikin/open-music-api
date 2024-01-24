const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');

class CollaborationsService {
  constructor() {
    this.pool = new Pool();
  }

  async addCollaboration(playlistId, userId) {
    const checkUser = {
      text: 'SELECT id FROM users WHERE id = $1',
      values: [userId],
    };

    const checkUserResult = await this.pool.query(checkUser);

    if (checkUserResult.rows.length === 0) {
      throw new NotFoundError(
        'Collaboration failed to be added, user not found'
      );
    }

    const id = `collab-${nanoid(16)}`;
    const createdAt = new Date().toISOString();

    const query = {
      text: 'INSERT INTO collaborations VALUES($1, $2, $3, $4, $4) RETURNING id',
      values: [id, playlistId, userId, createdAt],
    };
    const result = await this.pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Collaboration failed to be added');
    }
    return result.rows[0].id;
  }

  async deleteCollaboration(playlistId, userId) {
    const query = {
      text: 'DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2 RETURNING id',
      values: [playlistId, userId],
    };

    const result = await this.pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Collaboration failed to be removed');
    }
  }

  async verifyCollaborator(playlistId, userId) {
    const query = {
      text: 'SELECT id FROM collaborations WHERE playlist_id = $1 AND user_id = $2',
      values: [playlistId, userId],
    };

    const result = await this.pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Collaboration failed to be verified');
    }
  }
}

module.exports = CollaborationsService;
