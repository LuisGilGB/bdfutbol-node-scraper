const rp = require('request-promise');
const fs = require('fs-extra');
const path = require('path');
const jsdom = require('jsdom');
const chalk = require('chalk');
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
    SEASON_PREFIX,
    SEASON_CLASSIFICATION_TABLE_ID,
    FIRST_STARTING_YEAR,
    LAST_STARTING_YEAR,
    INVALID_STARTING_YEARS,
    CLASSIFICATION_COLUMNS
} = consts;

const {
    CLUB_NAME_COL
} = CLASSIFICATION_COLUMNS;

const collectPage = (url, destPath, selector) => new Promise((resolve, reject) => {
    rp(url)
        .then(response => {
            console.log(`Ensuring ${chalk.yellow(destPath)} exists.`);
            fs.ensureFileSync(destPath);
            console.log(`Ready to write ${chalk.yellow(destPath)} file.`);
            fs.writeFile(destPath, selectSubhtml(response, selector), (err) => {
                err && reject(err);
                console.log(`${chalk.green('[OK]')} -> ${chalk.green(destPath)} file successfully saved`);
                resolve();
            });
        })
        .catch(err => reject(err));
});

const collectLeague = (url, destPath) => collectPage(url, destPath, `#${SEASON_CLASSIFICATION_TABLE_ID}`);
const collectRoster = (url, destPath) => collectPage(url, destPath, '#taulaplantilla');

const constrainYear = (year = LAST_STARTING_YEAR) => +(year < FIRST_STARTING_YEAR ? FIRST_STARTING_YEAR : year >= +(new Date().getFullYear()) ? LAST_STARTING_YEAR : year);

const getSeasonCode = (startingYear) => {
    const endingYear = +(startingYear) + 1;
    return `${startingYear}-${endingYear.toString().slice(-2)}`;
}

const getSeasonLink = seasonCode => `${BASE_URL}${ES_SUBPATH}${SEASON_SUBPATH}${SEASON_PREFIX}${seasonCode}.html`;

const getNextValidStartingYear = (year) => INVALID_STARTING_YEARS.includes(year + 1) ? getNextValidStartingYear(year + 1) : year + 1;

const getIdFromHref = href => href.split('/').reverse()[0].split('.')[0].slice(8);

const collectPages = (firstSeasonStartingYear) => {
    const collectSeason = (year = LAST_STARTING_YEAR) => {
        const startingYear = constrainYear(year);
        const seasonCode = getSeasonCode(startingYear);
        console.log('Collecting data from season:', seasonCode);
        const seasonLink = getSeasonLink(seasonCode)
        console.log('Link:', seasonLink);
        const destPath = path.join(__dirname,`../htmlSaves/s${seasonCode}/s${seasonCode}.html`);
        return new Promise((resolve, reject) => {
            collectLeague(seasonLink, destPath).then(() => {
                console.log(`Read collected table form season ${seasonCode}`)
                const seasonTable = new JSDOM(fs.readFileSync(destPath, 'utf8'));
                const rostersUrls = [...(seasonTable.window.document.querySelectorAll('tr'))]
                    .filter(r => !!r.getAttribute('ideq'))
                    .map(r => ({
                        clubId: getIdFromHref(r.querySelectorAll('td')[CLUB_NAME_COL].childNodes[0].href),
                        url: r.querySelectorAll('td')[CLUB_NAME_COL].childNodes[0].href.replace('../', `${BASE_URL}${ES_SUBPATH}`)
                    }));
                Promise.all(rostersUrls.map(({clubId, url}) => collectRoster(url, path.join(__dirname,`../htmlSaves/s${seasonCode}/clubs/c${clubId}.html`))))
                    .then(rosterPages => {
                        console.log('Rosters pages read and saved');
                        resolve()
                    }).catch(err => reject(err));
            }).catch(err => reject(err));
        });
    }
    
    const collectSeasonsSince = (year = LAST_STARTING_YEAR) => new Promise((resolve, reject) => {
        const startingYear = Math.min(Math.max(+(year), FIRST_STARTING_YEAR), LAST_STARTING_YEAR);
        collectSeason(startingYear)
            .then(() => {
                console.log(chalk.cyan('--------------------------------------------------------------------------'));
                console.log(chalk.cyan(`---              Season ${startingYear}/${+(startingYear) + 1} data successfully saved              ---`));
                console.log(chalk.cyan('--------------------------------------------------------------------------'));
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

    return collectSeasonsSince(firstSeasonStartingYear);
}

module.exports = collectPages;