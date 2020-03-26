const opts = {
    url: {
        demand: true,
        alias: 'u'
    },
    outputFileName: {
        demand: true,
        alias: 'o'
    }
}

const argv = require('yargs')
    .command('custom-season', 'Scrapes a custom season table', opts)
    .help()
    .argv;

module.exports = {argv}