/**
 * Attaches event listeners to the 'x' buttons to remove the corresponding team row.
 */
function setupRemoveTeamListeners() {
    const removeButtons = document.querySelectorAll('.remove-btn');

    removeButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            // Traverse up the DOM to find the parent table row (<tr>)
            const rowToRemove = event.target.closest('tr');
            
            if (rowToRemove) {
                // Get the team name for logging/tracking (optional)
                const teamName = rowToRemove.dataset.teamName;
                console.log(`Removing team: ${teamName}`);
                
                // Actually remove the row from the table
                rowToRemove.remove();
            }
        });
    });
}

// ------------------------------------------------------------------
// IMPORTANT: Update the end of your renderFixtures function!
// ------------------------------------------------------------------

// Change the end of your renderFixtures function from this:
/*
    // ... inside renderFixtures
    container.innerHTML = html;
}

// Execute the main function when the script loads
renderFixtures();
*/

// TO THIS:
// Execute the main function when the script loads
renderFixtures().then(() => {
    // Call the setup function ONLY after the HTML has been inserted 
    // into the DOM, otherwise the buttons won't exist yet!
    setupRemoveTeamListeners();
});
