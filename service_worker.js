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

chrome.runtime.onInstalled.addListener(installInfo => {
    let installDate, updateDate;
    if (installInfo.reason === "install") {
        installDate = new Date();
    } else {
        updateDate = new Date().toISOString();
    }
    chrome.runtime.getPlatformInfo(platformInfo => {
        let debugData = {
            ...platformInfo,
            agent: navigator.userAgent,
            locale: navigator.language,
            platform: navigator.platform,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }
        if (installDate) debugData.installDate = installDate;
        if (updateDate) debugData.updateDate = updateDate;

        console.log(debugData);
        const encodedTechnicalDetails = encodeURIComponent(
            Object.keys(debugData)
            .map(debugKey => `${debugKey}: ${debugData[debugKey]}`)
            .join("\n")
        );
        chrome.runtime.setUninstallURL(`https://docs.google.com/forms/d/e/1FAIpQLSfVQNeGxn0pb6CnG1WRjeWPWjheTa30a7L58g7B7X-x8jaIqg/viewform?usp=pp_url&entry.1303663358=${encodedTechnicalDetails}`);
    });
});