const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const InvariantError = require('../../exceptions/InvariantError');
const AuthenticationError = require('../../exceptions/AuthenticationError');

class UsersService {
  constructor() {
    this.pool = new Pool();
  }

  async addUser({ username, password, fullname }) {
    await this.verifyNewUsername(username);

    const createdAt = new Date().toISOString();

    const id = `user-${nanoid(16)}`;

    const hashedPassword = await bcrypt.hash(password, 10);

    const query = {
      text: 'INSERT INTO users VALUES($1, $2, $3, $4, $5, $5) RETURNING id ',
      values: [id, username, hashedPassword, fullname, createdAt],
    };

    const result = await this.pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('User gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async verifyNewUsername(username) {
    const query = {
      text: 'SELECT username FROM users WHERE username = $1',
      values: [username],
    };

    const result = await this.pool.query(query);

    if (result.rows.length > 0) {
      throw new InvariantError(
        'Gagal menambahkan user. Username sudah digunakan.'
      );
    }
  }

  async verifyUserCredential({ username, password }) {
    const query = {
      text: 'SELECT id, username, password FROM users WHERE username = $1',
      values: [username],
    };

    const result = await this.pool.query(query);

    if (!result.rowCount) {
      throw new AuthenticationError('Kredensial yang Anda berikan salah');
    }

    const {
      id,
      username: retrievedUsername,
      password: hashedPassword,
    } = result.rows[0];

    const match = await bcrypt.compare(password, hashedPassword);

    if (!match) {
      throw new AuthenticationError('Kredensial yang Anda berikan salah');
    }

    return { id, username: retrievedUsername };
  }
}

module.exports = UsersService;