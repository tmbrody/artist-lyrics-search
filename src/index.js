import React from 'react';
import ReactDOM from 'react-dom/client';
import './app.css';

import LyricsDisplay from './lyricsdisplay';

function App() {
    return (
        <div>
            {/* Header section */}
            <div className="root-top">
                <h1>Singer Lyrics Search</h1>
                <div className="search-textbox">
                    <textarea placeholder="Enter singer name here"></textarea>
                    <button>🔍</button>
                </div>
            </div>
            {/* Loading animation and background */}
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
            {/* Main content */}
            <div className="App">
                <LyricsDisplay />
            </div>
        </div>
    );
}

// Listen for the DOMContentLoaded event to ensure the DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    // Select relevant DOM elements
    const searchTextarea = document.querySelector('.search-textbox textarea');
    const searchButton = document.querySelector('.search-textbox button');

    const rootTop = document.querySelector('.root-top');
    const loadIcon = document.querySelector('.load-icon');

    const starContainer = document.querySelector('.star-container');
    const allSongsContainer = document.querySelector('.all-songs-container');

    // Function to handle the search event
    function searchEvent() {
        const newValue = searchTextarea.value;
        window.api.send('textarea-value-changed', newValue);

        loadIcon.style.opacity = 1;

        // Receive a signal when lyrics are fetched and hide the loading icon
        window.api.receive('lyrics-fetched', () => {
            loadIcon.style.opacity = 0;
        });
    }

    // Listen for Enter key press in the textarea to trigger a search
    searchTextarea.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            searchEvent();
        }
    });

    // Listen for button click to trigger a search
    searchButton.addEventListener('click', function () {
        searchEvent();
    });

    // Listen for clicks anywhere on the page except the textarea
    document.body.addEventListener('click', function (event) {
        if (event.target !== searchTextarea) {
            // If the textarea is not empty, hide the search bar and show the lyrics
            if (rootTop.style.marginTop !== '' && searchTextarea.value === '') {
                allSongsContainer.style.opacity = 0;

                starContainer.style.animation = 'star-fade-out 0.5s ease-out';
                starContainer.style.opacity = 0;
                loadIcon.style.opacity = 0;

                rootTop.style.animation = 'root-move-to-bottom 0.5s ease-out';
                rootTop.style.marginTop = '50vh';
            }
        // If the textarea is empty, show the search bar and hide the lyrics
        } else {
            allSongsContainer.style.opacity = 1;

            starContainer.style.animation = 'star-fade-in 0.5s ease-out'
            starContainer.style.opacity = 1;

            rootTop.style.animation = 'root-move-to-top 0.5s ease-out';
            rootTop.style.marginTop = 0;
        }
    });
});

// Get the root element and render the App component
const root = document.getElementById('root');
const reactRoot = ReactDOM.createRoot(root);
reactRoot.render(<App />);