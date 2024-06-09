let darkModeListener = (isDarkMode) => {
  chrome.runtime.sendMessage({
    type: "themeChange",
    mode: isDarkMode.matches ? 'dark' : 'light',
  });
  document.querySelectorAll('.msg-form__signature-toggle img').forEach(toggleImg => {
    toggleImg.src = chrome.runtime.getURL(`icons/${isDarkMode.matches ? 'dark' : 'light'}/icon32.png`);
  });
}
const darkModePreference = window.matchMedia("(prefers-color-scheme: dark)");
// recommended method for newer browsers: specify event-type as first argument
darkModePreference.addEventListener("change", darkModeListener);
// deprecated method for backward compatibility
darkModePreference.addListener(e => darkModeListener);
// set icons on initial load
darkModeListener(darkModePreference);

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
document.addEventListener('focus', async () => {
  let activeElement = document.activeElement,
    isConnectNoteBox = activeElement.matches('textarea.connect-button-send-invite__custom-message'),
    isMessageBox = activeElement.matches('div.msg-form__contenteditable');
  if (!isConnectNoteBox && !isMessageBox) return;

  let fieldContainsText = isMessageBox ? activeElement.textContent.trim() : activeElement.value.trim();
  if (fieldContainsText) return;

  const { linkedinsignature } = await chrome.storage.local.get(['linkedinsignature']);
  if (linkedinsignature.messageSignEnabled && isMessageBox) {
    activeElement.innerHTML = modifySignatureToHTML(linkedinsignature.messageText || linkedinsignature.text);
  }
  if (linkedinsignature.connectNoteSignEnabled && isConnectNoteBox) {
    activeElement.value = linkedinsignature.connectionText || linkedinsignature.text;
  }
  _setCaretPosition(activeElement, 0);
  activeElement.click();
}, true);

const toggleSignature = async () => {
  const { linkedinsignature } = await chrome.storage.local.get(['linkedinsignature']);
  linkedinsignature.messageSignEnabled = !linkedinsignature.messageSignEnabled;
  await chrome.storage.local.set({ linkedinsignature });
  document.querySelectorAll('.msg-form__signature-toggle img').forEach(toggleImg => {
    toggleImg.style.opacity = linkedinsignature.messageSignEnabled ? 1 : 0.4;
  });
}

const addSignatureToggle = async (messageActions) => {
  if (!messageActions) return;
  const signatureToggle = document.createElement('div');
  signatureToggle.classList.add('msg-form__signature-toggle');
  signatureToggle.style = 'cursor: pointer; display: flex; align-items: center; justify-content: center;';
  signatureToggle.title = 'Enable/Disable Signature';
  signatureToggle.addEventListener('click', toggleSignature);

  const icon = document.createElement('img');
  icon.src = chrome.runtime.getURL(`icons/${darkModePreference.matches ? 'dark' : 'light'}/icon32.png`);
  icon.alt = 'Toggle Signature';
  icon.style = 'width: 20px; height: 20px; margin: 0 0.5rem; transition: opacity 0.3s; position: relative; bottom: 0.2em;';
  const item = await chrome.storage.local.get(['linkedinsignature']);
  icon.style.opacity = item.linkedinsignature.messageSignEnabled ? 1 : 0.4;
  signatureToggle.appendChild(icon);

  messageActions.appendChild(signatureToggle);
};

const messageForm = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === 'childList') {
      mutation.addedNodes.forEach((addedNode) => {
        if (addedNode.nodeType === Node.ELEMENT_NODE 
          && addedNode.matches('.msg-form__footer .msg-form__left-actions')
        ) addSignatureToggle(addedNode)
      });
    }
  });
});
messageForm.observe(document.body, { childList: true, subtree: true });
