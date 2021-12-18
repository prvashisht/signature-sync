if (typeof browser === "undefined") {
  var browser = chrome;
}

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
  var activeElement = document.activeElement,
    isMessageBox = activeElement.classList.contains('msg-form__contenteditable');

  if (isMessageBox && !activeElement.textContent.trim()) {
    browser.storage.local.get(['linkedinsignature'], function (item) {
      if (item.linkedinsignature.enabled) {
        activeElement.innerHTML = modifySignatureToHTML(item.linkedinsignature.text);
        _setCaretPosition(activeElement, 0);
        activeElement.click();
      }
      return;
    });
  }
}, true);