// content.js
let notificationTimeout = null;
let hoverNotification = null;
let txStartsWith = 'https://solscan.io/tx/';
let global_response = null;

// 正则表达式用于匹配Solana交易签名
const solanaSignatureRegex = /[1-9A-HJ-NP-Za-km-z]{32,88}/;

function checkForJitoBundle() {
  //console.log('Checking for Jito bundle...');
  // Clear any existing timeout to prevent multiple checks
  clearTimeout(notificationTimeout);
  
  // Only proceed if we're on a transaction page
  if (!window.location.href.startsWith(txStartsWith)) {
    //console.log('Not on a transaction page: ' + window.location.pathname);
    removeNotification();
    return;
  }

  // Wait for the page to fully load its data
  notificationTimeout = setTimeout(() => {
    // Get the transaction signature from the URL
    const txSignature = window.location.pathname.split('/tx/')[1];
    if (!txSignature) {
      //console.log('can not get txs');
      removeNotification();
      return;
    }
    //console.log('sending ' + txSignature)
    // Call the background script to fetch data from the Jito API
    chrome.runtime.sendMessage(
      { 
        type: 'fetchJitoBundle', 
        signature: txSignature 
      },
      (response) => {
        if (response && response.success) {
          // Display the notification based on the API response          
          global_response = response;
          showNotification(response); 
          //console.log(`Transaction ${txSignature} is ${response.isBundle ? 'a' : 'not a'} Jito bundle`);
        } else {
          // Handle error
          console.error('Error checking Jito bundle:', response ? response.error : 'No response');
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

function showNotification(response) {
  // Remove any existing notifications first
  isJitoBundle = response.isBundle;  
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
    textContent = '✓ tx is Jito bundle (tip: ' + response.validatorTip + ')';
    const adLink = document.createElement('a');
    url = response.bundleUrl;
    adLink.textContent = textContent;
    adLink.href = url;
    adLink.target = '_blank';
    adLink.style.color = 'white';
    adLink.style.textDecoration = 'underline';
    adLink.style.fontWeight = 'bold';
    notification.appendChild(adLink);
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

function showHoverNotification(response, x, y) {
  isJitoBundle = response.isBundle;
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
    textContent = '✓ Jito bundle (tip: ' + response.validatorTip + ')';
    const adLink = document.createElement('a');
    url = response.bundleUrl;
    adLink.textContent = textContent;
    adLink.href = url;
    adLink.target = '_blank';
    adLink.style.color = 'white';
    adLink.style.textDecoration = 'underline';
    adLink.style.fontWeight = 'bold';
    notification.appendChild(adLink);
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
          showHoverNotification(response, x, y);
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
    console.log('got message and call checkForJitoBundle')
    checkForJitoBundle();
  }
});


// Helper function to check if current page is a transaction page
function isTransactionPage() {
  return window.location.href.startsWith(txStartsWith);
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

function insertCustomDiv(para_link, para_text) {
  // 先找到所有符合基本属性的 div
  const divs = document.querySelectorAll("div");

  const signerDiv = Array.from(divs).find(div => div.innerText.trim() === "Signer");
  if (!signerDiv) {
    console.log("未找到包含 'Signer' 的 div");
    return false;
  }

  // 创建新的 div 元素
  const newDiv = document.createElement("div");
  newDiv.innerHTML = `
      <div class="flex flex-row flex-wrap justify-start grow-0 shrink-0 basis-full min-w-0 box-border -mx-4 sm:-mx-3 items-stretch gap-y-0">
          <div class="max-w-24/24 md:max-w-6/24 flex-24/24 md:flex-6/24 block relative box-border my-0 px-4 sm:px-3">
              <div class="flex gap-1 flex-row items-center justify-start flex-wrap">
                  <div class="" data-state="closed">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-help text-neutral8 md:text-neutral5 font-medium md:font-normal">
                          <circle cx="12" cy="12" r="10"></circle>
                          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                          <path d="M12 17h.01"></path>
                      </svg>
                  </div>
                  <div class="not-italic text-[14px] leading-[24px] text-neutral8 md:text-neutral5 font-medium md:font-normal">Jito Bundle</div>
              </div>
          </div>
          <div class="max-w-24/24 md:max-w-18/24 flex-24/24 md:flex-18/24 block relative box-border my-0 px-4 sm:px-3">
              <div class="flex flex-col gap-2 items-stretch justify-start w-full">
                  <div>
                      <span class="w-auto max-w-full whitespace-nowrap">
                          <div class="inline" data-state="closed">
                              <span class="align-middle font-normal text-[14px] leading-[24px] border border-dashed border-transparent box-content break-all px-1 -mx-1 rounded-md textLink autoTruncate">
                                  <a id="jito-bundle-link" class="text-current" href="${para_link}">${para_text}</a>
                              </span>
                          </div>
                          <span class="inline-flex items-center ml-1 gap-2 align-middle" id="cp-jitobundle">
                              <div class="inline-flex align-middle" data-state="closed">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy cursor-pointer text-[#adb5bd] hover:text-link-500">
                                      <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
                                      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
                                  </svg>
                              </div>
                          </span>
                      </span>
                  </div>
              </div>
          </div>
      </div>
  `;

  // 插入新元素
  const outerDiv = signerDiv.closest("div").parentNode; // 获取最外层的 <div>
  outerDiv.insertAdjacentElement("afterend", newDiv);
  return true;
}

function attemptInsertCustomDiv(para_link, para_text, maxAttempts = 20, attempt = 0) {
  if (attempt >= maxAttempts) {
    console.error("Failed to insert custom div after maximum attempts.");
    return;
  }

  const success = insertCustomDiv(para_link, para_text);
  if (success) {
    console.log("Custom div inserted successfully.");
    addLoadingIndicator();
    // read storage and update the div
    attemptUpdateCustomDiv();    
  } else {
    console.log("Attempt failed, retrying in 300ms...");
    setTimeout(() => {
      attemptInsertCustomDiv(para_link, para_text, maxAttempts, attempt + 1);
    }, 300);
  }
}


function addLoadingIndicator() {
  let element = document.getElementById("jito-bundle-link");
  if (!element) return;

  // 设置文本内容
  element.textContent = "Updating";
  element.style.display = "inline-flex";
  element.style.alignItems = "center";
  element.style.fontWeight = "bold";
  element.style.fontSize = "14px";
  
  // 创建旋转加载动画（单指针样式）
  let spinner = document.createElement("div");
  spinner.style.width = "16px";
  spinner.style.height = "16px";
  spinner.style.marginLeft = "8px";
  spinner.style.borderRadius = "50%";
  spinner.style.border = "2px solid rgba(0, 0, 0, 0.2)";
  spinner.style.borderTop = "2px solid black";
  spinner.style.animation = "spin 1s linear infinite";
  
  // 添加旋转动画样式
  let style = document.createElement("style");
  style.textContent = `
      @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
      }
  `;
  document.head.appendChild(style);
  
  // 添加旋转图标到元素
  element.appendChild(spinner);
}


function attemptUpdateCustomDiv(maxAttempts = 30, attempt = 0) {
  if (attempt >= maxAttempts) {
    //console.error("Failed to update jito bundle div after maximum attempts.");
    let element = document.getElementById("jito-bundle-link");
    if (element) {
      element.textContent = "Failed to update jito bundle";
      element.style.color = "red";
    }    
    return;
  }

  if (!global_response) {    
    setTimeout(() => {
      attemptUpdateCustomDiv(maxAttempts, attempt + 1);
    }, 500);
  } else {
    isJitoBundle = global_response.isBundle;  
    let element = document.getElementById("jito-bundle-link");
    if (isJitoBundle) {    
      bundleId = global_response.bundleId;      
      if (element) {
        element.textContent = bundleId + ' (Validator Tip: ' + global_response.validatorTip + ')';
        element.href = global_response.bundleUrl;
      }    

      // 指定要复制到剪贴板的内容
      const contentToCopy = bundleId;

      // 获取元素
      const copyElement = document.getElementById('cp-jitobundle');

      if (copyElement) {
          // 为元素添加点击事件监听器
          copyElement.addEventListener('click', async () => {
              try {
                  // 使用 Clipboard API 将内容写入剪贴板
                  await navigator.clipboard.writeText(contentToCopy);
                  console.log('内容已成功复制到剪贴板');
              } catch (error) {
                  console.error('复制内容到剪贴板时出错:', error);
              }
          });
      } 
    } else {
      if (element) {
        element.textContent = "Not Jito bundle";
        element.style.color = "red";
      }            
    }
    global_response = null;    
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

  // 检查当前页面
  if (isTransactionPage()) {
    attemptInsertCustomDiv("#", "Bundle ID (Tip)");
  }