document.addEventListener('focus', function(event) {
  var activeElement = document.activeElement,
    isMessageBox = activeElement.getAttribute('name') === 'message' && 
                   activeElement.classList.contains('ember-text-area') &&
                   activeElement.tagName.toLowerCase() === 'textarea',
    messagebox;
  if (isMessageBox && !activeElement.value) {
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

document.addEventListener('DOMNodeInserted', function(e) {
  var node = e.target,
    classList = node.classList;

  if (classList &&
        (classList.contains('msg-messaging-form__left-actions') ||
        classList.contains('msg-compose-form__left-actions'))) {
    chrome.storage.local.get(['linkedinsignature'], function(item) {
      var parsedLISignature = JSON.parse(item.linkedinsignature),
        sliderChecked = parsedLISignature.enabled ? 'checked' : '',
        tooltipTextVar = '',
        tooltipClass = '';
      var eleToAdd = document.createElement('label');
      eleToAdd.classList.add('lnkdmsg_switch');
      if (!parsedLISignature.sliderUsedBefore) {
        tooltipTextVar = '<span class="lnkdmsg_tooltiptext">This switch toggles the LinkedIn Messages Signatures on/off.<br />Once you use this switch, the tooltip will disappear.</span>';
        eleToAdd.classList.add('lnkdmsg_tooltip');
      }
      eleToAdd.innerHTML = `
        <input class="lnkdmsg_checkbox" type="checkbox" ${sliderChecked}>
        <span class="lnkdmsg_slider lnkdmsg_round"></span>
        ${tooltipTextVar}
      `;
      node.appendChild(eleToAdd);

      eleToAdd.addEventListener('click', function(e) {
        if (!parsedLISignature.sliderUsedBefore) {
          var li_signTooltips = document.getElementsByClassName('lnkdmsg_tooltip');
          for (var i = li_signTooltips.length - 1; i >= 0; i--) {
            li_signTooltips[i].classList.remove('lnkdmsg_tooltip')
          }
          var li_signTooltipTexts = document.getElementsByClassName('lnkdmsg_tooltiptext');
          for (var i = li_signTooltipTexts.length - 1; i >= 0; i--) {
            li_signTooltipTexts[i].parentNode.removeChild(li_signTooltipTexts[i]);
          }
        }
        changeSignatureEnableState({
          enabled: e.target.checked,
          text: parsedLISignature.text,
          sliderUsedBefore: parsedLISignature.sliderUsedBefore || true
        });
      });
      return;
    });
  }
});

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

function changeSignatureEnableState(signdetails) {
  chrome.storage.local.set({'linkedinsignature': JSON.stringify(signdetails)}, function() {
    var li_signcheckboxes = document.getElementsByClassName('lnkdmsg_checkbox');
    for (var i = li_signcheckboxes.length - 1; i >= 0; i--) {
      if (signdetails.enabled) {
        li_signcheckboxes[i].setAttribute('checked', 'checked');
      } else {
        li_signcheckboxes[i].removeAttribute("checked");
      }
    }
  });
}
