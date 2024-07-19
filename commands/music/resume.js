const { SlashCommandBuilder } = require('@discordjs/builders');
const { useMainPlayer } = require('discord-player');
const { setNowPlaying } = require('../../index');
const { lastfm } = require('../../config.json');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('resume')
		.setDescription('we are so back'),
	async execute(interaction) {
        const player = useMainPlayer();
		var queue = player.nodes.get(interaction.guildId);
		if (!queue) {
			return interaction.reply({ content:'You are not connected to a voice channel!', ephemeral: true });
		}
		queue.node.resume();
		// we should send now playing to lastfm again
		if (lastfm) {
			const track = queue.current;
			queue.channel.members.forEach(member => {
				setNowPlaying(track, member);
			})
		}
		await interaction.reply({ content: "▶️ | Resumed"});
	},
};