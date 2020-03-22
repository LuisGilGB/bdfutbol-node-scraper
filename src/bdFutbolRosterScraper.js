const {ROSTER_TABLE_ID} = require('./consts.js');
const {getDom} = require('./utils');
const {isPlayerRow, getPlayerDataFromRow} = require('./rosterTableUtils');

const bdFutbolRosterScraper = (page, playerRowCustomFilter) => {
    const rows = [...(getDom(page).querySelectorAll(`#${ROSTER_TABLE_ID} tr`))];

    return rows.filter(isPlayerRow)
                .filter((r,i,a) => playerRowCustomFilter ? playerRowCustomFilter(r,i,a) : true)
                .map(getPlayerDataFromRow);
}

const scraper = (page, playerRowCustomFilter) => {
    const scrapedData = bdFutbolRosterScraper(page, playerRowCustomFilter);
    console.log('Roster page was successfully scraped.');
    //fs.writeFile(path.join(__dirname, '../output/players.json'), JSON.stringify(scrapedData), err => {
    //    console.log(err || 'Scraped data was successfully written to players.json in the output folder!!');
    //});
    return scrapedData;
}

module.exports = scraper;