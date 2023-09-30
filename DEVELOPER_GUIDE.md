# SignatureSync Developer's Guide

Welcome to the SignatureSync Developer's Guide! This guide provides detailed information for developers who want to contribute to SignatureSync or customize its functionality for their specific needs.

## Getting Started

To get started with development, follow these steps:

```
git clone https://github.com/prvashisht/signature-sync.git
```
1. Clone the SignatureSync repository to your local machine.

```
cd signature-sync
```
2. Navigate to the cloned repository directory.

```
chrome://extensions/
```
3. Open your Chrome browser and navigate to `chrome://extensions/`.

4. Enable "Developer mode" by toggling the switch in the bottom right corner of the Extensions page.

```
Load unpacked
```
5. Click on "Load unpacked" and select the cloned repository folder. This loads the extension into your browser for local development.

## Making Changes

### Extension Files

- **manifest.json:** This file contains the extension's metadata and configuration, including permissions and content scripts.
- **popup.html:** The HTML file for the extension's popup, allowing users to edit and save their signatures.
- **popup.js:** JavaScript code for handling user interactions in the popup.
- **contentScript.js:** JavaScript code injected into LinkedIn pages to modify the message box behavior.
- **background.js:** Unused in the current version of the extension.

### Modifying Behavior

- **popup.js:** Modify this file to change the behavior of the extension's popup. You can add new features or modify existing functionality.
- **contentScript.js:** This script handles the behavior of the message box on LinkedIn pages. Modify it to adjust how signatures are added to messages.

### Testing

When making changes, thoroughly test the extension on LinkedIn to ensure that it behaves as expected. Pay special attention to signature insertion and editing functionality.

## Deploying Changes

### Local Testing

After making changes, reload the extension in `chrome://extensions/` by clicking the refresh icon next to the SignatureSync extension. Test the changes in your local environment before proceeding.

### Production Deployment

For production deployment, follow the steps outlined in the [Production Installation](https://pratyushvashisht.com/signaturesync) section. Ensure that all changes are thoroughly tested and do not introduce errors or unexpected behavior.

## Reporting Issues

If you encounter any issues or bugs, please open a GitHub issue in the SignatureSync repository. Provide detailed information about the problem, including steps to reproduce it and any error messages you receive.

## Contributing

We welcome contributions from the developer community! If you have ideas for new features, improvements, or bug fixes, feel free to fork the repository and submit a pull request.

Thank you for contributing to SignatureSync and making professional messaging effortless for users!
