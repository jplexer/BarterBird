const { useMainPlayer } = require('discord-player');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('queue')
		.setDescription('view the queue'),
	async execute(interaction, client) {
		const player = useMainPlayer();
		var queue = player.nodes.get(interaction.guildId);
		if (!queue) {
			return interaction.reply({ content:'You are not connected to a voice channel!', ephemeral: true });
		}

		//return a list of songs in the queue as a code block
        var queueList = [];
        queueList.push("Now Playing: " + queue.currentTrack.title);
        for (var i = 0; i < queue.tracks.toArray().length; i++) {
            queueList.push((i + 1) + ". " + queue.tracks.toArray()[i].title);
        }
        await interaction.reply({ content: "```" + queueList.join("\n") + "```" });
	},
};