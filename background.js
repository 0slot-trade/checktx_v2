chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  //console.log('fetching jito bundle...')
  if (request.type === 'fetchJitoBundle') {
    const apiUrl = `https://bundles.jito.wtf/api/v1/bundles/transaction/${request.signature}`;
    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        const isBundle = Array.isArray(data) && data.length > 0 && data[0].bundle_id;
        
        if (isBundle) {
          const bundleId = data[0].bundle_id;
          const bundleUrl = `https://explorer.jito.wtf/bundle/${bundleId}`;
          
          fetch(`https://bundles.jito.wtf/api/v1/bundles/bundle/${bundleId}`)
            .then(response => response.json())
            .then(bundleData => {
              if (Array.isArray(bundleData) && bundleData.length > 0) {
                const landedTipLamports = bundleData[0].landedTipLamports;
                
                const solAmount = landedTipLamports / 1000000000;
                
                const formattedSol = Number(solAmount).toString();    
                const validatorTip = formattedSol   
                
                sendResponse({
                  success: true,
                  isBundle,
                  bundleUrl,
                  validatorTip,
                  bundleId
                });
              } else {
                const validatorTip = `null`;
                sendResponse({
                  success: true,
                  isBundle,
                  bundleUrl,
                  validatorTip,
                  bundleId
                });
              }
            })
            .catch(error => {
              const validatorTip = `null`;
              sendResponse({
                success: true,
                isBundle,
                bundleUrl,
                validatorTip,
                bundleId
              });
            });
          return true; // Keep the message channel open
        } else {
          sendResponse({ success: true, isBundle });
          return false;
        }
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
        return false;
      });
    return true; // Async response needs to return true
  }
});
