// --- Configuration and API Endpoints ---
const BOOTSTRAP_URL = 'https://fantasy.premierleague.com/api/bootstrap-static/';
const FIXTURES_URL = 'https://fantasy.premierleague.com/api/fixtures/';
// LOGO paths/extensions are no longer needed

// --- Utility function to fetch JSON data (No Change) ---
async function fetchData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Fetch error:', error);
        document.getElementById('loading-error').textContent = 'Error fetching data. Check console for details or try again later.';
        return null;
    }
}

// --- Helper function to get the FDR color based on the rating (No Change) ---
function getFDRColor(rating) {
    if (rating <= 1) return '#00ff85'; // Easy (Green)
    if (rating === 2) return '#10a567';
    if (rating === 3) return '#ffc107'; // Medium (Yellow/Orange)
    if (rating === 4) return '#ff8500';
    if (rating >= 5) return '#dc3545'; // Hard (Red)
    return '#6c757d'; // Default (Grey)
}

// --- Main function to get and display fixtures ---
async function getNextGameweekFixtures() {
    const fixturesListEl = document.getElementById('fixtures-list');
    const titleEl = document.getElementById('gameweek-title');
    fixturesListEl.innerHTML = '';

    const bootstrapData = await fetchData(BOOTSTRAP_URL);
    if (!bootstrapData) return;

    const { events: gameweeks, teams } = bootstrapData;

    const nextGameweek = gameweeks.find(gw => gw.is_next);

    if (!nextGameweek) {
        titleEl.textContent = 'Could not determine the next Gameweek.';
        return;
    }

    const nextGwId = nextGameweek.id;
    titleEl.textContent = `Premier League Fixtures: Gameweek ${nextGwId}`;

    // 1. Create the simplified map for team IDs to team data
    const teamNameMap = teams.reduce((map, team) => {
        map[team.id] = {
            name: team.name, 
            stadium: team.venue 
        };
        return map;
    }, {});
    
    // 2. Fetch ALL fixtures
    const allFixtures = await fetchData(FIXTURES_URL);
    if (!allFixtures) return;

    // 3. Filter and sort fixtures
    const nextGwFixtures = allFixtures
        .filter(fixture => fixture.event === nextGwId && fixture.finished === false)
        .sort((a, b) => new Date(a.kickoff_time) - new Date(b.kickoff_time));

    if (nextGwFixtures.length === 0) {
        fixturesListEl.innerHTML = '<p>No upcoming fixtures found for this Gameweek.</p>';
        return;
    }

    // 4. Render the fixtures without logos
    nextGwFixtures.forEach(fixture => {
        const homeTeamData = teamNameMap[fixture.team_h];
        const awayTeamData = teamNameMap[fixture.team_a];
        
        const location = homeTeamData.stadium;
        
        const fdr = fixture.team_h_difficulty; 
        const fdrColor = getFDRColor(fdr);

        // Format the kickoff time
        const kickoffTime = new Date(fixture.kickoff_time);
        const dateOptions = { weekday: 'short', month: 'short', day: 'numeric' };
        const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: false };
        
        const dateStr = kickoffTime.toLocaleDateString('en-GB', dateOptions);
        const timeStr = kickoffTime.toLocaleTimeString('en-GB', timeOptions);

        // Create the HTML element using the simplified structure
        const fixtureCard = document.createElement('div');
        fixtureCard.className = 'fixture-card';
        fixtureCard.innerHTML = `
            <span class="team-name home-team">${homeTeamData.name}</span>
            
            <div class="match-info">
                <span class="vs-fdr">vs</span>
                <span class="location">${location}</span>
                <span class="date-time">${dateStr} | ${timeStr}</span>
            </div>
            
            <div class="fdr-container">
                <span class="fdr-badge" style="background-color: ${fdrColor};">${fdr}</span>
            </div>
            
            <span class="team-name away-team">${awayTeamData.name}</span>
        `;
        
        fixturesListEl.appendChild(fixtureCard);
    });
}

// Execute the function when the page loads
getNextGameweekFixtures();
