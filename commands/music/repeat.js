const { SlashCommandBuilder } = require('@discordjs/builders');
const { useMainPlayer } = require('discord-player');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('repeat')
		.setDescription(`hello yes I want you to play this song again`)
        .addBooleanOption(option =>option.setName('queue')
                .setDescription('should the whole queue be repeated?')),
	async execute(interaction, client) {
        const player = useMainPlayer();
		var queue = player.nodes.get(interaction.guildId);
        const queueSkip = interaction.options.getBoolean('queue');
		if (!queue) {
			return interaction.reply({ content:'You are not connected to a voice channel!', ephemeral: true });
		}
		if (queue.repeatMode !== 0) {
			queue.setRepeatMode(0);
			await interaction.reply({ content: "▶️ | Continuing normally"});
		} else if (queueSkip) {
			queue.setRepeatMode(2);
			await interaction.reply({ content: "🔂 | Repeating the queue"});
        } else {
            queue.setRepeatMode(1);
            await interaction.reply({ content: "🔁 | Repeating the current song"});
        }
	},
};