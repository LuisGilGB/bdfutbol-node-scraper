const fs = require('fs-extra');
const rp = require('request-promise');
const path = require('path');
const chalk = require('chalk');
const rosterScraper = require('./bdFutbolRosterScraper.js');
const {
    LAST_STARTING_YEAR,
    MIN_GAMES,
    ROSTER_COLUMNS
} = require('./consts.js');;
const {
    getDom,
    readFilePromise,
    constrainYear,
    getNextValidStartingYear,
    getSeasonCode,
    getSeasonLocalPathFromCode,
    getSeasonLinkFromCode,
    getSeasonClubRosterLocalPath
} = require('./utils');
const {
    isClubRow,
    getClubDataFromRow,
    filterClubDataToSave
} = require('./seasonTableUtils');

const {
    PLAYER_DORSAL_COL,
    PLAYER_GAMES_PLAYED
} = ROSTER_COLUMNS;

const returnEmptyIfInvalid = t => t && t !== String.fromCharCode(160) ? t : '';

const getDorsal = r => returnEmptyIfInvalid(r.childNodes[PLAYER_DORSAL_COL].textContent);

const getGames = r => r.childNodes[PLAYER_GAMES_PLAYED].childNodes[0].textContent;

const CLUBS_OUTPUT_FILE = path.join(__dirname, '../output/clubs.json');
const PLAYERS_OUTPUT_FILE = path.join(__dirname, '../output/players.json')

const filterIrrelevantPlayers = r => !((r.querySelector('.filial') || !getDorsal(r)) && +(getGames(r)) < MIN_GAMES);

const seasonClubsScraper = seasonCode => page => new Promise((resolve, reject) => {
    const pageDom = getDom(page);
    const rawRows = pageDom.querySelectorAll('#classific tr');
    const rows = [...rawRows];

    const clubs = rows.filter(isClubRow).map(getClubDataFromRow);
    console.log(`We have all the club HTML row elements (${clubs.length}).`);

    const clubsPromises = clubs.map(c => {
        const {bdFutbolId, rosterUrl} = c;
        const clubLocalPath = getSeasonClubRosterLocalPath(seasonCode, bdFutbolId);
        console.log(clubLocalPath)
        console.log('Ensuring local file for roster data exists.');
        if (fs.existsSync(clubLocalPath)) {
            console.log('Local file exists.');
            return readFilePromise(getSeasonClubRosterLocalPath(seasonCode, bdFutbolId));
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

            const currentPlayersData = fs.pathExistsSync(PLAYERS_OUTPUT_FILE) ? fs.readJsonSync(PLAYERS_OUTPUT_FILE) : [];
            const newPlayersData = [...currentPlayersData, ...players].filter((p,i,a) => a.findIndex(pl => pl.bdFutbolId === p.bdFutbolId) === i);

            fs.writeFile(PLAYERS_OUTPUT_FILE, JSON.stringify(newPlayersData, null, '  '), err => {
                if (err) {
                    console.log('Scraped data was successfully written to players.json in the output folder!!')
                    reject(err);
                } else {
                    resolve(clubs.map(filterClubDataToSave));
                }
            });
        })
        .catch(err => console.log(err));
});

const scraper = (inputYear = LAST_STARTING_YEAR) => new Promise((resolve, reject) => {
    const year = constrainYear(inputYear);
    const seasonCode = getSeasonCode(year);
    const bdFutbolClubsScraper = seasonClubsScraper(seasonCode);
    
    const localPath = getSeasonLocalPathFromCode(seasonCode);
    if (fs.existsSync(localPath)) {
        readFilePromise(localPath).then(data => {
            console.log('Successfully read from a local file.');
            bdFutbolClubsScraper(data)
                .then(scrapedData => {
                    console.log('The classification page was successfully scraped.');

                    const currentClubsData = fs.pathExistsSync(CLUBS_OUTPUT_FILE) ? fs.readJsonSync(CLUBS_OUTPUT_FILE) : [];
                    const newClubsData = [...currentClubsData, ...scrapedData].filter((c,i,a) => a.findIndex(cl => cl.bdFutbolId === c.bdFutbolId) === i);

                    fs.writeFile(CLUBS_OUTPUT_FILE, JSON.stringify(newClubsData, null, '  '), err => {
                        if (err) {
                            console.log('Scraped data was successfully written to clubs.json in the output folder!!');
                            reject(err);
                        } else {
                            resolve();
                        }
                    });
                })
                .catch(err => {reject(err)});
        });
    } else {
        console.log('Data is not locally available, so it must be remotely fetched.');
        const url = getSeasonLinkFromCode(seasonCode);
        rp(url).then(html => {
            bdFutbolClubsScraper(html)
                .then(scrapedData => {
                    console.log('The classification page was successfully scraped.');
                    fs.writeFile(path.join(__dirname, '../output/clubs.json'), JSON.stringify(scrapedData, null, '  '), err => {
                        if (err) {
                            console.log('Scraped data was successfully written to clubs.json in the output folder!!');
                            reject(err);
                        } else {
                            resolve();
                        }
                    });
                })
                .catch(err => {reject(err)});
        }).catch(err => {reject(err)});
    }
});

const scrapeSince = (inputYear = LAST_STARTING_YEAR) => new Promise((resolve, reject) => {
    const startingYear = constrainYear(inputYear);
    scraper(startingYear)
        .then(() => {
            console.log(chalk.cyan('--------------------------------------------------------------------------'));
            console.log(chalk.cyan(`---             Season ${startingYear}/${+(startingYear) + 1} data successfully scraped             ---`));
            console.log(chalk.cyan('--------------------------------------------------------------------------'));
            const nextStartingYear = getNextValidStartingYear(startingYear);
            if (nextStartingYear <= LAST_STARTING_YEAR) {
                scrapeSince(nextStartingYear);
            } else {
                console.log('All seasons were successfully scraped.');
                resolve('Done');
            }
        })
        .catch(err => {reject(err)});
});

module.exports = scrapeSince;