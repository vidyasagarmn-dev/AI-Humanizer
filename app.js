// public/app.js
document.addEventListener('DOMContentLoaded', () => {
    const aiInput = document.getElementById('ai-input');
    const humanOutput = document.getElementById('human-output');
    const humanizeButton = document.getElementById('humanize-button');

    humanizeButton.addEventListener('click', async () => {
        const textToHumanize = aiInput.value;

        if (!textToHumanize) {
            alert('Please paste some text to humanize.');
            return;
        }

        // --- Good UX: Disable button and show loading ---
        humanizeButton.disabled = true;
        humanizeButton.innerText = 'Humanizing...';
        humanOutput.value = '';

        try {
            // --- Call your own backend server ---
            const response = await fetch('/api/humanize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text: textToHumanize })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Something went wrong');
            }

            const data = await response.json();

            // --- Success ---
            humanOutput.value = data.humanizedText;

        } catch (error) {
            // --- Failure ---
            console.error('Error:', error);
            humanOutput.value = `Error: ${error.message}`;
        
        } finally {
            // --- Re-enable button ---
            humanizeButton.disabled = false;
            humanizeButton.innerText = 'Humanize!';
        }
    });
});