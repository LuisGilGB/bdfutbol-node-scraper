#!/usr/bin/env node
'use strict'

const path = require('path');
const fs = require('fs-extra');
const {argv} = require('./config/yargs');
const scrapeSeasonTable = require('./src/customSeasonTableScraper');

const {
    url,
    outputFileName
} = argv;

console.log(`url: ${url}`)

const outputDir = path.join(__dirname, `./customOutput`);
const output = path.join(outputDir, `./${outputFileName}.json`);
fs.ensureDirSync(outputDir);

scrapeSeasonTable(url, output);