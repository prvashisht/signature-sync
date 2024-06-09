if (typeof browser === "undefined") {
  var browser = chrome;
}

document.addEventListener('DOMContentLoaded', async () => {
  const signatureText = document.getElementById('signature'),
    enableSignBox = document.getElementById('enableSign'),
    editButton = document.getElementById('editSignature'),
    saveButton = document.getElementById('saveSignature'),
    messagesTab = document.getElementById('messagesTab'),
    connectionsTab = document.getElementById('connectionsTab');

  const defaultSignature = {
    messageSignEnabled: true,
    connectNoteSignEnabled: true,
    messageText: "\nRegards",
    connectionText: "\nRegards"
  };

  let { linkedinsignature: storedSignature } = await browser.storage.local.get('linkedinsignature');

  const migrateStoredSignature = (storedSignature) => {
    let updatedSignature = { ...defaultSignature };
    if (storedSignature) {
      if (Object.keys(storedSignature).includes('text')) {
        // Old format detected
        updatedSignature.messageText = storedSignature.text;
        updatedSignature.connectionText = storedSignature.text;
        updatedSignature.messageSignEnabled = storedSignature.messageSignEnabled;
        updatedSignature.connectNoteSignEnabled = storedSignature.connectNoteSignEnabled;
      } else updatedSignature = { ...storedSignature };
    }
    return updatedSignature;
  };

  storedSignature = migrateStoredSignature(storedSignature);
  await browser.storage.local.set({ linkedinsignature: storedSignature });

  let currentTab = 'messages';

  const updateSignatureText = () => {
    if (currentTab === 'messages') {
      signatureText.value = storedSignature.messageText;
      enableSignBox.checked = storedSignature.messageSignEnabled;
    } else {
      signatureText.value = storedSignature.connectionText;
      enableSignBox.checked = storedSignature.connectNoteSignEnabled;
    }
  };

  const setSaveButtonDisabledState = () => {
    saveButton.disabled = currentTab === 'messages'
      ? signatureText.value === storedSignature.messageText && enableSignBox.checked === storedSignature.messageSignEnabled
      : signatureText.value === storedSignature.connectionText && enableSignBox.checked === storedSignature.connectNoteSignEnabled;
  };

  const setEditButton = (newState) => {
    editButton.textContent = newState;
    signatureText.disabled = newState === 'Edit';
  }

  signatureText.addEventListener('input', setSaveButtonDisabledState);
  enableSignBox.addEventListener('change', setSaveButtonDisabledState);

  editButton.addEventListener('click', () => {
    if (editButton.textContent === "Edit") {
      setEditButton('Cancel');
      signatureText.focus();
    } else {
      updateSignatureText();
      setEditButton('Edit');
      setSaveButtonDisabledState();
    }
  });

  saveButton.addEventListener('click', async () => {
    if (currentTab === 'messages') {
      storedSignature.messageText = signatureText.value;
      storedSignature.messageSignEnabled = enableSignBox.checked;
    } else {
      storedSignature.connectionText = signatureText.value;
      storedSignature.connectNoteSignEnabled = enableSignBox.checked;
    }

    await browser.storage.local.set({ linkedinsignature: storedSignature });
    setEditButton('Edit');
    setSaveButtonDisabledState();
  });

  const showTabContent = (tab) => {
    currentTab = tab;
    setEditButton('Edit');
    enableSignBox.nextElementSibling.textContent = tab === 'messages' ? "Use in messages" : "Use in connection requests";
    messagesTab.classList.toggle('active', tab === 'messages');
    connectionsTab.classList.toggle('active', tab === 'connections');
    updateSignatureText();
    setSaveButtonDisabledState();
  };

  messagesTab.addEventListener('click', () => showTabContent('messages'));
  connectionsTab.addEventListener('click', () => showTabContent('connections'));

  showTabContent('messages');
});
