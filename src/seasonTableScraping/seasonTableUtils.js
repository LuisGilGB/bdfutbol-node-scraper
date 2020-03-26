const {
    BASE_URL,
    ES_SUBPATH,
    CLASSIFICATION_COLUMNS: {CLUB_CREST_COL, CLUB_NAME_COL}
} = require('../consts');

const isClubRow = r => r.getAttribute('ideq');

const getIdFromHref = href => href.split('/').reverse()[0].split('.')[0].slice(8);

const getAlias = tds => tds[CLUB_NAME_COL].childNodes[0].textContent;

const getBdFutbolId = tds => getIdFromHref(tds[CLUB_NAME_COL].childNodes[0].href);

const getPicUrl = tds => tds[CLUB_CREST_COL].querySelector('img').src.replace('/em/', '/eg/').replace('../../', BASE_URL);

const getRosterUrl = tds => tds[CLUB_NAME_COL].childNodes[0].href.replace('../', `${BASE_URL}${ES_SUBPATH}`);

const getClubDataFromRow = r => {
    const tds = r.querySelectorAll('td');
    return {
        alias: getAlias(tds),
        bdFutbolId: getBdFutbolId(tds),
        picUrl: getPicUrl(tds),
        rosterUrl: getRosterUrl(tds)
    }
}

const filterClubDataToSave = ({alias, bdFutbolId, picUrl}) => ({alias, bdFutbolId, picUrl});

module.exports = {
    isClubRow,
    getAlias,
    getBdFutbolId,
    getPicUrl,
    getRosterUrl,
    getClubDataFromRow,
    filterClubDataToSave
}