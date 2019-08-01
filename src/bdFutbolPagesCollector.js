const rp = require('request-promise');
const fs = require('fs');
const path = require('path');
const jsdom = require('jsdom');
const utils = require('./utils.js');
const consts = require('./consts.js');

const {JSDOM} = jsdom;
const {
    selectSubhtml
} = utils;
const {
    baseUrl,
    esSubpath
} = consts;

const collectPage = (url, destDir, selector) => rp(url)
    .then(response => fs.writeFile(destDir, selectSubhtml(response, selector), () => {
        console.log('Page successfully saved');
    }))
    .catch(err => console.log(err));

module.exports = collectPage;