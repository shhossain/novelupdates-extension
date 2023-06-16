chrome.action.onClicked.addListener((tab) => {
  chrome.windows.create({
    url: chrome.runtime.getURL("popup.html"),
    type: "popup",
    width: 300,
    height: 500,
  });
});

// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   if (request.action === "getTopN") {
//     const topN = request.topN;
//     // Send a message to the content script with the updated topN value
//     chrome.tabs.sendMessage(sender.tab.id, { action: "updateTopN", topN });
//   }
// });
