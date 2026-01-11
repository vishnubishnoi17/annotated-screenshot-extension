// Context menu
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "capture-screenshot",
    title: "📸 Capture Full Page Screenshot",
    contexts: ["page"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "capture-screenshot") {
    captureFullPage(tab);
  }
});

// Keyboard shortcut
chrome.commands.onCommand.addListener((command) => {
  if (command === "capture-screenshot") {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      if (tab) captureFullPage(tab);
    });
  }
});

// Message listener
chrome.runtime.onMessage. addListener(async (msg, sender, sendResponse) => {
  if (msg.action === "CAPTURE_FULL_PAGE") {
    const [tab] = await chrome.tabs. query({ active: true, currentWindow: true });
    if (tab) captureFullPage(tab);
  }
  
  if (msg.action === "CAPTURE_VISIBLE") {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) captureVisible(tab);
  }
});

// Full page capture
async function captureFullPage(tab) {
  try {
    if (!tab || tab.url.startsWith("chrome://") || tab.url.startsWith("chrome-extension://") || tab.url.startsWith("edge://")) {
      showNotification("Cannot capture Chrome internal pages", "error");
      return;
    }

    // Show badge
    chrome.action.setBadgeText({ text: ".. .", tabId: tab.id });
    chrome.action.setBadgeBackgroundColor({ color: "#4285f4", tabId: tab.id });

    // Inject capture script
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        document.body.style.overflow = 'hidden';
      }
    });

    // Get page dimensions
    const [{ result: meta }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const body = document.body;
        const html = document.documentElement;
        return {
          width: Math.max(body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth),
          height: Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight),
          viewportWidth: window.innerWidth,
          viewportHeight: window.innerHeight,
          devicePixelRatio:  window.devicePixelRatio || 1,
          scrollX: window.scrollX,
          scrollY: window.scrollY,
          url: window.location.href,
          title: document.title
        };
      }
    });

    const screenshots = [];
    const delay = 500;
    let capturedHeight = 0;

    // Capture screenshots in chunks
    for (let y = 0; y < meta. height; y += meta.viewportHeight) {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (scrollY) => window.scrollTo(0, scrollY),
        args: [y]
      });

      await new Promise(r => setTimeout(r, delay));
      
      const dataUrl = await chrome.tabs.captureVisibleTab(null, { 
        format: "png",
        quality: 100
      });
      
      screenshots.push(dataUrl);
      capturedHeight = y + meta.viewportHeight;

      // Update badge progress
      const progress = Math.min(100, Math.round((capturedHeight / meta.height) * 100));
      chrome.action.setBadgeText({ text: `${progress}%`, tabId: tab.id });
    }

    // Restore scroll position
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (x, y) => {
        window.scrollTo(x, y);
        document.body.style.overflow = '';
      },
      args: [meta.scrollX, meta.scrollY]
    });

    // Store data with metadata
    await chrome.storage.local.set({ 
      screenshots, 
      meta,
      timestamp: Date.now(),
      captureType: 'fullpage'
    });

    // Clear badge
    chrome.action.setBadgeText({ text: "", tabId: tab.id });

    // Open editor
    chrome.tabs.create({
      url: chrome.runtime.getURL("editor/editor.html")
    });

  } catch (error) {
    console.error("Screenshot capture failed:", error);
    chrome.action.setBadgeText({ text: "✗", tabId: tab.id });
    chrome.action.setBadgeBackgroundColor({ color: "#ea4335", tabId: tab. id });
    setTimeout(() => chrome.action.setBadgeText({ text: "" }), 2000);
    showNotification(`Capture failed: ${error.message}`, "error");
  }
}

// Visible area only capture
async function captureVisible(tab) {
  try {
    const dataUrl = await chrome.tabs.captureVisibleTab(null, { 
      format: "png",
      quality: 100
    });

    const [{ result: meta }] = await chrome.scripting.executeScript({
      target: { tabId:  tab.id },
      func: () => ({
        width: window.innerWidth,
        height: window.innerHeight,
        viewportWidth: window.innerWidth,
        viewportHeight: window. innerHeight,
        url: window.location.href,
        title: document.title
      })
    });

    await chrome.storage.local.set({ 
      screenshots: [dataUrl], 
      meta:  {
        ... meta,
        totalHeight: meta.height
      },
      timestamp: Date.now(),
      captureType: 'visible'
    });

    chrome.tabs.create({
      url: chrome.runtime.getURL("editor/editor. html")
    });

  } catch (error) {
    console.error("Visible capture failed:", error);
    showNotification(`Capture failed: ${error.message}`, "error");
  }
}

function showNotification(message, type = "info") {
  // You could implement chrome.notifications here
  console.log(`[${type.toUpperCase()}] ${message}`);
}