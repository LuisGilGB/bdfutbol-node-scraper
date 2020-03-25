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

const LEGEND_TABLE = {
    j1753: 1,       // Messi
    j12429: 1,      // Cristiano
    j8405: 1,       // Ricardo Zamora
    j7444: 1,       // Kubala
    j7349: 1,       // Di Stéfano
    j5282: 1,       // Cruyff
    j591: 1,        // Maradona
    j2400: 1,       // Ronaldo
    j2664: 1,       // Zidane
    j9323: 1,       // Jacinto Quincoces
    j11367: 1,      // Ciriaco
    j10566: 1,      // Lángara
    j11373: 1,      // Luis Regueiro
    j9913: 1,       // Zarra
    j8389: 1,       // Gaínza
    j8230: 1,       // Ramallets
    j9633: 1,       // Basora
    j9575: 1,       // Kopa
    j7442: 1,       // Miguel Muñoz
    j6063: 1,       // Gento
    j7510: 1,       // Rial
    j7863: 1,       // Santamaría
    j7862: 1,       // Puskás
    j9499: 1,       // Didí
    j7889: 1,       // Kocsis
    j8169: 1,       // Czibor
    j5459: 1,       // Amancio
    j2883: 1,       // Juanito
    j1345: 1,       // Mágico González
    j667: 1,        // Butragueño
    j2197: 1,       // Futre
    j1695: 1,       // Lopetegui
    j2636: 1,       // Wilfred
    j2102: 1,       // Salenko
    j1841: 1,       // Momparlet
    j2394: 1,       // Romário
    j2296: 1,       // Raúl
    j2226: 1,       // Pedro José
    j2614: 1,       // Rivaldo
    j789: 1,        // Finidi
    j390: 1,        // Mono Montoya
    j429: 1,        // Vieri
    j608: 1,        // Djalminha
    j383: 1,        // Roa
    j956: 1,        // Mono Burgos
    j1721: 1,       // Keller
    j1938: 1,       // Martín Herrera
    j2399: 1,       // Ronaldinho
    j1972: 1,       // Owen
    j2544: 1,       // Gravesen
    j2081: 1,       // El Mortadelo del Cádiz
    j2380: 1,       // Robinho
    j12427: 1,      // Kaká
    j8569: 1,       // Di María
    j8572: 1,       // Özil
    j15201: 1       // Neymar
}

const POSITION_GOALS_WEIGHT = {
    portero: 10,
    defensa: 5,
    centrocampista: 3,
    delantero: 1
}

const mapToAlias = pl => pl.alias;

const getGoalsWeight = position => Math.sqrt(POSITION_GOALS_WEIGHT[position] || 1);
const getLastSeasonStartingYear = pl => +(getLast(pl.seasons).split('-')[0]);

const BASE_FACTOR = 1000;

const minutesPlayedBase = pl => 50 * Math.log(2 + pl.minutes/400) + Math.pow(pl.minutes/80, 1.25);
const goalsBase = pl => Math.pow(pl.goals * getGoalsWeight(pl.position), 1.5);
const goalsRateBase = pl => Math.pow(1 + (600 * (pl.goals * Math.sqrt(getGoalsWeight(pl.position)))/pl.minutes), 2 + Math.log10(pl.minutes/80));
const goalsConcededBase = pl => Math.pow(1 + Math.log((2500 - getLastSeasonStartingYear(pl))/5) * Math.pow(2, 1-(90 * pl.concededGoals)/pl.minutes), 2 + Math.log10(1 + pl.minutes/90)) * Math.log10(1 + pl.minutes/100)/3;
const goalsRelatedBase = pl => pl.position === PORTERO ? goalsConcededBase(pl) : 0.75 * (goalsBase(pl) + goalsRateBase(pl));
const recentPlayerFactor = pl => (7.82 - Math.log(9000 - 4*2019)) * (Math.pow(2, Math.pow(1/Math.log10(2029 - getLastSeasonStartingYear(pl)), 4)) - 1);
const memoryFactor = pl => LEGEND_TABLE[pl.bdFutbolId] || recentPlayerFactor(pl);
const minutesPerSeasonFactor = pl => Math.pow(1 + pl.minutes/(3000 * pl.seasons.length), 1.3);
const careerLengthFactor = pl => Math.pow(1.25, 1 + pl.seasons.length/25);

const calculateScore = (pl) => Math.round(
    BASE_FACTOR * (
        minutesPlayedBase(pl) + 
        goalsRelatedBase(pl)
    ) * memoryFactor(pl));

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
    const delanteros = cookedPlayers.filter(pl => pl.position === DELANTERO).filter((p,i) => i < 256);

    fs.writeJsonSync(COOK_PORTEROS_FILE, porteros, {spaces: 2});
    fs.writeJsonSync(COOK_DEFENSAS_FILE, defensas, {spaces: 2});
    fs.writeJsonSync(COOK_CENTROCAMPISTAS_FILE, centrocampistas, {spaces: 2});
    fs.writeJsonSync(COOK_DELANTEROS_FILE, delanteros, {spaces: 2});

    fs.writeJsonSync(COOK_PORTEROS_QUICK_VIEW_FILE, porteros.map(mapToAlias), {spaces: 2});
    fs.writeJsonSync(COOK_DEFENSAS_QUICK_VIEW_FILE, defensas.map(mapToAlias), {spaces: 2});
    fs.writeJsonSync(COOK_CENTROCAMPISTAS_QUICK_VIEW_FILE, centrocampistas.map(mapToAlias), {spaces: 2});
    fs.writeJsonSync(COOK_DELANTEROS_QUICK_VIEW_FILE, delanteros.map(mapToAlias), {spaces: 2});

    console.log('DONE!!!');
}

module.exports = cook;