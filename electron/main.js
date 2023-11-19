const { app, BrowserWindow, ipcMain } = require('electron');
const fetch = require('electron-fetch').default;
const path = require('path');
const SpotifyWebApi = require('spotify-web-api-node');
const fs = require('fs');
require('dotenv').config();

let musixmatchApiUrls = [];
let startSearching = true;
let artist = '';

let musixmatchApiKey = process.env.MUSIXMATCHAPIKEY;
let spotifyClientId = process.env.SPOTIFYWEBAPIID;
let spotifyClientSecret = process.env.SPOTIFYWEBAPISECRET;

let restoreCredentialsWindow = false;

let credentialsWindow;

// Function to create a window for entering credentials
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
            // Write credentials to .env file
            fs.writeFileSync('.env', 
                `MUSIXMATCHAPIKEY="${userData[0]}"\n` + 
                `SPOTIFYWEBAPIID="${userData[1]}"\nSPOTIFYWEBAPISECRET="${userData[2]}"`
            );

            // Update variables with new credentials
            musixmatchApiKey = userData[0];
            spotifyClientId = userData[1];
            spotifyClientSecret = userData[2];
            restoreCredentialsWindow = false;

            // Close the credentials window and create the main window
            credentialsWindow.close();
            createMainWindow();
        }
    });

    credentialsWindow.on('closed', () => {
        credentialsWindow = null;
    });
}

app.on('ready', () => {
    if (!fs.existsSync('.env')) {
        restoreCredentialsWindow = true;
        createCredentialsWindow();
    } else {
        createMainWindow();
    }
});

async function spotifySearch() {
    const spotifyApi = new SpotifyWebApi({
        clientId: spotifyClientId,
        clientSecret: spotifyClientSecret
    });

    try {
        // Request a client credentials grant
        const data = await spotifyApi.clientCredentialsGrant();
        spotifyApi.setAccessToken(data.body.access_token);

        // Search for tracks by the specified artist
        const searchData = await spotifyApi.searchTracks(`artist:"${artist}"`, { limit: 50 });
        const tracks = searchData.body.tracks.items;

        // If tracks were found, create an array of Musixmatch API URLs
        if (tracks.length > 0) {
            searchedTracks = [];
            is_new_track = false;

            tracks.forEach(async (track) => {
                if (searchedTracks.length === 0 || !searchedTracks.includes(track.name)) {
                    searchedTracks.push(track.name);
                    is_new_track = true;
                }

                // If the track is new, create a Musixmatch API URL
                if (is_new_track) {
                    const apiUrl = `https://api.musixmatch.com/ws/1.1/track.search?q=${encodeURIComponent(
                        track.name
                    )}&q_artist=${encodeURIComponent(artist)}&apikey=${musixmatchApiKey}`;

                    musixmatchApiUrls.push(apiUrl);
                }

                is_new_track = false;
            });
        }
    } catch (error) {
        // Handle errors by restoring credentials window
        restoreCredentialsWindow = true;
        mainWindow.close();
        createCredentialsWindow();
    }
}

let mainWindow;

// Function to create the main application window
const createMainWindow = () => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
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

// Handle window close event for all windows
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Listen for changes in the artist input field
ipcMain.on('textarea-value-changed', (event, newValue) => {
    startSearching = true;
    artist = newValue;
    spotifySearch();
});

// Listen for a request to fetch lyrics
ipcMain.on('fetch-lyrics', async (event) => {
    async function startFetchingLyrics() {
        if (musixmatchApiUrls.length > 0 && startSearching) {
            startSearching = false;
            const replyData = await fetchLyrics();
            musixmatchApiUrls = [];
            event.reply('lyrics-fetched', replyData);
        }
    }

    // Periodically fetch lyrics
    setInterval(startFetchingLyrics, 2000);
});

// Function to fetch lyrics from Musixmatch
async function fetchLyrics() {
    try {
        const lyricsPromises = musixmatchApiUrls.map(async (apiUrl) => {
            const response = await fetch(apiUrl);
            const data = await response.json();

            if (
                data.message &&
                data.message.body &&
                data.message.body.track_list &&
                data.message.body.track_list.length > 0
            ) {
                const trackId = data.message.body.track_list[0].track.track_id;

                const lyricsUrl = `https://api.musixmatch.com/ws/1.1/track.lyrics.get?track_id=${trackId}&apikey=${musixmatchApiKey}`;
    
                const lyricsResponse = await fetch(lyricsUrl);
                const lyricsData = await lyricsResponse.json();

                if (
                    lyricsData.message &&
                    lyricsData.message.body &&
                    lyricsData.message.body.lyrics
                ) {
                    const title = data.message.body.track_list[0].track.track_name;
                    const lyrics = lyricsData.message.body.lyrics.lyrics_body;
    
                    return {
                        title: title,
                        lyrics: lyrics
                    };
                } else {
                    return null;
                }
            } else {
                return null;
            }
        });

        // Wait for all lyrics promises to resolve and filter out null results
        const lyricsDataArray = await Promise.all(lyricsPromises);
        return lyricsDataArray.filter(data => data !== null);
    } catch (error) {
        throw error;
    }
};
