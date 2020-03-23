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
            const currentPlayersData = fs.pathExistsSync(PLAYERS_OUTPUT_FILE) ? fs.readJsonSync(PLAYERS_OUTPUT_FILE) : [];
            const players = clubPlayers.reduce((a0, pArr) => [...a0, ...pArr], []);

            console.log('We got all the players!!!');

            players.forEach((pl,i,a) => {
                const {bdFutbolId: playerId} = pl;
                const matchIndex = currentPlayersData.findIndex(({bdFutbolId}) => bdFutbolId === playerId);
                if (matchIndex >= 0) {
                    const oldPlayerData = currentPlayersData[matchIndex];
                    const updatedPlayerData = {
                        ...oldPlayerData,
                        gamesPlayed: oldPlayerData.gamesPlayed + pl.gamesPlayed,
                        gameStartings: oldPlayerData.gameStartings + pl.gameStartings,
                        gamesCompleted: oldPlayerData.gamesCompleted + pl.gamesCompleted,
                        yellowCards: oldPlayerData.yellowCards + pl.yellowCards,
                        redCards: oldPlayerData.redCards + pl.redCards,
                        goals: oldPlayerData.goals + pl.goals
                    }
                    currentPlayersData[matchIndex] = updatedPlayerData;
                } else {
                    currentPlayersData.push(pl);
                }
            })

            fs.writeJson(PLAYERS_OUTPUT_FILE, currentPlayersData, {spaces: 2}, err => {
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

const writeClubsData = (newScrapedClubData) => new Promise((resolve, reject) => {
    const currentClubsData = fs.pathExistsSync(CLUBS_OUTPUT_FILE) ? fs.readJsonSync(CLUBS_OUTPUT_FILE) : [];
    // TODO: The complexity of this operation can be optimized for sure. Won't do it while it works, but consider doing it in future stages.
    const newClubsData = [...newScrapedClubData, ...currentClubsData].filter((c,i,a) => a.findIndex(cl => cl.bdFutbolId === c.bdFutbolId) === i);

    fs.writeJSON(CLUBS_OUTPUT_FILE, newClubsData, {spaces: 2}, err => {
        if (err) {
            console.log('Scraped data was successfully written to clubs.json in the output folder!!');
            reject(err);
        } else {
            resolve();
        }
    });
});

const scrapeSeason = (inputYear = LAST_STARTING_YEAR) => new Promise((resolve, reject) => {
    const year = constrainYear(inputYear);
    const seasonCode = getSeasonCode(year);
    const localPath = getSeasonLocalPathFromCode(seasonCode);
    const bdFutbolClubsScraper = seasonClubsScraper(seasonCode);

    const postSeasonScrapeRoutine = scrapedClubsData => {
        console.log('The classification page was successfully scraped.');
        writeClubsData(scrapedClubsData)
            .then(res => resolve(res))
            .catch(err => reject(err))
    }

    if (fs.existsSync(localPath)) {
        readFilePromise(localPath).then(data => {
            console.log('Successfully read from a local file.');
            bdFutbolClubsScraper(data)
                .then(postSeasonScrapeRoutine)
                .catch(err => {reject(err)});
        });
    } else {
        console.log('Data is not locally available, so it must be remotely fetched.');
        const url = getSeasonLinkFromCode(seasonCode);
        rp(url).then(html => {
            bdFutbolClubsScraper(html)
                .then(postSeasonScrapeRoutine)
                .catch(err => {reject(err)});
        }).catch(err => {reject(err)});
    }
});

const scrape = (inputYear = LAST_STARTING_YEAR) => new Promise((resolve, reject) => {
    const firstYearToOperate = constrainYear(inputYear);
    const scrapeSince = (startingYear) => new Promise((resolve, reject) => {
        scrapeSeason(startingYear)
            .then(() => {
                console.log(chalk.cyan('--------------------------------------------------------------------------'));
                console.log(chalk.cyan(`---             Season ${startingYear}/${+(startingYear) + 1} data successfully scraped             ---`));
                console.log(chalk.cyan('--------------------------------------------------------------------------'));
                const nextStartingYear = getNextValidStartingYear(startingYear);
                if (nextStartingYear <= LAST_STARTING_YEAR) {
                    scrapeSince(nextStartingYear);
                } else {
                    resolve();
                }
            })
            .catch(err => {reject(err)});
    });

    scrapeSince(firstYearToOperate)
        .then(res => {
            console.log('All seasons were successfully scraped.');
            resolve(res);
        })
        .catch(err => reject(err));
});

module.exports = scrape;