#!/usr/bin/env node
const fs = require('fs-extra');
const path = require('path');
const {getLast} = require('@luisgilgb/js-utils');

const PLAYERS_OUTPUT_FILE = path.join(__dirname, './output/players.json');
const COOK_OUTPUT_FILE = path.join(__dirname, './spanishFootballBotCook/players.json');
const COOK_SUMMARY_OUTPUT_FILE = path.join(__dirname, './spanishFootballBotCook/playersSummary.json');
const COOK_NAMES_LIST_OUTPUT_FILE = path.join(__dirname, './spanishFootballBotCook/playersNamesList.json');
const COOK_PORTEROS = path.join(__dirname, './spanishFootballBotCook/porteros.json');
const COOK_DEFENSAS = path.join(__dirname, './spanishFootballBotCook/defensas.json');
const COOK_CENTROCAMPISTAS = path.join(__dirname, './spanishFootballBotCook/centrocampistas.json');
const COOK_DELANTEROS = path.join(__dirname, './spanishFootballBotCook/delanteros.json');

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
                            score: Math.round((Math.pow(pl.minutes/300, 1.5) + Math.pow(pl.goals * getGoalsWeight(pl.position)/2, 1.5) + Math.pow(1 + (600 * (pl.goals * Math.sqrt(getGoalsWeight(pl.position)))/pl.minutes), 2 + Math.log10(pl.minutes/60)) + (pl.concededGoals ? Math.pow(1 + Math.log((2500 - +(getLast(pl.seasons).split('-')[0]))/5) * pl.minutes/(100 * pl.concededGoals), 2 + Math.log10(pl.minutes/100)) : 0)) * 1000 * (5 - Math.log(2040 - +(getLast(pl.seasons).split('-')[0]))) * Math.pow(1 + pl.minutes/(3000 * pl.seasons.length), 1.3) * Math.pow(1 + pl.seasons.length/25, 2))
                        }))
                        .sort((a,b) => b.score - a.score);

fs.writeJsonSync(COOK_OUTPUT_FILE, cookedPlayers, {spaces: 2});
fs.writeJsonSync(COOK_SUMMARY_OUTPUT_FILE, cookedPlayers.map((pl, i) => ({
    alias: pl.alias,
    lastSeason: +(getLast(pl.seasons).split('-')[0]),
    pos: i+1,
    score: pl.score
})), {spaces: 2});
fs.writeJsonSync(COOK_NAMES_LIST_OUTPUT_FILE, cookedPlayers.map((pl, i) => pl.alias), {spaces: 2});
fs.writeJsonSync(COOK_PORTEROS, cookedPlayers.filter(pl => pl.position === 'portero').map((pl, i) => pl.alias).filter((p,i) => i < 128), {spaces: 2});
fs.writeJsonSync(COOK_DEFENSAS, cookedPlayers.filter(pl => pl.position === 'defensa').map((pl, i) => pl.alias).filter((p,i) => i < 512), {spaces: 2});
fs.writeJsonSync(COOK_CENTROCAMPISTAS, cookedPlayers.filter(pl => pl.position === 'centrocampista').map((pl, i) => pl.alias).filter((p,i) => i < 512), {spaces: 2});
fs.writeJsonSync(COOK_DELANTEROS, cookedPlayers.filter(pl => pl.position === 'delantero').map((pl, i) => pl.alias).filter((p,i) => i < 256), {spaces: 2});

console.log('DONE!!!');