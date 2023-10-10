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
      var range = elem.createTextRange();
      range.move('character', caretPos);
      range.select();
    } else {
      if (elem.selectionStart) {
        elem.focus();
        elem.setSelectionRange(caretPos, caretPos);
      } else {
        elem.focus();
      }
    }
  }
}

// Add signature when message box is focused
document.addEventListener('focus', function (event) {
  let activeElement = document.activeElement,
    isConnectNoteBox = activeElement.matches('textarea.connect-button-send-invite__custom-message'),
    isMessageBox = activeElement.matches('div.msg-form__contenteditable'),
    shouldAppendSignature = (isConnectNoteBox || isMessageBox) && !activeElement.textContent.trim();

  if (shouldAppendSignature) {
    chrome.storage.local.get(['linkedinsignature'], function (item) {
      if (item.linkedinsignature.messageSignEnabled) {
        if (isMessageBox) {
          activeElement.innerHTML = modifySignatureToHTML(item.linkedinsignature.text);
        } else if (isConnectNoteBox) {
          activeElement.value = item.linkedinsignature.text;
        }
        _setCaretPosition(activeElement, 0);
        activeElement.click();
      }
      return;
    });
  }
}, true);

let darkModeListener = (isDarkMode) => {
  chrome.runtime.sendMessage({
    type: "themeChange",
    mode: isDarkMode.matches ? 'dark' : 'light',
  });
}
// MediaQueryList
const darkModePreference = window.matchMedia("(prefers-color-scheme: dark)");
// recommended method for newer browsers: specify event-type as first argument
darkModePreference.addEventListener("change", darkModeListener);
// deprecated method for backward compatibility
darkModePreference.addListener(e => darkModeListener);
// set icons on initial load
darkModeListener(darkModePreference);