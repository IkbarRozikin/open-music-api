const mapDBToModel = ({ id, name, year }) => ({
  id,
  name,
  year,
});

const mapDBToModelSongs = ({ id, title, performer }) => ({
  id,
  title,
  performer,
});

const mapDBToModelSongById = ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  album_id: albumId,
}) => ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  albumId,
});

const mapDBToModelPlaylists = ({ id, name, owner: username }) => ({
  id,
  name,
  username,
});

module.exports = {
  mapDBToModel,
  mapDBToModelSongs,
  mapDBToModelSongById,
  mapDBToModelPlaylists,
};
