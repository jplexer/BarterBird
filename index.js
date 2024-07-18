const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { YoutubeiExtractor, createYoutubeiStream } = require("discord-player-youtubei")
const { SpotifyExtractor } = require("@discord-player/extractor")
const Sequelize = require('sequelize');
const { token, yt_access_token, yt_refresh_token } = require('./confidentialconfig.json');
const { Player } = require('discord-player');


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
});

client.serverconfig = serverconfig;
client.userconfig = userconfig;

const player = new Player(client);
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

player.events.on('playerStart', (queue, track) => {
    queue.metadata.channel.send(`Now Playing: **${track.title}** (${track.duration}) \n @ ${track.url}`);
});


// Login to Discord with your client's token
client.login(token);