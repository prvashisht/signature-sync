# Changelog

- `v4.0.1`
  - fix: Improved getCompanyName function and stored localStorage data on install
- `v4.0`
  - Fix getting company name for different scenarios
  - feat: Update LinkedIn signature with profile name
  - Allow separate signatures for messages and connection requests
  - Improved popup UI with multiple changes
- `v3.3`
  - Fix: Connection note used to get reset when focus was lost
  - Feature: Added the extension icon to toggle the signature from the message form itself
- `v3.2.1` - Removed unused "tabs" permission
- `v3.2.0` - Toggle signatures in connection notes and messages individually
- `v3.1.2` - Append signature to note while adding connection
- `v3.1.1` - Fixed CSS in the textbox area, made it compatible with Firefox UI
- `v3.1.0` - Added support for icon change in dark mode
- `v3.0.0` - Changed the name to SignatureSync
- `v2.1.0` - Made the extension compatible with manifest V3
- `v2.0` - Made the extension live again, making it work with the new UI. Removed the switch to enable/disable the extension via the UI

**Update**: Publishing this extension under a new name because the last one was taken down due to a legal notice from the professional networking website I've built this for. Just to be safe, I'll avoid taking the company's name wherever possible and call it LIN

- `v1.0.9` - Enable/Disable switch was not showing as LIN changed class names on message forms. Fixed it
- `v1.0.8` - Fixed a bug where in case when local-storage was empty, content script was breaking
- `v1.0.7` - Added a switch to enable/disable LIN messages signatures via the UI and no need to click the extension icon
- `v1.0.6` - Signature will not auto append on page load but only when you click on the message box. If you delete it, it will also not be added again which was annoying. After the signature is added, the typing caret will automatically move to the beginning of the message so you can start typing your message right away
- `v1.0.5` - Signature was coming while writing a post as well, fixed it
- `v1.0.4` - Works with the new UI of LIN
- `v1.0.3` - You can disable and enable signature in messages
- `v1.0.2` - Signature works in the messages sent from profiles as well
- `v1.0` - Added initial version of the extension
