const SpotifyWebApi = require('spotify-web-api-node');

const spotifyApi = new SpotifyWebApi({
    clientId: 'your-client-id',
    clientSecret: 'your-client-secret'
});

module.exports = spotifyApi;