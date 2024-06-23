# SignatureSync

[![Version](https://img.shields.io/badge/Version-4.0.3-blue.svg)]() [![Release Workflow](https://github.com/prvashisht/signature-sync/actions/workflows/release-extension.yaml/badge.svg?branch=main)](https://github.com/prvashisht/signature-sync/actions/workflows/release-extension.yaml)

SignatureSync is an open-source browser extension designed to enhance your professional messaging experience. Say goodbye to repetitive typing and hello to effortless conversations. SignatureSync allows you to set your signatures once and automatically appends them to your messages, ensuring a polished and professional touch.

## Features

- **Effortless Signatures:** Set your signatures once, and they will automatically append to your messages. Now, it also works on the note you add while sending someone a request to connect
- **Total Control:** Enable or disable signatures with a click, adapting your signature presence to match your conversation's tone.
- **Separate messages and connection notes**: From version 4.0.0 onwards, you can set a separate message or signature for connection notes.
- **Profile Variables**: While adding a note for a connection request, you can add the following variables, which will be updated automatically:
  - `__name__`, `__firstName__`, `__lastName__`: replaces with the full, first, and last names, respectively, of the profile the connection request is being to.
  - `__company__`: The current company of the person works correctly always on the profile page but is less reliable on the search results or other pages.
- **Dark Mode support:** The icon changes colour based on your theme for easier visibility.
- **Flexible Customization:** You can Edit your signatures directly from the extension or toggle them from the message box itself.

## Installation

### Local Installation and Development

1. Clone the repository: `git clone https://github.com/prvashisht/signature-sync.git`
2. Open your Chrome browser and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the bottom right corner
4. Click on "Load unpacked" and select the cloned repository folder

SignatureSync is now installed and ready for development. To develop the extension locally, follow the development setup instructions in the [Developer's Guide](./DEVELOPER_GUIDE.md#making-changes).

### Production Installation

SignatureSync is available for production use through the Chrome Web Store. To install the extension for everyday use, visit [https://vashis.ht/rd/signaturesync](https://vashis.ht/rd/signaturesync?from=github-readme) and follow the instructions to add SignatureSync to your Chrome browser.

## Usage

1. Open the extension popup by clicking on the extension icon.
2. Set your signatures and enable or disable them as needed.
3. Your signatures will be automatically added to your messages, ensuring a professional touch.

## Contribution

We welcome contributions from the community. If you have any suggestions or find a bug, please open an issue or create a pull request.

Let's make professional messaging effortless together!
