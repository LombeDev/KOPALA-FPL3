// --- Configuration and API Endpoints ---
const BOOTSTRAP_URL = 'https://fantasy.premierleague.com/api/bootstrap-static/';
const FIXTURES_URL = 'https://fantasy.premierleague.com/api/fixtures/';

// --- Utility function to fetch JSON data (WITH HEADERS) ---
async function fetchData(url) {
    try {
        // Add a User-Agent header to mimic a browser request, improving reliability
        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36'
            }
        };

        const response = await fetch(url, options); // Pass the options object to fetch

        if (!response.ok) {
            // Log the error status to the console for detailed debugging
            console.error(`Fetch failed. URL: ${url} | Status: ${response.status} ${response.statusText}`);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Fetch error:', error);
        // This text remains the general warning for the user
        document.getElementById('loading-error').textContent = 'Error fetching data. Check console for details or try again later.';
        return null;
    }
}

// (The rest of the script.js remains the same)
// ... function getFDRColor() ...
// ... function getNextGameweekFixtures() ...
// ... execution call ...
