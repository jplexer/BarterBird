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
        queueList.push("Now Playing: " + queue.currentTrack.title + " - " + queue.currentTrack.author + " (" + queue.currentTrack.duration + ")");
        for (var i = 0; i < queue.tracks.toArray().length; i++) {
            queueList.push((i + 1) + ". " + queue.tracks.toArray()[i].title + " - " + queue.tracks.toArray()[i].author + " (" + queue.tracks.toArray()[i].duration + ")");
        }

        // Split the queueList into chunks of 2000 characters
        var chunk = "";
        var firstMessage = true;
        for (var i = 0; i < queueList.length; i++) {
            if ((chunk.length + queueList[i].length + 4) > 2000) { // +4 for "\n" and "```"
                if (firstMessage) {
                    await interaction.reply({ content: "```" + chunk + "```" });
                    firstMessage = false;
                } else {
                    await interaction.followUp({ content: "```" + chunk + "```" });
                }
                chunk = queueList[i];
            } else {
                chunk += "\n" + queueList[i];
            }
        }
        if (chunk.length > 0) {
            if (firstMessage) {
                await interaction.reply({ content: "```" + chunk + "```" });
            } else {
                await interaction.followUp({ content: "```" + chunk + "```" });
            }
        }
    },
};