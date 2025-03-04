// content.js
let notificationTimeout = null;
let hoverNotification = null;

// 正则表达式用于匹配Solana交易签名
const solanaSignatureRegex = /[1-9A-HJ-NP-Za-km-z]{32,88}/;

function checkForJitoBundle() {
  // Clear any existing timeout to prevent multiple checks
  clearTimeout(notificationTimeout);
  
  // Only proceed if we're on a transaction page
  if (!window.location.pathname.startsWith('/tx/')) {
    removeNotification();
    return;
  }

  // Wait for the page to fully load its data
  notificationTimeout = setTimeout(() => {
    // Get the transaction signature from the URL
    const txSignature = window.location.pathname.split('/tx/')[1];
    if (!txSignature) {
      removeNotification();
      return;
    }

    // Call the background script to fetch data from the Jito API
    chrome.runtime.sendMessage(
      { 
        type: 'fetchJitoBundle', 
        signature: txSignature 
      },
      (response) => {
        if (response && response.success) {
          // Display the notification based on the API response
          showNotification(response.isBundle);
          //console.log(`Transaction ${txSignature} is ${response.isBundle ? 'a' : 'not a'} Jito bundle`);
        } else {
          // Handle error
          //console.error('Error checking Jito bundle:', response ? response.error : 'No response');
          showErrorNotification();
        }
      }
    );
  }, 1500); // Wait 1.5 seconds for page content to load
}

function removeNotification() {
  // Remove any existing notifications
  const existingNotification = document.getElementById('jito-bundle-notification');
  if (existingNotification) {
    existingNotification.remove();
  }
  
  // Clear any existing timeout
  if (notificationTimeout) {
    clearTimeout(notificationTimeout);
    notificationTimeout = null;
  }
}

function removeHoverNotification() {
  if (hoverNotification) {
    hoverNotification.remove();
    hoverNotification = null;
  }
}

function showNotification(isJitoBundle) {
  // Remove any existing notifications first
  removeNotification();

  // Create a new notification element
  const notification = document.createElement('div');
  notification.id = 'jito-bundle-notification';
  notification.style.position = 'fixed';
  notification.style.top = '70px';
  notification.style.right = '20px';
  notification.style.padding = '15px';
  notification.style.borderRadius = '5px';
  notification.style.zIndex = '10000';
  notification.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
  notification.style.fontSize = '14px';
  notification.style.fontWeight = 'bold';

  if (isJitoBundle) {
    notification.style.backgroundColor = '#4CAF50';
    notification.style.color = 'white';
    notification.textContent = '✓ tx is Jito bundle';
  } else {
    notification.style.backgroundColor = '#f44336';
    notification.style.color = 'white';
    notification.textContent = '✗ tx is NOT Jito bundle';
  }

  // Add a close button
  const closeButton = document.createElement('span');
  closeButton.textContent = '×';
  closeButton.style.marginLeft = '10px';
  closeButton.style.cursor = 'pointer';
  closeButton.style.float = 'right';
  closeButton.onclick = function() {
    removeNotification();
  };
  notification.appendChild(closeButton);
  
  // Add advertisement
  addAdvertisement(notification);

  // Add the notification to the page
  document.body.appendChild(notification);

  // Auto-hide after 10 seconds
  notificationTimeout = setTimeout(() => {
    removeNotification();
  }, 10000);
}

function showHoverNotification(isJitoBundle, x, y) {
  // Remove any existing hover notification
  removeHoverNotification();

  // Create a new notification element
  const notification = document.createElement('div');
  notification.id = 'jito-hover-notification';
  notification.style.position = 'fixed';
  notification.style.left = `${x + 15}px`;
  notification.style.top = `${y + 15}px`;
  notification.style.padding = '10px';
  notification.style.borderRadius = '5px';
  notification.style.zIndex = '10001';
  notification.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
  notification.style.fontSize = '12px';
  notification.style.fontWeight = 'bold';
  notification.style.pointerEvents = 'none'; // 让鼠标事件穿透该元素
  notification.style.maxWidth = '200px';

  if (isJitoBundle) {
    notification.style.backgroundColor = '#4CAF50';
    notification.style.color = 'white';
    notification.textContent = '✓ Jito bundle';
  } else {
    notification.style.backgroundColor = '#f44336';
    notification.style.color = 'white';
    notification.textContent = '✗ NOT Jito bundle';
  }

  // Add advertisement
  addAdvertisement(notification, true);

  // Add the notification to the page
  document.body.appendChild(notification);
  
  // Store the hover notification reference
  hoverNotification = notification;
}

function showErrorNotification() {
  // Remove any existing notifications first
  removeNotification();

  // Create error notification
  const notification = document.createElement('div');
  notification.id = 'jito-bundle-notification';
  notification.style.position = 'fixed';
  notification.style.top = '70px';
  notification.style.right = '20px';
  notification.style.padding = '15px';
  notification.style.borderRadius = '5px';
  notification.style.zIndex = '10000';
  notification.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
  notification.style.fontSize = '14px';
  notification.style.fontWeight = 'bold';
  notification.style.backgroundColor = '#FF9800';
  notification.style.color = 'white';
  notification.textContent = '! 检查 Jito bundle 时出错';

  // Add a close button
  const closeButton = document.createElement('span');
  closeButton.textContent = '×';
  closeButton.style.marginLeft = '10px';
  closeButton.style.cursor = 'pointer';
  closeButton.style.float = 'right';
  closeButton.onclick = function() {
    removeNotification();
  };
  notification.appendChild(closeButton);
  
  // Add advertisement
  addAdvertisement(notification);

  // Add the notification to the page
  document.body.appendChild(notification);

  // Auto-hide after 10 seconds
  notificationTimeout = setTimeout(() => {
    removeNotification();
  }, 10000);
}

function addAdvertisement(element, isHover = false) {
  // Add advertisement
  const adContainer = document.createElement('div');
  adContainer.style.marginTop = '6px';
  adContainer.style.fontSize = isHover ? '10px' : '12px';
  adContainer.style.borderTop = '1px solid rgba(255, 255, 255, 0.3)';
  adContainer.style.paddingTop = '6px';
  adContainer.style.textAlign = 'center';
  
  const adText = document.createElement('span');
  adText.textContent = 'by ';
  
  const adLink = document.createElement('a');
  adLink.textContent = '0slot.trade';
  adLink.href = 'https://0slot.trade';
  adLink.target = '_blank';
  adLink.style.color = 'white';
  adLink.style.textDecoration = 'underline';
  adLink.style.fontWeight = 'bold';
  
  // 如果是悬停通知，则启用点击事件(需要覆盖pointerEvents)
  if (isHover) {
    adLink.style.pointerEvents = 'auto';
    adLink.style.cursor = 'pointer';
  }
  
  adContainer.appendChild(adText);
  adContainer.appendChild(adLink);
  element.appendChild(adContainer);
}

// 检查链接是否包含Solana交易签名
function extractSignatureFromLink(link) {
  // 检查是否是solscan的交易链接
  if (link.href && link.href.includes('solscan.io/tx/')) {
    return link.href.split('/tx/')[1];
  }
  
  /*
  // 检查是否是其他包含Solana签名的链接
  if (link.href && solanaSignatureRegex.test(link.href)) {
    const match = link.href.match(solanaSignatureRegex);
    if (match && match[0].length >= 32) {
      return match[0];
    }
  }
  
  // 检查链接文本是否是Solana签名
  if (link.textContent && solanaSignatureRegex.test(link.textContent)) {
    const match = link.textContent.match(solanaSignatureRegex);
    if (match && match[0].length >= 32) {
      return match[0];
    }
  }*/
  
  return null;
}

// 鼠标悬停处理
let hoverTimeout = null;
let currentHoverSignature = null;

function handleLinkHover(event) {
  const link = event.target.closest('a');
  if (!link) return;
  
  // 清除任何现有的悬停超时和通知
  clearTimeout(hoverTimeout);
  removeHoverNotification();
  
  //console.log('checking link')
  const signature = extractSignatureFromLink(link);
  if (!signature) return;
  
  // 存储当前检查的签名以防止重复请求
  currentHoverSignature = signature;
  
  // 延迟显示通知，以避免频繁触发
  hoverTimeout = setTimeout(() => {
    const x = event.clientX;
    const y = event.clientY;
    
    //console.log('sending message to check for link hover')
    // 检查是否是Jito bundle
    chrome.runtime.sendMessage(
      { 
        type: 'fetchJitoBundle', 
        signature: signature 
      },
      (response) => {
        // 如果鼠标已经移开或者已经检查了不同的签名，则不显示通知
        if (currentHoverSignature !== signature) return;
        
        if (response && response.success) {
          showHoverNotification(response.isBundle, x, y);
        }
      }
    );
  }, 300); // 300ms延迟，避免过于频繁的API调用
}

function handleLinkLeave() {
  clearTimeout(hoverTimeout);
  currentHoverSignature = null;
  removeHoverNotification();
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "checkJitoBundle") {
    //console.log('got message and call checkForJitoBundle')
    checkForJitoBundle();
  }
});

// Helper function to check if current page is a transaction page
function isTransactionPage() {
  return window.location.pathname.startsWith('/tx/');
}

// 设置页面加载和导航的处理
function setupPageHandlers() {
  // 添加鼠标悬停事件监听器
  document.addEventListener('mouseover', handleLinkHover);
  document.addEventListener('mouseout', handleLinkLeave);
  
  // 检查当前页面
  if (isTransactionPage()) {
    checkForJitoBundle();
  } else {
    removeNotification();
  }
}

// 初始化
setupPageHandlers();

// Monitor URL changes (for SPA navigation)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    if (isTransactionPage()) {
      checkForJitoBundle();
    } else {
      removeNotification();
    }
  }
}).observe(document, { subtree: true, childList: true });

// Also listen for history events (back/forward navigation)
window.addEventListener('popstate', () => {
  if (isTransactionPage()) {
    checkForJitoBundle();
  } else {
    removeNotification();
  }
});