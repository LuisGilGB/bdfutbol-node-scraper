const {getDom} = require('../utils');
const {isClubRow, getClubDataFromRow} = require('./seasonTableUtils');

const seasonClubsScraper = page => {
    const rows = [...(getDom(page).querySelectorAll('#classific tr'))];

    const clubs = rows.filter(isClubRow).map(getClubDataFromRow);
    console.log(`We have all the club HTML row elements (${clubs.length}).`);

    return clubs;
}

module.exports = seasonClubsScraper;