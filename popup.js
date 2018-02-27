document.addEventListener('DOMContentLoaded', function() {
  var signatureTextDiv   = document.getElementById('signature'),
      signatureEnableBox = document.getElementById('enablesign')
  signatureTextDiv.disabled = true;
  document.getElementById('editSignature').addEventListener('click', function() {
    signatureTextDiv.disabled = false;
    signatureTextDiv.focus();
  });
  document.getElementById('saveSignature').addEventListener('click', function() {
    var sign      = signatureTextDiv.value,
      enablesign  = signatureEnableBox.checked,
      signdetails = {
        enabled: enablesign,
        text: sign
      }
    chrome.storage.local.set({'linkedinsignature': JSON.stringify(signdetails)}, function() {
      signatureTextDiv.disabled = true;
    });
  });
  chrome.storage.local.get(['linkedinsignature'], function(item) {
    if (!item.linkedinsignature) {
      var signdetails = {
        enabled: true,
        text: "Regards"
      }
      chrome.storage.local.set({'linkedinsignature': JSON.stringify(signdetails)}, function() {
        signatureTextDiv.value = "Regards";
        signatureEnableBox.checked = true;
        signatureTextDiv.disabled = true;
      });
    }
    var signdetails = JSON.parse(item.linkedinsignature);
    signatureTextDiv.value = signdetails.text;
    signatureEnableBox.checked = signdetails.enabled;
  })
});
