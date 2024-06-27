if (typeof browser === "undefined") {
  var browser = chrome;
}

class Popup {
  constructor() {
    this.signatureText = document.getElementById('signature');
    this.enableSignBox = document.getElementById('enableSign');
    this.editButton = document.getElementById('editSignature');
    this.saveButton = document.getElementById('saveSignature');
    this.tabButtons = document.querySelectorAll('.tablinks');

    this.defaultSignature = {
      messageSignEnabled: true,
      connectNoteSignEnabled: true,
      messageSignatures: [{ name: "Default", text: "\nRegards" }],
      connectionSignatures: [{ name: "Default", text: "\nRegards" }]
    };

    this.state = {
      currentTab: 'messages',
      signature: null,
      isEditing: false
    };

    this.init();
  }

  async init() {
    let { linkedinsignature: storedSignature } = await browser.storage.local.get('linkedinsignature');
    storedSignature = this.migrateStoredSignature(storedSignature);
    await browser.storage.local.set({ linkedinsignature: storedSignature });

    this.state.signature = storedSignature;
    this.render();

    this.signatureText.addEventListener('input', () => this.updateSaveButtonState());
    this.enableSignBox.addEventListener('change', () => this.updateSaveButtonState());
    this.editButton.addEventListener('click', () => this.toggleEditState());
    this.saveButton.addEventListener('click', () => this.saveSignature());
    this.tabButtons.forEach(tabButton => tabButton.addEventListener('click', e => this.setTab(e.target.getAttribute('data-tab'))));
  }

  migrateStoredSignature(storedSignature) {
    let updatedSignature = { ...this.defaultSignature };
    if (storedSignature) {
      if (Object.keys(storedSignature).includes('text')) {
        updatedSignature.messageSignatures[0].text = storedSignature.text;
        updatedSignature.connectionSignatures[0].text = storedSignature.text;
        updatedSignature.messageSignEnabled = storedSignature.messageSignEnabled;
        updatedSignature.connectNoteSignEnabled = storedSignature.connectNoteSignEnabled;
      } else updatedSignature = { ...storedSignature };
    }
    return updatedSignature;
  }

  setTab(tab) {
    this.setState({ currentTab: tab, isEditing: false });
  }

  toggleEditState() {
    this.setState({ isEditing: !this.state.isEditing });
  }

  async saveSignature() {
    const { currentTab, signature } = this.state;

    if (currentTab === 'messages') {
      signature.messageSignatures[0].text = this.signatureText.value;
      signature.messageSignEnabled = this.enableSignBox.checked;
    } else {
      signature.connectionSignatures[0].text = this.signatureText.value;
      signature.connectNoteSignEnabled = this.enableSignBox.checked;
    }

    await browser.storage.local.set({ linkedinsignature: signature });
    this.setState({ signature, isEditing: false });
  }

  updateSaveButtonState() {
    const { currentTab, signature } = this.state;
    this.saveButton.disabled = currentTab === 'messages'
      ? this.signatureText.value === signature.messageSignatures[0].text && this.enableSignBox.checked === signature.messageSignEnabled
      : this.signatureText.value === signature.connectionSignatures[0].text && this.enableSignBox.checked === signature.connectNoteSignEnabled;
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.render();
  }

  render() {
    const { currentTab, signature, isEditing } = this.state;

    if (currentTab === 'messages') {
      this.signatureText.value = signature.messageSignatures[0].text;
      this.enableSignBox.checked = signature.messageSignEnabled;
    } else {
      this.signatureText.value = signature.connectionSignatures[0].text;
      this.enableSignBox.checked = signature.connectNoteSignEnabled;
    }

    this.signatureText.disabled = !isEditing;
    this.saveButton.disabled = !isEditing;
    this.editButton.textContent = isEditing ? 'Cancel' : 'Edit';
    
    if (isEditing) this.signatureText.focus();

    this.tabButtons.forEach(tabButton => tabButton.classList.toggle('active', tabButton.getAttribute('data-tab') === currentTab));
    this.enableSignBox.nextElementSibling.textContent = currentTab === 'messages' ? "Use in messages" : "Use in connection requests";
  }
}

document.addEventListener('DOMContentLoaded', () => new Popup());
