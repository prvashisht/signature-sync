const darkModeListener = (isDarkMode) => {
  const mode = isDarkMode.matches ? 'dark' : 'light';
  chrome.runtime.sendMessage({ type: "themeChange", mode });
  document.querySelectorAll('.msg-form__signature-toggle img').forEach(toggleImg => {
    toggleImg.src = chrome.runtime.getURL(`icons/${mode}/icon32.png`);
  });
}
const darkModePreference = window.matchMedia("(prefers-color-scheme: dark)");
darkModePreference.addEventListener("change", darkModeListener);
darkModeListener(darkModePreference);

// Every line should be a paragraph. 
// Including empty lines which should be a whitespace + break tag inside a paragraph
const modifySignatureToHTML = signature => {
  if (!signature) return "<p> <br/></p>"
  return signature.split('\n').map(signPart => {
    return `<p>${signPart || " <br/>"}</p>`
  }).join(" ")
}

const _setCaretPosition = (elem, caretPos) => {
  if (!elem) return;
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

const replaceProfileVariables = (signature, profileDetails) => {
  if (!profileDetails) return signature;

  const replacementHash = {
    '__name__': 'fullName',
    '__firstName__': 'firstName',
    '__lastName__': 'lastName',
    '__company__': 'company'
  };
  return Object.keys(replacementHash).reduce((acc, key) => {
    const value = profileDetails[replacementHash[key]];
    return value ? acc.replace(new RegExp(key, 'g'), value) : acc;
  }, signature);
}

const addSignatureObserver = (messageBox) => {
  const observer = new MutationObserver(async (mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList' || mutation.type === 'characterData') {
        const fieldContainsText = messageBox.textContent.trim();
        if (fieldContainsText) return;

        const { linkedinsignature } = await chrome.storage.local.get(['linkedinsignature']);
        const { profileDetails } = linkedinsignature;
        // TODO: Combine the code with the other function
        if (linkedinsignature.messageSignEnabled) {
          const signatureToAdd = replaceProfileVariables(linkedinsignature.messageSignatures[0].text, profileDetails);
          messageBox.innerHTML = modifySignatureToHTML(signatureToAdd);
          _setCaretPosition(messageBox, 0);
          messageBox.dispatchEvent(new Event('input', { bubbles: true }));
          chrome.storage.local.set({ linkedinsignature: { ...linkedinsignature, profileDetails: {} } });
        }
      }
    }
  });

  observer.observe(messageBox, { childList: true, characterData: true, subtree: true });
  messageBox.signatureObserver = observer;
};

const removeSignatureObserver = (messageBox) => {
  if (messageBox.signatureObserver) {
    messageBox.signatureObserver.disconnect();
    delete messageBox.signatureObserver;
  }
};

// Add signature when message box is focused
document.addEventListener('focus', async () => {
  const activeElement = document.activeElement,
    isConnectNoteBox = activeElement.matches('textarea.connect-button-send-invite__custom-message'),
    isMessageBox = activeElement.matches('div.msg-form__contenteditable');
  if (!isConnectNoteBox && !isMessageBox) return;
  if (isMessageBox) addSignatureObserver(activeElement);

  let fieldContainsText = (isMessageBox ? activeElement.textContent : activeElement.value).trim();
  if (fieldContainsText) return;

  const { linkedinsignature } = await chrome.storage.local.get(['linkedinsignature']);
  const { profileDetails } = linkedinsignature;

  const addSignature = (signature, isMessageBox) => {
    const signatureText = replaceProfileVariables(signature.text, profileDetails);
    if (isMessageBox) {
      activeElement.innerHTML = modifySignatureToHTML(signatureText);
    } else {
      activeElement.value = signatureText;
    }
    chrome.storage.local.set({ linkedinsignature: { ...linkedinsignature, profileDetails: {} } });
  };
  if (linkedinsignature.messageSignEnabled && isMessageBox) {
    addSignature(linkedinsignature.messageSignatures[0], true);
  } else if (linkedinsignature.connectNoteSignEnabled && isConnectNoteBox) {
    addSignature(linkedinsignature.connectionSignatures[0], false);
  }
  _setCaretPosition(activeElement, 0);
  activeElement.dispatchEvent(new Event('input', { bubbles: true }));
}, true);

document.addEventListener('blur', (event) => {
  const isMessageBox = event.target.matches('div.msg-form__contenteditable');
  if (isMessageBox) removeSignatureObserver(event.target);
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

  const { linkedinsignature } = await chrome.storage.local.get(['linkedinsignature']);
  if (!linkedinsignature) return;

  const signatureToggle = document.createElement('div');
  signatureToggle.classList.add('msg-form__signature-toggle');
  signatureToggle.style = 'cursor: pointer; display: flex; align-items: center; justify-content: center;';
  signatureToggle.title = 'Enable/Disable Signature';
  signatureToggle.addEventListener('click', toggleSignature);

  const icon = document.createElement('img');
  icon.src = chrome.runtime.getURL(`icons/${darkModePreference.matches ? 'dark' : 'light'}/icon32.png`);
  icon.alt = 'Toggle Signature';
  icon.style = 'width: 20px; height: 20px; margin: 0 0.5rem; transition: opacity 0.3s; position: relative; bottom: 0.2em;';
  icon.style.opacity = linkedinsignature.messageSignEnabled ? 1 : 0.4;

  signatureToggle.appendChild(icon);
  messageActions.appendChild(signatureToggle);
};

const findCompanyName = (fullName) => {
  if (window.location.href.includes('linkedin.com/in/')) {
    const mainName = document.querySelector('main h1').textContent.trim();
    if (mainName !== fullName) return;

    const experienceTitleSelector = 'div.mr1 span[aria-hidden="true"]',
      experienceSubtitleSelector = 'span.t-14:not(.t-black--light):first-of-type span[aria-hidden="true"]',
      latestCompany = document.querySelector('section #experience').parentElement.querySelector('li'),
      changedRoles = latestCompany.querySelector('.pvs-entity__caption-wrapper').textContent.trim().indexOf(' · ') === -1,
      latestCompanyName = changedRoles ?
        latestCompany.querySelector(experienceTitleSelector).textContent.trim() :
        latestCompany.querySelector(experienceSubtitleSelector).textContent.trim().split(' · ')[0],
      latestTimeline = changedRoles ?
        latestCompany.querySelector('.pvs-entity__sub-components li .pvs-entity__caption-wrapper').textContent.trim() :
        latestCompany.querySelector('.pvs-entity__caption-wrapper').textContent.trim(),
      isCurrentCompany = !latestTimeline.split(' - ')[1].split(' · ')[0].includes(' ');

    return isCurrentCompany ? latestCompanyName : null;
  } else if (window.location.href.includes('linkedin.com/search/results/')) {
    let returnValue = null;
    document.querySelectorAll('div.mb1').forEach(result => {
      const name = result.querySelector('a > span > span:not(.visually-hidden)').textContent.trim();
      if (name !== fullName) return;

      const skillSections = result.nextElementSibling.textContent.trim(),
        isSkillCurrentCompany = skillSections.startsWith('Current:');

      if (isSkillCurrentCompany) {
        returnValue = skillSections.split(':')[1].split(' at ')[1].trim();
        return;
      }

      const primarySummary = result.querySelector('.entity-result__primary-subtitle').textContent.trim(),
        summaryHasCurrentCompany = primarySummary.includes(' at ');

      if (summaryHasCurrentCompany) returnValue = primarySummary.split(' at ')[1].split(/[^\w\s]/)[0];
    });

    return returnValue;
  }
};

const saveProfileDetails = async (modal) => {
  if (!modal) return;
  const fullName = modal.querySelector('strong').textContent.trim();
  if (!fullName) return;

  const companyname = findCompanyName(fullName);

  const names = fullName.split(' '),
    firstName = names[0],
    lastName = names.slice(1).join(' ');
  
  const { linkedinsignature } = await chrome.storage.local.get(['linkedinsignature']);
  linkedinsignature.profileDetails = { fullName, firstName, lastName };
  if (companyname) linkedinsignature.profileDetails.company = companyname;
  await chrome.storage.local.set({ linkedinsignature });
}

const messageForm = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === 'childList') {
      mutation.addedNodes.forEach((addedNode) => {
        if (addedNode.nodeType === Node.ELEMENT_NODE) {
          if (addedNode.matches('.msg-form__footer .msg-form__left-actions')) addSignatureToggle(addedNode);
          if (addedNode.matches('.send-invite .artdeco-modal__content p.display-flex')) saveProfileDetails(addedNode);
        }
      });
    }
  });
});
messageForm.observe(document.body, { childList: true, subtree: true });
