import { MESSAGE } from '../utils/constants.js';

const historyList = document.getElementById('history');
const status = document.getElementById('status');

const showStatus = (text, error = false) => {
  status.textContent = text;
  status.style.color = error ? '#dc2626' : '#1d4ed8';
};

async function capture(captureType) {
  const delayMs = Number(document.getElementById('delayMs').value) || 0;
  showStatus('Capturing...');

  const response = await chrome.runtime.sendMessage({
    action: MESSAGE.CAPTURE,
    captureType,
    delayMs
  });

  if (!response?.ok) {
    showStatus(response?.error || 'Capture failed', true);
    return;
  }

  showStatus('Capture complete. Editor opened.');
  setTimeout(() => window.close(), 350);
}

function historyItemTemplate(item) {
  const li = document.createElement('li');
  li.className = 'history-item';
  li.innerHTML = `
    <img alt="capture preview" src="${item.imageDataUrl}" />
    <div>
      <div><strong>${item.meta?.captureType || item.type || 'capture'}</strong></div>
      <div style="font-size:11px;color:#64748b">${new Date(item.createdAt).toLocaleString()}</div>
    </div>
  `;

  li.addEventListener('click', async () => {
    await chrome.runtime.sendMessage({ action: MESSAGE.OPEN_EDITOR, captureId: item.id });
    window.close();
  });

  return li;
}

async function loadHistory() {
  const response = await chrome.runtime.sendMessage({ action: MESSAGE.GET_HISTORY });
  if (!response?.ok) {
    showStatus('Failed to load history', true);
    return;
  }

  historyList.innerHTML = '';
  response.captures.forEach((item) => historyList.appendChild(historyItemTemplate(item)));
}

document.querySelectorAll('[data-capture]').forEach((button) => {
  button.addEventListener('click', () => capture(button.dataset.capture));
});

loadHistory();
