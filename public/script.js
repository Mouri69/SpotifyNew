// JavaScript code for the client side

// Function to handle Spotify login
document.getElementById('login-button').addEventListener('click', () => {
    const clientId = '4a6baa63ea2641ada0e3e9c1f8e50a84';
    const redirectUri = encodeURIComponent('https://mouri69-recommender.vercel.app/callback');
    const scopes = 'user-library-read user-top-read';
    const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes}`;

    window.location.href = authUrl;
});

// Function to fetch and display recommendations
async function fetchRecommendations(code) {
    try {
        // Exchange the authorization code for an access token
        const tokenResponse = await fetch('/get-token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code })
        });

        const { access_token } = await tokenResponse.json();

        // Fetch recommendations using the access token
        const recommendationsResponse = await fetch('https://api.spotify.com/v1/recommendations', {
            headers: {
                'Authorization': `Bearer ${access_token}`
            },
            params: {
                seed_genres: 'pop', // Example parameter, adjust as needed
                limit: 10
            }
        });

        const recommendationsData = await recommendationsResponse.json();

        // Extract and format recommendations
        const recommendations = recommendationsData.tracks.map(track => ({
            name: track.name,
            artists: track.artists.map(artist => artist.name).join(', '),
            album: track.album.name,
            release_date: track.album.release_date,
            preview_url: track.preview_url,
            album_image: track.album.images[0].url
        }));

        // Display recommendations
        const recommendationsContainer = document.getElementById('recommendations');
        recommendationsContainer.innerHTML = `
            <h2>Recommended Songs</h2>
            <ul>
                ${recommendations.map(track => `
                    <li>
                        <img src="${track.album_image}" alt="${track.name}" style="width: 50px; height: 50px; object-fit: cover;">
                        <strong>${track.name}</strong> by ${track.artists}<br>
                        Album: ${track.album}<br>
                        Release Date: ${track.release_date}<br>
                        <audio controls>
                            <source src="${track.preview_url}" type="audio/mpeg">
                            Your browser does not support the audio element.
                        </audio>
                    </li>
                `).join('')}
            </ul>
        `;
    } catch (error) {
        console.error('Error fetching recommendations:', error);
    }
}

// Check if the URL has a code parameter and fetch recommendations if it does
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');

if (code) {
    fetchRecommendations(code);
}
