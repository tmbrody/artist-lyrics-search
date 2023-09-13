import React from 'react';
import ReactDOM from 'react-dom/client';
import './app.css';

import LyricsDisplay from './lyricsdisplay';

function App() {
    return (
        <div className="App">
            <LyricsDisplay />
        </div>
    );
}

const root = document.getElementById('root');
const reactRoot = ReactDOM.createRoot(root);
reactRoot.render(<App />);