const { userconfig } = require('./db.js');
const { lastfm, listenbrainz } = require("../config.json");
const { lastfmScrobbler } = require('./scrobblers/lastfm.js');
const { listenbrainzScrobbler } = require('./scrobblers/listenbrainz.js');

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

                if (listenbrainz && userconf.listenbrainzToken) {
                    listenbrainzScrobbler.setNowPlaying(track, member, userconf.listenbrainzToken);
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

                if (listenbrainz && userconf.listenbrainzToken) {
                    listenbrainzScrobbler.scrobbleSong(track, member, userconf.listenbrainzToken);
                }
            }
        }
    });
}

module.exports = { setNowPlaying, scrobbleSong };