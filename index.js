const fs = require('fs');

const outputDir = './output';

if (fs.existsSync(outputDir)) {
    console.log("Output dir already exists, so no need to create it.");
} else {
    console.log("Output directoty doesn't exist, so we create it now.");
    fs.mkdirSync(outputDir);
    console.log("Output directoty successfully created.");
}

const clubsScraper = require('./src/bdFutbolClubsScraper.js');

clubsScraper();