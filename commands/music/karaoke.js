const { SlashCommandBuilder } = require('@discordjs/builders');
const { useMainPlayer } = require('discord-player');
module.exports = {
	data: new SlashCommandBuilder()
        .setName('karaoke')
        .setDescription('toggle karaoke mode'),
	async execute(interaction) {
        const player = useMainPlayer();
		var queue = player.nodes.get(interaction.guildId);
		if (!queue) {
			return interaction.reply({ content:'You are not connected to a voice channel!', ephemeral: true });
		}

        if (queue.metadata.karaoke) {
            queue.metadata.karaoke = false;
            queue.metadata.thread.send({
                content: 'Karaoke mode disabled. Thank you for singing!'
            });
            queue.metadata.thread = null;
            return interaction.reply({ content: 'Karaoke mode disabled', ephemeral: true });
        } else {
            if (queue.metadata.channel.type === 2) {
                return interaction.reply({ content: 'Karaoke mode is not supported in voice-text channels.', ephemeral: true });
            }
            queue.metadata.karaoke = true;
            queue.insertTrack(queue.currentTrack, 0);
            queue.node.skip();
            return interaction.reply({ content: 'Karaoke mode enabled!', ephemeral: true });
        }
	},
};