const { app, BrowserWindow, ipcMain } = require('electron');
const fetch = require('electron-fetch').default;
const { JSDOM } = require('jsdom');
const path = require('path');
const SpotifyWebApi = require('spotify-web-api-node');
const fs = require('fs');
require('dotenv').config();

let lyricsApiUrls = [];
let startSearching = true;
let artist = '';

let lyricsUserId = process.env.LYRICSAPIUSERID;
let lyricsToken = process.env.LYRICSAPITOKEN;
let spotifyClientId = process.env.SPOTIFYWEBAPIID;
let spotifyClientSecret = process.env.SPOTIFYWEBAPISECRET;

let restoreCredentialsWindow = false;

let credentialsWindow;
async function createCredentialsWindow() {
    credentialsWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        },
        autoHideMenuBar: true,
    });

    credentialsWindow.loadFile(path.join(__dirname, '../build/credentials.html'));

    ipcMain.on('credentials-submitted', (event, userData) => {
        if (restoreCredentialsWindow) {
            fs.writeFileSync('.env', 
                `LYRICSAPIUSERID="${userData[0]}"\nLYRICSAPITOKEN="${userData[1]}"\n` + 
                `SPOTIFYWEBAPIID="${userData[2]}"\nSPOTIFYWEBAPISECRET="${userData[3]}"`
            );
            console.log('.env file created with your credentials.');

            lyricsUserId = userData[0];
            lyricsToken = userData[1];
            spotifyClientId = userData[2];
            spotifyClientSecret = userData[3];
            restoreCredentialsWindow = false;

            credentialsWindow.close();
            createMainWindow();
        }
    });

    credentialsWindow.on('closed', () => {
        credentialsWindow = null;
    });
}

app.on('ready', () =>{
    if (!fs.existsSync('.env')) {
        restoreCredentialsWindow = true;
        createCredentialsWindow();
    } else {
        console.log('.env file already exists.');
        createMainWindow();
    }
});

async function spotifySearch() {
    const spotifyApi = new SpotifyWebApi({
        clientId: spotifyClientId,
        clientSecret: spotifyClientSecret
    });

    try {
        const data = await spotifyApi.clientCredentialsGrant();
        spotifyApi.setAccessToken(data.body.access_token);

        const searchData = await spotifyApi.searchTracks(`artist:"${artist}"`, { limit: 15 });
        const tracks = searchData.body.tracks.items;

        if (tracks.length > 0) {
            searchedTracks = [];
            is_new_track = false;

            tracks.forEach(async (track) => {
                let cleanedArtist = artist.replace(/ /g, "%20");
                let cleanedTrack = track.name.replace(/ /g, "%20");

                if (searchedTracks.length === 0 || !searchedTracks.includes(cleanedTrack)) {
                    searchedTracks.push(cleanedTrack);
                    is_new_track = true;
                }

                if (is_new_track) {
                    let apiUrlStart = 'https://www.stands4.com/services/v2/lyrics.php';
                    let apiUrlUser = `?uid=${lyricsUserId}`;
                    let apiUrlToken = `&tokenid=${lyricsToken}`;
                    let apiUrlTerm = `&term=${cleanedTrack}`;
                    let apiUrlArtist = `&artist=${cleanedArtist}`;
                    let apiUrlFormat = '&format=json';
                    let ApiUrlFull = [apiUrlStart, apiUrlUser, apiUrlToken, 
                                        apiUrlTerm, apiUrlArtist, apiUrlFormat];
                    let lyricsApiUrl = ApiUrlFull.join('');
                    lyricsApiUrls.push(lyricsApiUrl);
                }

                is_new_track = false;
            });
        }
    } catch (error) {
        restoreCredentialsWindow = true;
        mainWindow.close();
        createCredentialsWindow();
    }
}

let mainWindow;

const createMainWindow = () => {
    mainWindow = new BrowserWindow({
        width:800,
        height:600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        },
        autoHideMenuBar: true,
    });

    mainWindow.loadFile(path.join(__dirname, '../build/index.html'));

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
};

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

ipcMain.on('textarea-value-changed', (event, newValue) => {
    startSearching = true;
    artist = newValue;
    spotifySearch();
});

ipcMain.on('fetch-lyrics', async (event) => {
    async function startFetchingLyrics() {
        if (lyricsApiUrls.length > 0 && startSearching) {
            startSearching = false;
            const replyData = await fetchLyrics();
            lyricsApiUrls = [];
            event.reply('lyrics-fetched', replyData);
        }
    }

    setInterval(startFetchingLyrics, 2000);
});

async function fetchLyrics() {
    try {
        const lyricsPromises = lyricsApiUrls.map(async (apiUrl) => {
            const response = await fetch(apiUrl);
            const data = await response.json();
    
            if (data["result"]) {
                let songLink = data["result"]["song-link"];
                if (data["result"].length > 0) {
                    songLink = data["result"][0]["song-link"];
                } else {
                    songLink = data["result"]["song-link"];
                }
    
                const response2 = await fetch(songLink);
                const lyricsInfo = await response2.text();
    
                const dom = new JSDOM(lyricsInfo);
                const lyricsText = dom.window.document.getElementById('lyric-body-text').textContent.trim();
                const titleText = dom.window.document.getElementById('lyric-title-text').textContent.trim();
    
                if (lyricsText && titleText) {
                    const data = {
                        title: titleText,
                        lyrics: lyricsText
                    };
    
                    return data;
                } else {
                    return null;
                }
            } else {
                return null;
            }
        });

        const lyricsDataArray = await Promise.all(lyricsPromises);
        return lyricsDataArray.filter(data => data !== null);
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};