import React, { useEffect, useState } from 'react';
import './app.css';

const LyricsDisplay = () => {

    const [isCollapsed, setIsCollapsed] = useState(true);
    const [lyricsData, setLyricsData] = useState({ title: '', lyrics: '' });

    useEffect(() => {
        if (window.api) {
        
            window.api.send('fetch-lyrics');

            window.api.receive('lyrics-fetched', (data) => {
                setLyricsData(data);
            });

            return () => {
                window.api.removeAllListeners('lyrics-fetched');
            };
        }
    }, []);

    const toggleLyrics = () => {
        setIsCollapsed(!isCollapsed);
    };

    return ( 
        <div className={'song-container'}>
            <div className='song-title' onClick={toggleLyrics}>
                <h3>{lyricsData.title}</h3>
            </div>
            <div className={`lyrics ${isCollapsed ? 'collapsed' : 'expanded'}`}>
                {lyricsData.lyrics.split('\n').map((line, index) => (
                    <React.Fragment key={index}>
                        {line}
                        <br />
                    </React.Fragment>
                ))}
            </div>
            <div className='song-title' onClick={toggleLyrics}>
                <button className='toggle-button'>
                    {isCollapsed ? String.fromCharCode(9660) : String.fromCharCode(9650)}
                </button>
            </div>
        </div>
    );
};

export default LyricsDisplay;