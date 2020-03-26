const fs = require('fs-extra');
const rp = require('request-promise');
const seasonTableScraper = require('./seasonTableScraping/seasonTableScraper');

const scrapeSeasonTable = (url, outputFile) => new Promise((resolve, reject) => {
    rp(url).then(html => {
        const clubs = seasonTableScraper(html);
        const prevClubs = fs.existsSync(outputFile) ? fs.readJsonSync(outputFile) : [];
        const updatedClubs = [...prevClubs, ...clubs].filter((c,i,a) => i === a.findIndex(c2 => c2.bdFutbolId === c.bdFutbolId));
        fs.writeJson(outputFile, updatedClubs, {spaces: 2}, (err, outputData) => {
            if (err) {
                reject(err);
            } else {
                resolve(outputData)
            }
        });
    }).catch(err => {reject(err)});
});

module.exports = scrapeSeasonTable;