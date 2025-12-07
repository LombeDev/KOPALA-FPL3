// --- API Endpoints ---
// OLD: const BASE_URL = "https://fantasy.premierleague.com/api/";
// NEW: The BASE_URL is now your own domain, so we can make it empty 
//      or point to the root, but let's change the endpoint variables.
const BASE_URL = ""; // We will build the path in the function call

// Use the new local proxy paths defined in _redirects
const FIXTURES_ENDPOINT = "/api/fpl/fixtures/"; 
const BOOTSTRAP_ENDPOINT = "/api/fpl/bootstrap/"; 

/**
 * Fetches JSON data from a given FPL API endpoint.
 * @param {string} endpoint The specific API path (e.g., /api/fpl/fixtures/).
 * @returns {Promise<object | null>} The JSON data or null on error.
 */
async function getFplData(endpoint) {
    try {
        // The endpoint already contains the full path including /api/fpl/...
        const response = await fetch(endpoint); // <-- Updated to use the endpoint directly
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    } catch (e) {
        console.error(`Error fetching data from ${endpoint}:`, e);
        return null;
    }
}

// ... rest of the script remains the same ...

/**
 * Creates a map from team IDs to team names.
 * @param {object} bootstrapData The data from the bootstrap-static endpoint.
 * @returns {Map<number, string>} A map of Team ID -> Team Name.
 */
function createTeamMap(bootstrapData) {
    const teamMap = new Map();
    if (bootstrapData && bootstrapData.teams) {
        bootstrapData.teams.forEach(team => {
            // Using 'name' for the full team name
            teamMap.set(team.id, team.name); 
        });
    }
    return teamMap;
}

/**
 * Creates an HTML string for a single fixture block.
 * @param {object} fixture The fixture object from the API.
 * @param {Map<number, string>} teamMap Map of team IDs to names.
 * @returns {string} The HTML string for the fixture.
 */
function createFixtureHtml(fixture, teamMap) {
    const gameweek = fixture.event || 'TBD';
    const homeTeamId = fixture.team_h;
    const awayTeamId = fixture.team_a;
    
    // Get the pre-calculated FDR and team names
    const homeFDR = fixture.team_h_difficulty;
    const awayFDR = fixture.team_a_difficulty;
    const homeTeamName = teamMap.get(homeTeamId) || `Team ID ${homeTeamId}`;
    const awayTeamName = teamMap.get(awayTeamId) || `Team ID ${awayTeamId}`;

    return `
        <div class="fixture">
            <h3 class="gameweek">Gameweek ${gameweek}</h3>
            <div class="matchup">
                
                <div class="team home">
                    <span class="team-name">${homeTeamName} (H)</span>
                    <span class="fdr-score fdr-${homeFDR}">${homeFDR}</span>
                </div>
                
                <span class="separator">vs</span>
                
                <div class="team away">
                    <span class="team-name">${awayTeamName} (A)</span>
                    <span class="fdr-score fdr-${awayFDR}">${awayFDR}</span>
                </div>

            </div>
        </div>
    `;
}

/**
 * Main function to fetch data and render the fixtures.
 */
async function renderFixtures() {
    const container = document.getElementById('fixtures-container');
    container.innerHTML = '<h2>Fetching data...</h2>'; // Update loading message

    // 1. Fetch data
    const [bootstrapData, fixturesData] = await Promise.all([
        getFplData(BOOTSTRAP_ENDPOINT),
        getFplData(FIXTURES_ENDPOINT)
    ]);

    if (!bootstrapData || !fixturesData) {
        container.innerHTML = '<h2>Error loading FPL data. Please try again.</h2>';
        return;
    }

    // 2. Create Team Map
    const teamMap = createTeamMap(bootstrapData);

    // 3. Filter for upcoming fixtures and generate HTML
    const upcomingFixturesHtml = fixturesData
        .filter(fixture => !fixture.started && fixture.finished === false)
        .sort((a, b) => a.event - b.event) // Sort by Gameweek
        .map(fixture => createFixtureHtml(fixture, teamMap))
        .join(''); // Join all the HTML strings together

    // 4. Insert into the DOM
    container.innerHTML = upcomingFixturesHtml || '<h2>No upcoming fixtures found.</h2>';
}

// Execute the main function when the script loads
renderFixtures();
