// Function to simulate fetching FPL data based on a team ID
async function fetchFplData(teamId) {
    console.log(`Attempting to fetch data for FPL ID: ${teamId}`);
    
    // --- Mock Data Simulation ---
    // In a real application, you would replace this with a fetch() call 
    // to an API endpoint (e.g., your own backend proxy to FPL data).
    // Example Real API structure (requires backend):
    /*
    const response = await fetch(`YOUR_API_ENDPOINT/live-rank/${teamId}`);
    if (!response.ok) {
        throw new Error("Failed to fetch FPL data.");
    }
    const data = await response.json();
    return data;
    */
    
    // Using simple mock data for demonstration
    const mockData = {
        managerName: "Coded Manager",
        teamName: "The Code Commanders",
        netPoints: 125,
        transfers: 3,
        liveRank: "1,234,567",
    };

    return new Promise(resolve => {
        // Simulate network delay
        setTimeout(() => {
            resolve(mockData);
        }, 800); 
    });
}

// Function to update the DOM with fetched data
function updateLiveRankCard(data) {
    document.getElementById('team-manager-name').textContent = `${data.teamName} (${data.managerName})`;
    document.getElementById('net-points-value').textContent = data.netPoints.toLocaleString();
    document.getElementById('transfers-value').textContent = data.transfers.toLocaleString();
    document.getElementById('live-rank-value').textContent = data.liveRank;
}

// Function to reset the card to its default state
function resetLiveRankCard() {
    document.getElementById('fpl-id-input').value = '';
    document.getElementById('team-manager-name').textContent = 'Team name (Player name)';
    document.getElementById('net-points-value').textContent = '-';
    document.getElementById('transfers-value').textContent = '-';
    document.getElementById('live-rank-value').textContent = '-';
    document.getElementById('go-btn').disabled = false;
}

// Main function to initialize event listeners
function initLiveRankFeature() {
    const goButton = document.getElementById('go-btn');
    const resetButton = document.getElementById('reset-btn');
    const inputField = document.getElementById('fpl-id-input');

    // --- "Go" Button Handler ---
    goButton.addEventListener('click', async () => {
        const teamId = inputField.value.trim();

        if (teamId === "" || isNaN(teamId) || parseInt(teamId) <= 0) {
            alert("Please enter a valid FPL Team ID (a positive number).");
            return;
        }

        goButton.disabled = true;
        goButton.textContent = 'Loading...';

        try {
            const data = await fetchFplData(teamId);
            updateLiveRankCard(data);
        } catch (error) {
            console.error("Error fetching live rank:", error);
            alert("Could not fetch data for that ID. Please try again.");
            resetLiveRankCard(); // Reset on error
        } finally {
            goButton.disabled = false;
            goButton.textContent = 'Go';
        }
    });
    
    // --- "Reset" Button Handler ---
    resetButton.addEventListener('click', resetLiveRankCard);
    
    // --- Initial reset for clean start ---
    resetLiveRankCard();
}

// Call the initialization function when the page loads
document.addEventListener('DOMContentLoaded', initLiveRankFeature);
