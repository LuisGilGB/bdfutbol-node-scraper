#!/usr/bin/env node
const fs = require('fs-extra');
const path = require('path');

const PLAYERS_OUTPUT_FILE = path.join(__dirname, './output/players.json');
const COOK_OUTPUT_FILE = path.join(__dirname, './spanishFootballBotCook/players.json');

console.log("Read scraped players data.")

const players = fs.readJsonSync(PLAYERS_OUTPUT_FILE);

console.log("Players data succesfully read");

const POSITION_GOALS_WEIGHT = {
    portero: 50,
    defensa: 10,
    centrocampista: 5,
    delantero: 2
}

const getGoalsWeight = position => POSITION_GOALS_WEIGHT[position] || 1;

console.log("Let's cook!");

fs.rmdirSync(path.join(__dirname, './spanishFootballBotCook'), {recursive: true});
fs.ensureDirSync(path.join(__dirname, './spanishFootballBotCook'));

const cookedPlayers = players
                        .filter(pl => pl.gamesPlayed > 0)
                        .map(pl => ({
                            ...pl,
                            score: Math.round((Math.round(pl.gamesPlayed/50) + Math.round(pl.goals * getGoalsWeight(pl.position)/50) + (1 + pl.goals/pl.gamesPlayed)^(1 + pl.seasons.length/10)) * (pl.gameStartings * pl.gamesCompleted)/(pl.gamesPlayed^2) * 100)
                        }))
                        .sort((a,b) => b.score - a.score);

fs.writeJsonSync(COOK_OUTPUT_FILE, cookedPlayers, {spaces: 2});

console.log('DONE!!!')