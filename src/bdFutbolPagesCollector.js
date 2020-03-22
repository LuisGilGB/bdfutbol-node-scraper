const rp = require('request-promise');
const fs = require('fs-extra');
const chalk = require('chalk');
const {
    SEASON_CLASSIFICATION_TABLE_ID,
    LAST_STARTING_YEAR
} = require('./consts.js');
const {
    getDom,
    selectSubhtml,
    constrainYear,
    getNextValidStartingYear,
    getSeasonCode,
    getSeasonLocalPathFromCode,
    getSeasonLinkFromCode,
    getSeasonClubRosterLocalPath
} = require('./utils.js');
const {
    isClubRow,
    getClubDataFromRow
} = require('./seasonTableUtils');

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

const getIdFromHref = href => href.split('/').reverse()[0].split('.')[0].slice(8);

const collectPages = (firstSeasonStartingYear) => {
    const collectSeason = (year = LAST_STARTING_YEAR) => {
        const startingYear = constrainYear(year);
        const seasonCode = getSeasonCode(startingYear);
        console.log('Collecting data from season:', seasonCode);
        const seasonLink = getSeasonLinkFromCode(seasonCode)
        console.log('Link:', seasonLink);
        const destPath = getSeasonLocalPathFromCode(seasonCode);
        return new Promise((resolve, reject) => {
            collectLeague(seasonLink, destPath).then(() => {
                console.log(`Read collected table form season ${seasonCode}`)
                const seasonTable = getDom(fs.readFileSync(destPath, 'utf8'));
                const rostersUrls = [...(seasonTable.querySelectorAll('tr'))]
                    .filter(isClubRow)
                    .map(getClubDataFromRow);
                Promise.all(rostersUrls.map(({bdFutbolId, rosterUrl}) => collectRoster(rosterUrl, getSeasonClubRosterLocalPath(seasonCode, bdFutbolId))))
                    .then(rosterPages => {
                        console.log('Rosters pages read and saved');
                        resolve();
                    }).catch(err => reject(err));
            }).catch(err => reject(err));
        });
    }
    
    const collectSeasonsSince = (year = LAST_STARTING_YEAR) => new Promise((resolve, reject) => {
        const startingYear = constrainYear(year);
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