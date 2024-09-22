// karaoke.js

const karaokeState = {};


function setKaraokeState(guildId, state, thread) {
    karaokeState[guildId] = {
        karaoke: state,
        thread: thread
    };
}

function getKaraokeState(guildId) {
    return karaokeState[guildId] || { karaoke: false, thread: null };
}

module.exports = {
    setKaraokeState,
    getKaraokeState
};