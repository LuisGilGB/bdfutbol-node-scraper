const rp = require('request-promise');

const scrapeSeasonTable = (url) => new Promise((resolve, reject) => {
    rp(url).then(html => {
        bdFutbolClubsScraper(html)
            .then(postSeasonScrapeRoutine)
            .catch(err => {reject(err)});
    }).catch(err => {reject(err)});
});