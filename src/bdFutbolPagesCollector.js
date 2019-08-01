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
    baseUrl,
    esSubpath
} = consts;

const collectPage = (url, destDir, selector) => rp(url)
    .then(response => fs.writeFile(destDir, selectSubhtml(response, selector), () => {
        console.log('Page successfully saved');
    }))
    .catch(err => console.log(err));

const collectLeague = (url, destDir) => collectPage(url, destDir, '#classification');
const collectRoster = (url, destDir) => collectPage(url, destDir, '#taulaplantilla');

const constrainYear = (year = 2018) => +(year < 1928 ? 1928 : year >= +(new Date().getFullYear()) ? 2018 : year);

const getSeasonCode = (startingYear) => {
    const endingYear = +(startingYear) + 1;
    return `${startingYear}-${endingYear.toString().slice(-2)}`;
}

const collectSeason = (year = 2018) => {
    const startingYear = constrainYear(year);
    console.log(getSeasonCode(startingYear));
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