const { BrowserWindow, app } = require('electron');
const fetch = require('electron-fetch').default;
const { JSDOM } = require('jsdom');
const fs = require('fs');

const filePath = './response.json';

let mainWindow;

const createWindow = () => {
    mainWindow = new BrowserWindow({
        width:800,
        height:600,
        webPreferences: {
            nodeIntegration: true
        }
    })

    mainWindow.loadFile('./index.html');

    mainWindow.webContents.openDevTools();

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(() => {
    createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
})

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
})

async function fetchLyrics() {

    try {
        const rawData = fs.readFileSync(filePath);
        const jsonData = JSON.parse(rawData);

        if (jsonData.result.length > 0) {
            const { "song-link": songLink } = jsonData.result[0];

            const response = await fetch(songLink);
            const lyricsInfo = await response.text();

            const dom = new JSDOM(lyricsInfo);
            const lyricsText = dom.window.document.getElementById('lyric-body-text').textContent.trim();
            const titleText = dom.window.document.getElementById('lyric-title-text').textContent.trim();

            if (lyricsText && titleText) {
                const formattedTitle = `<h3>${titleText}</h3>`
                const formattedLyrics = `<p>${lyricsText.replace(/\n/g, '<br />').replace(/"/g, '\\"')}</p>`;
                mainWindow.webContents.executeJavaScript(`document.getElementById('root').innerHTML = 
                                                            "${formattedTitle}${formattedLyrics}";`);
            } else {
                console.log('Lyrics not found on the page.');
            }
        } else {
            console.log('No results found.');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

fetchLyrics();