# AI Text Generator Chrome Extension

A Chrome extension that allows you to generate text using AI in any text field on any webpage.

## Features

- Generate text in any editable field (textareas, input fields, contenteditable divs)
- Two ways to trigger text generation:
  1. Popup interface with custom prompts
  2. Right-click context menu with default prompt
- Simple and intuitive user interface

## Installation

1. Clone this repository or download the files
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory

## Usage

### Popup Method
1. Click the extension icon in the Chrome toolbar
2. Focus on any text field on the webpage
3. Enter your instruction in the popup
4. Click "Generate" to insert the AI-generated text

### Right-Click Method
1. Right-click on any text field
2. Select "Generate with AI" from the context menu
3. The text will be generated using a default prompt

## Customization

To use your own AI service:
1. Open `scripts/content.js`
2. Replace the `generateText` function with your own implementation
3. Add your API keys and configuration as needed

## Directory Structure

```
├── manifest.json        # Extension configuration
├── popup/
│   ├── popup.html      # Popup interface
│   ├── popup.css       # Popup styles
│   └── popup.js        # Popup functionality
└── scripts/
    ├── content.js      # Content script
    └── background.js   # Background script
```

## Security Note

When implementing your own AI service integration, never store API keys directly in the code. Instead, use Chrome's storage API or require users to input their own API keys through a settings page.