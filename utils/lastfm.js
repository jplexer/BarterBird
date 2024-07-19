const { userconfig } = require('../utils/db.js');
const axios = require('axios');
const crypto = require('crypto');
const { lastfm_api_key, lastfm_api_secret } = require('../confidentialconfig.json');

function setNowPlaying(track, member) {
	var method = 'track.updateNowPlaying';
	userconfig.findOne({ where: { userId: member.id } }).then(userconf => {
		if (userconf) {
			if (!userconf.youtubeScrobble && track.source == 'youtube') {
				return;
			}
			if (track.source == 'arbitrary') {
				return;
			}
			var session_key = userconf.lastfmSessionKey;
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
		}
	});
}

function scrobbleSong(track, member) {
	var method = 'track.scrobble';
	userconfig.findOne({ where: { userId: member.id } }).then(userconf => {
		if (userconf) {
			if (!userconf.youtubeScrobble && track.source == 'youtube') {
				return;
			}
			if (track.source == 'arbitrary') {
				return;
			}
			var session_key = userconf.lastfmSessionKey;
			var timestamp = Math.floor(new Date().getTime() / 1000);
			//var chosenByUser = member.id == queue.metadata.user.id ? 1 : 0;
			var signature = crypto.createHash('md5').update(`api_key${lastfm_api_key}artist${track.author}method${method}sk${session_key}timestamp${timestamp}track${track.title}${lastfm_api_secret}`).digest('hex');
			axios.post(`http://ws.audioscrobbler.com/2.0/?format=json&method=track.scrobble&api_key=${lastfm_api_key}&artist=${track.author}&track=${track.title}&timestamp=${timestamp}&sk=${session_key}&api_sig=${signature}`)
			.then(response => {
			})
			.catch(error => {
				if (error.response.data.error == 9) {
					// DM user to reauthenticate
					member.send(`Your Last.fm session key is invalid. Please reauthenticate.`);
					// delete their userconf
					userconfig.destroy({ where: { userId: member.id } });
				}
			});
		}
	});
}

module.exports = { setNowPlaying, scrobbleSong };