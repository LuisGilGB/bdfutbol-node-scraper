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
    SEASON_CLASSIFICATION_DIV_ID,
    FIRST_STARTING_YEAR,
    LAST_STARTING_YEAR
} = consts;

const collectPage = (url, destDir, selector) => rp(url)
    .then(response => fs.writeFile(destDir, selectSubhtml(response, selector), (err) => {
        if (err) throw err;
        console.log('Page successfully saved');
    }))
    .catch(err => console.log(err));

const collectLeague = (url, destDir) => collectPage(url, destDir, `#${SEASON_CLASSIFICATION_DIV_ID}`);
const collectRoster = (url, destDir) => collectPage(url, destDir, '#taulaplantilla');

const constrainYear = (year = LAST_STARTING_YEAR) => +(year < FIRST_STARTING_YEAR ? FIRST_STARTING_YEAR : year >= +(new Date().getFullYear()) ? LAST_STARTING_YEAR : year);

const getSeasonCode = (startingYear) => {
    const endingYear = +(startingYear) + 1;
    return `${startingYear}-${endingYear.toString().slice(-2)}`;
}

const getSeasonLink = seasonCode => `${BASE_URL}${ES_SUBPATH}${SEASON_SUBPATH}${SEASON_PREFFIX}${seasonCode}.html`;

const collectSeason = (year = LAST_STARTING_YEAR) => {
    const startingYear = constrainYear(year);
    const seasonCode = getSeasonCode(startingYear);
    console.log('Collecting data from season:', seasonCode);
    const seasonLink = getSeasonLink(seasonCode)
    console.log('Link:', seasonLink)
    collectLeague(seasonLink, path.join(__dirname, `../htmlSaves/seasons/t${seasonCode}.html`));
    // if (startingYear < LAST_STARTING_YEAR) {
    //     collectSeason(startingYear + 1);
    // }
}

const collectPages = () => {
    collectSeason(1901);
    collectSeason(1928);
    collectSeason('1964');
    collectSeason(1990);
    collectSeason(2006);
    collectSeason(2018);
    collectSeason(2019);
    collectSeason('2032');
}

module.exports = collectPages;