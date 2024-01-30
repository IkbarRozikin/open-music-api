const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapDBToModel, mapDBToModelSongs } = require('../../utils');

class AlbumsService {
  constructor(storageService) {
    this.pool = new Pool();
    this.storageService = storageService;
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;
    const createdAt = new Date().toISOString();

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3, $4, $4) RETURNING id',
      values: [id, name, year, createdAt],
    };
    const result = await this.pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Albums failed to be added');
    }

    return result.rows[0].id;
  }

  async getAlbumById(id) {
    const queryAlbum = {
      text: 'SELECT id, name, year, cover FROM albums WHERE id = $1',
      values: [id],
    };

    const result = await this.pool.query(queryAlbum);

    if (!result.rowCount) {
      throw new NotFoundError('id not found');
    }

    const albumData = result.rows.map(mapDBToModel)[0];

    const querySongs = {
      text: 'SELECT id, title, performer FROM songs WHERE album_id = $1',
      values: [id],
    };

    const songsResult = await this.pool.query(querySongs);
    const songsData = songsResult.rows.map(mapDBToModelSongs);

    albumData.songs = songsData;

    return albumData;
  }

  async editAlbumById(id, { name, year }) {
    const updatedAt = new Date().toISOString();

    const query = {
      text: 'UPDATE albums SET name = $1, year = $2, updated_at = $3 WHERE id = $4 RETURNING id',
      values: [name, year, updatedAt, id],
    };

    const result = await this.pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Cannot edit album. Id not found');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this.pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Album cannot be deleted, Id not found');
    }
  }

  async addAlbumCoverById(albumId, fileLocation) {
    const queryAlbum = {
      text: 'SELECT id, name, year FROM albums WHERE id = $1',
      values: [albumId],
    };

    const result = await this.pool.query(queryAlbum);

    if (!result.rowCount) {
      throw new NotFoundError('id not found');
    }

    const { name, year } = result.rows[0];
    const updatedAt = new Date().toISOString();

    const insertCoverQuery = {
      text: 'UPDATE albums SET name = $1, year = $2, cover = $3, updated_at = $4 WHERE id = $5 RETURNING id',
      values: [name, year, fileLocation, updatedAt, albumId],
    };

    const insertResult = await this.pool.query(insertCoverQuery);

    const coverIdResult = insertResult.rows[0].id;

    return coverIdResult;
  }
}

module.exports = AlbumsService;
