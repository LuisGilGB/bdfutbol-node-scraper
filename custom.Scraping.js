#!/usr/bin/env node
'use strict'

const {argv} = require('./config/yargs');

const {
    url
} = argv;

scrapeSeasonTable(url);