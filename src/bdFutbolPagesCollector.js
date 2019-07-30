const rp = require('request-promise');
const fs = require('fs');
const path = require('path');
const jsdom = require('jsdom');
const consts = require('./consts.js');

const {
    baseUrl,
    esSubpath
} = consts;

const collectPage = (url, destDir) => rp(url)
                                        .then(response => fs.writeFile(destDir, response, () => console.log('Page successfully saved')))
                                        .catch(err => console.log(err));

module.exports = collectPage;