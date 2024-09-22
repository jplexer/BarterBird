const { SlashCommandBuilder } = require('@discordjs/builders');
const { useMainPlayer } = require('discord-player');
const { getKaraokeState, setKaraokeState } = require('../../utils/karaoke');
const { ThreadAutoArchiveDuration } = require('discord.js');
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

        if (getKaraokeState(queue.guild.id).karaoke) {
            getKaraokeState(queue.guild.id).thread.send({
                content: 'Karaoke mode disabled. Thank you for singing!'
            });
            setKaraokeState(queue.guild.id, false, null);
            return interaction.reply({ content: 'Karaoke mode disabled', ephemeral: true });
        } else {
            if (queue.metadata.channel.type === 2) {
                return interaction.reply({ content: 'Karaoke mode is not supported in voice-text channels.', ephemeral: true });
            }
            if (queue.metadata.channel.type === 0) {
                var thread = await queue.metadata.channel.threads.create({
                    name: 'Karaoke Session - ' + Date.now(),
                    autoArchiveDuration: ThreadAutoArchiveDuration.OneHour,
                    reason: 'Karaoke Session',
                });
                setKaraokeState(queue.guild.id, true, thread);

                queue.insertTrack(queue.currentTrack, 0);
                queue.node.skip();
                return interaction.reply({ content: 'Karaoke mode enabled!', ephemeral: true });
            } else {
                return interaction.reply({ content: 'Karaoke mode is not supported in this channel.', ephemeral: true });
            }
        }
	},
};