import React, { useEffect, useState } from 'react';
import './app.css';

const LyricsDisplay = () => {

    const [isCollapsedArray, setIsCollapsedArray] = useState(true);
    const [lyricsDataArray, setLyricsDataArray] = useState([]);

    useEffect(() => {
        if (window.api) {
        
            // Send a message to fetch lyrics data from an external source.
            window.api.send('fetch-lyrics');

            // Listen for the response and update the component's state when lyrics data is received.
            window.api.receive('lyrics-fetched', (data) => {
                setLyricsDataArray(data);

                // Initialize the isCollapsedArray to an array of "true" values with the same length as the lyrics data.
                setIsCollapsedArray(new Array(data.length).fill(true));
            });

            // Remove the event listener when the component is unmounted.
            return () => {
                window.api.removeAllListeners('lyrics-fetched');
            };
        }
    }, []);

    // Define a function to toggle the collapse/expand state of lyrics at a specific index.
    const toggleLyrics = (index) => {
        setIsCollapsedArray((prevIsCollapsedArray) => {
            const newIsCollapsedArray = [...prevIsCollapsedArray];
            newIsCollapsedArray[index] = !newIsCollapsedArray[index];
            return newIsCollapsedArray;
        });
    };

    // Render the component's JSX content.
    return ( 
        <div className='all-songs-container'>
            {lyricsDataArray.map((lyricsData, index) => (
                <div 
                    key={index} 
                    className={'song-container'} 
                    style={{ animationDelay: `${index * 200}ms` }} // Apply animation delay for visual effect.
                >
                    <div className='song-title-click' onClick={() => toggleLyrics(index)}>
                        <h3>{lyricsData.title}</h3>
                    </div>
                    <div className={`neon-text lyrics ${isCollapsedArray[index] ? 'collapsed' : 'expanded'}`}>
                        {/* Split lyrics text by line and render each line separately. */}
                        {lyricsData.lyrics.split('\n').map((line, index) => (
                            <React.Fragment key={index}>
                                {line}
                                <br /> {/* Add a line break between each line of lyrics. */}
                            </React.Fragment>
                        ))}
                    </div>
                    <div className='song-title-click' onClick={() => toggleLyrics(index)}>
                        <button className='neon-text toggle-button'>
                            {/* Display an up or down arrow icon based on the collapse/expand state. */}
                            {isCollapsedArray[index] ? String.fromCharCode(9660) : String.fromCharCode(9650)}
                        </button>
                    </div>
                </div>
            ))}
        </div> 
    );
};

export default LyricsDisplay;