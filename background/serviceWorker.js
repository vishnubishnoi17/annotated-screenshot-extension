import { captureAndStore } from '../capture/captureService.js';
import { MESSAGE, CAPTURE_TYPE } from '../utils/constants.js';
import { logger } from '../utils/logger.js';
import { listCaptures } from '../storage/indexedDb.js';

function openEditor(captureId) {
  chrome.tabs.create({
    url: chrome.runtime.getURL(`editor/editor.html?captureId=${encodeURIComponent(captureId)}`)
  });
}

async function runCapture(captureType, delayMs = 300) {
  const saved = await captureAndStore({ captureType, delayMs });
  openEditor(saved.id);
  return saved;
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({ id: 'capture-full', title: '📸 Capture Full Page', contexts: ['page'] });
  chrome.contextMenus.create({ id: 'capture-visible', title: '👁️ Capture Visible Area', contexts: ['page'] });
  chrome.contextMenus.create({ id: 'capture-region', title: '✂️ Capture Region', contexts: ['page'] });
});

chrome.contextMenus.onClicked.addListener(async (info) => {
  try {
    if (info.menuItemId === 'capture-full') await runCapture(CAPTURE_TYPE.FULL_PAGE, 350);
    if (info.menuItemId === 'capture-visible') await runCapture(CAPTURE_TYPE.VISIBLE, 100);
    if (info.menuItemId === 'capture-region') await runCapture(CAPTURE_TYPE.REGION, 100);
  } catch (error) {
    logger.error('Context capture failed', error);
  }
});

chrome.commands.onCommand.addListener(async (command) => {
  try {
    if (command === 'capture-screenshot') await runCapture(CAPTURE_TYPE.FULL_PAGE, 300);
    if (command === 'capture-region') await runCapture(CAPTURE_TYPE.REGION, 100);
  } catch (error) {
    logger.error('Shortcut capture failed', error);
  }
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.action === MESSAGE.CAPTURE) {
    runCapture(message.captureType || CAPTURE_TYPE.VISIBLE, Number(message.delayMs) || 300)
      .then((saved) => sendResponse({ ok: true, id: saved.id }))
      .catch((error) => sendResponse({ ok: false, error: error.message }));
    return true;
  }

  if (message?.action === MESSAGE.OPEN_EDITOR) {
    openEditor(message.captureId);
    sendResponse({ ok: true });
    return;
  }

  if (message?.action === MESSAGE.GET_HISTORY) {
    listCaptures(15)
      .then((captures) => sendResponse({ ok: true, captures }))
      .catch((error) => sendResponse({ ok: false, error: error.message }));
    return true;
  }
});
