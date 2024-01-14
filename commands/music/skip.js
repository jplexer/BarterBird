const { SlashCommandBuilder } = require('@discordjs/builders');
const { useMainPlayer } = require('discord-player');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('skip')
		.setDescription('skip to the next track'),

	async execute(interaction) {
        const player = useMainPlayer();
		var queue = player.nodes.get(interaction.guildId);
		if (!queue) {
			return interaction.reply({ content:'You are not connected to a voice channel!', ephemeral: true });
		}
		queue.node.skip();
		await interaction.reply({ content: "Skipping..."});
	},
};