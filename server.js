const express = require('express');
const axios = require('axios');
const querystring = require('querystring');
const path = require('path');
const app = express();

const CLIENT_ID = '4a6baa63ea2641ada0e3e9c1f8e50a84';
const CLIENT_SECRET = '05145083e7b94c3e90d9b66277164318';
const REDIRECT_URI = 'https://mouri69-recommender.vercel.app/callback';

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/callback', async (req, res) => {
    const code = req.query.code;

    if (!code) {
        return res.status(400).send('Authorization code is missing.');
    }

    try {
        const tokenResponse = await axios.post('https://accounts.spotify.com/api/token', querystring.stringify({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: REDIRECT_URI,
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const { access_token } = tokenResponse.data;

        const recommendationsResponse = await axios.get('https://api.spotify.com/v1/recommendations', {
            headers: {
                'Authorization': `Bearer ${access_token}`
            },
            params: {
                seed_genres: 'pop',
                limit: 10
            }
        });

        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link rel="stylesheet" href="styles.css">
                <title>Recommendations</title>
            </head>
            <body>
                <div class="container">
                    <h1>Recommended Songs</h1>
                    <ul>
                        ${recommendationsResponse.data.tracks.map(track => `
                            <li>
                                <img src="${track.album.images[0].url}" alt="${track.name}" style="width: 50px; height: 50px; object-fit: cover;">
                                <strong>${track.name}</strong> by ${track.artists.map(artist => artist.name).join(', ')}<br>
                                Album: ${track.album.name}<br>
                                Release Date: ${track.album.release_date}<br>
                                <audio controls>
                                    <source src="${track.preview_url}" type="audio/mpeg">
                                    Your browser does not support the audio element.
                                </audio>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            </body>
            </html>
        `);
    } catch (error) {
        console.error('Error obtaining access token or recommendations:', error.message);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
