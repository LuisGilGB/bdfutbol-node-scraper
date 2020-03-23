#!/usr/bin/env node
const fs = require('fs');
const chalk = require('chalk');

const outputDir = './output';

if (fs.existsSync(outputDir)) {
    console.log(`${chalk.red("Output dir already exists")}, so let's remove it to clean any remaining and possibly outdated data.`);
    fs.rmdirSync(outputDir, {recursive: true});
    console.log(chalk.cyan("Old output directory has been successfully removed."));
} else {
    console.log(`${chalk.cyan("Output directory doesn't exist")}, so no need to remove it.`);
}
fs.mkdirSync(outputDir);
console.log(chalk.green("Output directory successfully created."));

const clubsScraper = require('./src/bdFutbolClubsScraper.js');

clubsScraper(1928)
    .then(() => {console.log(chalk.green('DONE!!!'))})
    .catch(err => {console.error(err)});