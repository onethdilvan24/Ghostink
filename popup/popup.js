document.addEventListener('DOMContentLoaded', () => {
    // Get UI elements
    const generateButton = document.getElementById('generate');
    const promptInput = document.getElementById('prompt');

    // Check if elements exist
    if (!generateButton || !promptInput) {
        console.error('Required elements not found in popup.html');
        return;
    }

    // Focus the input when popup opens
    try {
        promptInput.focus();
    } catch (error) {
        console.error('Error focusing input:', error);
    }

    // Handle enter key in textarea
    promptInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            generateButton.click();
        }
    });

    generateButton.addEventListener('click', async () => {
        // Safely get the prompt value
        const promptValue = promptInput?.value;
        const prompt = typeof promptValue === 'string' ? promptValue.trim() : '';
        
        if (!prompt) {
            promptInput.classList.add('error');
            setTimeout(() => promptInput.classList.remove('error'), 1000);
            return;
        }

        // Update button state
        generateButton.disabled = true;
        const originalText = generateButton.textContent;
        generateButton.textContent = 'Generating...';
        
        try {
            // Get the active tab
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            const tab = tabs?.[0];
            
            if (!tab?.id) {
                throw new Error('No active tab found');
            }

            // Try to send message to content script with retries
            let retries = 2;
            let lastError = null;
            
            for (let i = 0; i <= retries; i++) {
                try {
                    const response = await chrome.tabs.sendMessage(tab.id, {
                        action: 'generate',
                        prompt: prompt
                    });
                    
                    if (response?.success) {
                        // Close the popup after successful generation
                        window.close();
                        return;
                    } else if (response?.error) {
                        throw new Error(response.error);
                    }
                } catch (error) {
                    lastError = error;
                    if (i < retries) {
                        // Wait before retrying (exponential backoff)
                        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
                        continue;
                    }
                    throw error;
                }
            }
            
            throw lastError || new Error('Failed to generate text');
        } catch (error) {
            console.error('Error:', error);
            
            // Show error message based on the type of error
            let errorMessage = 'Failed to generate text. Please try again.';
            if (error.message.includes('No active tab')) {
                errorMessage = 'Please open a webpage before generating text.';
            } else if (error.message.includes('Could not establish connection')) {
                errorMessage = 'Please refresh the page and try again.';
            } else if (error.message.includes('Cannot read properties')) {
                errorMessage = 'Error accessing text field. Please try again.';
            } else if (error.message.includes('Please focus on a text field')) {
                errorMessage = 'Please click into a text field first.';
            }
            
            // Show error in popup
            const errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            errorElement.textContent = errorMessage;
            promptInput.parentElement.appendChild(errorElement);
            
            // Remove error message after 3 seconds
            setTimeout(() => {
                errorElement.remove();
            }, 3000);
        } finally {
            // Reset button state
            generateButton.disabled = false;
            generateButton.textContent = originalText;
        }
    });
}); 