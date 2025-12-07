// Function to fetch FPL data using the hosting provider's proxy rules
async function fetchFplData(teamId) {
    // This is the relative path that your hosting service's proxy rules
    // (e.g., in a Netlify _redirects file) will forward to the external FPL API.
    const relativeProxyUrl = `/api/fpl/entry/${teamId}`; 

    try {
        // Fetch data from your own domain, which avoids CORS issues.
        const response = await fetch(relativeProxyUrl);

        if (!response.ok) {
             // If the proxy fails or the API returns a non-200 status
             throw new Error("FPL ID not found or API lookup failed.");
        }

        const data = await response.json();
        
        // Map the required fields from the FPL API response
        const processedData = {
            // Manager and Team Name
            managerName: data.player_first_name + ' ' + data.player_last_name,
            teamName: data.name,
            
            // Overall Points and Rank
            netPoints: data.summary_overall_points,
            liveRank: data.summary_overall_rank.toLocaleString(),
            
            // NOTE: Transfers data is not directly in this entry endpoint, so N/A is used.
            // A more complex solution involving the 'transfers' endpoint would be needed for real data.
            transfers: 'N/A' 
        };

        return processedData;

    } catch (error) {
        // Log the technical error for debugging
        console.error("Fetch Error:", error.message);
        
        // Throw a user-friendly error
        throw new Error("Could not retrieve FPL data. Please double-check the ID and ensure your proxy configuration is correct.");
    }
}

// Function to update the DOM with fetched data
function updateLiveRankCard(data) {
    document.getElementById('team-manager-name').textContent = `${data.teamName} (${data.managerName})`;
    document.getElementById('net-points-value').textContent = data.netPoints.toLocaleString();
    document.getElementById('transfers-value').textContent = data.transfers;
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

// Main function to initialize all event listeners
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

        // UI Feedback during loading
        goButton.disabled = true;
        goButton.textContent = 'Loading...';

        try {
            const data = await fetchFplData(teamId);
            updateLiveRankCard(data);
        } catch (error) {
            // Display the user-friendly error message from fetchFplData
            alert(error.message);
            resetLiveRankCard(); // Reset on error
        } finally {
            // Restore button state
            goButton.disabled = false;
            goButton.textContent = 'Go';
        }
    });
    
    // --- "Reset" Button Handler ---
    resetButton.addEventListener('click', resetLiveRankCard);
    
    // Also reset the card when the enter key is pressed in the input field
    inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevent default form submission behavior
            goButton.click(); // Programmatically click the Go button
        }
    });
}

// Call the initialization function when the page loads
document.addEventListener('DOMContentLoaded', () => {
    initLiveRankFeature();
    resetLiveRankCard(); // Ensure the card starts in a clean state
});
