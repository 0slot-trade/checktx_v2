chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  //console.log('fetching jito bundle...')
  if (request.type === 'fetchJitoBundle') {
    const apiUrl = `https://bundles.jito.wtf/api/v1/bundles/transaction/${request.signature}`;
    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        // 检查返回数据是否为数组且有内容
        const isBundle = Array.isArray(data) && data.length > 0 && data[0].bundle_id;
        
        if (isBundle) {
          const bundleId = data[0].bundle_id;
          const bundleUrl = `https://explorer.jito.wtf/bundle/${bundleId}`;
          
          // 获取 bundle 详细信息
          fetch(`https://bundles.jito.wtf/api/v1/bundles/bundle/${bundleId}`)
            .then(response => response.json())
            .then(bundleData => {
              if (Array.isArray(bundleData) && bundleData.length > 0) {
                const landedTipLamports = bundleData[0].landedTipLamports;
                // 将 lamports 转换为 SOL (1 SOL = 1,000,000,000 lamports)
                const solAmount = landedTipLamports / 1000000000;
                // 格式化 SOL 数量
                const formattedSol = Number(solAmount).toString();    
                const validatorTip = formattedSol   
                // 发送结果给 content.js                
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