const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits } = require('discord-api-types/v10');
const axios = require('axios');
const crypto = require('crypto');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('listenbrainz')
		.setDescription('configure your listenbrainz settings')
        .addSubcommand(subcommand =>
            subcommand
                .setName('login')
                .setDescription('login to listenbrainz')
                .addStringOption(option =>
                    option.setName('token')
                        .setDescription('your listenbrainz token from https://listenbrainz.org/settings/')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('logout')
                .setDescription('logout from listenbrainz')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('toggleyoutube')
                .setDescription('toggle Youtube Scrobbling (not recommended)')
        )
        .addSubcommand(subcommand =>
            subcommand
            .setName('togglescrobbling')
            .setDescription('toggle scrobbling on or off')
        ),

	async execute(interaction) {
        if (interaction.options.getSubcommand() === 'login') {
            
            const userconfig = await interaction.client.userconfig.findOne({ where: { userId:  interaction.user.id} });
            if (userconfig) {
                await interaction.client.userconfig.update({ listenbrainzToken: interaction.options.getString('token') }, { where: { userId:  interaction.user.id} });
                await interaction.reply({ content: `Login successful`, ephemeral: true });
            } else {
                await interaction.client.userconfig.create({ userId: interaction.user.id, listenbrainzToken: interaction.options.getString('token') });
                await interaction.reply({ content: `Login successful`, ephemeral: true });
            }

        } else if (interaction.options.getSubcommand() === 'logout') {
            const userconfig = await interaction.client.userconfig.findOne({ where: { userId:  interaction.user.id} });

            if (userconfig) {
                if (!userconfig.lastfmSessionKey) {
                    await interaction.client.userconfig.destroy({ where: { userId: interaction.user.id } });
                    await interaction.reply({ content: `Logout successful`, ephemeral: true });
                } else {
                    await interaction.client.userconfig.update({ lastfmSessionKey: null }, { where: { userId: interaction.user.id } });
                    await interaction.reply({ content: `Logout successful`, ephemeral: true });
                }
            } else {
                await interaction.reply({ content: `You are not logged in`, ephemeral: true });
            }
        } else if (interaction.options.getSubcommand() === 'toggleyoutube') {
            const userconfig = await interaction.client.userconfig.findOne({ where: { userId:  interaction.user.id} });

            if (userconfig && userconfig.listenbrainzToken) {
                await interaction.client.userconfig.update({ youtubeScrobble: !userconfig.youtubeScrobble }, { where: { userId:  interaction.user.id} });
                await interaction.reply({ content: `Youtube Scrobbling ${userconfig.youtubeScrobble ? 'disabled' : 'enabled'}`, ephemeral: true });
            } else {
                await interaction.reply({ content: `You are not logged in`, ephemeral: true });
            }

        } else if (interaction.options.getSubcommand() === 'togglescrobbling') {
            const userconfig = await interaction.client.userconfig.findOne({ where: { userId:  interaction.user.id} });
            if (userconfig && userconfig.listenbrainzToken) {
                await interaction.client.userconfig.update({ scrobblingEnabled: !userconfig.scrobblingEnabled }, { where: { userId:  interaction.user.id} });
                await interaction.reply({ content: `Scrobbling ${userconfig.scrobblingEnabled ? 'disabled' : 'enabled'}`, ephemeral: true });
            } else {
                await interaction.reply({ content: `You are not logged in`, ephemeral: true });
            }

        }else {
            await interaction.reply({ content: `invalid subcommand`, ephemeral: true });
        }
	},
};