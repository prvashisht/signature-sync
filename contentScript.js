document.addEventListener('focus', function(event) {
  var activeElement = document.activeElement,
    isMessageBox = activeElement.getAttribute('name') === 'message' && 
                   activeElement.classList.contains('ember-text-area') &&
                   activeElement.tagName.toLowerCase() === 'textarea',
    messagebox;
  if (isMessageBox && !activeElement.value) {
    console.log('Message box is active and empty');
    chrome.storage.local.get(['linkedinsignature'], function(item) {
      var parsedLISignature = JSON.parse(item.linkedinsignature)
      if (parsedLISignature.enabled) {
        activeElement.value = parsedLISignature.text;
        setCaretPosition(activeElement, 0);
      }
      return;
    });
  }
}, true);


function setCaretPosition(elem, caretPos) {
    if(elem != null) {
        if(elem.createTextRange) {
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

