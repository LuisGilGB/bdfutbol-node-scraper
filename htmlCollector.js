const collectPages = require('./src/bdFutbolPagesCollector.js')

collectPages(2030).then(msg => console.log(msg)).catch(err => console.log(err));
