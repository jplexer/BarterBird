const { useMainPlayer } = require('discord-player');
const { SlashCommandBuilder } = require('discord.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Play some music!')
        .addStringOption(option => option.setName('query').setDescription('Link or Name').setRequired(true))
        .addIntegerOption(option => option.setName('searchprovider').setDescription('Select what service to search with').addChoices(
            { name: 'Spotify', value: 0 },
            { name: 'Youtube', value: 1 },
        ).setRequired(false)),
	async execute(interaction) {
        const player = useMainPlayer();
        const channel = interaction.member.voice.channel;
        if (!channel) return interaction.reply({ content:'You are not connected to a voice channel!', ephemeral: true }); // make sure we have a voice channel
        const query = interaction.options.getString('query', true); // we need input/query to play
        
        // let's defer the interaction as things can take time to process
        await interaction.deferReply();
    
        // let's check if the server has specified a search provider in the config
        const serverconfig = await interaction.client.serverconfig.findOne({ where: { serverId:  interaction.guildId} });

        // if the serverconfig exists, get the search provider
        if (serverconfig) {
            var searchProvider = serverconfig.get("searchProvider");
        }

        // if the user has specified a search provider, use that instead
        if (interaction.options.getInteger('searchprovider')) {
            searchProvider = interaction.options.getInteger('searchprovider');
        }

        var searchEngine = searchProvider !== 0 ? searchProvider : undefined;

        if (searchEngine !== undefined) {
            if (searchEngine === 1) {
                searchEngine = 'youtubeSearch';
            }
        } else {
            searchEngine = 'spotifySearch';
        }
        
        // if the query is a link, do not use search engine
        if (query.startsWith('http')) {
            searchEngine = "auto";
        }


        try {
            const { track } = await player.play(channel, query, {
                nodeOptions: {
                    // nodeOptions are the options for guild node (aka your queue in simple word)
                    metadata: interaction // we can access this metadata object using queue.metadata later on 
                },
                searchEngine: searchEngine,
            });

            // let's reply with the track info
            if(track.playlist) {
                if (track.playlist.type === 'album') {
                    return interaction.followUp(`Album **${track.playlist.title}** by **${track.author}** enqueued!`);
                }
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