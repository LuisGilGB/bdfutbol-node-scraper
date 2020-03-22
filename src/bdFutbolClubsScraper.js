const fs = require('fs-extra');
const rp = require('request-promise');
const path = require('path');
const jsdom = require('jsdom');
const rosterScraper = require('./bdFutbolRosterScraper.js');
const consts = require('./consts.js');
const {
    readFilePromise,
    constrainYear,
    getSeasonCode,
    getSeasonLocalPathFromCode,
    getSeasonLinkFromCode,
    getSeasonClubRosterLocalPath
} = require('./utils');
const {
    isClubRow,
    getBdFutbolId,
    getRosterUrl,
    getClubDataFromRow,
    filterClubDataToSave
} = require('./seasonTableUtils');

const {
    BASE_URL,
    ES_SUBPATH,
    LAST_STARTING_YEAR,
    MIN_GAMES,
    CLASSIFICATION_COLUMNS,
    ROSTER_COLUMNS
} = consts;

const {
    CLUB_CREST_COL,
    CLUB_NAME_COL
} = CLASSIFICATION_COLUMNS;

const {
    PLAYER_DORSAL_COL,
    PLAYER_GAMES_PLAYED
} = ROSTER_COLUMNS;

const {JSDOM} = jsdom;

const returnEmptyIfInvalid = t => t && t !== String.fromCharCode(160) ? t : '';

const getDorsal = r => returnEmptyIfInvalid(r.childNodes[PLAYER_DORSAL_COL].textContent);

const getGames = r => r.childNodes[PLAYER_GAMES_PLAYED].childNodes[0].textContent;

const filterIrrelevantPlayers = r => !((r.querySelector('.filial') || !getDorsal(r)) && +(getGames(r)) < MIN_GAMES);

const scraper = (inputYear = LAST_STARTING_YEAR) => {
    const year = constrainYear(inputYear);
    const seasonCode = getSeasonCode(year);
    
    const bdFutbolClubsScraper = page => {
        const pageDom = new JSDOM(page);
        const rawRows = pageDom.window.document.querySelectorAll('#classific tr');
        const rows = [...rawRows];

        const clubs = rows.filter(isClubRow).map(getClubDataFromRow);
        console.log(`We have all the club HTML row elements (${clubs.length}).`);

        const clubsPromises = clubs.map(c => {
            const {clubId, rosterUrl} = c;
            const clubLocalPath = getSeasonClubRosterLocalPath(seasonCode, clubId);
            console.log('Ensuring local file for roster data exists.');
            if (fs.existsSync(clubLocalPath)) {
                console.log('Local file exists.');
                return readFilePromise(getSeasonClubRosterLocalPath(seasonCode, clubId));
            } else {
                console.log('The local file does not exist, so we fetch the data remotely.');
                return rp(rosterUrl);
            }
        });

        Promise.all(clubsPromises)
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

        return clubs.map(filterClubDataToSave);
    }

    const localPath = getSeasonLocalPathFromCode(seasonCode);
    if (fs.existsSync(localPath)) {
        readFilePromise(localPath).then(data => {
            console.log('Successfully read from a local file.');
            const scrapedData = bdFutbolClubsScraper(data);
            console.log('The classification page was successfully scraped.');
            fs.writeFile(path.join(__dirname, '../output/clubs.json'), JSON.stringify(scrapedData, null, '  '), err => {
                console.log(err || 'Scraped data was successfully written to clubs.json in the output folder!!');
            });
        });
    } else {
        console.log('Data is not locally available, so it must be remotely fetched.');
        const url = getSeasonLinkFromCode(seasonCode);
        rp(url).then(html => {
            const scrapedData = bdFutbolClubsScraper(html);
            console.log('The classification page was successfully scraped.');
            fs.writeFile(path.join(__dirname, '../output/clubs.json'), JSON.stringify(scrapedData, null, '  '), err => {
                console.log(err || 'Scraped data was successfully written to clubs.json in the output folder!!');
            });
        }).catch(err => console.log(err));
    }
}

module.exports = scraper;