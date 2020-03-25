#!/usr/bin/env node
const fs = require('fs-extra');
const path = require('path');
const {getLast} = require('@luisgilgb/js-utils');
const {
    PORTERO,
    DEFENSA,
    CENTROCAMPISTA,
    DELANTERO,
} = require('./consts');
const {
    PLAYERS_OUTPUT_FILE,
    COOK_OUTPUT_DIR,
    COOK_OUTPUT_FILE,
    COOK_SUMMARY_OUTPUT_FILE,
    COOK_NAMES_LIST_OUTPUT_FILE,
    COOK_PORTEROS_DIR,
    COOK_PORTEROS_FILE,
    COOK_PORTEROS_QUICK_VIEW_FILE,
    COOK_DEFENSAS_DIR,
    COOK_DEFENSAS_FILE,
    COOK_DEFENSAS_QUICK_VIEW_FILE,
    COOK_CENTROCAMPISTAS_DIR,
    COOK_CENTROCAMPISTAS_FILE,
    COOK_CENTROCAMPISTAS_QUICK_VIEW_FILE,
    COOK_DELANTEROS_DIR,
    COOK_DELANTEROS_FILE,
    COOK_DELANTEROS_QUICK_VIEW_FILE
} = require('./fileLocations');

const POSITION_GOALS_WEIGHT = {
    portero: 10,
    defensa: 3,
    centrocampista: 2,
    delantero: 1
}

const getGoalsWeight = position => POSITION_GOALS_WEIGHT[position] || 1;
const getPlayerLastStartingYear = pl => +(getLast(pl.seasons).split('-')[0]);

const BASE_FACTOR = 1000;

const minutesPlayedBase = pl => Math.pow(pl.minutes/300, 1.5);
const goalsBase = pl => Math.pow(pl.goals * getGoalsWeight(pl.position)/2, 1.5);
const goalsRateBase = pl => Math.pow(1 + (600 * (pl.goals * Math.sqrt(getGoalsWeight(pl.position)))/pl.minutes), 2 + Math.log10(pl.minutes/60));
const goalsConcededBase = pl => Math.pow(1 + Math.log((2500 - +(getLast(pl.seasons).split('-')[0]))/5) * pl.minutes/(100 * pl.concededGoals), 2 + Math.log10(pl.minutes/100));
const goalsRelatedBase = pl => pl.position === PORTERO ? goalsConcededBase(pl) : (goalsBase(pl) + goalsRateBase(pl));
const recentPlayerFactor = pl => 5 - Math.log(2040 - getPlayerLastStartingYear(pl));
const minutesPerSeasonFactor = pl => Math.pow(1 + pl.minutes/(3000 * pl.seasons.length), 1.3);
const careerLengthFactor = pl => Math.pow(1 + pl.seasons.length/25, 2);

const calculateScore = (pl) => Math.round(
    BASE_FACTOR * (
        minutesPlayedBase(pl) + 
        goalsRelatedBase(pl)
    ) * recentPlayerFactor(pl) * careerLengthFactor(pl));

const cook = () => {
    console.log("Read scraped players data.")

    const players = fs.readJsonSync(PLAYERS_OUTPUT_FILE);

    console.log("Players data successfully read");

    console.log("Let's cook!");

    fs.rmdirSync(COOK_OUTPUT_DIR, {recursive: true});
    fs.ensureDirSync(COOK_OUTPUT_DIR);
    fs.ensureDirSync(COOK_PORTEROS_DIR);
    fs.ensureDirSync(COOK_DEFENSAS_DIR);
    fs.ensureDirSync(COOK_CENTROCAMPISTAS_DIR);
    fs.ensureDirSync(COOK_DELANTEROS_DIR);


    const cookedPlayers = players
                            .filter(pl => pl.gamesPlayed > 0)
                            .map(pl => ({
                                ...pl,
                                score: calculateScore(pl)
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

    const porteros = cookedPlayers.filter(pl => pl.position === PORTERO).filter((p,i) => i < 128);
    const defensas = cookedPlayers.filter(pl => pl.position === DEFENSA).filter((p,i) => i < 512);
    const centrocampistas = cookedPlayers.filter(pl => pl.position === CENTROCAMPISTA).filter((p,i) => i < 512);
    const delanteros = cookedPlayers.filter(pl => pl.position === DELANTERO).filter((p,i) => i < 128);

    fs.writeJsonSync(COOK_PORTEROS_FILE, porteros, {spaces: 2});
    fs.writeJsonSync(COOK_DEFENSAS_FILE, defensas, {spaces: 2});
    fs.writeJsonSync(COOK_CENTROCAMPISTAS_FILE, centrocampistas, {spaces: 2});
    fs.writeJsonSync(COOK_DELANTEROS_FILE, delanteros, {spaces: 2});

    console.log('DONE!!!');
}

module.exports = cook;