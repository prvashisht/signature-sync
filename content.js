// Every line should be a paragraph. 
// Including empty lines which should be a whitespace + break tag inside a paragraph
const modifySignatureToHTML = signature => {
  return "<p> <br/></p>" + signature.split('\n').map(signPart => {
    return `<p>${signPart || " <br/>"}</p>`
  }).join(" ")
}

const _setCaretPosition = (elem, caretPos) => {
  if (elem != null) {
    if (elem.createTextRange) {
      let range = elem.createTextRange();
      range.move('character', caretPos);
      range.select();
    } else {
      elem.focus();
      if (elem.selectionStart) {
        elem.setSelectionRange(caretPos, caretPos);
      }
    }
  }
}

// Add signature when message box is focused
document.addEventListener('focus', function (event) {
  let activeElement = document.activeElement,
    isConnectNoteBox = activeElement.matches('textarea.connect-button-send-invite__custom-message'),
    isMessageBox = activeElement.matches('div.msg-form__contenteditable');
  if (!isConnectNoteBox && !isMessageBox) return;

  let fieldContainsText = isMessageBox ? activeElement.textContent.trim() : activeElement.value.trim();
  if (fieldContainsText) return;

  chrome.storage.local.get(['linkedinsignature'], function (item) {
    if (item.linkedinsignature.messageSignEnabled && isMessageBox) {
      activeElement.innerHTML = modifySignatureToHTML(item.linkedinsignature.text);
    }
    if (item.linkedinsignature.connectNoteSignEnabled && isConnectNoteBox) {
      activeElement.value = item.linkedinsignature.text;
    }
    _setCaretPosition(activeElement, 0);
    activeElement.click();
  });
}, true);

let darkModeListener = (isDarkMode) => {
  chrome.runtime.sendMessage({
    type: "themeChange",
    mode: isDarkMode.matches ? 'dark' : 'light',
  });
}
const darkModePreference = window.matchMedia("(prefers-color-scheme: dark)");
// recommended method for newer browsers: specify event-type as first argument
darkModePreference.addEventListener("change", darkModeListener);
// deprecated method for backward compatibility
darkModePreference.addListener(e => darkModeListener);
// set icons on initial load
darkModeListener(darkModePreference);
