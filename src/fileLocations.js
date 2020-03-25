const path = require('path');

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

module.exports = {
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
}