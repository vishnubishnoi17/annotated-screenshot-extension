import { AnnotationEngine } from '../annotation/annotationEngine.js';
import { drawAnnotation, drawSelection } from '../annotation/renderer.js';
import { getCapture, listCaptures, updateCapture } from '../storage/indexedDb.js';
import { getAnnotationSuggestions } from '../ui/aiSuggestions.js';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const engine = new AnnotationEngine();

let baseImage = null;
let activeCapture = null;
let tool = 'select';
let color = '#ef4444';
let width = 3;

let pointer = { down: false, startX: 0, startY: 0 };
let draft = null;
let interaction = { mode: null, handle: null, startX: 0, startY: 0 };

const toastEl = document.getElementById('toast');
const textModal = document.getElementById('textModal');
const textInput = document.getElementById('textInput');
const textSize = document.getElementById('textSize');
let pendingTextPoint = null;

function toast(message) {
  toastEl.textContent = message;
  toastEl.classList.add('visible');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => toastEl.classList.remove('visible'), 1800);
}

function getCaptureIdFromUrl() {
  const url = new URL(location.href);
  return url.searchParams.get('captureId');
}

async function loadCapture(captureId) {
  const fallback = (await chrome.storage.local.get('latestCaptureId'))?.latestCaptureId;
  const id = captureId || fallback;

  if (!id) {
    toast('No capture found');
    return;
  }

  const capture = await getCapture(id);
  if (!capture) {
    toast('Capture not found in IndexedDB');
    return;
  }

  activeCapture = capture;
  engine.load(capture.annotations || []);

  const image = new Image();
  image.src = capture.imageDataUrl;
  await image.decode();
  baseImage = image;

  canvas.width = image.width;
  canvas.height = image.height;
  render();
  await renderHistoryList();
}

function render() {
  if (!baseImage) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(baseImage, 0, 0);

  const all = engine.getAll();
  all.forEach((item) => drawAnnotation(ctx, baseImage, item));

  if (draft) {
    drawAnnotation(ctx, baseImage, draft);
  }

  const selected = engine.getSelected();
  if (selected) {
    drawSelection(ctx, engine.getBounds(selected));
  }
}

async function persistAnnotations() {
  if (!activeCapture) return;
  const next = await updateCapture(activeCapture.id, { annotations: engine.getAll() });
  if (next) activeCapture = next;
}

function setTool(nextTool) {
  tool = nextTool;
  document.getElementById('activeToolLabel').textContent = nextTool;
  document.querySelectorAll('[data-tool]').forEach((el) => el.classList.toggle('active', el.dataset.tool === nextTool));
}

function toCanvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY
  };
}

function startDraft(startX, startY) {
  if (tool === 'arrow') {
    return { type: 'arrow', x1: startX, y1: startY, x2: startX, y2: startY, color, width };
  }
  if (tool === 'rectangle') {
    return { type: 'rectangle', x: startX, y: startY, w: 0, h: 0, color, width };
  }
  if (tool === 'ellipse') {
    return { type: 'ellipse', x: startX, y: startY, w: 0, h: 0, color, width };
  }
  if (tool === 'blur') {
    return { type: 'blur', x: startX, y: startY, w: 0, h: 0, color, width };
  }
  if (tool === 'highlight') {
    return { type: 'highlight', x: startX, y: startY, w: 0, h: 0, color: '#facc15', width };
  }
  return null;
}

function updateDraftShape(item, x, y) {
  if (!item) return;
  if (item.type === 'arrow') {
    item.x2 = x;
    item.y2 = y;
    return;
  }

  item.x = Math.min(pointer.startX, x);
  item.y = Math.min(pointer.startY, y);
  item.w = Math.abs(x - pointer.startX);
  item.h = Math.abs(y - pointer.startY);
}

function onPointerDown(event) {
  const point = toCanvasPoint(event);
  pointer = { down: true, startX: point.x, startY: point.y };

  if (tool === 'text') {
    pendingTextPoint = point;
    textModal.classList.remove('hidden');
    textInput.value = '';
    textInput.focus();
    return;
  }

  if (tool === 'select') {
    const resizeHandle = engine.getResizeHandle(point.x, point.y);
    if (resizeHandle) {
      interaction = { mode: 'resize', handle: resizeHandle, startX: point.x, startY: point.y };
      return;
    }

    const target = engine.hitTest(point.x, point.y);
    if (target) {
      engine.setSelected(target.id);
      interaction = { mode: 'move', handle: null, startX: point.x, startY: point.y };
    } else {
      engine.clearSelection();
      interaction = { mode: null, handle: null, startX: 0, startY: 0 };
    }

    render();
    return;
  }

  draft = startDraft(point.x, point.y);
}

function onPointerMove(event) {
  if (!pointer.down) return;

  const point = toCanvasPoint(event);
  if (tool === 'select' && interaction.mode) {
    const dx = point.x - interaction.startX;
    const dy = point.y - interaction.startY;

    if (interaction.mode === 'move') {
      engine.moveSelected(dx, dy);
    }

    if (interaction.mode === 'resize') {
      engine.resizeSelected(interaction.handle, dx, dy);
    }

    interaction.startX = point.x;
    interaction.startY = point.y;
    render();
    return;
  }

  updateDraftShape(draft, point.x, point.y);
  render();
}

async function onPointerUp(event) {
  if (!pointer.down) return;
  pointer.down = false;

  if (tool === 'select') {
    interaction = { mode: null, handle: null, startX: 0, startY: 0 };
    await persistAnnotations();
    return;
  }

  if (!draft) return;

  const point = toCanvasPoint(event);
  updateDraftShape(draft, point.x, point.y);

  const isTiny = draft.type !== 'arrow' && (draft.w < 4 || draft.h < 4);
  if (!isTiny) {
    engine.add(draft);
    await persistAnnotations();
  }

  draft = null;
  render();
}

async function exportCanvas(includeAnnotations = true, imageFormat = 'png') {
  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = canvas.width;
  exportCanvas.height = canvas.height;
  const exportCtx = exportCanvas.getContext('2d');

  exportCtx.drawImage(baseImage, 0, 0);
  if (includeAnnotations) {
    engine.getAll().forEach((item) => drawAnnotation(exportCtx, baseImage, item));
  }

  const mime = imageFormat === 'jpeg' ? 'image/jpeg' : 'image/png';
  const blob = await new Promise((resolve) => exportCanvas.toBlob(resolve, mime, 0.95));
  return { blob, mime };
}

async function downloadImage() {
  const include = document.getElementById('includeAnnotations').checked;
  const format = document.getElementById('imageFormat').value;
  const { blob } = await exportCanvas(include, format);

  if (!blob) {
    toast('Export failed');
    return;
  }

  const url = URL.createObjectURL(blob);
  const ext = format === 'jpeg' ? 'jpg' : 'png';

  await chrome.downloads.download({
    url,
    filename: `screenshot-v2-${Date.now()}.${ext}`,
    saveAs: true
  });

  URL.revokeObjectURL(url);
  toast('Downloaded');
}

async function copyToClipboard() {
  const include = document.getElementById('includeAnnotations').checked;
  const { blob } = await exportCanvas(include, 'png');
  await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
  toast('Copied to clipboard');
}

async function exportPdf() {
  const include = document.getElementById('includeAnnotations').checked;
  const { blob } = await exportCanvas(include, 'png');

  if (!window.jspdf?.jsPDF) {
    toast('jsPDF unavailable');
    return;
  }

  const dataUrl = await new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({
    orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
    unit: 'px',
    format: [canvas.width, canvas.height]
  });

  pdf.addImage(dataUrl, 'PNG', 0, 0, canvas.width, canvas.height);
  pdf.save(`screenshot-v2-${Date.now()}.pdf`);
  toast('PDF exported');
}

async function runOcr() {
  toast('Loading OCR...');

  if (!window.Tesseract) {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  const { blob } = await exportCanvas(false, 'png');
  const result = await window.Tesseract.recognize(blob, 'eng');
  const text = result?.data?.text?.trim();
  if (!text) {
    toast('No OCR text found');
    return;
  }

  await navigator.clipboard.writeText(text);
  toast('OCR text copied to clipboard');
}

async function runAiSuggestions() {
  const suggestions = await getAnnotationSuggestions({
    title: activeCapture?.title,
    meta: activeCapture?.meta,
    annotationCount: engine.getAll().length
  });
  alert(`AI suggestions:\n\n${suggestions.map((s) => `• ${s}`).join('\n')}`);
}

function setupToolbar() {
  document.querySelectorAll('[data-tool]').forEach((button) => {
    button.addEventListener('click', () => setTool(button.dataset.tool));
  });

  document.getElementById('color').addEventListener('input', (e) => {
    color = e.target.value;
  });

  document.getElementById('width').addEventListener('input', (e) => {
    width = Number(e.target.value) || 3;
  });

  document.getElementById('undo').addEventListener('click', async () => {
    if (engine.undo()) {
      render();
      await persistAnnotations();
    }
  });

  document.getElementById('redo').addEventListener('click', async () => {
    if (engine.redo()) {
      render();
      await persistAnnotations();
    }
  });

  document.getElementById('deleteSelected').addEventListener('click', async () => {
    const selected = engine.getSelected();
    if (!selected) return;
    const next = engine.getAll().filter((item) => item.id !== selected.id);
    engine.replaceAll(next);
    engine.clearSelection();
    render();
    await persistAnnotations();
  });

  document.getElementById('download').addEventListener('click', downloadImage);
  document.getElementById('copy').addEventListener('click', copyToClipboard);
  document.getElementById('pdf').addEventListener('click', exportPdf);
  document.getElementById('ocr').addEventListener('click', () => runOcr().catch((error) => toast(error.message)));
  document.getElementById('aiSuggest').addEventListener('click', runAiSuggestions);
}

function setupKeyboard() {
  document.addEventListener('keydown', async (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
      event.preventDefault();
      if (event.shiftKey) {
        if (engine.redo()) {
          render();
          await persistAnnotations();
        }
      } else if (engine.undo()) {
        render();
        await persistAnnotations();
      }
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'y') {
      event.preventDefault();
      if (engine.redo()) {
        render();
        await persistAnnotations();
      }
    }

    const map = { v: 'select', a: 'arrow', r: 'rectangle', e: 'ellipse', t: 'text', b: 'blur', h: 'highlight' };
    if (!event.ctrlKey && !event.metaKey && map[event.key.toLowerCase()]) {
      setTool(map[event.key.toLowerCase()]);
    }

    if (event.key === 'Delete' || event.key === 'Backspace') {
      const selected = engine.getSelected();
      if (!selected) return;
      const next = engine.getAll().filter((item) => item.id !== selected.id);
      engine.replaceAll(next);
      engine.clearSelection();
      render();
      await persistAnnotations();
    }
  });
}

function setupTextModal() {
  document.getElementById('textCancel').addEventListener('click', () => {
    textModal.classList.add('hidden');
    pendingTextPoint = null;
  });

  document.getElementById('textApply').addEventListener('click', async () => {
    if (!pendingTextPoint) return;
    const value = textInput.value.trim();
    if (!value) return;

    engine.add({
      type: 'text',
      x: pendingTextPoint.x,
      y: pendingTextPoint.y,
      text: value,
      color,
      size: Number(textSize.value) || 20,
      bold: false,
      italic: false
    });

    textModal.classList.add('hidden');
    pendingTextPoint = null;
    render();
    await persistAnnotations();
  });
}

async function renderHistoryList() {
  const history = await listCaptures(30);
  const list = document.getElementById('historyList');
  list.innerHTML = '';

  history.forEach((item) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <img src="${item.imageDataUrl}" alt="capture" />
      <div>
        <div><strong>${item.meta?.captureType || item.type}</strong></div>
        <div style="font-size:11px;color:#94a3b8">${new Date(item.createdAt).toLocaleString()}</div>
      </div>
    `;

    li.addEventListener('click', () => {
      const url = new URL(location.href);
      url.searchParams.set('captureId', item.id);
      history.replaceState({}, '', url);
      loadCapture(item.id);
    });

    list.appendChild(li);
  });
}

function setupCanvasEvents() {
  canvas.addEventListener('mousedown', onPointerDown);
  window.addEventListener('mousemove', onPointerMove);
  window.addEventListener('mouseup', onPointerUp);
}

(async function init() {
  setupToolbar();
  setupKeyboard();
  setupTextModal();
  setupCanvasEvents();
  await loadCapture(getCaptureIdFromUrl());
})();
