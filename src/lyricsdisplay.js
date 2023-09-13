import React, { useState } from 'react';
import './app.css';

function LyricsDisplay() {

    const [isCollapsed, setIsCollapsed] = useState(true);

    const toggleLyrics = () => {
        setIsCollapsed(!isCollapsed);
    };

    return ( 
        <div className={'song-container'}>
            <div className='song-title' onClick={toggleLyrics}>
                <h3>Forever Young</h3>
            </div>
            <div className={`lyrics ${isCollapsed ? 'collapsed' : 'expanded'}`}>
                <p>
                    Let's dance in style, let's dance for a while<br />
                    Heaven can wait we're only watching the skies<br />
                    Hoping for the best, but expecting the worst<br />
                    Are you gonna drop the bomb or not?<br /><br />

                    Let us die young or let us live forever<br />
                    We don't have the power, but we never say never<br />
                    Sitting in a sandpit, life is a short trip<br />
                    The music's for the sad man<br /><br />

                    Can you imagine when this race is won?<br />
                    Turn our golden the faces into the sun<br />
                    Praising our leaders, we're getting in tune<br />
                    The music's played by the, the madman<br /><br />

                    Forever young<br />
                    I want to be forever young<br />
                    Do you really want to live forever?<br />
                    Forever, and ever<br /><br />

                    Forever young<br />
                    I want to be forever young<br />
                    Do you really want to live forever?<br />
                    Forever young<br /><br />

                    Some are like water, some are like the heat<br />
                    Some are a melody and some are the beat<br />
                    Sooner or later they all will be gone<br />
                    Why don't they stay young?<br /><br />

                    It's so hard to get old without a cause<br />
                    I don't want to perish like a fading horse<br />
                    Youth's like diamonds in the sun,<br />
                    And diamonds are forever<br /><br />

                    So many adventures given up today<br />
                    So many songs we forgot to play<br />
                    So many dreams swinging out of the blue<br />
                    Oh let it come true<br /><br />

                    Forever young<br />
                    I want to be forever young<br />
                    Do you really want to live forever<br />
                    Forever, and ever?<br /><br />

                    Forever young<br />
                    I want to be forever young<br />
                    Do you really want to live forever<br />
                    Forever, and ever?<br /><br />

                    Forever young<br />
                    I want to be forever young<br />
                    Do you really want to live forever<br />
                    Forever young<br /><br />
                </p>
            </div>
            <div className='song-title' onClick={toggleLyrics}>
                <button className='toggle-button'>
                    {isCollapsed ? String.fromCharCode(9660) : String.fromCharCode(9650)}
                </button>
            </div>
        </div>
    );
}

export default LyricsDisplay;