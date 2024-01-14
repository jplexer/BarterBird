const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, EmbedBuilder } = require('discord.js');
const { color, name, githubRepo} = require('../../config.json');
const { version } = require('../../package.json');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('I need somebody!'),
		async execute(interaction) {
			let embed = new EmbedBuilder();
				embed.setTitle( name+ " Help");
				embed.setDescription("Here are some things you can try.");
				embed.setColor(color);
				embed.addFields([
					{ name: "Play", value: "Play a song or playlist. Use `/play <link or name>`"},
					{ name: "Skip", value: "Skip the current song. Use `/skip`"},
					{ name: "Stop", value: "Stop the music and leave the voice channel. Use `/stop`"},
					{ name: "Queue", value: "View the current queue. Use `/queue`"},
					{ name: "Remove", value: "Remove a song from the queue. Use `/remove <number>`"},
				])
				embed.setFooter({text: `${name} ${version}`});
				await interaction.reply({ embeds: [embed] });
	},
};