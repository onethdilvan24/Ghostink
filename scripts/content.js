let activeElement = null;

// Get the icon URL and log it for debugging
const iconURL = chrome.runtime.getURL('icons/icon16.png');
console.log('AI Icon URL:', iconURL);

// Track elements that already have buttons
const processedElements = new WeakSet();

// Track the currently focused element
document.addEventListener('focusin', (e) => {
  if (isEditableElement(e.target)) {
    activeElement = e.target;
  }
});

document.addEventListener('focusout', () => {
  activeElement = null;
});

// Function to add button to an element
function addAIButton(element) {
  if (processedElements.has(element)) return;
  
  // Ensure the element has a relative or absolute positioned container
  element.style.position = 'relative';
  
  // Create the button
  const button = document.createElement('button');
  button.className = 'ai-generate-button';
  button.innerHTML = `<img src="${iconURL}" width="16" height="16" alt="AI" style="width: 16px; height: 16px;">`;
  button.title = 'Generate with AI';
  
  // Position the button relative to the input element
  const rect = element.getBoundingClientRect();
  button.style.position = 'absolute';
  button.style.right = '5px';
  button.style.top = '50%';
  button.style.transform = 'translateY(-50%)';
  button.style.zIndex = '10000';
  
  // Add click handler
  button.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    button.classList.add('generating');
    
    try {
      const generatedText = await generateText('Write a professional response');
      
      if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        element.value = generatedText;
        element.dispatchEvent(new Event('input', { bubbles: true }));
      } else {
        element.textContent = generatedText;
      }
    } catch (error) {
      console.error('Error generating text:', error);
      alert('Failed to generate text. Please try again.');
    } finally {
      button.classList.remove('generating');
    }
  });
  
  // Insert the button after the element
  element.parentNode.insertBefore(button, element.nextSibling);
  processedElements.add(element);
  
  // Log for debugging
  console.log('Added AI button to element:', element);
}

// Observer to watch for new editable elements
const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      if (node.nodeType === Node.ELEMENT_NODE && isEditableElement(node)) {
        addAIButton(node);
      }
    }
  }
});

// Start observing the document
observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Process existing elements
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('textarea, input[type="text"]').forEach(addAIButton);
});

// Also process elements immediately in case DOM is already loaded
document.querySelectorAll('textarea, input[type="text"]').forEach(addAIButton);

// Helper function to check if an element is editable
function isEditableElement(element) {
  return element.tagName === 'TEXTAREA' ||
         (element.tagName === 'INPUT' && element.type === 'text') ||
         element.contentEditable === 'true';
}

// Listen for messages from popup or background script
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === 'generate') {
    if (!activeElement) {
      alert('Please focus on a text field first');
      return;
    }
    
    try {
      // Here you would make an API call to your AI service
      const generatedText = await generateText(request.prompt);
      
      // Insert the generated text
      if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') {
        activeElement.value = generatedText;
        // Trigger input event to ensure any listeners are notified
        activeElement.dispatchEvent(new Event('input', { bubbles: true }));
      } else {
        activeElement.textContent = generatedText;
      }
    } catch (error) {
      console.error('Error generating text:', error);
      alert('Failed to generate text. Please try again.');
    }
  }
});

// Placeholder function for AI text generation
async function generateText(prompt) {
  // TODO: Replace this with your actual AI API call
  // For example, using OpenAI's API:
  // const response = await fetch('https://api.openai.com/v1/completions', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Authorization': 'Bearer YOUR_API_KEY'
  //   },
  //   body: JSON.stringify({
  //     model: 'text-davinci-003',
  //     prompt: prompt,
  //     max_tokens: 150
  //   })
  // });
  // const data = await response.json();
  // return data.choices[0].text;
  
  return `Generated text based on: ${prompt}`;
} 