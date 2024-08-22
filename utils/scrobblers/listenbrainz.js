const { userconfig } = require('../db.js');
const axios = require('axios');
const { listenbrainzhost } = require('../../config.json');

let listenbrainzScrobbler = {

    setNowPlaying: function(track, member, userToken) {
        axios.post( listenbrainzhost + `/1/submit-listens`, {
            listen_type: 'playing_now',
            payload: [{
                track_metadata: {
                    artist_name: track.author,
                    track_name: track.title
                }
            }]
        }, {
            headers: {
                'Authorization': `Token ${userToken}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            console.log(response.data);
        })
        .catch(error => {
            console.log(error.response);
            if (error.response.status == 401) {
                // DM user to reauthenticate
                member.send(`Your Listenbrainz token is invalid. Please reauthenticate.`);
                // delete their userconf
                if (!user.lastfmSessionKey) {
                    userconfig.destroy({ where: { userId: member.id } });
                } else {
                    userconfig.update({ listenbrainzToken: null }, { where: { userId: member.id } });
                }
            }
        });
	},

	scrobbleSong: function(track, member, userToken) {
        axios.post( listenbrainzhost + `/1/submit-listens`, {
            listen_type: 'single',
            payload: [{
                listened_at: Math.floor(new Date().getTime() / 1000),
                track_metadata: {
                    artist_name: track.author,
                    track_name: track.title
                }
            }]
        }, {
            headers: {
                'Authorization': `Token ${userToken}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            console.log(response.data);
        })
        .catch(error => {
            console.log(error.response);
            if (error.response.status == 401) {
                // DM user to reauthenticate
                member.send(`Your Listenbrainz token is invalid. Please reauthenticate.`);
                // delete their userconf
                if (!user.lastfmSessionKey) {
					userconfig.destroy({ where: { userId: member.id } });
				} else {
					userconfig.update({ listenbrainzToken: null }, { where: { userId: member.id } });
				}
            }
        });
	}

}

module.exports = { listenbrainzScrobbler };