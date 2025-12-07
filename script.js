// A global map to hold player names and team IDs (will be populated later)
let playerElementMap = {};

// Function to fetch the static bootstrap data to map player IDs to names
async function fetchBootstrapData() {
    const bootstrapUrl = '/api/fpl/bootstrap-static/'; // Assuming you set a proxy rule for /bootstrap-static/

    try {
        const response = await fetch(bootstrapUrl);
        if (!response.ok) {
            throw new Error("Failed to load player static data.");
        }
        const data = await response.json();
        
        // Build the playerElementMap for quick lookup: {id: {web_name, team_code}}
        data.elements.forEach(player => {
            playerElementMap[player.id] = {
                name: player.web_name,
                teamId: player.team
            };
        });
        
        // NOTE: You would also need to map Team ID to Team Name (data.teams) for a full display.
        // For simplicity, we will just display the Team ID for now.
        
        console.log("Player map loaded successfully.");
    } catch (error) {
        console.error("Error loading bootstrap data:", error);
    }
}


// Function to fetch Gameweek Live Data
async function fetchBonusData(gwId) {
    const relativeProxyUrl = `/api/fpl/livegw/${gwId}`; 

    // Ensure we have player names loaded before fetching live data
    if (Object.keys(playerElementMap).length === 0) {
        await fetchBootstrapData();
    }

    try {
        const response = await fetch(relativeProxyUrl);

        if (!response.ok) {
            throw new Error("Gameweek data not found or API lookup failed.");
        }

        const data = await response.json();
        
        // The data is under the 'elements' key
        const playersData = data.elements;
        
        // 1. Filter for players who received bonus points (bonus > 0)
        const bonusPlayers = playersData.filter(player => player.stats.bonus > 0);
        
        // 2. Process and enrich the data with player names
        const finalBonusList = bonusPlayers.map(player => {
            const playerInfo = playerElementMap[player.id] || { name: 'Unknown Player', teamId: '?' };
            return {
                playerId: player.id,
                playerName: playerInfo.name,
                teamId: playerInfo.teamId, // This is the numerical team ID
                bonusPoints: player.stats.bonus,
                bps: player.stats.bps // BPS score is useful for context
            };
        });

        // Sort by bonus points descending, then BPS descending
        finalBonusList.sort((a, b) => {
            if (b.bonusPoints !== a.bonusPoints) {
                return b.bonusPoints - a.bonusPoints;
            }
            return b.bps - a.bps;
        });

        return finalBonusList;

    } catch (error) {
        console.error("Bonus Data Fetch Error:", error.message);
        throw new Error("Could not retrieve Bonus Data. Check the GW ID and proxy setup.");
    }
}


// Function to render the bonus points table
function renderBonusTable(bonusList, gwId) {
    const standingsBody = document.getElementById('bonus-points-body');
    const header = document.getElementById('bonus-gw-header');
    
    standingsBody.innerHTML = ''; // Clear previous results
    
    header.textContent = `Bonus points for Gameweek ${gwId}`;

    if (bonusList.length === 0) {
        standingsBody.innerHTML = '<tr><td colspan="3">No bonus points awarded in this Gameweek yet, or all matches are not finalized.</td></tr>';
        return;
    }

    bonusList.forEach(entry => {
        const row = standingsBody.insertRow();
        
        // Cell 1: Player Name
        row.insertCell().textContent = entry.playerName;
        
        // Cell 2: Team ID (You would convert this to a Team Name with the full bootstrap data)
        row.insertCell().textContent = `Team ID: ${entry.teamId}`; 
        
        // Cell 3: Bonus Points (and BPS score for detail)
        row.insertCell().textContent = `${entry.bonusPoints} pts (${entry.bps} BPS)`;
    });
}

// Function to initialize the Bonus Points Tracker feature
function initBonusTrackerFeature() {
    const goButton = document.getElementById('gw-go-btn');
    const resetButton = document.getElementById('gw-reset-btn');
    const inputField = document.getElementById('gw-id-input');
    
    // --- "Go" Button Handler for Bonus Tracker ---
    goButton.addEventListener('click', async () => {
        const gwId = inputField.value.trim();

        if (gwId === "" || isNaN(gwId) || parseInt(gwId) < 1 || parseInt(gwId) > 38) {
            alert("Please enter a valid Gameweek ID (1-38).");
            return;
        }

        goButton.disabled = true;
        goButton.textContent = 'Loading...';

        try {
            const bonusList = await fetchBonusData(gwId);
            renderBonusTable(bonusList, gwId);
        } catch (error) {
            alert(error.message);
            // Clear the display on error
            document.getElementById('bonus-points-body').innerHTML = '<tr><td colspan="3">Error loading bonus points.</td></tr>';
        } finally {
            goButton.disabled = false;
            goButton.textContent = 'Go';
        }
    });

    // --- "Reset" Button Handler for Bonus Tracker ---
    resetButton.addEventListener('click', () => {
        inputField.value = '';
        document.getElementById('bonus-points-body').innerHTML = '';
        document.getElementById('bonus-gw-header').textContent = 'Bonus points for Gameweek -';
    });
    
    // Initial load of bootstrap data (needed for player names)
    fetchBootstrapData();
}

// Make sure to call the initialization function in your main DOMContentLoaded listener
document.addEventListener('DOMContentLoaded', () => {
    // Existing calls: initLiveRankFeature(); initMiniLeagueFeature();
    // NEW CALL:
    initBonusTrackerFeature(); 
});
