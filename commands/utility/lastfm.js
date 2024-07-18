const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits } = require('discord-api-types/v10');
const axios = require('axios');
const crypto = require('crypto');

const { lastfm_api_key, lastfm_api_secret } = require('../../confidentialconfig.json');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('lastfm')
		.setDescription('configure your lastfm settings')
        .addSubcommand(subcommand =>
            subcommand
                .setName('login')
                .setDescription('login to lastfm')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('logout')
                .setDescription('logout from lastfm')
        ),
	async execute(interaction) {
        if (interaction.options.getSubcommand() === 'login') {
            var method = 'auth.gettoken';
            var signature = crypto.createHash('md5').update(`api_key${lastfm_api_key}method${method}${lastfm_api_secret}`).digest('hex');
            var token;

            await axios.get(`http://ws.audioscrobbler.com/2.0/?method=auth.gettoken&api_key=${lastfm_api_key}&format=json&api_sig=${signature}`)
                  .then(response => {
                      token = response.data.token;
                  })
                  .catch(error => {
                      interaction.reply({ content: `An error occured, please try again`, ephemeral: true });
                  });

                const done = new ButtonBuilder()
                        .setCustomId('confirm')
	                    .setLabel('Done')
	                    .setStyle(3);
                    
                const cancel = new ButtonBuilder()
                        .setCustomId('cancel')
                        .setLabel('Cancel')
                        .setStyle(4);

                const row = new ActionRowBuilder()
                        .addComponents(done, cancel);

                const response = await interaction.reply({ content: `[Click this link](<http://www.last.fm/api/auth/?api_key=${lastfm_api_key}&token=${token}>) to login to last.fm. When you are done press Done.`, components: [row], ephemeral: true });

                const collectorFilter = i => i.user.id === interaction.user.id;

                try {
	                const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 180000 });

                    if (confirmation.customId === 'confirm') {
                        var method = 'auth.getsession';
                        var signature = crypto.createHash('md5').update(`api_key${lastfm_api_key}method${method}token${token}${lastfm_api_secret}`).digest('hex');

                        var session;
                        await axios.get(`http://ws.audioscrobbler.com/2.0/?method=auth.getsession&api_key=${lastfm_api_key}&token=${token}&format=json&api_sig=${signature}`)
                        .then(response => {
                            session = response.data.session.key;
                        })
                        .catch(error => {
                            console.log(error);
                            confirmation.update({ content: `An error occured, please try again`, components: [], ephemeral: true });
                        });
                        if (session) {
                            const userconfig = await interaction.client.userconfig.findOne({ where: { userId:  interaction.user.id} });

                            if (userconfig) {
                                await interaction.client.userconfig.update({ lastfmSessionKey: session }, { where: { userId:  interaction.user.id} });
                            } else {
                                await interaction.client.userconfig.create({ userId:  interaction.user.id, lastfmSessionKey: session });
                            }

                            await confirmation.update({ content: `Login successful`, components: [], ephemeral: true });
                        }
                    } else if (confirmation.customId === 'cancel') {
                        await confirmation.update({ content: `Login cancelled.`, components: [], ephemeral: true });
                    }
                } catch (e) {
                    console.error(e);
	                await interaction.editReply({ content: "Login hasn't happened within 3 minutes, cancelling", components: [], ephemeral: true });
                }
        } else if (interaction.options.getSubcommand() === 'logout') {
            const userconfig = await interaction.client.userconfig.findOne({ where: { userId:  interaction.user.id} });

            if (userconfig) {
                await interaction.client.userconfig.destroy({ where: { userId:  interaction.user.id} });
                await interaction.reply({ content: `Logout successful`, ephemeral: true });
            } else {
                await interaction.reply({ content: `You are not logged in`, ephemeral: true });
            }
        } else {
            await interaction.reply({ content: `invalid subcommand`, ephemeral: true });
        }
	},
};