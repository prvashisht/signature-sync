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
  return signature ? signature.split('\n')
    .map(signPart => `<p>${signPart || " <br/>"}</p>`)
    .join(" ") : "<p> <br/></p>";
}

const _setCaretPosition = (elem, caretPos) => {
  if (!elem) return;
  if (elem.createTextRange) {
    const range = elem.createTextRange();
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
  return Object.entries(replacementHash).reduce((acc, [key, value]) => {
    const profileValue = profileDetails[value];
    return profileValue ? acc.replace(new RegExp(key, 'g'), profileValue) : acc;
  }, signature);
}

const handleSignatureAddition = async (element, isMessageBox) => {
  const { linkedinsignature } = await chrome.storage.local.get(['linkedinsignature']);
  if (!linkedinsignature) return;

  const signature = isMessageBox ? linkedinsignature.messageSignatures[0] : linkedinsignature.connectionSignatures[0];
  if (!signature) return;

  const { profileDetails, messageSignEnabled, connectNoteSignEnabled } = linkedinsignature;
  const signatureText = replaceProfileVariables(signature.text, profileDetails);
  let signatureAdded = false;
  if (messageSignEnabled && isMessageBox) {
    element.innerHTML = modifySignatureToHTML(signatureText);
    signatureAdded = true;
  } else if (connectNoteSignEnabled && !isMessageBox) {
    element.value = signatureText;
    signatureAdded = true;
  }
  chrome.storage.local.set({ linkedinsignature: { ...linkedinsignature, profileDetails: {} } });

  if (!signatureAdded) return;
  _setCaretPosition(element, 0);
  element.dispatchEvent(new Event('input', { bubbles: true }));
};

const addSignatureObserver = (messageBox) => {
  const observer = new MutationObserver(async (mutations) => {
    for (const mutation of mutations) {
      if ((mutation.type === 'childList' || mutation.type === 'characterData') && !messageBox.textContent.trim()) {
        await handleSignatureAddition(messageBox, true);
      }
    }
  });

  observer.observe(messageBox, { childList: true, characterData: true, subtree: true });
  messageBox.signatureObserver = observer;
};

const removeSignatureObserver = (messageBox) => {
  messageBox.signatureObserver?.disconnect();
  delete messageBox.signatureObserver;
};

const checkFocusedElement = async () => {
  const activeElement = document.activeElement,
    isConnectNoteBox = activeElement.matches('textarea.connect-button-send-invite__custom-message'),
    isMessageBox = activeElement.matches('div.msg-form__contenteditable');
  if (!isConnectNoteBox && !isMessageBox) return;
  if (isMessageBox) addSignatureObserver(activeElement);

  const fieldContainsText = (isMessageBox ? activeElement.textContent : activeElement.value).trim();
  if (!fieldContainsText) await handleSignatureAddition(activeElement, isMessageBox);
}

document.addEventListener('focus', checkFocusedElement, true);

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
      experienceTimeLineSelector = '.pvs-entity__sub-components li .pvs-entity__caption-wrapper',
      latestCompany = document.querySelector('section #experience').parentElement.querySelector('li'),
      changedRoles = Boolean(latestCompany.querySelector(experienceTimeLineSelector)),
      latestCompanyName = changedRoles ?
        latestCompany.querySelector(experienceTitleSelector).textContent.trim() :
        latestCompany.querySelector(experienceSubtitleSelector).textContent.trim().split(' · ')[0],
      latestTimeline = changedRoles ?
        latestCompany.querySelector(experienceTimeLineSelector).textContent.trim() :
        latestCompany.querySelector('.pvs-entity__caption-wrapper').textContent.trim(),
      isCurrentCompany = !latestTimeline.split(' - ')[1].split(' · ')[0].includes(' ');

    return isCurrentCompany ? latestCompanyName.replace(/\s+/, ' ') : null;
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
