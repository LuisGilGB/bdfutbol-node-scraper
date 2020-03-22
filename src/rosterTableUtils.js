const {
    BASE_URL,
    POS_MAP,
    ROSTER_COLUMNS: {PLAYER_NAME_COL}
} = require('./consts.js');

const isPlayerRow = (r, i) => (i > 0 && i < 12) || i > 14;
const getIdFromHref = href => href.split('/').reverse()[0].split('.')[0];
const getAlias = tds => tds[PLAYER_NAME_COL].childNodes[0].childNodes[0].childNodes[0].textContent;
const getCompleteName = tds => tds[PLAYER_NAME_COL].childNodes[0].childNodes[0].childNodes[1].textContent;
const getBdFutbolId = tds => getIdFromHref(tds[PLAYER_NAME_COL].childNodes[0].childNodes[0].href);
const getPicUrl = r => r.querySelector('img').src.replace('/m/', '/j/').replace('../../', BASE_URL).replace('.png', '.jpg');
const getPosition = r => POS_MAP[Object.keys(POS_MAP).find(k => r.querySelector(`.${k}`))];

const getPlayerDataFromRow = r => {
    const tds = r.querySelectorAll('td');
    return {
        position: getPosition(r),
        alias: getAlias(tds),
        completeName: getCompleteName(tds),
        bdFutbolId: getBdFutbolId(tds),
        picUrl: getPicUrl(r)
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