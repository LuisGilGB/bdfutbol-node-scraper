const rp = require('request-promise');
const fs = require('fs');
const path = require('path');
const jsdom = require('jsdom');
const utils = require('./utils.js');
const consts = require('./consts.js');

const {JSDOM} = jsdom;
const {
    selectSubhtml
} = utils;
const {
    BASE_URL,
    ES_SUBPATH,
    SEASON_SUBPATH,
    SEASON_PREFFIX,
    SEASON_CLASSIFICATION_TABLE_ID,
    FIRST_STARTING_YEAR,
    LAST_STARTING_YEAR,
    INVALID_STARTING_YEARS
} = consts;

const collectPage = (url, destDir, selector) => new Promise((resolve, reject) => {
    rp(url)
        .then(response => fs.writeFile(destDir, selectSubhtml(response, selector), (err) => {
            err && reject(err);
            console.log('Page successfully saved');
            resolve();
        }))
        .catch(err => reject(err));
});

const collectLeague = (url, destDir) => collectPage(url, destDir, `#${SEASON_CLASSIFICATION_TABLE_ID}`);
const collectRoster = (url, destDir) => collectPage(url, destDir, '#taulaplantilla');

const constrainYear = (year = LAST_STARTING_YEAR) => +(year < FIRST_STARTING_YEAR ? FIRST_STARTING_YEAR : year >= +(new Date().getFullYear()) ? LAST_STARTING_YEAR : year);

const getSeasonCode = (startingYear) => {
    const endingYear = +(startingYear) + 1;
    return `${startingYear}-${endingYear.toString().slice(-2)}`;
}

const getSeasonLink = seasonCode => `${BASE_URL}${ES_SUBPATH}${SEASON_SUBPATH}${SEASON_PREFFIX}${seasonCode}.html`;

const getNextValidStartingYear = (year) => INVALID_STARTING_YEARS.includes(year + 1) ? getNextValidStartingYear(year + 1) : year + 1;

const collectSeason = (year = LAST_STARTING_YEAR) => {
    const startingYear = constrainYear(year);
    const seasonCode = getSeasonCode(startingYear);
    console.log('Collecting data from season:', seasonCode);
    const seasonLink = getSeasonLink(seasonCode)
    console.log('Link:', seasonLink)
    return collectLeague(seasonLink, path.join(__dirname, `../htmlSaves/seasons/t${seasonCode}.html`));
}

const collectSeasonsSince = (year = LAST_STARTING_YEAR) => new Promise((resolve, reject) => {
    const startingYear = Math.max(+(year), FIRST_STARTING_YEAR);
    collectSeason(startingYear)
        .then(() => {
            const nextStartingYear = getNextValidStartingYear(startingYear);
            if (nextStartingYear <= LAST_STARTING_YEAR) {
                collectSeasonsSince(nextStartingYear);
            } else {
                console.log('All pages were successfully collected.');
                resolve('Done');
            }
        })
        .catch(err => reject(err));
});

const collectPages = (startingYear) => collectSeasonsSince(startingYear);

module.exports = collectPages;