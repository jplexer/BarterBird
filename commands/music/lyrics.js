const { SlashCommandBuilder } = require('@discordjs/builders');
const { useMainPlayer } = require('discord-player');
module.exports = {
	data: new SlashCommandBuilder()
        .setName('lyrics')
        .setDescription('for those who want to sing along'),
	async execute(interaction) {
        const player = useMainPlayer();
		var queue = player.nodes.get(interaction.guildId);
		if (!queue) {
			return interaction.reply({ content:'You are not connected to a voice channel!', ephemeral: true });
		}

        await interaction.deferReply();

        const lyrics = await player.lyrics.search({
            q: queue.currentTrack.title + ' ' + queue.currentTrack.author,
        }); // this is a lot better than genius but sometimes gives weird result, specify artistName as well in such situations
        
        if (!lyrics.length) return interaction.followUp({ content: 'No lyrics found', ephemeral: true });
        
        // Split the lyrics into chunks of 2000 characters
        const chunks = lyrics[0].plainLyrics.match(/[\s\S]{1,1994}/g); // 2000 - 6 (for code block markdown)

        // Send each chunk as a separate message wrapped in code blocks
        for (const chunk of chunks) {
            await interaction.followUp({ content: `\`\`\`${chunk}\`\`\`` });
        }
	},
};