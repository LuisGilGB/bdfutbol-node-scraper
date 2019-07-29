const baseUrl = 'https://www.bdfutbol.com/';
const esSubpath = 'es/';

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
    baseUrl,
    esSubpath,
    POS_MAP,
    MIN_GAMES,
    playerDorsalColIndex,
    playerPicColIndex,
    playerGamesPlayedColIndex
}