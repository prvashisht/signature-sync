document.addEventListener('DOMContentLoaded', function () {
  var signatureTextDiv = document.getElementById('signature'),
    signatureEnableBox = document.getElementById('enablesign')
  signatureTextDiv.disabled = true;

  document.getElementById('editSignature').addEventListener('click', function () {
    signatureTextDiv.disabled = false;
    signatureTextDiv.focus();
  });

  document.getElementById('saveSignature').addEventListener('click', function () {
    var sign = signatureTextDiv.value,
      enablesign = signatureEnableBox.checked,
      linkedinsignature = {
        enabled: enablesign,
        text: sign
      }
    browser.storage.local.set({ linkedinsignature }, () => {
      signatureTextDiv.disabled = true;
    });
  });

  browser.storage.local.get('linkedinsignature', function (item) {
    if (!item || !item.linkedinsignature) {
      var linkedinsignature = {
        enabled: true,
        text: "Regards"
      }
      browser.storage.local.set({ linkedinsignature }, () => {
        signatureTextDiv.value = "Regards";
        signatureEnableBox.checked = true;
        signatureTextDiv.disabled = true;
      });
    } else {
      var signdetails = item.linkedinsignature;
      signatureTextDiv.value = signdetails.text;
      signatureEnableBox.checked = signdetails.enabled;
    }
  })
});
