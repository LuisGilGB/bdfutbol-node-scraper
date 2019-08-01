const jsdom = require('jsdom');
const {JSDOM} = jsdom;

const getDom = html => new JSDOM(html).window.document;

const selectSubhtml = (html, selector) => getDom(html).querySelector(selector).outerHTML;

module.exports = {
    getDom,
    selectSubhtml
}