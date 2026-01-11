// Elements
const captureFull = document.getElementById('capture-full');
const captureVisible = document.getElementById('capture-visible');
const statusDiv = document.getElementById('status');
const loadingOverlay = document.getElementById('loading');
const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress-text');

// Settings
const autoOpenCheck = document.getElementById('auto-open');
const playSoundCheck = document.getElementById('play-sound');
const captureDelaySelect = document.getElementById('capture-delay');

// Load settings
chrome.storage.sync.get(['autoOpen', 'playSound', 'captureDelay'], (result) => {
  autoOpenCheck.checked = result.autoOpen !== false;
  playSoundCheck.checked = result.playSound !== false;
  captureDelaySelect.value = result.captureDelay || '500';
});

// Save settings
autoOpenCheck.addEventListener('change', (e) => {
  chrome.storage.sync.set({ autoOpen: e.target.checked });
});

playSoundCheck.addEventListener('change', (e) => {
  chrome.storage.sync. set({ playSound: e.target.checked });
});

captureDelaySelect.addEventListener('change', (e) => {
  chrome.storage.sync.set({ captureDelay: e.target. value });
});

// Capture Full Page
captureFull.addEventListener('click', async () => {
  showLoading();
  
  chrome.runtime.sendMessage({ action: "CAPTURE_FULL_PAGE" });
  
  // Simulate progress (real progress would need messaging from background)
  simulateProgress();
  
  setTimeout(() => {
    window.close();
  }, 1000);
});

// Capture Visible
captureVisible.addEventListener('click', async () => {
  showStatus('Capturing visible area... ', 'info');
  
  chrome.runtime.sendMessage({ action: "CAPTURE_VISIBLE" });
  
  setTimeout(() => {
    window.close();
  }, 500);
});

// Help
document.getElementById('help').addEventListener('click', () => {
  chrome.tabs.create({ url: 'https://github.com/vishnubishnoi17/annotated-screenshot-extension' });
});

// Shortcuts
document.getElementById('shortcuts').addEventListener('click', () => {
  showShortcutsModal();
});

// Functions
function showLoading() {
  loadingOverlay.classList. remove('hidden');
}

function hideLoading() {
  loadingOverlay.classList. add('hidden');
}

function simulateProgress() {
  let progress = 0;
  const interval = setInterval(() => {
    progress += 10;
    progressFill.style.width = progress + '%';
    progressText.textContent = progress + '%';
    
    if (progress >= 100) {
      clearInterval(interval);
    }
  }, 100);
}

function showStatus(message, type = 'info') {
  statusDiv.textContent = message;
  statusDiv.className = `status ${type}`;
  
  setTimeout(() => {
    statusDiv. textContent = '';
    statusDiv. className = 'status';
  }, 3000);
}

function showShortcutsModal() {
  const shortcuts = `
    KEYBOARD SHORTCUTS:
    
    Capture Screenshot: Ctrl+Shift+S (Cmd+Shift+S on Mac)
    
    EDITOR: 
    Undo: Ctrl+Z (Cmd+Z)
    Redo: Ctrl+Y (Cmd+Y)
    Delete Selected:  Delete/Backspace
    Select Tool: 1-8 (number keys)
    Zoom In: Ctrl++ (Cmd++)
    Zoom Out: Ctrl+- (Cmd+-)
    Reset Zoom: Ctrl+0 (Cmd+0)
  `;
  alert(shortcuts);
}

// Listen for errors
chrome.runtime.onMessage. addListener((msg) => {
  if (msg. action === 'CAPTURE_ERROR') {
    hideLoading();
    showStatus(msg.error, 'error');
  }
});