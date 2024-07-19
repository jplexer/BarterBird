const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { YoutubeiExtractor, createYoutubeiStream } = require("discord-player-youtubei")
const { SpotifyExtractor } = require("@discord-player/extractor")
const Sequelize = require('sequelize');
const { token, yt_access_token, yt_refresh_token, lastfm_api_key, lastfm_api_secret } = require('./confidentialconfig.json');
const { Player } = require('discord-player');
const { lastfm } = require("./config.json")
const axios = require('axios');
const crypto = require('crypto');


const client = new Client({ intents: [GatewayIntentBits.Guilds, 'GuildVoiceStates'] });

const sequelize = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	// SQLite only
	storage: 'database.sqlite',
});

// Command handler
client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

// Event handler
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

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
	youtubeScrobble: {
		type: Sequelize.BOOLEAN,
		defaultValue: false,
		allowNull: false,
	}
});

client.serverconfig = serverconfig;
client.userconfig = userconfig;

const player = new Player(client);
player.extractors.loadDefault((ext) => ext !== 'YouTubeExtractor' && ext !== 'SpotifyExtractor');

player.extractors.register(YoutubeiExtractor, {
	authentication: {
		accessToken: yt_access_token,
		refreshToken: yt_refresh_token,
		expiry: 0
},
})

player.extractors.register(SpotifyExtractor, {
    createStream: createYoutubeiStream
})


player.events.on('playerStart', async (queue, track) => {
    queue.metadata.channel.send(`Now Playing: **${track.title}** (${track.duration}) \n @ ${track.url}`);
	if (lastfm) {
		// Update last.fm now playing
		queue.channel.members.forEach(member => {
			setNowPlaying(track, member);
		})
	}
});

player.events.on('playerFinish', async (queue, track) => {
	if (lastfm) {
		// check if the track was longer than 30 seconds
		if (track.durationMS < 30000) {
			return;
		}

		//scrobble the track for each user in the channel
		queue.channel.members.forEach(member => {
			scrobbleSong(track, member);
		})
	}
});

function setNowPlaying(track, member) {
	var method = 'track.updateNowPlaying';
	client.userconfig.findOne({ where: { userId: member.id } }).then(userconfig => {
		if (userconfig) {
			if (!userconfig.youtubeScrobble && track.source == 'youtube') {
				return;
			}
			if (track.source == 'arbitrary') {
				return;
			}
			var session_key = userconfig.lastfmSessionKey;
			var signature = crypto.createHash('md5').update(`api_key${lastfm_api_key}artist${track.author}method${method}sk${session_key}track${track.title}${lastfm_api_secret}`).digest('hex');
			axios.post(`http://ws.audioscrobbler.com/2.0/?method=track.updateNowPlaying&api_key=${lastfm_api_key}&artist=${track.author}&track=${track.title}&sk=${session_key}&format=json&api_sig=${signature}`)
			.catch(error => {
				if (error.response.data.error == 9) {
					// DM user to reauthenticate
					member.send(`Your Last.fm session key is invalid. Please reauthenticate.`);
					// delete their userconfig
					client.userconfig.destroy({ where: { userId: member.id } });
				}
			});
		}
	});
}

function scrobbleSong(track, member) {
	var method = 'track.scrobble';
	client.userconfig.findOne({ where: { userId: member.id } }).then(userconfig => {
		if (userconfig) {
			if (!userconfig.youtubeScrobble && track.source == 'youtube') {
				return;
			}
			if (track.source == 'arbitrary') {
				return;
			}
			var session_key = userconfig.lastfmSessionKey;
			var timestamp = Math.floor(new Date().getTime() / 1000);
			//var chosenByUser = member.id == queue.metadata.user.id ? 1 : 0;
			var signature = crypto.createHash('md5').update(`api_key${lastfm_api_key}artist${track.author}method${method}sk${session_key}timestamp${timestamp}track${track.title}${lastfm_api_secret}`).digest('hex');
			axios.post(`http://ws.audioscrobbler.com/2.0/?format=json&method=track.scrobble&api_key=${lastfm_api_key}&artist=${track.author}&track=${track.title}&timestamp=${timestamp}&sk=${session_key}&api_sig=${signature}`)
			.then(response => {
			})
			.catch(error => {
				if (error.response.data.error == 9) {
					// DM user to reauthenticate
					member.send(`Your Last.fm session key is invalid. Please reauthenticate.`);
					// delete their userconfig
					client.userconfig.destroy({ where: { userId: member.id } });
				}
			});
		}
	});
}


// Login to Discord with your client's token
client.login(token);

module.exports = { scrobbleSong, setNowPlaying };