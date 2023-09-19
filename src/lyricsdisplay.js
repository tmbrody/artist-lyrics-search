import React, { useEffect, useState } from 'react';
import './app.css';

const LyricsDisplay = () => {

    const [isCollapsedArray, setIsCollapsedArray] = useState(true);
    const [lyricsDataArray, setLyricsDataArray] = useState([]);

    useEffect(() => {
        if (window.api) {
        
            window.api.send('fetch-lyrics');

            window.api.receive('lyrics-fetched', (data) => {
                setLyricsDataArray(data);

                setIsCollapsedArray(new Array(data.length).fill(true));
            });

            return () => {
                window.api.removeAllListeners('lyrics-fetched');
            };
        }
    }, []);

    const toggleLyrics = (index) => {
        setIsCollapsedArray((prevIsCollapsedArray) => {
            const newIsCollapsedArray = [...prevIsCollapsedArray];
            newIsCollapsedArray[index] = !newIsCollapsedArray[index];
            return newIsCollapsedArray;
        });
    };

    return ( 
        <div className='all-songs-container'>
            {lyricsDataArray.map((lyricsData, index) => (
                <div 
                    key={index} 
                    className={'song-container'} 
                    style={{ animationDelay: `${index * 200}ms` }}
                >
                    <div className='song-title-click' onClick={() => toggleLyrics(index)}>
                        <h3>{lyricsData.title}</h3>
                    </div>
                    <div className={`neon-text lyrics ${isCollapsedArray[index] ? 'collapsed' : 'expanded'}`}>
                        {lyricsData.lyrics.split('\n').map((line, index) => (
                            <React.Fragment key={index}>
                                {line}
                                <br />
                            </React.Fragment>
                        ))}
                    </div>
                    <div className='song-title-click' onClick={() => toggleLyrics(index)}>
                        <button className='neon-text toggle-button'>
                            {isCollapsedArray[index] ? String.fromCharCode(9660) : String.fromCharCode(9650)}
                        </button>
                    </div>
                </div>
            ))}
        </div> 
    );
};

export default LyricsDisplay;