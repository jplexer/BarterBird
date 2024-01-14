const { SlashCommandBuilder } = require('@discordjs/builders');
const { useMainPlayer } = require('discord-player');
module.exports = {
	data: new SlashCommandBuilder()
        .setName('remove')
        .setDescription('remove a track from the queue')
        .addIntegerOption(option => option.setName('tracknumber').setDescription('Number of the track you want to remove').setRequired(true)),
	async execute(interaction) {
        const player = useMainPlayer();
		var queue = player.nodes.get(interaction.guildId);
        const query = interaction.options.get("tracknumber").value;
		if (!queue) {
			return interaction.reply({ content:'You are not connected to a voice channel!', ephemeral: true });
		}
        if (queue.tracks == []) {
            return await interaction.reply({ content: "There is nothing to remove", ephemeral: true });
        } else if (query <= 0 || query > queue.tracks.toArray().length) {
            return await interaction.reply({ content: "You need to specify a valid number!", ephemeral: true });
        } else {
            await interaction.reply({ content: `Removed ${queue.tracks.toArray()[query - 1].title}`});
            queue.node.remove(query - 1)
        }
	},
};