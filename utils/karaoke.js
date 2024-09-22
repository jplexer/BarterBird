// karaoke.js

const karaokeState = {};


function setKaraokeState(guildId, state, threadId) {
    karaokeState[guildId] = {
        state: state,
        thread: thread
    };
}

function getKaraokeState(guildId) {
    return karaokeState[guildId] || { state: false, thread: null };
}

module.exports = {
    setKaraokeState,
    getKaraokeState
};