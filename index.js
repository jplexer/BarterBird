const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { YoutubeiExtractor, createYoutubeiStream } = require("discord-player-youtubei")
const { SpotifyExtractor } = require("@discord-player/extractor")
const { serverconfig, userconfig } = require('./utils/db.js');
const { token, yt_access_token, yt_refresh_token } = require('./confidentialconfig.json');
const { Player } = require('discord-player');
const { lastfm } = require("./config.json")
const { setNowPlaying, scrobbleSong } = require('./utils/lastfm.js');


const client = new Client({ intents: [GatewayIntentBits.Guilds, 'GuildVoiceStates'] });



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

// Login to Discord with your client's token
client.login(token);
