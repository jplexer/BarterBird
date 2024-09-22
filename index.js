const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, ThreadAutoArchiveDuration } = require('discord.js');
const { YoutubeiExtractor, createYoutubeiStream } = require("discord-player-youtubei")
const { SpotifyExtractor } = require("@discord-player/extractor")
const { serverconfig, userconfig } = require('./utils/db.js');
const { token, yt_credentials } = require('./confidentialconfig.json');
const { Player, usePlayer } = require('discord-player');
const { lastfm, listenbrainz } = require("./config.json")
const { setNowPlaying, scrobbleSong } = require('./utils/scrobbling.js');


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
	authentication: yt_credentials,
streamOptions: {
	useClient: "ANDROID"
 } 

})

player.extractors.register(SpotifyExtractor, {
    createStream: createYoutubeiStream
})


player.events.on('playerStart', async (queue, track) => {
	console.log(queue.metadata.channel.type);
	if (!queue.thread  && queue.metadata.channel.type === 0 && queue.karaoke) {
		// create a thread for the session
		queue.thread = await queue.metadata.channel.threads.create({
			name: 'Karaoke Session - ' + Date.now(),
			autoArchiveDuration: ThreadAutoArchiveDuration.OneHour,
			reason: 'Karaoke Session',
		});
	}
	await

    queue.metadata.channel.send(`Now Playing: **${track.title}** (${track.duration}) \n @ ${track.url}`);
	if (lastfm || listenbrainz) {
		// Update last.fm now playing
		queue.channel.members.forEach(member => {
			setNowPlaying(track, member);
		})
	}

	if (queue.karaoke) {
		const results = await player.lyrics.search({
			q: track.title + ' ' + track.author,
		}); // this is a lot better than genius but sometimes gives weird result, specify artistName as well in such situations
		
		const first = results[0];
		
		if (!first.syncedLyrics) {
			return; // no synced lyrics available
		}
		
		// load raw lyrics to the queue
		const syncedLyrics = queue.syncedLyrics(first);
		
		// Listen to live updates. This will be called whenever discord-player detects a new line in the lyrics
		syncedLyrics.onChange(async (lyrics, timestamp) => {
			// timestamp = timestamp in lyrics (not queue's time)
			// lyrics = line in that timestamp
			await queue.thread?.send({
				content: `${lyrics}`
			});
		});
		
		syncedLyrics.subscribe(); // start listening to live updates
	}
});

player.events.on('playerFinish', async (queue, track) => {
	if (queue.karaoke && queue.thread) {
		await queue.thread?.send({
			content: 'This song has ended. Thank you for singing!'
		});
	}

	if (lastfm || listenbrainz) {
		// check if the track was longer than 30 seconds
		if (track.durationMS < 30000) {
			return;
		}

		const guildNode = queue.node;//usePlayer(queue.guild.id);
		// for some reason playbackTime is undefined when we enable karaoke mode
		// doesnt matter, we just set it to 0. sucks but it works
		const playbackTime = guildNode.playbackTime || 0;
		//check if the track was played for at least 50% of its duration or 4 minutes
		if (playbackTime < track.durationMS / 2 && playbackTime < 240000) {
			return 
		}
		// Scrobble the song
		queue.channel.members.forEach(member => {
			scrobbleSong(track, member);
		})
	}
});

// Login to Discord with your client's token
client.login(token);
