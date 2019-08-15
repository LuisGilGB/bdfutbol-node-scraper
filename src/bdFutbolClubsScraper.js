const rp = require('request-promise');
const fs = require('fs');
const path = require('path');
const jsdom = require('jsdom');
const rosterScraper = require('./bdFutbolRosterScraper.js');
const consts = require('./consts.js');

const {
    BASE_URL,
    ES_SUBPATH,
    MIN_GAMES,
    CLASSIFICATION_COLUMNS,
    playerDorsalColIndex,
    playerGamesPlayedColIndex
} = consts;

const {
    CLUB_NAME_COL
} = CLASSIFICATION_COLUMNS;

const {JSDOM} = jsdom;

const url = 'https://www.bdfutbol.com/es/t/t2018-19.html';

const returnEmptyIfInvalid = t => t && t !== String.fromCharCode(160) ? t : '';

const getDorsal = r => returnEmptyIfInvalid(r.childNodes[playerDorsalColIndex].textContent);

const getGames = r => r.childNodes[playerGamesPlayedColIndex].childNodes[0].textContent;

const filterIrrelevantPlayers = r => !((r.querySelector('.filial') || !getDorsal(r)) && +(getGames(r)) < MIN_GAMES);

const bdFutbolClubsScraper = page => {
    const pageDom = new JSDOM(page);
    const rawRows = pageDom.window.document.querySelectorAll('#classific tr');
    const rows = [...rawRows];

    const isClubRow = r => r.getAttribute('ideq');
    const getIdFromHref = href => href.split('/').reverse()[0].split('.')[0].slice(8);
    const getAlias = r => r.querySelector('.aligesq a').textContent;
    const getBdFutbolId = r => getIdFromHref(r.querySelector('.aligesq a').href);
    const getPicUrl = r => r.querySelectorAll('td')[2].querySelector('img').src.replace('/em/', '/eg/').replace('../../', BASE_URL);
    const getRosterUrl = r => r.querySelectorAll('td')[CLUB_NAME_COL].childNodes[0].href.replace('../', `${BASE_URL}${ES_SUBPATH}`);

    const clubs = rows.filter(isClubRow);

    Promise.all(clubs.map(c => rp(getRosterUrl(c))))
        .then(clubPages => {
            const clubPlayers = clubPages.map(cP => rosterScraper(cP, filterIrrelevantPlayers));
            const players = clubPlayers.reduce((a0, pArr) => [...a0, ...pArr], [])
                                    .filter((p, i, a) => a.findIndex(up => up.bdFutbolId === p.bdFutbolId) === i);

            console.log('We got all the players!!!');

            fs.writeFile(path.join(__dirname, '../output/players.json'), JSON.stringify(players, null, '  '), err => {
                console.log(err || 'Scraped data was successfully written to players.json in the output folder!!');
            });
        })
        .catch(err => console.log(err));

    return rows.filter(isClubRow)
               .map(r => ({
                    alias: getAlias(r),
                    bdFutbolId: getBdFutbolId(r),
                    picUrl: getPicUrl(r)
               }));
}

const scraper = () => {
    rp(url).then(html => {
        const scrapedData = bdFutbolClubsScraper(html);
        console.log('The classification page was successfully scraped');
        fs.writeFile(path.join(__dirname, '../output/clubs.json'), JSON.stringify(scrapedData, null, '  '), err => {
            console.log(err || 'Scraped data was succesfully written to clubs.json in the output folder!!');
        })
    }).catch(err => console.log(err));
}

module.exports = scraper;