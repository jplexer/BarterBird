const { userconfig } = require('./db.js');
const { lastfm } = require("../config.json");
const { lastfmScrobbler } = require('./scrobblers/lastfm.js');

function checkRequirements(track, member, userconf) {
    if (!userconf.youtubeScrobble && track.source == 'youtube') {
        return false;
    }

    if (!userconf.scrobblingEnabled) {
        return false;
    }

    if (track.source == 'arbitrary') {
        return false;
    }

    if (member.voice.deaf) {
        return false;
    }

    return true;
}

function setNowPlaying(track, member) {
    userconfig.findOne({ where: { userId: member.id } }).then(userconf => {
		if (userconf) {
            if (checkRequirements(track, member, userconf)) {
                if (lastfm && userconf.lastfmSessionKey) {
                    lastfmScrobbler.setNowPlaying(track, member, userconf.lastfmSessionKey);
                }
            }
        }
    });
}

function scrobbleSong(track, member) {
    userconfig.findOne({ where: { userId: member.id } }).then(userconf => {
		if (userconf) {
            if (checkRequirements(track, member, userconf)) {
                if (lastfm && userconf.lastfmSessionKey) {
                    lastfmScrobbler.scrobbleSong(track, member, userconf.lastfmSessionKey);
                    
                }
            }
        }
    });
}

module.exports = { setNowPlaying, scrobbleSong };