const {getFromReverseIndex, restrictBottomToZero} = require('./utils');
const {
    BASE_URL,
    POS_MAP,
    ROSTER_COLUMNS: {
        PLAYER_NAME_COL,
        PLAYER_GAMES_PLAYED,
        PLAYER_GAME_STARTINGS,
        PLAYER_GAMES_COMPLETED,
        PLAYER_YELLOW_CARDS_REVERSE,
        PLAYER_RED_CARDS_REVERSE,
        PLAYER_GOALS_REVERSE
    }
} = require('./consts.js');


const isPlayerRow = (r, i) => ((i > 0 && i < 12) || i > 14) && r.querySelectorAll('td').length > 7;
const getImage = r => r.querySelector('img');
const getIdFromHref = href => href.split('/').reverse()[0].split('.')[0];
const getLastColsSelAndFormat = (tds, reverseIndex) => restrictBottomToZero(getFromReverseIndex(tds, reverseIndex).childNodes[0].textContent);
const getAlias = tds => tds[PLAYER_NAME_COL].childNodes[0].childNodes[0].childNodes[0].textContent;
const getCompleteName = tds => tds[PLAYER_NAME_COL].childNodes[0].childNodes[0].childNodes[1].textContent;
const getBdFutbolId = tds => getIdFromHref(tds[PLAYER_NAME_COL].childNodes[0].childNodes[0].href);
const getUrlFromImageIfExists = img => img ? img.src.replace('/m/', '/j/').replace('../../', BASE_URL).replace('.png', '.jpg') : '';
const getPicUrl = r => getUrlFromImageIfExists(getImage(r));
const getPosition = r => POS_MAP[Object.keys(POS_MAP).find(k => r.querySelector(`.${k}`))];
const getGamesPlayed = tds => +(tds[PLAYER_GAMES_PLAYED].childNodes[0].textContent);
const getGameStartings = tds => +(tds[PLAYER_GAME_STARTINGS].childNodes[0].textContent);
const getGamesCompleted = tds => +(tds[PLAYER_GAMES_COMPLETED].childNodes[0].textContent);
const getYellowCards = tds => getLastColsSelAndFormat(tds, PLAYER_YELLOW_CARDS_REVERSE);
const getRedCards = tds => getLastColsSelAndFormat(tds, PLAYER_RED_CARDS_REVERSE);
const getGoals = tds => getLastColsSelAndFormat(tds, PLAYER_GOALS_REVERSE);

const getPlayerDataFromRow = r => {
    const tds = [...(r.querySelectorAll('td'))];
    return {
        position: getPosition(r),
        alias: getAlias(tds),
        completeName: getCompleteName(tds),
        bdFutbolId: getBdFutbolId(tds),
        picUrl: getPicUrl(r),
        gamesPlayed: getGamesPlayed(tds),
        gameStartings: getGameStartings(tds),
        gamesCompleted: getGamesCompleted(tds),
        yellowCards: getYellowCards(tds),
        redCards: getRedCards(tds),
        goals: getGoals(tds)
    }
}

module.exports = {
    isPlayerRow,
    getAlias,
    getCompleteName,
    getBdFutbolId,
    getPicUrl,
    getPosition,
    getPlayerDataFromRow
}