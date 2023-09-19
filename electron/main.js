const { app, BrowserWindow, ipcMain } = require('electron');
const fetch = require('electron-fetch').default;
const { JSDOM } = require('jsdom');
const path = require('path');
const spotifyApi = require('./spotify');
require('dotenv').config();

let lyricsApiUrls = [];
let startSearching = true;
let artist = '';

const lyricsUserId = process.env.LYRICSAPIUSERID;
const lyricsToken = process.env.LYRICSAPITOKEN;

async function spotifySearch() {    
    try {
        const data = await spotifyApi.clientCredentialsGrant();
        spotifyApi.setAccessToken(data.body.access_token);

        const searchData = await spotifyApi.searchTracks(`artist:"${artist}"`);
        const tracks = searchData.body.tracks.items;

        if (tracks.length > 0) {
            tracks.forEach(async (track) => {
                let cleanedTrack = track.name.replace(/ /g, "%20");
                let cleanedArtist = artist.replace(/ /g, "%20");

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
            });
        }
    } catch (error) {
        console.error('Error obtaining access token:', error);
    }
}

let mainWindow;

const createWindow = () => {
    mainWindow = new BrowserWindow({
        width:800,
        height:600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        }
    });

    mainWindow.loadFile(path.join(__dirname, '../build/index.html'));

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
};

app.on('ready', () =>{
    createWindow();
});

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