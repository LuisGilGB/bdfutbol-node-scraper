const rp = require('request-promise');
const $ = require('cheerio');
const jsdom = require('jsdom');
const axios = require('axios');

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
    const getAlias = r => r.querySelector('.aligesq a').innerHTML;
    const getBdFutbolId = r => getIdFromHref(r.querySelector('.aligesq a').href);
    const getPicUrl = r => r.querySelectorAll('td')[2].querySelector('img').src.replace('/em/', '/eg/').replace('../../', baseUrl);
    const getRosterUrl = r => r.querySelector('.aligesq a').href.replace('../', `${baseUrl}${esSubpath}`);

    rows.filter(isClubRow)[0] && axios.get(getRosterUrl(rows.filter(isClubRow)[0]))
        .then(response => console.log(new JSDOM(response).window.document))
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
        console.log(bdFutbolClubsScraper(html));
    }).catch(err => console.log(err));
}

module.exports = scraper;