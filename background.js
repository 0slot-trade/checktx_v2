chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'fetchJitoBundle') {    
    //console.log('got fetchJitoBundle request')
    const apiUrl = `https://bundles.jito.wtf/api/v1/bundles/transaction/${request.signature}`;
    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        // 检查返回数据是否为数组且有内容
        const isBundle = Array.isArray(data) && data.length > 0 && data[0].bundle_id;
        sendResponse({ success: true, isBundle });
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
      });
    return true; // 异步响应需要返回true
  }
});

// Listen for navigation events
chrome.webNavigation.onHistoryStateUpdated.addListener(
  function(details) {
    if (details.url.includes("solscan.io/tx/")) {
      //console.log('debug bg send checkJitoBundle for navigation')
      //chrome.tabs.sendMessage(details.tabId, { action: "checkJitoBundle" });
      chrome.tabs.sendMessage(details.tabId, { action: "checkJitoBundle" })
      .catch((error) => {
        //console.error("sendMessage failed:", error);
        // 等待 1 秒后重试
        setTimeout(() => {
          chrome.tabs.sendMessage(details.tabId, { action: "checkJitoBundle" })
            .catch((err) => console.error("Retry sendMessage failed:", err));
        }, 3000);
      });
    
    }
  },
  { url: [{ hostSuffix: "solscan.io" }] }
);

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes("solscan.io/tx/")) {
    //console.log('debug bg send checkJitoBundle for tab updates')
    //chrome.tabs.sendMessage(tabId, { action: "checkJitoBundle" });
    chrome.tabs.sendMessage(tabId, { action: "checkJitoBundle" })
    .catch((error) => {
      //console.error("sendMessage failed:", error);
      // 等待 1 秒后重试
      setTimeout(() => {
        chrome.tabs.sendMessage(tabId, { action: "checkJitoBundle" })
          .catch((err) => console.error("Retry sendMessage failed:", err));
      }, 3000);
    });
  
  }
});