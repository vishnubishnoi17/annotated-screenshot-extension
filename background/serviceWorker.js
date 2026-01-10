chrome.runtime.onMessage.addListener(async (msg) => {
  if (msg.action !== "CAPTURE_FULL_PAGE") return;

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || tab.url.startsWith("chrome://")) return;

  const [{ result: meta }] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => ({
      width: document.documentElement.clientWidth,
      viewportHeight: window.innerHeight,
      totalHeight: document.documentElement.scrollHeight
    })
  });

  const screenshots = [];
  const delay = 1000;

  for (let y = 0; y < meta.totalHeight; y += meta.viewportHeight) {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: y => window.scrollTo(0, y),
      args: [y]
    });

    await new Promise(r => setTimeout(r, delay));
    const img = await chrome.tabs.captureVisibleTab();
    screenshots.push(img);
  }

  await chrome.storage.local.set({ screenshots, meta });

  chrome.tabs.create({
    url: chrome.runtime.getURL("editor/editor.html")
  });
});
