const { SlashCommandBuilder } = require('@discordjs/builders');
const { useMainPlayer } = require('discord-player');
const { getLyrics } = require('genius-lyrics-api');
const { genius_api_key } = require('../../confidentialconfig.json');
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
        // let's defer the interaction as things can take time to process
        await interaction.deferReply();

        const songLyrics = await getLyrics(
            {
                apiKey: genius_api_key,
                title: queue.currentTrack.title,
                artist: queue.currentTrack.author,
                optimizeQuery: true
            }
        )

        if (!songLyrics) {
            return interaction.editReply({ content: 'No lyrics found for this song.' });
        }

        // Split the lyrics into chunks of 2000 characters
        const chunks = songLyrics.match(/[\s\S]{1,1994}/g); // 2000 - 6 (for code block markdown)

        // Send each chunk as a separate message wrapped in code blocks
        for (const chunk of chunks) {
            await interaction.followUp({ content: `\`\`\`${chunk}\`\`\`` });
        }
	},
};