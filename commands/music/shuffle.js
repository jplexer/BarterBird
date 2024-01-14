const { SlashCommandBuilder } = require('@discordjs/builders');
const { useMainPlayer } = require('discord-player');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('shuffle')
		.setDescription('shuffle up the queue (irreversible)'),
	async execute(interaction) {
        const player = useMainPlayer();
		var queue = player.nodes.get(interaction.guildId);
		if (!queue) {
			return interaction.reply({ content:'You are not connected to a voice channel!', ephemeral: true });
		}
		queue.tracks.shuffle();
		await interaction.reply({ content: "Shuffling..."});
	},
};