const { app, BrowserWindow, ipcMain } = require('electron');
const fetch = require('electron-fetch').default;
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

const filePath = './response.json';

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

    mainWindow.webContents.openDevTools();

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
};

app.whenReady().then(() => {
    createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

ipcMain.on('fetch-lyrics', async (event) => {
    const lyricsData = await fetchLyrics();
    event.reply('lyrics-fetched', lyricsData);
});

async function fetchLyrics() {
    try {
        const rawData = fs.readFileSync(filePath);
        const jsonData = JSON.parse(rawData);
        // const response = await fetch(apiUrl);

        // const data = await response.json();

        if (jsonData.result.length > 0) {
            const { "song-link": songLink } = jsonData.result[0];

            const response = await fetch(songLink);
            const lyricsInfo = await response.text();

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
        }
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};