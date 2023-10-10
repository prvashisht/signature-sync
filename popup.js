if (typeof browser === "undefined") {
  var browser = chrome;
}

document.addEventListener('DOMContentLoaded', function () {
  let signatureTextDiv = document.getElementById('signature'),
    messageSignEnableBox = document.getElementById('enableMessageSign'),
    connectNoteSignEnableBox = document.getElementById('enableConnectNoteSign');
  signatureTextDiv.disabled = true;

  document.getElementById('editSignature').addEventListener('click', function () {
    signatureTextDiv.disabled = false;
    signatureTextDiv.focus();
  });

  document.getElementById('saveSignature').addEventListener('click', function () {
    let sign = signatureTextDiv.value,
      enableMessageSign = messageSignEnableBox.checked,
      enableConnectNoteSign = connectNoteSignEnableBox.checked,
      linkedinsignature = {
        messageSignEnabled: enableMessageSign,
        connectNoteSignEnabled: enableConnectNoteSign,
        text: sign
      }
    browser.storage.local.set({ linkedinsignature }, () => {
      signatureTextDiv.disabled = true;
    });
  });

  browser.storage.local.get('linkedinsignature', function (item) {
    if (!item || !item.linkedinsignature) {
      const defaultState = true;
      let linkedinsignature = {
        messageSignEnabled: defaultState,
        connectNoteSignEnabled: defaultState,
        text: "\nRegards"
      }
      browser.storage.local.set({ linkedinsignature }, () => {
        signatureTextDiv.value = "\nRegards";
        messageSignEnableBox.checked = true;
        connectNoteSignEnableBox.checked = true;
        signatureTextDiv.disabled = true;
      });
    } else {
      let signdetails = item.linkedinsignature;
      signatureTextDiv.value = signdetails.text;
      messageSignEnableBox.checked = signdetails.messageSignEnabled;
      connectNoteSignEnableBox.checked = signdetails.connectNoteSignEnabled;
    }
  })
});
