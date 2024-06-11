if (typeof browser === "undefined") {
    var browser = chrome;
}
  
chrome.runtime.onMessage.addListener((request) => {
    if (request.type === "themeChange") {
        let icon_paths = {
            "16": `icons/${request.mode}/icon16.png`,
            "32": `icons/${request.mode}/icon32.png`,
            "48": `icons/${request.mode}/icon48.png`,
            "128": `icons/${request.mode}/icon128.png`
        };
        chrome.action.setIcon({ path: icon_paths });
    }
});

// TODO: move to a common file and import
const defaultSignature = {
    messageSignEnabled: true,
    connectNoteSignEnabled: true,
    messageSignatures: [{
        name: "Default",
        text: "\nRegards"
    }],
    connectionSignatures: [{
        name: "Default",
        text: "\nRegards"
    }],
};
chrome.runtime.onInstalled.addListener(installInfo => {
    let installDate, updateDate;
    if (installInfo.reason === "install") {
        installDate = new Date();
    } else {
        updateDate = new Date().toISOString();
    }
    chrome.runtime.getPlatformInfo(async platformInfo => {
        let debugData = {
            ...platformInfo,
            agent: navigator.userAgent,
            locale: navigator.language,
            platform: navigator.platform,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }
        if (installDate) debugData.installDate = installDate;
        if (updateDate) debugData.updateDate = updateDate;

        const encodedDebugData = encodeURIComponent(
            Object.keys(debugData)
            .map(debugKey => `${debugKey}: ${debugData[debugKey]}`)
            .join("\n")
        );
        chrome.runtime.setUninstallURL(`https://pratyushvashisht.com/signaturesync/uninstall?utm_source=browser&utm_medium=extension&utm_campaign=uninstall&debugData=${encodedDebugData}`);

        await browser.storage.local.set({ linkedinsignature: defaultSignature });
    });
});
