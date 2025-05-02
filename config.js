const config = {
    API_BASE_URL: 'https://api.deepseek.ai/v1',  // Deepseek API endpoint
    MODEL_NAME: 'deepseek-chat',  // Default model
    MAX_TOKENS: 2000,
    TEMPERATURE: 0.7,
    DEFAULT_SYSTEM_PROMPT: 'You are a helpful assistant that generates high-quality text content. Please provide clear, concise, and contextually appropriate responses.'
};

// Export the configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = config;
} else {
    window.config = config;
} 