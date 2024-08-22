const { userconfig } = require('../db.js');
const axios = require('axios');
const crypto = require('crypto');
const { lastfm_api_key, lastfm_api_secret } = require('../../confidentialconfig.json');

let lastfmScrobbler = {

	setNowPlaying: function(track, member, session_key) {
		var method = 'track.updateNowPlaying';
		var signature = crypto.createHash('md5').update(`api_key${lastfm_api_key}artist${track.author}method${method}sk${session_key}track${track.title}${lastfm_api_secret}`).digest('hex');
		axios.post(`http://ws.audioscrobbler.com/2.0/?method=track.updateNowPlaying&api_key=${lastfm_api_key}&artist=${track.author}&track=${track.title}&sk=${session_key}&format=json&api_sig=${signature}`)
		.catch(error => {
			if (error.response.data.error == 9) {
				// DM user to reauthenticate
				member.send(`Your Last.fm session key is invalid. Please reauthenticate.`);
				// delete their userconf
				userconfig.destroy({ where: { userId: member.id } });
			}
		});
	},

	scrobbleSong: function(track, member, session_key) {
		var timestamp = Math.floor(new Date().getTime() / 1000);
		//var chosenByUser = member.id == queue.metadata.user.id ? 1 : 0;
		var method = 'track.scrobble';
		var signature = crypto.createHash('md5').update(`api_key${lastfm_api_key}artist${track.author}method${method}sk${session_key}timestamp${timestamp}track${track.title}${lastfm_api_secret}`).digest('hex');
		axios.post(`http://ws.audioscrobbler.com/2.0/?format=json&method=track.scrobble&api_key=${lastfm_api_key}&artist=${track.author}&track=${track.title}&timestamp=${timestamp}&sk=${session_key}&api_sig=${signature}`)
		.catch(error => {
			if (error.response.data.error == 9) {
				// DM user to reauthenticate
				member.send(`Your Last.fm session key is invalid. Please reauthenticate.`);
				// delete their userconf
				userconfig.destroy({ where: { userId: member.id } });
			}
		});
	}

}

module.exports = { lastfmScrobbler };