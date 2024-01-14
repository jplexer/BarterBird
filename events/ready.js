const { Events } = require('discord.js');

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		client.serverconfig.sync();
		console.log(`Ready! Logged in as ${client.user.tag}`);
	},
};