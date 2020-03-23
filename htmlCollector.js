#!/usr/bin/env node
const fs = require('fs');
const chalk = require('chalk');
const collectPages = require('./src/bdFutbolPagesCollector.js')

const htmlSavesDir = './htmlSaves';

if (fs.existsSync(htmlSavesDir)) {
    console.log(`${chalk.red("HTML saves dir already exists")}, so let's remove it to clean any remaining and possibly outdated data.`);
    fs.rmdirSync(htmlSavesDir, {recursive: true});
    console.log(chalk.cyan("Old HTML saves directory has been successfully removed."));
} else {
    console.log(`${chalk.cyan("HTML saves directory doesn't exist")}, so no need to remove it.`);
}
fs.mkdirSync(htmlSavesDir);
console.log(chalk.green("HTML saves directory has been successfully created."));

collectPages(1928).then(msg => console.log(msg)).catch(err => console.log(err));
