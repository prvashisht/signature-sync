let darkModeListener = (isDarkMode) => {
  chrome.runtime.sendMessage({
    type: "themeChange",
    mode: isDarkMode.matches ? 'dark' : 'light',
  });
  document.querySelectorAll('.msg-form__signature-toggle img').forEach(toggleImg => {
    toggleImg.src = chrome.runtime.getURL(`icons/${isDarkMode.matches ? 'dark' : 'light'}/icon32.png`);
  });
}
const darkModePreference = window.matchMedia("(prefers-color-scheme: dark)");
// recommended method for newer browsers: specify event-type as first argument
darkModePreference.addEventListener("change", darkModeListener);
// deprecated method for backward compatibility
darkModePreference.addListener(e => darkModeListener);
// set icons on initial load
darkModeListener(darkModePreference);

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
}

// Add signature when message box is focused
document.addEventListener('focus', async () => {
  let activeElement = document.activeElement,
    isConnectNoteBox = activeElement.matches('textarea.connect-button-send-invite__custom-message'),
    isMessageBox = activeElement.matches('div.msg-form__contenteditable');
  if (!isConnectNoteBox && !isMessageBox) return;

  let fieldContainsText = isMessageBox ? activeElement.textContent.trim() : activeElement.value.trim();
  if (fieldContainsText) return;

  const { linkedinsignature } = await chrome.storage.local.get(['linkedinsignature']);
  if (linkedinsignature.messageSignEnabled && isMessageBox) {
    activeElement.innerHTML = modifySignatureToHTML(linkedinsignature.messageSignatures[0].text);
  }
  if (linkedinsignature.connectNoteSignEnabled && isConnectNoteBox) {
    let signatureToAdd = linkedinsignature.connectionSignatures[0].text;
    const { profileDetails } = linkedinsignature;
    if (profileDetails) {
      signatureToAdd = signatureToAdd
        .replace(/__name__/g, profileDetails.fullName)
        .replace(/__firstName__/g, profileDetails.firstName)
        .replace(/__lastName__/g, profileDetails.lastName);
      if (profileDetails.company) signatureToAdd = signatureToAdd.replace(/__company__/g, profileDetails.company);
    }
    activeElement.value = signatureToAdd;
  }
  _setCaretPosition(activeElement, 0);
  activeElement.dispatchEvent(new Event('input', { bubbles: true }));
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
  const signatureToggle = document.createElement('div');
  signatureToggle.classList.add('msg-form__signature-toggle');
  signatureToggle.style = 'cursor: pointer; display: flex; align-items: center; justify-content: center;';
  signatureToggle.title = 'Enable/Disable Signature';
  signatureToggle.addEventListener('click', toggleSignature);

  const icon = document.createElement('img');
  icon.src = chrome.runtime.getURL(`icons/${darkModePreference.matches ? 'dark' : 'light'}/icon32.png`);
  icon.alt = 'Toggle Signature';
  icon.style = 'width: 20px; height: 20px; margin: 0 0.5rem; transition: opacity 0.3s; position: relative; bottom: 0.2em;';
  const { linkedinsignature } = await chrome.storage.local.get(['linkedinsignature']);
  if (!linkedinsignature) return;
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
      experiences = document.querySelector('section #experience').parentElement,
      latestCompany = experiences.querySelector('li'),
      changedRoles = latestCompany.querySelector('.pvs-entity__caption-wrapper').textContent.trim().indexOf(' · ') === -1,
      latestCompanyName = changedRoles ?
        latestCompany.querySelector(experienceTitleSelector).textContent.trim() :
        latestCompany.querySelector(experienceSubtitleSelector).textContent.trim().split(' · ')[0],
      latestTimeline = changedRoles ?
        latestCompany.querySelector('.pvs-entity__sub-components li .pvs-entity__caption-wrapper').textContent.trim() :
        latestCompany.querySelector('.pvs-entity__caption-wrapper').textContent.trim(),
      isCurrentCompany = !latestTimeline.split(' - ')[1].split(' · ')[0].includes(' ');

    if (isCurrentCompany) return latestCompanyName;
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
