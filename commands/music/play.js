const { useMainPlayer } = require('discord-player');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Play some music!')
        .addStringOption(option => option.setName('query').setDescription('Link or Name').setRequired(true)),
	async execute(interaction) {
        const player = useMainPlayer();
        const channel = interaction.member.voice.channel;
        if (!channel) return interaction.reply({ content:'You are not connected to a voice channel!', ephemeral: true }); // make sure we have a voice channel
        const query = interaction.options.getString('query', true); // we need input/query to play
    
        // let's defer the interaction as things can take time to process
        await interaction.deferReply();
    
        try {
            const { track } = await player.play(channel, query, {
                nodeOptions: {
                    // nodeOptions are the options for guild node (aka your queue in simple word)
                    metadata: interaction // we can access this metadata object using queue.metadata later on 
                }
            });

            // let's reply with the track info
            if (track.playlist.type === 'album') {
                return interaction.followUp(`Album **${track.playlist.title}** by **${track.author}** enqueued!`);
            } else if(track.playlist) {
                return interaction.followUp({ content: `Playlist **${track.playlist.title}** with **${track.playlist.tracks.length}** tracks enqueued!`});
            }  else {
                return interaction.followUp(`**${track.title}** by **${track.author}** enqueued!`);
            }

        } catch (e) {
            // let's return error if something failed
            return interaction.followUp(`Something went wrong: ${e}`);
        }
    },
};