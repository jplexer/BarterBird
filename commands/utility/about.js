const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, EmbedBuilder } = require('discord.js');
const { color, name, githubRepo} = require('../../config.json');
const { version } = require('../../package.json');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('about')
		.setDescription('about the bot'),
	async execute(interaction) {
		let embed = new EmbedBuilder();
        embed.setTitle(`About ${name}`);
        embed.setDescription("BarterBird is a easy to use, open source, music bot for Discord.");
        embed.setColor(color);
		embed.addFields([
			{ name: "License", value: `This bot is licensed under the GNU General Public License v3.0. You can find the full license [here](https://github.com/${githubRepo}/blob/master/LICENSE).`},
			{ name: "Source Code", value: `The source code for this bot is available on [GitHub](https://github.com/${githubRepo}).`},
		])
		embed.setFooter({text: `${name} ${version}`});
		await interaction.reply({ embeds: [embed] });
	},
};