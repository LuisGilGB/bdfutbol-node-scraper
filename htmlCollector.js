const fs = require('fs');
const collectPages = require('./src/bdFutbolPagesCollector.js')

const htmlSavesDir = './htmlSaves';
const clubsDir = '/clubs';
const playersDir = '/players';
const seasonsDir = '/seasons';

const logDirExists = (dirLogAlias = 'Dir') => console.log(`${dirLogAlias} directory already exists, so no need to create it.`);
const logDirDoesNotExist = (dirLogAlias = 'Dir') => console.log(`${dirLogAlias} directoty doesn't exist, so we create it now.`);
const logCreatedDir = (dirLogAlias = 'Dir') => console.log(`${dirLogAlias} directoty successfully created.`);

const createChildDir = (dir = '/dir') => fs.mkdirSync(`${htmlSavesDir}${dir}`);

const checkAndCreateChildDir = (dir = '/dir', dirLogAlias = 'Dir') => {
    if (fs.existsSync(`${htmlSavesDir}${dir}`)) {
        logDirExists(dirLogAlias);
    } else {
        logDirDoesNotExist(dirLogAlias);
        createChildDir(dir);
        logCreatedDir(dirLogAlias);
    }
}

if (fs.existsSync(htmlSavesDir)) {
    logDirExists('HTML saves');
    checkAndCreateChildDir(clubsDir, 'Clubs');
    checkAndCreateChildDir(playersDir, 'Players');
    checkAndCreateChildDir(seasonsDir, 'Seasons');
} else {
    logDirDoesNotExist('HTML saves');
    fs.mkdirSync(htmlSavesDir);
    createChildDir(clubsDir);
    createChildDir(playersDir);
    createChildDir(seasonsDir);
    console.log("HTML saves directoty successfully created with all its children directories.");
}

collectPages('https://www.bdfutbol.com/es/t/t2018-19.html', `${htmlSavesDir}${seasonsDir}/t2018-19.html`, '#classification');

console.log('Done');