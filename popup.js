if (typeof browser === "undefined") {
  var browser = chrome;
}

document.addEventListener('DOMContentLoaded', async () => {
  const signatureTextDiv = document.getElementById('signature'),
    messageSignEnableBox = document.getElementById('enableMessageSign'),
    connectNoteSignEnableBox = document.getElementById('enableConnectNoteSign'),
    editButton = document.getElementById('editSignature'),
    saveButton = document.getElementById('saveSignature');

  const defaultSignature = {
    messageSignEnabled: true,
    connectNoteSignEnabled: true,
    text: "\nRegards"
  };

  let { linkedinsignature: storedSignature } = await browser.storage.local.get('linkedinsignature');

  if (!storedSignature) {
    storedSignature = defaultSignature;
    await browser.storage.local.set({ linkedinsignature: defaultSignature });
  }

  signatureTextDiv.value = storedSignature.text;
  messageSignEnableBox.checked = storedSignature.messageSignEnabled;
  connectNoteSignEnableBox.checked = storedSignature.connectNoteSignEnabled;

  const setSaveButtonDisabledState = () => {
    saveButton.disabled = signatureTextDiv.value === storedSignature.text
    && messageSignEnableBox.checked === storedSignature.messageSignEnabled
    && connectNoteSignEnableBox.checked === storedSignature.connectNoteSignEnabled
  };

  signatureTextDiv.addEventListener('input', setSaveButtonDisabledState);
  messageSignEnableBox.addEventListener('change', setSaveButtonDisabledState);
  connectNoteSignEnableBox.addEventListener('change', setSaveButtonDisabledState);

  editButton.addEventListener('click', () => {
    const isButtonEdit = editButton.textContent === "Edit";
    signatureTextDiv.disabled = !isButtonEdit;
    editButton.textContent = isButtonEdit ? "Cancel" : "Edit";
    if (isButtonEdit) signatureTextDiv.focus();
    else {
      signatureTextDiv.value = storedSignature.text;
      setSaveButtonDisabledState();
    }
  });

  saveButton.addEventListener('click', async () => {
    const newSignature = {
      text: signatureTextDiv.value,
      messageSignEnabled: messageSignEnableBox.checked,
      connectNoteSignEnabled: connectNoteSignEnableBox.checked,
    };

    await browser.storage.local.set({ linkedinsignature: newSignature });
    storedSignature = newSignature;
    signatureTextDiv.disabled = true;
    editButton.textContent = 'Edit';
    setSaveButtonDisabledState();
  });

  setSaveButtonDisabledState();
});
