chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
   if(changeInfo && changeInfo.status == "complete"){
        console.log("Tab updated: " + tab.url);

        chrome.tabs.sendMessage(tabId, {data: tab}, function(response) {
            console.log(response);
        });
    }
});

//listen to network request.