let activeElement = null;
let lastFocusedEditableElement = null; // Keep track of the last focused element

// Get the icon URL and log it for debugging
const iconURL = chrome.runtime.getURL('icons/icon16.png');
console.log('AI Icon URL:', iconURL);

// Track elements that already have buttons
const processedElements = new WeakSet();

// Track the currently focused element
document.addEventListener('focusin', (e) => {
  if (isEditableElement(e.target)) {
    activeElement = e.target;
    lastFocusedEditableElement = e.target; // Update last focused element
    console.log('Focus IN:', lastFocusedEditableElement);
  }
});

document.addEventListener('focusout', (e) => {
  // Don't nullify lastFocusedEditableElement here
  if (e.target === activeElement) {
      activeElement = null;
      console.log('Focus OUT:', e.target);
  }
});

// Helper function to check if an element is editable
function isEditableElement(element) {
  return element.tagName === 'TEXTAREA' ||
         (element.tagName === 'INPUT' && element.type === 'text') ||
         element.contentEditable === 'true';
}

// Function to call Deepseek API
async function callDeepseekAPI(prompt) {
  try {
    const settings = await chrome.storage.sync.get(['apiKey', 'model', 'temperature']);
    const apiKey = settings.apiKey || 'sk-66a09fce500a4e1aba8b4716594df9fd'; // Use provided key as default
    
    if (!apiKey) {
      throw new Error('API key not found. Please set your API key in the extension settings.');
    }

    const response = await fetch(`${config.API_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: settings.model || config.MODEL_NAME,
        messages: [
          {
            role: 'system',
            content: config.DEFAULT_SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: settings.temperature || config.TEMPERATURE,
        max_tokens: config.MAX_TOKENS
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to generate text. Please try again.');
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('API Error:', error);
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('Network error. Please check your internet connection.');
    }
    throw error;
  }
}

// Function to generate text with retry logic
async function generateText(prompt, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      return await callDeepseekAPI(prompt);
    } catch (error) {
      if (i === retries) {
        throw error;
      }
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
}

// Function to get element's current text content
function getElementText(element) {
    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        return element.value || '';
    } else if (element.contentEditable === 'true') {
        return element.textContent || '';
    }
    return '';
}

// Function to set element's text content
function setElementText(element, text) {
    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        element.value = text;
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
    } else if (element.contentEditable === 'true') {
        element.textContent = text;
        element.dispatchEvent(new Event('input', { bubbles: true }));
    }
}

// Function to add button to an element
function addAIButton(element) {
  if (processedElements.has(element)) return;
  
  // Ensure the element has a relative position
  element.style.position = 'relative';
  
  // Create the button
  const button = document.createElement('button');
  button.className = 'ai-generate-button';
  button.innerHTML = `<img src="${chrome.runtime.getURL('icons/icon16.png')}" width="16" height="16" alt="AI" style="width: 16px; height: 16px;">`;
  button.title = 'Generate with AI';
  
  // Position the button
  button.style.position = 'absolute';
  button.style.right = '5px';
  button.style.top = '50%';
  button.style.transform = 'translateY(-50%)';
  button.style.zIndex = '10000';
  
  // Add click handler
  button.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      button.classList.add('generating');
      button.title = 'Generating...';
      
      // Get current text and create prompt
      let currentText = getElementText(element).trim();
      let prompt = currentText || 'Write a professional response';
      
      const generatedText = await generateText(prompt);
      setElementText(element, generatedText);
      
    } catch (error) {
      console.error('Generation error:', error);
      alert(error.message);
    } finally {
      button.classList.remove('generating');
      button.title = 'Generate with AI';
    }
  });
  
  // Insert the button
  element.parentNode.insertBefore(button, element.nextSibling);
  processedElements.add(element);
}

// Process existing elements
document.querySelectorAll('textarea, input[type="text"]').forEach(addAIButton);

// Observer for new elements
const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      if (node.nodeType === Node.ELEMENT_NODE && isEditableElement(node)) {
        addAIButton(node);
      }
    }
  }
});

// Start observing
observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === 'generate') {
    try {
      // Use the last focused element instead of the current active one
      if (!lastFocusedEditableElement) {
        throw new Error('Please focus on a text field first');
      }
      
      console.log('Generating for element:', lastFocusedEditableElement);
      const generatedText = await generateText(request.prompt);
      setElementText(lastFocusedEditableElement, generatedText);
      
      // Send success response
      sendResponse({ success: true });
    } catch (error) {
      console.error('Error handling message:', error);
      sendResponse({ success: false, error: error.message });
    }
    return true; // Keep the message channel open for async response
  }
}); 