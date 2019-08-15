const fs = require('fs');
const path = require('path');
const jsdom = require('jsdom');
const consts = require('./consts.js');

const {
    BASE_URL,
    ES_SUBPATH,
    ROSTER_TABLE_ID,
    POS_MAP,
    ROSTER_COLUMNS
} = consts;

const {
    PLAYER_DORSAL_COL,
    PLAYER_PIC_COL,
    PLAYER_FLAG_COL,
    PLAYER_NAME_COL,
    PLAYER_POSITION,
    PLAYER_AGE,
    PLAYER_GAMES_PLAYED
} = ROSTER_COLUMNS;

const {JSDOM} = jsdom;

const bdFutbolRosterScraper = (page, playerRowCustomFilter) => {
    const pageEl = new JSDOM(page).window.document;
    const rawRows = pageEl.querySelectorAll(`#${ROSTER_TABLE_ID} tr`);
    const rows = [...rawRows];

    const isPlayerRow = (r, i) => (i > 0 && i < 12) || i > 14;
    const getIdFromHref = href => href.split('/').reverse()[0].split('.')[0];
    const getAlias = r => r.querySelectorAll('td')[PLAYER_NAME_COL].nodeChildren[0].nodeChildren[0].textContent;
    const getCompleteName = r => r.querySelectorAll('td')[PLAYER_NAME_COL].nodeChildren[0].nodeChildren[1].textContent;
    const getBdFutbolId = r => getIdFromHref(r.querySelector('.aligesq a').href);
    const getPicUrl = r => r.querySelector('img').src.replace('/m/', '/j/').replace('../../', BASE_URL);
    const getPosition = r => POS_MAP[Object.keys(POS_MAP).find(k => r.querySelector(`.${k}`))];

    return rows.filter(r => isPlayerRow(r))
                .filter((r,i,a) => playerRowCustomFilter ? playerRowCustomFilter(r,i,a) : true)
                .map(r => ({
                    position: getPosition(r),
                    alias: getAlias(r),
                    completeName: getCompleteName(r),
                    bdFutbolId: getBdFutbolId(r),
                    picUrl: getPicUrl(r)
                }));
}

const scraper = (page, playerRowCustomFilter) => {
    const scrapedData = bdFutbolRosterScraper(page, playerRowCustomFilter);
    console.log('Roster page was scraped successfully.');
    //fs.writeFile(path.join(__dirname, '../output/players.json'), JSON.stringify(scrapedData), err => {
    //    console.log(err || 'Scraped data was successfully written to players.json in the output folder!!');
    //});
    return scrapedData;
}

module.exports = scraper;