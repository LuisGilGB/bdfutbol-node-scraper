#!/usr/bin/env node
const fs = require('fs-extra');
const path = require('path');
const {getLast} = require('@luisgilgb/js-utils');

const PLAYERS_OUTPUT_FILE = path.join(__dirname, '../output/players.json');

const COOK_OUTPUT_DIR = path.join(__dirname, '../spanishFootballBotCook');

const COOK_OUTPUT_FILE = path.join(COOK_OUTPUT_DIR, './players.json');
const COOK_SUMMARY_OUTPUT_FILE = path.join(COOK_OUTPUT_DIR, './playersSummary.json');
const COOK_NAMES_LIST_OUTPUT_FILE = path.join(COOK_OUTPUT_DIR, './playersNamesList.json');

const COOK_PORTEROS_DIR = path.join(COOK_OUTPUT_DIR, './porteros');
const COOK_PORTEROS_FILE = path.join(COOK_PORTEROS_DIR, './porteros.json');
const COOK_PORTEROS_QUICK_VIEW_FILE = path.join(COOK_PORTEROS_DIR, './porterosQuickView.json');

const COOK_DEFENSAS_DIR = path.join(COOK_OUTPUT_DIR, './defensas');
const COOK_DEFENSAS_FILE = path.join(COOK_DEFENSAS_DIR, './defensas.json');
const COOK_DEFENSAS_QUICK_VIEW_FILE = path.join(COOK_DEFENSAS_DIR, './defensasQuickView.json');

const COOK_CENTROCAMPISTAS_DIR = path.join(COOK_OUTPUT_DIR, './centrocampistas');
const COOK_CENTROCAMPISTAS_FILE = path.join(COOK_CENTROCAMPISTAS_DIR, './centrocampistas.json');
const COOK_CENTROCAMPISTAS_QUICK_VIEW_FILE = path.join(COOK_CENTROCAMPISTAS_DIR, './centrocampistasQuickView.json');

const COOK_DELANTEROS_DIR = path.join(COOK_OUTPUT_DIR, './delanteros');
const COOK_DELANTEROS_FILE = path.join(COOK_DELANTEROS_DIR, './delanteros.json');
const COOK_DELANTEROS_QUICK_VIEW_FILE = path.join(COOK_DELANTEROS_DIR, './delanterosQuickView.json');

const POSITION_GOALS_WEIGHT = {
    portero: 10,
    defensa: 3,
    centrocampista: 2,
    delantero: 1
}

const getGoalsWeight = position => POSITION_GOALS_WEIGHT[position] || 1;

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

    const porteros = cookedPlayers.filter(pl => pl.position === 'portero').filter((p,i) => i < 128);
    const defensas = cookedPlayers.filter(pl => pl.position === 'defensa').filter((p,i) => i < 512);
    const centrocampistas = cookedPlayers.filter(pl => pl.position === 'centrocampista').filter((p,i) => i < 512);
    const delanteros = cookedPlayers.filter(pl => pl.position === 'delantero').filter((p,i) => i < 128);

    fs.writeJsonSync(COOK_PORTEROS_FILE, porteros, {spaces: 2});
    fs.writeJsonSync(COOK_DEFENSAS_FILE, defensas, {spaces: 2});
    fs.writeJsonSync(COOK_CENTROCAMPISTAS_FILE, centrocampistas, {spaces: 2});
    fs.writeJsonSync(COOK_DELANTEROS_FILE, delanteros, {spaces: 2});

    console.log('DONE!!!');
}

module.exports = cook;