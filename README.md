# singer-lyrics-search

This is an Electron/React app that locates some song titles and lyrics for any artist entered into the search bar. This app uses the [Spotify Web API](https://developer.spotify.com/documentation/web-api) to fetch the song titles for the given artist, and it uses the [STANDS4 Lyrics API](https://www.lyrics.com/lyrics_api.php) to fetch the lyrics for each song.

### Lyrics API has several limitations and issues, so it's unable to find lyrics for many different songs.

That's why I decided to treat this as a test app to show basic functionality, and at some point in the future, I'll make a second version of this app that will use a different API to allow for full, extensive searches that will actually find all of the song titles and lyrics for any given artist.