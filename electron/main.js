const { app, BrowserWindow, ipcMain } = require('electron');
const fetch = require('electron-fetch').default;
const { JSDOM } = require('jsdom');
const path = require('path');
const spotifyApi = require('./spotify');
require('dotenv').config();

let lyricsApiUrls = [];

let startSearch = false;

let artist = 'Taylor Swift';
let formerArtist = '';

const lyricsUserId = process.env.LYRICSAPIUSERID;
const lyricsToken = process.env.LYRICSAPITOKEN;

function spotifySearch() {    
    spotifyApi.clientCredentialsGrant()
        .then(data => {
            spotifyApi.setAccessToken(data.body.access_token);
    
            spotifyApi.searchTracks(`artist:"${artist}"`, { limit: 50 })
                .then(data => {
                    const tracks = data.body.tracks.items;
                    tracks.forEach(track => {
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
                    startSearch = true;
                    });
                })
                .catch(error => {
                    console.error('Error searching for songs:', error);
                });
        })
        .catch(error => {
            console.error('Error obtaining access token:', error);
        });
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

    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));

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
    if (newValue === artist && newValue !== formerArtist && !startSearch) {
        formerArtist = artist;
        spotifySearch();
    }
});

ipcMain.on('create-auth-button', () => {
    mainWindow.webContents.send('create-auth-button');
});

ipcMain.on('fetch-lyrics', async (event) => {
    async function startFetchingLyrics() {
        if (startSearch) {
            startSearch = false;
            const replyData = await fetchLyrics();
            event.reply('lyrics-fetched', replyData);
        }
    }

    setInterval(startFetchingLyrics, 500);
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
                    console.log('Lyrics not found on the page.');
                    return null;
                }
            } else {
                console.log('No results found.');
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