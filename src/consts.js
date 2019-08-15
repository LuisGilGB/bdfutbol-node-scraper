const BASE_URL = 'https://www.bdfutbol.com/';
const ES_SUBPATH = 'es/';
const SEASON_SUBPATH = 't/';
const SEASON_PREFFIX = 't';

const SEASON_CLASSIFICATION_TABLE_ID = 'classific';

const FIRST_STARTING_YEAR = 1928;
const LAST_STARTING_YEAR = 2018;

const POS_MAP = {
    por: 'portero',
    def: 'defensa',
    ltd: 'defensa',
    lti: 'defensa',
    cen: 'defensa',
    mig: 'centrocampista',
    dav: 'delantero',
    dac: 'delantero'
}

const MIN_GAMES = 3;

const playerDorsalColIndex = 0;
const playerPicColIndex = 1;
const playerGamesPlayedColIndex = 7;

module.exports = {
    BASE_URL,
    ES_SUBPATH,
    SEASON_SUBPATH,
    SEASON_PREFFIX,
    SEASON_CLASSIFICATION_TABLE_ID,
    FIRST_STARTING_YEAR,
    LAST_STARTING_YEAR,
    POS_MAP,
    MIN_GAMES,
    playerDorsalColIndex,
    playerPicColIndex,
    playerGamesPlayedColIndex
}