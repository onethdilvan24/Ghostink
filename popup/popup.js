document.addEventListener('DOMContentLoaded', () => {
    const generateButton = document.getElementById('generate');
    const promptInput = document.getElementById('prompt');

    // Focus the input when popup opens
    promptInput.focus();

    // Handle enter key in textarea
    promptInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            generateButton.click();
        }
    });

    generateButton.addEventListener('click', async () => {
        const prompt = promptInput.value.trim();
        
        if (!prompt) {
            promptInput.classList.add('error');
            setTimeout(() => promptInput.classList.remove('error'), 1000);
            return;
        }

        generateButton.disabled = true;
        generateButton.textContent = 'Generating...';
        
        try {
            // Get the active tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (!tab) {
                throw new Error('No active tab found');
            }

            // Send message to content script
            await chrome.tabs.sendMessage(tab.id, {
                action: 'generate',
                prompt: prompt
            });

            // Close the popup after successful generation
            window.close();
        } catch (error) {
            console.error('Error:', error);
            
            // Show error message based on the type of error
            let errorMessage = 'Failed to generate text. Please try again.';
            if (error.message.includes('No active tab')) {
                errorMessage = 'Please open a webpage before generating text.';
            } else if (error.message.includes('Could not establish connection')) {
                errorMessage = 'Please refresh the page and try again.';
            }
            
            alert(errorMessage);
        } finally {
            generateButton.disabled = false;
            generateButton.textContent = 'Generate';
        }
    });
}); 