const fs = require('fs');
const path = require('path');
const jsdom = require('jsdom');

const {JSDOM} = jsdom;
const baseUrl = 'https://www.bdfutbol.com/';
const esSubpath = 'es/';

const POS_MAP = {
    por: 'portero',
    def: 'defensa',
    ltd: 'defensa',
    lti: 'defensa',
    cen: 'defensa',
    mig: 'centrocampista',
    dav: 'delantero',
    dac: 'delantero'
}

const bdFutbolRosterScraper = page => {
    const pageEl = new JSDOM(page).window.document;
    const rawRows = pageEl.querySelectorAll('#taulaplantilla tr');
    const rows = [...rawRows];

    const isPlayerRow = r => r.childNodes.length > 1 && r.childNodes[0].nodeName !== 'TH';
    const getIdFromHref = href => href.split('/').reverse()[0].split('.')[0];
    const getAlias = r => r.querySelector('.aligesq a').textContent;
    const getCompleteName = r => r.querySelector('.aligesq.colnom a').textContent;
    const getBdFutbolId = r => getIdFromHref(r.querySelector('.aligesq a').href);
    const getPicUrl = r => r.querySelector('img').src.replace('/m/', '/j/').replace('../../', baseUrl);
    const getPosition = r => POS_MAP[Object.keys(POS_MAP).find(k => r.querySelector(`.${k}`))];

    return rows.filter(r => isPlayerRow(r))
               .map(r => ({
                    position: getPosition(r),
                    alias: getAlias(r),
                    completeName: getCompleteName(r),
                    bdFutbolId: getBdFutbolId(r),
                    picUrl: getPicUrl(r)
                }));
}

const scraper = page => {
    const scrapedData = bdFutbolRosterScraper(page);
    console.log(scrapedData);
    fs.writeFile(path.join(__dirname, '../output/players.json'), JSON.stringify(scrapedData), err => {
        console.log(err || 'Scraped data was succesfully written to players.json in the output folder!!');
    });
}

module.exports = scraper;