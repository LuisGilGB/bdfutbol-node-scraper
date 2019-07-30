const fs = require('fs');

const htmlSavesDir = './htmlSaves';
const clubsDir = '/clubs';
const playersDir = '/players';
const seasonsDir = '/seasons';

if (fs.existsSync(htmlSavesDir)) {
    console.log("HTML saves dir already exists, so no need to create it.");
    if (fs.existsSync(`${htmlSavesDir}${clubsDir}`)) {
        console.log("Clubs directory already exists, so no need to create it.");
    } else {
        console.log("Clubs directoty doesn't exist, so we create it now.");
        fs.mkdirSync(`${htmlSavesDir}${clubsDir}`);
        console.log("Clubs directoty successfully created.");
    }
    if (fs.existsSync(`${htmlSavesDir}${playersDir}`)) {
        console.log("Players directory already exists, so no need to create it.");
    } else {
        console.log("Players directoty doesn't exist, so we create it now.");
        fs.mkdirSync(`${htmlSavesDir}${playersDir}`);
        console.log("Players directoty successfully created.");
    }
    if (fs.existsSync(`${htmlSavesDir}${seasonsDir}`)) {
        console.log("Seasons directory already exists, so no need to create it.");
    } else {
        console.log("Seasons directoty doesn't exist, so we create it now.");
        fs.mkdirSync(`${htmlSavesDir}${seasonsDir}`);
        console.log("Seasons directoty successfully created.");
    }
} else {
    console.log("HTML saves directoty doesn't exist, so we create it now.");
    fs.mkdirSync(htmlSavesDir);
    fs.mkdirSync(`${htmlSavesDir}${clubsDir}`);
    fs.mkdirSync(`${htmlSavesDir}${playersDir}`);
    fs.mkdirSync(`${htmlSavesDir}${seasonsDir}`);
    console.log("HTML saves directoty successfully created with all its children directories.");
}

console.log('Done');