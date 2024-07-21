const { useMainPlayer } = require('discord-player');
const { SlashCommandBuilder } = require('discord.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('playfile')
		.setDescription('Play a file!')
        .addAttachmentOption(option => option.setName('file').setDescription('The file to play').setRequired(true)),
	async execute(interaction) {
        const player = useMainPlayer();
        const channel = interaction.member.voice.channel;
        if (!channel) return interaction.reply({ content:'You are not connected to a voice channel!', ephemeral: true }); // make sure we have a voice channel
       
        const file = interaction.options.getAttachment('file', true); // we need input/query to play
        const query = file.url;
        
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
            return interaction.followUp(`**${track.title}** enqueued!`);

        } catch (e) {
            // let's return error if something failed
            return interaction.followUp(`Something went wrong: ${e}`);
        }
    },
};