const rp = require('request-promise');
const fs = require('fs');
const path = require('path');
const jsdom = require('jsdom');
const rosterScraper = require('./bdFutbolRosterScraper.js');

const {JSDOM} = jsdom;

const baseUrl = 'https://www.bdfutbol.com/';
const esSubpath = 'es/';
const url = 'https://www.bdfutbol.com/es/t/t2018-19.html';

const bdFutbolClubsScraper = page => {
    const pageDom = new JSDOM(page);
    const rawRows = pageDom.window.document.querySelectorAll('#classific tr');
    const rows = [...rawRows];

    const isClubRow = r => r.childNodes.length > 1 && r.childNodes[0].nodeName !== 'TH';
    const getIdFromHref = href => href.split('/').reverse()[0].split('.')[0].slice(8);
    const getAlias = r => r.querySelector('.aligesq a').textContent;
    const getBdFutbolId = r => getIdFromHref(r.querySelector('.aligesq a').href);
    const getPicUrl = r => r.querySelectorAll('td')[2].querySelector('img').src.replace('/em/', '/eg/').replace('../../', baseUrl);
    const getRosterUrl = r => r.querySelector('.aligesq a').href.replace('../', `${baseUrl}${esSubpath}`);

    const clubs = rows.filter(isClubRow);

    Promise.all(clubs.map(c => rp(getRosterUrl(c))))
        .then(clubPages => {
            const clubPlayers = clubPages.map(cP => rosterScraper(cP));
            const players = clubPlayers.reduce((a0, pArr) => [...a0, ...pArr], [])
                                    .filter((p, i, a) => a.findIndex(up => up.bdFutbolId === p.bdFutbolId) === i);

            console.log('We got all the players!!!');

            fs.writeFile(path.join(__dirname, '../output/players.json'), JSON.stringify(players, null, '  '), err => {
                console.log(err || 'Scraped data was successfully written to players.json in the output folder!!');
            });
        })
        .catch(err => console.log(err));

    return rows.filter(isClubRow)
               .map(r => ({
                    alias: getAlias(r),
                    bdFutbolId: getBdFutbolId(r),
                    picUrl: getPicUrl(r)
               }));
}

const scraper = () => {
    rp(url).then(html => {
        const scrapedData = bdFutbolClubsScraper(html);
        console.log('The classification page was successfully scraped');
        fs.writeFile(path.join(__dirname, '../output/clubs.json'), JSON.stringify(scrapedData, null, '  '), err => {
            console.log(err || 'Scraped data was succesfully written to clubs.json in the output folder!!');
        })
    }).catch(err => console.log(err));
}

module.exports = scraper;