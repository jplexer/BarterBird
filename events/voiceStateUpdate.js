const { Events } = require('discord.js');
const { setNowPlaying } = require('../utils/lastfm.js');
const { useMainPlayer } = require('discord-player');
const { lastfm } = require("../config.json");

module.exports = {
	name: Events.VoiceStateUpdate,
	async execute(oldState, newState) {
        if (oldState.member.user.bot) return;
        if (newState.member.user.bot) return;
        if (newState.channelId === null) {
            return;
        } else if (oldState.channelId === null || oldState.channelId !== newState.channelId) {
            if (lastfm) {
                // check if new channel is the same the bot is in
                // if so, setNowPlayer for the new user
                const botVoiceChannelId = newState.guild.voiceStates.cache.get(newState.client.user.id)?.channelId;
                if (newState.channelId === botVoiceChannelId) {
                    const player = useMainPlayer();
                    const queue = player.nodes.get(newState.guild.id);
                    if (queue) {
                       const track = queue.currentTrack;
                        setNowPlaying(track, newState.member);
                    }
                }
            }        
        }
	},
};
