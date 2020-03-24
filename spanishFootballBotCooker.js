#!/usr/bin/env node
const fs = require('fs-extra');
const path = require('path');
const {getLast} = require('@luisgilgb/js-utils');

const PLAYERS_OUTPUT_FILE = path.join(__dirname, './output/players.json');
const COOK_OUTPUT_FILE = path.join(__dirname, './spanishFootballBotCook/players.json');
const COOK_SUMMARY_OUTPUT_FILE = path.join(__dirname, './spanishFootballBotCook/playersSummary.json');
const COOK_NAMES_LIST_OUTPUT_FILE = path.join(__dirname, './spanishFootballBotCook/playersNamesList.json');

console.log("Read scraped players data.")

const players = fs.readJsonSync(PLAYERS_OUTPUT_FILE);

console.log("Players data succesfully read");

const POSITION_GOALS_WEIGHT = {
    portero: 10,
    defensa: 3,
    centrocampista: 2,
    delantero: 1
}

const getGoalsWeight = position => POSITION_GOALS_WEIGHT[position] || 1;

console.log("Let's cook!");

fs.rmdirSync(path.join(__dirname, './spanishFootballBotCook'), {recursive: true});
fs.ensureDirSync(path.join(__dirname, './spanishFootballBotCook'));

const cookedPlayers = players
                        .filter(pl => pl.gamesPlayed > 0)
                        .map(pl => ({
                            ...pl,
                            score: Math.round(((pl.gamesPlayed/20) + Math.pow(pl.goals * getGoalsWeight(pl.position)/2, 1.5) + Math.pow(1 + (2 * pl.goals/pl.gamesPlayed), Math.round(1 + Math.log10(pl.gamesPlayed)))) * 1000 * (5 - Math.log(2040 - +(getLast(pl.seasons).split('-')[0]))))
                        }))
                        .sort((a,b) => b.score - a.score);

fs.writeJsonSync(COOK_OUTPUT_FILE, cookedPlayers, {spaces: 2});
fs.writeJsonSync(COOK_SUMMARY_OUTPUT_FILE, cookedPlayers.map((pl, i) => ({
    alis: pl.alias,
    lastSeason: +(getLast(pl.seasons).split('-')[0]),
    pos: i+1,
    score: pl.score
})), {spaces: 2});
fs.writeJsonSync(COOK_NAMES_LIST_OUTPUT_FILE, cookedPlayers.map((pl, i) => pl.alias), {spaces: 2});

console.log('DONE!!!')