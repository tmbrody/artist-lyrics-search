import React from 'react';
import ReactDOM from 'react-dom/client';
import './app.css';

import LyricsDisplay from './lyricsdisplay';

function App() {
    return (
        <React.StrictMode>
            <div className='space-background'>
                <div className='space-center'></div>
                <div className='star-container'></div>
            </div>
            <div className="App">
                <LyricsDisplay />
            </div>
        </React.StrictMode>
    );
}

const textarea = document.querySelector('#search-textbox textarea');

textarea.addEventListener('input', () => {
    const newValue = textarea.value;

    window.api.send('textarea-value-changed', newValue);
});

const root = document.getElementById('root');
const reactRoot = ReactDOM.createRoot(root);
reactRoot.render(<App />);