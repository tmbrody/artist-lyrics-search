import React from 'react';
import ReactDOM from 'react-dom/client';
import './app.css';

import LyricsDisplay from './lyricsdisplay';

function App() {
    return (
        <div>
            <div className="root-top">
                <h1>Singer Lyrics Search</h1>
                <div className="search-textbox">
                    <textarea placeholder="Enter singer name here"></textarea>
                    <button>🔍</button>
                </div>
            </div>
            <div className='space-background'>
                <div className='space-center'>
                    <div className="load-icon">
                        <div className="load-icon-tail">
                            <div className='load-icon-sphere'></div>
                        </div>
                    </div>
                </div>
                <div className='star-container'></div>
            </div>
            <div className="App">
                <LyricsDisplay />
            </div>
        </div>
    );
}
document.addEventListener('DOMContentLoaded', function () {
    const searchTextarea = document.querySelector('.search-textbox textarea');
    const searchButton = document.querySelector('.search-textbox button');

    const rootTop = document.querySelector('.root-top');
    const loadIcon = document.querySelector('.load-icon');

    const starContainer = document.querySelector('.star-container');
    const allSongsContainer = document.querySelector('.all-songs-container');

    function searchEvent() {
        const newValue = searchTextarea.value;
        window.api.send('textarea-value-changed', newValue);

        loadIcon.style.opacity = 1;

        window.api.receive('lyrics-fetched', () => {
            loadIcon.style.opacity = 0;
        });
    }

    searchTextarea.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            searchEvent();
        }
    });

    searchButton.addEventListener('click', function () {
        searchEvent();
    });

    document.body.addEventListener('click', function (event) {
        if (event.target !== searchTextarea) {
            if (rootTop.style.marginTop !== '' && searchTextarea.value === '') {
                allSongsContainer.style.opacity = 0;

                starContainer.style.animation = 'star-fade-out 0.5s ease-out';
                starContainer.style.opacity = 0;
                loadIcon.style.opacity = 0;

                rootTop.style.animation = 'root-move-to-bottom 0.5s ease-out';
                rootTop.style.marginTop = '50vh';
            }
        } else {
            allSongsContainer.style.opacity = 1;

            starContainer.style.animation = 'star-fade-in 0.5s ease-out'
            starContainer.style.opacity = 1;

            rootTop.style.animation = 'root-move-to-top 0.5s ease-out';
            rootTop.style.marginTop = 0;
        }
    });
});


const root = document.getElementById('root');
const reactRoot = ReactDOM.createRoot(root);
reactRoot.render(<App />);