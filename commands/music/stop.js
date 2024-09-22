const { SlashCommandBuilder } = require('@discordjs/builders');
const { useMainPlayer, usePlayer } = require('discord-player');
const { lastfm, listenbrainz } = require("../../config.json");
const { scrobbleSong } = require("../../utils/scrobbling.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('stop')
		.setDescription('for when you had enough'),

	async execute(interaction) {
        const player = useMainPlayer();
		var queue = player.nodes.get(interaction.guildId);
		if (!queue) {
			return interaction.reply({ content:'You are not connected to a voice channel!', ephemeral: true });
		}

		if (queue.metadata.karaoke && queue.metadata.thread) {
			await queue.metadata.thread?.send({
				content: 'The queue has been stopped. Thank you for singing!'
			});
		}

		const track = queue.currentTrack;
		if (lastfm || listenbrainz) {
			// check if the track was longer than 30 seconds
			if (track.durationMS < 30000) {
				queue.delete();
				await interaction.reply({ content: "Stopping..."});
				return;
			}
	
			const guildNode = usePlayer(queue.guild.id);
			const playbackTime = guildNode.playbackTime;
			//check if the track was played for at least 50% of its duration or 4 minutes
			if (playbackTime < track.durationMS / 2 && playbackTime < 240000) {
				queue.delete();
				await interaction.reply({ content: "Stopping..."});
				return;
			}

			// Scrobble the song
			queue.channel.members.forEach(member => {
				scrobbleSong(track, member);
			})
		}

		queue.delete();
		await interaction.reply({ content: "Stopping..."});
	},
};