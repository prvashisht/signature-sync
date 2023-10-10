if (typeof browser === "undefined") {
  var browser = chrome;
}

document.addEventListener('DOMContentLoaded', function () {
  var signatureTextDiv = document.getElementById('signature'),
    messageSignEnableBox = document.getElementById('enableMessageSign')
  signatureTextDiv.disabled = true;

  document.getElementById('editSignature').addEventListener('click', function () {
    signatureTextDiv.disabled = false;
    signatureTextDiv.focus();
  });

  document.getElementById('saveSignature').addEventListener('click', function () {
    var sign = signatureTextDiv.value,
      enableMessageSign = messageSignEnableBox.checked,
      linkedinsignature = {
        messageSignEnabled: enableMessageSign,
        text: sign
      }
    browser.storage.local.set({ linkedinsignature }, () => {
      signatureTextDiv.disabled = true;
    });
  });

  browser.storage.local.get('linkedinsignature', function (item) {
    if (!item || !item.linkedinsignature) {
      var linkedinsignature = {
        messageSignEnabled: true,
        text: "\nRegards"
      }
      browser.storage.local.set({ linkedinsignature }, () => {
        signatureTextDiv.value = "\nRegards";
        messageSignEnableBox.checked = true;
        signatureTextDiv.disabled = true;
      });
    } else {
      var signdetails = item.linkedinsignature;
      signatureTextDiv.value = signdetails.text;
      messageSignEnableBox.checked = signdetails.messageSignEnabled;
    }
  })
});
