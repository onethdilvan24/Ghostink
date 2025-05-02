document.addEventListener('DOMContentLoaded', async () => {
    const apiKeyInput = document.getElementById('apiKey');
    const saveButton = document.getElementById('saveKey');
    const modelSelect = document.getElementById('model');
    const temperatureInput = document.getElementById('temperature');
    const temperatureValue = document.getElementById('temperatureValue');
    const statusDiv = document.getElementById('status');

    // Load saved settings
    const settings = await chrome.storage.sync.get(['apiKey', 'model', 'temperature']);
    if (settings.apiKey) {
        apiKeyInput.value = settings.apiKey;
    }
    if (settings.model) {
        modelSelect.value = settings.model;
    }
    if (settings.temperature) {
        temperatureInput.value = settings.temperature * 10;
        temperatureValue.textContent = settings.temperature.toFixed(1);
    }

    // Update temperature display
    temperatureInput.addEventListener('input', (e) => {
        const value = (e.target.value / 10).toFixed(1);
        temperatureValue.textContent = value;
    });

    // Save settings
    saveButton.addEventListener('click', async () => {
        const apiKey = apiKeyInput.value.trim();
        const model = modelSelect.value;
        const temperature = parseFloat(temperatureInput.value) / 10;

        if (!apiKey) {
            showStatus('Please enter an API key', 'error');
            return;
        }

        try {
            await chrome.storage.sync.set({
                apiKey,
                model,
                temperature
            });
            showStatus('Settings saved successfully!', 'success');
        } catch (error) {
            showStatus('Failed to save settings', 'error');
            console.error('Error saving settings:', error);
        }
    });

    function showStatus(message, type) {
        statusDiv.textContent = message;
        statusDiv.className = `status ${type}`;
        setTimeout(() => {
            statusDiv.className = 'status';
        }, 3000);
    }
}); 