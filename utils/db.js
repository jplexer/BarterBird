const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	// SQLite only
	storage: 'database.sqlite',
});

const serverconfig = sequelize.define('serverconfig', {
  serverId: {
    type: Sequelize.STRING,
    unique: true,
    primaryKey: true,
  },
  searchProvider: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
    allowNull: false,
  }
});

const userconfig = sequelize.define('userconfig', {
  userId: {
    type: Sequelize.STRING,
    unique: true,
    primaryKey: true,
  },
  lastfmSessionKey: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  listenbrainzToken: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  youtubeScrobble: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
  scrobblingEnabled: {
    type: Sequelize.BOOLEAN,
    defaultValue: true,
  }
});

module.exports = { serverconfig, userconfig };