import { CAPTURE_TYPE } from '../utils/constants.js';
import { logger, safeCall } from '../utils/logger.js';
import { saveCapture } from '../storage/indexedDb.js';
import { cropDataUrl, stitchVerticalSegments } from './stitch.js';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

function isRestrictedUrl(url = '') {
  return ['chrome://', 'chrome-extension://', 'edge://', 'devtools://'].some((prefix) =>
    url.startsWith(prefix)
  );
}

async function getPageMeta(tabId) {
  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      const body = document.body;
      const html = document.documentElement;
      return {
        width: Math.max(body.scrollWidth, html.scrollWidth, html.clientWidth),
        height: Math.max(body.scrollHeight, html.scrollHeight, html.clientHeight),
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        scrollX: window.scrollX,
        scrollY: window.scrollY,
        title: document.title,
        url: location.href,
        devicePixelRatio: window.devicePixelRatio || 1
      };
    }
  });

  return result;
}

async function restoreScroll(tabId, scrollX, scrollY) {
  await chrome.scripting.executeScript({
    target: { tabId },
    func: (x, y) => window.scrollTo(x, y),
    args: [scrollX, scrollY]
  });
}

async function captureVisible(tab) {
  const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png', quality: 100 });
  const meta = await getPageMeta(tab.id);

  return {
    imageDataUrl: dataUrl,
    meta: {
      ...meta,
      captureType: CAPTURE_TYPE.VISIBLE,
      width: meta.viewportWidth,
      height: meta.viewportHeight
    }
  };
}

async function captureFullPage(tab, delayMs) {
  const meta = await getPageMeta(tab.id);
  const segments = [];

  chrome.action.setBadgeText({ tabId: tab.id, text: '...' });
  chrome.action.setBadgeBackgroundColor({ tabId: tab.id, color: '#4f46e5' });

  try {
    for (let y = 0; y < meta.height; y += meta.viewportHeight) {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (nextY) => window.scrollTo(0, nextY),
        args: [y]
      });

      await sleep(delayMs);
      const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png', quality: 100 });
      segments.push(dataUrl);

      const progress = Math.min(100, Math.round(((y + meta.viewportHeight) / meta.height) * 100));
      chrome.action.setBadgeText({ tabId: tab.id, text: `${progress}%` });
    }

    const stitched = await stitchVerticalSegments(
      segments,
      Math.round(meta.viewportWidth * meta.devicePixelRatio),
      Math.round(meta.height * meta.devicePixelRatio),
      Math.round(meta.viewportHeight * meta.devicePixelRatio)
    );

    return {
      imageDataUrl: stitched,
      meta: {
        ...meta,
        captureType: CAPTURE_TYPE.FULL_PAGE
      }
    };
  } finally {
    await restoreScroll(tab.id, meta.scrollX, meta.scrollY);
    chrome.action.setBadgeText({ tabId: tab.id, text: '' });
  }
}

async function captureRegion(tab, delayMs) {
  const response = await chrome.tabs.sendMessage(tab.id, { action: 'START_REGION_SELECTION' });
  if (!response?.ok || !response.rect) {
    throw new Error(response?.error || 'Region was not selected');
  }

  await sleep(Math.max(delayMs, 100));

  const visible = await chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png', quality: 100 });
  const cropped = await cropDataUrl(
    visible,
    response.rect,
    response.viewportWidth,
    response.viewportHeight
  );

  const meta = await getPageMeta(tab.id);
  return {
    imageDataUrl: cropped,
    meta: {
      ...meta,
      captureType: CAPTURE_TYPE.REGION,
      width: response.rect.width,
      height: response.rect.height,
      region: response.rect
    }
  };
}

export async function captureAndStore({ captureType, delayMs = 300 }) {
  return safeCall(`capture:${captureType}`, async () => {
    const tab = await getActiveTab();
    if (!tab || isRestrictedUrl(tab.url)) {
      throw new Error('Cannot capture internal browser pages');
    }

    let capture;
    if (captureType === CAPTURE_TYPE.FULL_PAGE) {
      capture = await captureFullPage(tab, delayMs);
    } else if (captureType === CAPTURE_TYPE.REGION) {
      capture = await captureRegion(tab, delayMs);
    } else {
      capture = await captureVisible(tab);
    }

    const saved = await saveCapture({
      type: captureType,
      url: tab.url,
      title: tab.title,
      imageDataUrl: capture.imageDataUrl,
      meta: capture.meta,
      annotations: []
    });

    await chrome.storage.local.set({ latestCaptureId: saved.id });
    logger.info('Capture stored', { id: saved.id, captureType });
    return saved;
  });
}
