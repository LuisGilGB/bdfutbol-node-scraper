const fs = require('fs-extra');
const path = require('path');
const jsdom = require('jsdom');
const {getLast} = require('@luisgilgb/js-utils');
const {
    BASE_URL,
    ES_SUBPATH,
    SEASON_SUBPATH,
    SEASON_PREFIX,
    FIRST_STARTING_YEAR,
    LAST_STARTING_YEAR,
    INVALID_STARTING_YEARS
} = require('./consts');

const {JSDOM} = jsdom;

const getDom = html => new JSDOM(html).window.document;

const selectSubhtml = (html, selector) => getDom(html).querySelector(selector).outerHTML;

const getFromReverseIndex = (arr = [], rIndex) => getLast(rIndex > 0 ? arr.slice(0, -rIndex) : arr);

const restrictBottomToZero = input => input > 0 ? +(input) : 0;

const readFilePromise = (path, encoding = 'utf8') => new Promise((resolve, reject) => fs.readFile(path, encoding, (err, data) => {
    if (err) {
        reject(err);
    } else {
        resolve(data);
    }
}));

const getCurrentYear = () => new Date().getFullYear();

const constrainYear = (year = LAST_STARTING_YEAR) => Math.max(FIRST_STARTING_YEAR, Math.min(LAST_STARTING_YEAR, +(year)));

const getEndingYear = startingYear => +(startingYear) + 1;

const applyToNextYear = (year, fn) => fn(+(year) + 1);

const getNextValidStartingYear = (year) => applyToNextYear(year, nextYear => INVALID_STARTING_YEARS.includes(nextYear) ? getNextValidStartingYear(nextYear) : nextYear);

const getSeasonCode = (startingYear) => `${startingYear}-${getEndingYear(startingYear).toString().slice(-2)}`;

const getSeasonCodeAndApply = (startingYear, fn) => fn(getSeasonCode(startingYear));

const getSeasonLocalPathFromCode = seasonCode => path.join(__dirname,`../htmlSaves/s${seasonCode}/s${seasonCode}.html`);

const getSeasonLocalPathFromYear = startingYear => getSeasonCodeAndApply(startingYear, getSeasonLocalPath);

const getSeasonLinkFromCode = seasonCode => `${BASE_URL}${ES_SUBPATH}${SEASON_SUBPATH}${SEASON_PREFIX}${seasonCode}.html`;

const getSeasonClubRosterLocalPath = (seasonCode, clubId) => path.join(__dirname,`../htmlSaves/s${seasonCode}/clubs/c${clubId}.html`);

module.exports = {
    getDom,
    selectSubhtml,
    getFromReverseIndex,
    restrictBottomToZero,
    readFilePromise,
    getCurrentYear,
    constrainYear,
    getEndingYear,
    getNextValidStartingYear,
    getSeasonCode,
    getSeasonLocalPathFromCode,
    getSeasonLocalPathFromYear,
    getSeasonLinkFromCode,
    getSeasonClubRosterLocalPath
}