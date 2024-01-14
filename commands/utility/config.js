const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits } = require('discord-api-types/v10');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('config')
		.setDescription('change the config of the bot')
        //only let people with the manage messages permission use this command
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addSubcommand(subcommand =>
            subcommand
                .setName('searchprovider')
                .setDescription('change the search provider')
                .addIntegerOption(option => 
                    option.setName('provider')
                    .setDescription('Select the default search provider for the server')
                    .setRequired(true)
                    .addChoices(
                        { name: 'Spotify', value: 0 },
                        { name: 'Youtube', value: 1 },
                    ))
        ),
	async execute(interaction) {
        if (interaction.options.getSubcommand() === 'searchprovider') {
            const provider = interaction.options.getInteger('provider', true);
            if (provider === 0 || provider === 1) {
                const serverconfig = await interaction.client.serverconfig.findOne({ where: { serverId:  interaction.guildId} });
                if (serverconfig) {
                    await interaction.client.serverconfig.update({ searchProvider: provider }, { where: { serverId:  interaction.guildId} });
                } else {
                    await interaction.client.serverconfig.create({ serverId: interaction.guildId, searchProvider: provider });
                }
                var userProvider = undefined;
                if (provider === 0) {
                    userProvider = 'Spotify';
                } else if (provider === 1) {
                    userProvider = 'Youtube';
                }

                await interaction.reply({ content: `changed the search provider to ${userProvider}`, ephemeral: true });
            } else {
                await interaction.reply({ content: `invalid provider`, ephemeral: true });
            }
        } else {
            await interaction.reply({ content: `invalid subcommand`, ephemeral: true });
        }
	},
};