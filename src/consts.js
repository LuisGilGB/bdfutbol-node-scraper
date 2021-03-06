const BASE_URL = 'https://www.bdfutbol.com/';
const ES_SUBPATH = 'es/';
const SEASON_SUBPATH = 't/';
const SEASON_PREFIX = 't';

const SEASON_CLASSIFICATION_TABLE_ID = 'classific';
const ROSTER_TABLE_ID = 'taulaplantilla';

const PORTERO = 'portero';
const DEFENSA = 'defensa';
const CENTROCAMPISTA = 'centrocampista';
const DELANTERO = 'delantero';

const FIRST_STARTING_YEAR = 1928;
const LAST_STARTING_YEAR = 2019;

const INVALID_STARTING_YEARS = [1936, 1937, 1938];

const POS_MAP = {
    por: PORTERO,
    def: DEFENSA,
    ltd: DEFENSA,
    lti: DEFENSA,
    cen: DEFENSA,
    mig: CENTROCAMPISTA,
    dav: DELANTERO,
    dac: DELANTERO
}

const MIN_GAMES = 3;

const CLASSIFICATION_COLUMNS = {
    CLUB_CREST_COL: 1,
    CLUB_NAME_COL: 2
}

const ROSTER_COLUMNS = {
    PLAYER_DORSAL_COL: 0,
    PLAYER_PIC_COL: 1,
    PLAYER_FLAG_COL: 2,
    PLAYER_NAME_COL: 3,
    PLAYER_POSITION: 4,
    PLAYER_AGE: 5,
    PLAYER_GAMES_PLAYED: 6,
    PLAYER_GAME_STARTINGS: 7,
    PLAYER_GAMES_COMPLETED: 8,
    PLAYER_MINUTES_REVERSE: 3,
    PLAYER_YELLOW_CARDS_REVERSE: 2,
    PLAYER_RED_CARDS_REVERSE: 1,
    PLAYER_GOALS_REVERSE: 0
}

module.exports = {
    BASE_URL,
    ES_SUBPATH,
    SEASON_SUBPATH,
    SEASON_PREFIX,
    SEASON_CLASSIFICATION_TABLE_ID,
    ROSTER_TABLE_ID,
    PORTERO,
    DEFENSA,
    CENTROCAMPISTA,
    DELANTERO,
    FIRST_STARTING_YEAR,
    LAST_STARTING_YEAR,
    INVALID_STARTING_YEARS,
    POS_MAP,
    MIN_GAMES,
    CLASSIFICATION_COLUMNS,
    ROSTER_COLUMNS
}