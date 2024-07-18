const { Events } = require('discord.js');

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		client.serverconfig.sync();
		client.userconfig.sync();
		console.log(`Ready! Logged in as ${client.user.tag}`);
	},
};