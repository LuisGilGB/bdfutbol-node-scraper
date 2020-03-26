const opts = {
    url: {
        demand: true,
        alias: 'u'
    }
}

const argv = require('yargs')
    .command('custom-season', 'Scrapes a custom season table', opts)
    .help()
    .argv;

module.exports = {argv}