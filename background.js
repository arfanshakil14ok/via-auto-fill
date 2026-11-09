// Background Service Worker for VisaFill AI

chrome.runtime.onInstalled.addListener(() => {
  console.log("VisaFill AI Extension installed successfully.");
  // Configure side panel to open on toolbar icon click
  if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
      .catch((error) => console.error("Error setting panel behavior:", error));
  }
});

// Listener for connection and relaying if needed
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "PING") {
    sendResponse({ status: "PONG" });
  }
  return true;
});
