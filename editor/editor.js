/* ========================================
   CANVAS & GLOBAL STATE
======================================== */

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let tool = "select";
let currentColor = "#ff0000";
let lineWidth = 3;
let stepCount = 1;
let zoom = 1;

let baseImage = null;
let history = [];
let historyIndex = -1;

let startX = 0;
let startY = 0;
let isDrawing = false;
let currentPath = [];

let textPosition = null;
let cropState = {
  active: false,
  startX:  0,
  startY:  0,
  endX: 0,
  endY: 0,
  isDragging: false
};

/* ========================================
   INITIALIZATION
======================================== */

document.addEventListener('DOMContentLoaded',init);

async function init() {
  setupToolbar();
  setupCanvas();
  setupKeyboardShortcuts();
  await loadScreenshot();
}

/* ========================================
   TOOLBAR SETUP
======================================== */

function setupToolbar() {
  // Tool selection
  document.querySelectorAll("[data-tool]").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-tool]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      tool = btn.dataset.tool;
      updateCursor();
    });
  });

  // Color picker
  const colorPicker = document.getElementById("color-picker");
  colorPicker.addEventListener("change", (e) => {
    currentColor = e.target.value;
  });

  // Color presets
  document.querySelectorAll(".color-preset").forEach(btn => {
    btn.addEventListener("click", () => {
      currentColor = btn.dataset.color;
      colorPicker.value = currentColor;
    });
  });

  // Line width
  const lineWidthInput = document.getElementById("line-width");
  const widthValue = document.getElementById("width-value");
  lineWidthInput.addEventListener("input", (e) => {
    lineWidth = parseInt(e.target.value);
    widthValue.textContent = lineWidth;
  });

  // History
  document.getElementById("undo").addEventListener("click", undo);
  document.getElementById("redo").addEventListener("click", redo);
  document.getElementById("clear").addEventListener("click", clearAll);

  // Zoom
  document.getElementById("zoom-in").addEventListener("click", () => changeZoom(0.1));
  document.getElementById("zoom-out").addEventListener("click", () => changeZoom(-0.1));
  document.getElementById("zoom-reset").addEventListener("click", resetZoom);

  // Export
  document.getElementById("png").addEventListener("click", exportPNG);
  document.getElementById("pdf").addEventListener("click", exportPDF);
  document.getElementById("clip").addEventListener("click", copyToClipboard);
}

/* ========================================
   CANVAS SETUP
======================================== */

function setupCanvas() {
  canvas.addEventListener("mousedown", handleMouseDown);
  canvas.addEventListener("mousemove", handleMouseMove);
  canvas.addEventListener("mouseup", handleMouseUp);
  canvas.addEventListener("wheel", handleWheel, { passive: false });
}

function updateCursor() {
  canvas.className = '';
  if (tool === "select") canvas.classList.add("select-mode");
  if (tool === "text") canvas.classList.add("text-mode");
  if (tool === "crop") canvas.classList.add("crop-mode"); // ADD THIS LINE
}

/* ========================================
   GET MOUSE COORDINATES - FIXED
======================================== */

function getMousePos(e) {
  const rect = canvas.getBoundingClientRect();
  
  // Account for canvas scale (CSS vs actual size)
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect. height;
  
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY
  };
}

/* ========================================
   LOAD SCREENSHOT
======================================== */

async function loadScreenshot() {
  try {
    const { screenshots, meta } = await chrome.storage.local.get(["screenshots", "meta"]);
    
    if (! screenshots || !meta) {
      showToast("No screenshot data found", "error");
      return;
    }

    canvas.width = meta.width || meta.viewportWidth;
    canvas.height = meta.height || meta.totalHeight || meta.viewportHeight;

    baseImage = new Image();
    baseImage.src = await stitchScreenshots(screenshots, meta);
    await baseImage.decode();

    redraw();
    showToast(`Screenshot loaded:  ${canvas.width}×${canvas.height}px`, "success");
  } catch (error) {
    console.error("Failed to load screenshot:", error);
    showToast("Failed to load screenshot", "error");
  }
}

async function stitchScreenshots(images, meta) {
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = meta.width || meta.viewportWidth;
  tempCanvas.height = meta.height || meta.totalHeight || meta.viewportHeight;
  const tempCtx = tempCanvas.getContext("2d");

  let y = 0;
  for (const src of images) {
    const img = new Image();
    img.src = src;
    await img.decode();
    tempCtx.drawImage(img, 0, y);
    y += meta.viewportHeight;
  }

  return tempCanvas.toDataURL("image/png");
}

/* ========================================
   MOUSE EVENTS - FIXED
======================================== */

function handleMouseDown(e) {
  const pos = getMousePos(e);
  startX = pos.x;
  startY = pos.y;

  if (tool === "crop") {
    cropState.active = true;
    cropState.isDragging = true;
    cropState.startX = startX;
    cropState.startY = startY;
    cropState.endX = startX;
    cropState.endY = startY;
    return;
  }

  if (tool === "text") {
    showTextModal(startX, startY);
    return;
  }

  if (tool === "draw" || tool === "highlight") {
    isDrawing = true;
    currentPath = [{ x: startX, y: startY }];
  }
}

function handleMouseMove(e) {
  if (cropState.isDragging && tool === "crop") {
    const pos = getMousePos(e);
    cropState.endX = pos.x;
    cropState.endY = pos.y;
    redraw();
    drawCropPreview();
    return;
  }

  if (! isDrawing) return;

  const pos = getMousePos(e);

  if (tool === "draw" || tool === "highlight") {
    currentPath.push({ x: pos.x, y: pos.y });
    redraw();
    
    // Preview current path
    if (tool === "draw") {
      drawPath({ path: currentPath, color: currentColor, width: lineWidth });
    } else {
      drawHighlight({ path: currentPath, color: currentColor, width: lineWidth * 3 });
    }
  }
}

function handleMouseUp(e) {
  if (tool === "crop" && cropState.isDragging) {
    cropState.isDragging = false;
    const pos = getMousePos(e);
    cropState.endX = pos.x;
    cropState.endY = pos.y;
    
    // Only show controls if area is meaningful (at least 10px)
    const width = Math.abs(cropState. endX - cropState.startX);
    const height = Math. abs(cropState.endY - cropState.startY);
    
    if (width > 10 && height > 10) {
      showCropControls();
    } else {
      cancelCrop();
    }
    return;
  }
  if (!isDrawing && tool === "select") return;

  const pos = getMousePos(e);
  const endX = pos.x;
  const endY = pos.y;

  let layer = null;

  // Create layer based on tool
  switch (tool) {
    case "arrow":
      layer = { type: "arrow", x1: startX, y1: startY, x2: endX, y2: endY, color: currentColor, width: lineWidth };
      break;
    case "line":
      layer = { type:  "line", x1: startX, y1: startY, x2: endX, y2: endY, color: currentColor, width: lineWidth };
      break;
    case "rectangle": 
      layer = { 
        type: "rectangle", 
        x:  Math.min(startX, endX), 
        y: Math.min(startY, endY), 
        w: Math.abs(endX - startX), 
        h: Math.abs(endY - startY),
        color: currentColor,
        width: lineWidth
      };
      break;
    case "circle":
      const radius = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
      layer = { type: "circle", x: startX, y: startY, radius, color: currentColor, width: lineWidth };
      break;
    case "step":
      layer = { type:  "step", x: endX, y: endY, n: stepCount++, color: currentColor };
      break;
    case "blur":
      layer = {
        type: "blur",
        x: Math.min(startX, endX),
        y: Math.min(startY, endY),
        w: Math.abs(endX - startX),
        h: Math.abs(endY - startY)
      };
      break;
    case "draw":
      if (currentPath.length > 1) {
        layer = { type: "draw", path: [... currentPath], color: currentColor, width: lineWidth };
      }
      break;
    case "highlight":
      if (currentPath.length > 1) {
        layer = { type: "highlight", path: [...currentPath], color: currentColor, width: lineWidth * 3 };
      }
      break;
  }

  if (layer) {
    commit(layer);
  }

  isDrawing = false;
  currentPath = [];
}

function handleWheel(e) {
  if (e.ctrlKey) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    changeZoom(delta);
  }
}

/* ========================================
   HISTORY MANAGEMENT
======================================== */

function commit(layer) {
  history = history.slice(0, historyIndex + 1);
  history.push(layer);
  historyIndex++;
  redraw();
  updateHistoryButtons();
}

function undo() {
  if (historyIndex >= 0) {
    historyIndex--;
    redraw();
    updateHistoryButtons();
    showToast("Undo", "info");
  }
}

function redo() {
  if (historyIndex < history.length - 1) {
    historyIndex++;
    redraw();
    updateHistoryButtons();
    showToast("Redo", "info");
  }
}

function clearAll() {
  if (confirm("Clear all annotations?")) {
    history = [];
    historyIndex = -1;
    stepCount = 1;
    redraw();
    updateHistoryButtons();
    showToast("All annotations cleared", "info");
  }
}

function updateHistoryButtons() {
  document.getElementById("undo").disabled = historyIndex < 0;
  document.getElementById("redo").disabled = historyIndex >= history.length - 1;
}

/* ========================================
   RENDERING
======================================== */

function redraw() {
  if (!baseImage) return;

  ctx.save();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(baseImage, 0, 0);

  for (let i = 0; i <= historyIndex; i++) {
    drawLayer(history[i]);
  }
  
  ctx.restore();
}

function drawLayer(layer) {
  if (!layer) return;

  switch (layer.type) {
    case "arrow":  drawArrow(layer); break;
    case "line": drawLine(layer); break;
    case "rectangle": drawRectangle(layer); break;
    case "circle": drawCircle(layer); break;
    case "text": drawText(layer); break;
    case "draw": drawPath(layer); break;
    case "highlight": drawHighlight(layer); break;
    case "step": drawStep(layer); break;
    case "blur": drawBlur(layer); break;
  }
}

/* ========================================
   DRAWING FUNCTIONS
======================================== */


/* ========================================
   CROP TOOL FUNCTIONS
======================================== */

function drawCropPreview() {
  if (! cropState.active) return;
  
  const x = Math.min(cropState.startX, cropState.endX);
  const y = Math.min(cropState.startY, cropState.endY);
  const w = Math.abs(cropState. endX - cropState.startX);
  const h = Math.abs(cropState.endY - cropState.startY);
  
  // Draw darkened overlay outside crop area
  ctx.save();
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  
  // Top
  ctx.fillRect(0, 0, canvas.width, y);
  // Bottom
  ctx.fillRect(0, y + h, canvas.width, canvas.height - (y + h));
  // Left
  ctx.fillRect(0, y, x, h);
  // Right
  ctx.fillRect(x + w, y, canvas.width - (x + w), h);
  
  // Draw crop selection border
  ctx.strokeStyle = "#00ff00";
  ctx. lineWidth = 2;
  ctx.setLineDash([5, 5]);
  ctx.strokeRect(x, y, w, h);
  ctx.setLineDash([]);
  
  // Draw corner handles
  const handleSize = 10;
  ctx.fillStyle = "#00ff00";
  
  // Top-left
  ctx.fillRect(x - handleSize/2, y - handleSize/2, handleSize, handleSize);
  // Top-right
  ctx.fillRect(x + w - handleSize/2, y - handleSize/2, handleSize, handleSize);
  // Bottom-left
  ctx.fillRect(x - handleSize/2, y + h - handleSize/2, handleSize, handleSize);
  // Bottom-right
  ctx.fillRect(x + w - handleSize/2, y + h - handleSize/2, handleSize, handleSize);
  
  // Show dimensions
  ctx.fillStyle = "#00ff00";
  ctx.font = "bold 14px Arial";
  ctx.textAlign = "center";
  ctx.fillText(`${Math.round(w)} × ${Math.round(h)}`, x + w/2, y - 10);
  
  ctx.restore();
}

function showCropControls() {
  // Remove existing controls if any
  const existing = document.getElementById("crop-controls");
  if (existing) existing.remove();
  
  const controls = document.createElement("div");
  controls.id = "crop-controls";
  controls.className = "crop-controls";
  controls.innerHTML = `
    <button class="apply-crop">✓ Apply Crop</button>
    <button class="cancel-crop">✕ Cancel</button>
  `;
  
  document.body.appendChild(controls);
  
  controls.querySelector(".apply-crop").addEventListener("click", applyCrop);
  controls.querySelector(".cancel-crop").addEventListener("click", cancelCrop);
}

function applyCrop() {
  const x = Math.min(cropState.startX, cropState. endX);
  const y = Math.min(cropState.startY, cropState.endY);
  const w = Math.abs(cropState.endX - cropState.startX);
  const h = Math.abs(cropState.endY - cropState.startY);
  
  // Create new cropped image
  const croppedCanvas = document.createElement("canvas");
  croppedCanvas.width = w;
  croppedCanvas. height = h;
  const croppedCtx = croppedCanvas.getContext("2d");
  
  // Draw base image cropped
  croppedCtx.drawImage(baseImage, x, y, w, h, 0, 0, w, h);
  
  // Update base image
  baseImage = new Image();
  baseImage.src = croppedCanvas.toDataURL();
  baseImage.onload = () => {
    // Resize canvas
    canvas.width = w;
    canvas.height = h;
    
    // Adjust all existing annotations
    adjustAnnotationsAfterCrop(x, y);
    
    // Reset crop state
    resetCropState();
    
    // Redraw everything
    redraw();
    
    showToast("✅ Image cropped successfully", "success");
  };
  
  // Remove controls
  const controls = document.getElementById("crop-controls");
  if (controls) controls.remove();
}

function adjustAnnotationsAfterCrop(offsetX, offsetY) {
  // Adjust all annotation coordinates relative to new crop
  for (let i = 0; i < history.length; i++) {
    const layer = history[i];
    if (! layer) continue;
    
    switch (layer.type) {
      case "arrow":
      case "line":
        layer. x1 -= offsetX;
        layer.y1 -= offsetY;
        layer.x2 -= offsetX;
        layer.y2 -= offsetY;
        break;
      case "rectangle":
      case "blur":
        layer.x -= offsetX;
        layer.y -= offsetY;
        break;
      case "circle":
      case "step":
      case "text":
        layer. x -= offsetX;
        layer.y -= offsetY;
        break;
      case "draw":
      case "highlight":
        if (layer.path) {
          layer.path = layer.path.map(p => ({
            x: p.x - offsetX,
            y: p.y - offsetY
          }));
        }
        break;
    }
  }
  
  // Remove annotations that are completely outside the crop area
  history = history.filter((layer, index) => {
    if (index > historyIndex) return true;
    return isLayerVisible(layer, canvas.width, canvas.height);
  });
  
  historyIndex = Math.min(historyIndex, history.length - 1);
}

function isLayerVisible(layer, width, height) {
  // Simple visibility check - can be enhanced
  switch (layer.type) {
    case "arrow":
    case "line":
      return (layer.x1 >= 0 && layer.x1 <= width) || 
             (layer.x2 >= 0 && layer. x2 <= width);
    case "rectangle":
    case "blur":
      return layer.x < width && layer.y < height && 
             (layer.x + layer.w) > 0 && (layer. y + layer.h) > 0;
    default:
      return true; // Keep by default
  }
}

function cancelCrop() {
  resetCropState();
  redraw();
  
  const controls = document.getElementById("crop-controls");
  if (controls) controls.remove();
  
  showToast("Crop cancelled", "info");
}

function resetCropState() {
  cropState = {
    active: false,
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
    isDragging: false
  };
}

function drawArrow({ x1, y1, x2, y2, color, width }) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const headLength = 15 + width * 2;

  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";

  // Line
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  // Arrowhead
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(
    x2 - headLength * Math.cos(angle - Math.PI / 6),
    y2 - headLength * Math.sin(angle - Math.PI / 6)
  );
  ctx.lineTo(
    x2 - headLength * Math.cos(angle + Math.PI / 6),
    y2 - headLength * Math.sin(angle + Math.PI / 6)
  );
  ctx.closePath();
  ctx.fill();
}

function drawLine({ x1, y1, x2, y2, color, width }) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function drawRectangle({ x, y, w, h, color, width }) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineJoin = "round";

  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.stroke();
}

function drawCircle({ x, y, radius, color, width }) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;

  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.stroke();
}

function drawText({ x, y, text, color, size, bold, italic }) {
  ctx.fillStyle = color;
  let font = "";
  if (italic) font += "italic ";
  if (bold) font += "bold ";
  font += `${size}px Arial`;
  ctx.font = font;
  ctx.textBaseline = "top";
  
  // Text with background
  const metrics = ctx.measureText(text);
  const textHeight = size;
  
  ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
  ctx.fillRect(x - 4, y - 4, metrics. width + 8, textHeight + 8);
  
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

function drawPath({ path, color, width }) {
  if (path.length < 2) return;

  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  ctx.beginPath();
  ctx.moveTo(path[0].x, path[0].y);

  for (let i = 1; i < path.length; i++) {
    ctx.lineTo(path[i].x, path[i].y);
  }

  ctx.stroke();
}

function drawHighlight({ path, color, width }) {
  if (path.length < 2) return;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.globalAlpha = 0.3;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  ctx.beginPath();
  ctx.moveTo(path[0].x, path[0].y);

  for (let i = 1; i < path.length; i++) {
    ctx.lineTo(path[i].x, path[i].y);
  }

  ctx.stroke();
  ctx.restore();
}

function drawStep({ x, y, n, color }) {
  const radius = 18;
  
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math. PI * 2);
  ctx.fill();

  ctx.fillStyle = "white";
  ctx.font = "bold 16px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(n, x, y);
}

function drawBlur({ x, y, w, h }) {
  ctx.save();
  ctx.filter = "blur(10px)";
  ctx.drawImage(baseImage, x, y, w, h, x, y, w, h);
  ctx.filter = "none";
  
  // Border
  ctx.strokeStyle = "rgba(255, 0, 0, 0.5)";
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  ctx.strokeRect(x, y, w, h);
  ctx.setLineDash([]);
  ctx.restore();
}

/* ========================================
   ZOOM CONTROLS
======================================== */

function changeZoom(delta) {
  zoom = Math.max(0.5, Math.min(3, zoom + delta));
  canvas.style.transform = `scale(${zoom})`;
  document.getElementById("zoom-level").textContent = `${Math.round(zoom * 100)}%`;
  showToast(`Zoom:  ${Math.round(zoom * 100)}%`, "info");
}

function resetZoom() {
  zoom = 1;
  canvas.style.transform = `scale(1)`;
  document.getElementById("zoom-level").textContent = "100%";
}

/* ========================================
   TEXT MODAL
======================================== */

function showTextModal(x, y) {
  textPosition = { x, y };
  const modal = document.getElementById("text-modal");
  const textInput = document.getElementById("text-input");
  
  modal.classList.remove("hidden");
  textInput.value = "";
  textInput.focus();
}

document.getElementById("text-cancel").addEventListener("click", () => {
  document.getElementById("text-modal").classList.add("hidden");
  textPosition = null;
});

document.getElementById("text-ok").addEventListener("click", () => {
  const text = document.getElementById("text-input").value.trim();
  if (!text) return;
  
  const fontSize = parseInt(document.getElementById("font-size").value);
  const bold = document.getElementById("text-bold").checked;
  const italic = document.getElementById("text-italic").checked;
  
  const layer = {
    type: "text",
    x: textPosition. x,
    y: textPosition.y,
    text,
    color: currentColor,
    size:  fontSize,
    bold,
    italic
  };
  
  commit(layer);
  document.getElementById("text-modal").classList.add("hidden");
  textPosition = null;
});

// Enter key to submit
document.getElementById("text-input").addEventListener("keypress", (e) => {
  if (e. key === "Enter") {
    document.getElementById("text-ok").click();
  }
});

/* ========================================
   KEYBOARD SHORTCUTS
======================================== */

function setupKeyboardShortcuts() {
  document.addEventListener("keydown", (e) => {
    // Don't trigger shortcuts when typing in text input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      return;
    }

    // Undo/Redo
    if ((e.ctrlKey || e.metaKey) && e.key === "z") {
      e.preventDefault();
      undo();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === "y") {
      e.preventDefault();
      redo();
    }
    
    // Zoom
    if ((e.ctrlKey || e.metaKey) && e.key === "=") {
      e.preventDefault();
      changeZoom(0.1);
    }
    if ((e. ctrlKey || e.metaKey) && e.key === "-") {
      e.preventDefault();
      changeZoom(-0.1);
    }
    if ((e.ctrlKey || e.metaKey) && e.key === "0") {
      e.preventDefault();
      resetZoom();
    }
    
    // Tool shortcuts
    const toolMap = {
      'v': 'select',
      'a': 'arrow',
      'l': 'line',
      'r': 'rectangle',
      'c': 'circle',
      't': 'text',
      'd': 'draw',
      'h': 'highlight',
      'n': 'step',
      'b': 'blur'
    };
    
    if (toolMap[e.key.toLowerCase()] && !e.ctrlKey && !e.metaKey) {
      const toolName = toolMap[e.key.toLowerCase()];
      const toolBtn = document.querySelector(`[data-tool="${toolName}"]`);
      if (toolBtn) toolBtn.click();
    }
  });
}

/* ========================================
   EXPORT FUNCTIONS - FIXED
======================================== */

function createExportCanvas() {
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = canvas.width;
  exportCanvas. height = canvas.height;
  const exportCtx = exportCanvas.getContext("2d");
  
  // Draw base image
  exportCtx.drawImage(baseImage, 0, 0);
  
  // Save current context state
  const savedCtx = ctx;
  
  // Temporarily use export context to draw all layers
  window.tempCtx = exportCtx;
  
  // Draw all annotations using the same functions
  for (let i = 0; i <= historyIndex; i++) {
    const layer = history[i];
    if (! layer) continue;
    
    // Draw each layer on export canvas
    exportCtx.save();
    
    switch (layer.type) {
      case "arrow": 
        drawArrowOnContext(exportCtx, layer);
        break;
      case "line": 
        drawLineOnContext(exportCtx, layer);
        break;
      case "rectangle":
        drawRectangleOnContext(exportCtx, layer);
        break;
      case "circle":
        drawCircleOnContext(exportCtx, layer);
        break;
      case "text":
        drawTextOnContext(exportCtx, layer);
        break;
      case "draw":
        drawPathOnContext(exportCtx, layer);
        break;
      case "highlight":
        drawHighlightOnContext(exportCtx, layer);
        break;
      case "step":
        drawStepOnContext(exportCtx, layer);
        break;
      case "blur":
        drawBlurOnContext(exportCtx, baseImage, layer);
        break;
    }
    
    exportCtx.restore();
  }
  
  return exportCanvas;
}

// Drawing functions for export context
function drawArrowOnContext(context, { x1, y1, x2, y2, color, width }) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const headLength = 15 + width * 2;

  context.strokeStyle = color;
  context.fillStyle = color;
  context.lineWidth = width;
  context.lineCap = "round";

  context.beginPath();
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.stroke();

  context.beginPath();
  context.moveTo(x2, y2);
  context.lineTo(
    x2 - headLength * Math.cos(angle - Math. PI / 6),
    y2 - headLength * Math.sin(angle - Math.PI / 6)
  );
  context.lineTo(
    x2 - headLength * Math.cos(angle + Math.PI / 6),
    y2 - headLength * Math.sin(angle + Math.PI / 6)
  );
  context.closePath();
  context.fill();
}

function drawLineOnContext(context, { x1, y1, x2, y2, color, width }) {
  context.strokeStyle = color;
  context.lineWidth = width;
  context.lineCap = "round";

  context.beginPath();
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.stroke();
}

function drawRectangleOnContext(context, { x, y, w, h, color, width }) {
  context.strokeStyle = color;
  context.lineWidth = width;
  context.lineJoin = "round";

  context.beginPath();
  context.rect(x, y, w, h);
  context.stroke();
}

function drawCircleOnContext(context, { x, y, radius, color, width }) {
  context.strokeStyle = color;
  context.lineWidth = width;

  context. beginPath();
  context.arc(x, y, radius, 0, Math.PI * 2);
  context.stroke();
}

function drawTextOnContext(context, { x, y, text, color, size, bold, italic }) {
  context.fillStyle = color;
  let font = "";
  if (italic) font += "italic ";
  if (bold) font += "bold ";
  font += `${size}px Arial`;
  context.font = font;
  context.textBaseline = "top";
  
  const metrics = context.measureText(text);
  const textHeight = size;
  
  context.fillStyle = "rgba(255, 255, 255, 0.8)";
  context.fillRect(x - 4, y - 4, metrics.width + 8, textHeight + 8);
  
  context.fillStyle = color;
  context.fillText(text, x, y);
}

function drawPathOnContext(context, { path, color, width }) {
  if (path.length < 2) return;

  context.strokeStyle = color;
  context.lineWidth = width;
  context.lineJoin = "round";
  context.lineCap = "round";

  context.beginPath();
  context.moveTo(path[0].x, path[0].y);

  for (let i = 1; i < path.length; i++) {
    context.lineTo(path[i].x, path[i].y);
  }

  context.stroke();
}

function drawHighlightOnContext(context, { path, color, width }) {
  if (path.length < 2) return;

  context.strokeStyle = color;
  context.lineWidth = width;
  context.globalAlpha = 0.3;
  context.lineJoin = "round";
  context.lineCap = "round";

  context.beginPath();
  context.moveTo(path[0].x, path[0]. y);

  for (let i = 1; i < path. length; i++) {
    context.lineTo(path[i]. x, path[i].y);
  }

  context.stroke();
  context.globalAlpha = 1.0;
}

function drawStepOnContext(context, { x, y, n, color }) {
  const radius = 18;
  
  context.fillStyle = color;
  context.beginPath();
  context.arc(x, y, radius, 0, Math. PI * 2);
  context.fill();

  context.fillStyle = "white";
  context.font = "bold 16px Arial";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(n, x, y);
}

function drawBlurOnContext(context, image, { x, y, w, h }) {
  context.filter = "blur(10px)";
  context.drawImage(image, x, y, w, h, x, y, w, h);
  context.filter = "none";
  
  context.strokeStyle = "rgba(255, 0, 0, 0.5)";
  context.lineWidth = 2;
  context.setLineDash([5, 5]);
  context.strokeRect(x, y, w, h);
  context.setLineDash([]);
}

async function exportPNG() {
  try {
    showToast("Generating PNG...", "info");
    
    const exportCanvas = createExportCanvas();
    
    // Convert to blob and download
    exportCanvas.toBlob((blob) => {
      if (! blob) {
        showToast("❌ Failed to create PNG", "error");
        return;
      }
      
      const url = URL.createObjectURL(blob);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      
      chrome.downloads.download({
        url,
        filename: `screenshot-${timestamp}.png`,
        saveAs: true
      }, (downloadId) => {
        if (downloadId) {
          showToast("✅ PNG downloaded successfully!", "success");
        } else {
          showToast("❌ Download failed", "error");
        }
        URL.revokeObjectURL(url);
      });
    }, "image/png", 1.0);
    
  } catch (error) {
    console.error("PNG export failed:", error);
    showToast(`❌ PNG export failed: ${error.message}`, "error");
  }
}

async function exportPDF() {
  try {
    showToast("Generating PDF...", "info");
    
    const { jsPDF } = window.jspdf;
    
    if (! jsPDF) {
      showToast("❌ PDF library not loaded", "error");
      return;
    }
    
    const exportCanvas = createExportCanvas();
    const imgData = exportCanvas.toDataURL("image/png", 1.0);
    
    // Create PDF
    const imgWidth = exportCanvas.width;
    const imgHeight = exportCanvas.height;
    
    const pdf = new jsPDF({
      orientation: imgWidth > imgHeight ? "landscape" : "portrait",
      unit: "px",
      format:  [imgWidth, imgHeight]
    });
    
    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    pdf.save(`screenshot-${timestamp}.pdf`);
    
    showToast("✅ PDF downloaded successfully!", "success");
    
  } catch (error) {
    console.error("PDF export failed:", error);
    showToast(`❌ PDF export failed: ${error.message}`, "error");
  }
}

async function copyToClipboard() {
  try {
    showToast("Copying to clipboard.. .", "info");
    
    const exportCanvas = createExportCanvas();
    
    const blob = await new Promise(resolve => exportCanvas.toBlob(resolve, "image/png", 1.0));
    
    if (! blob) {
      showToast("❌ Failed to create image", "error");
      return;
    }
    
    await navigator.clipboard.write([
      new ClipboardItem({ "image/png": blob })
    ]);
    
    showToast("✅ Copied to clipboard!", "success");
    
  } catch (error) {
    console.error("Clipboard copy failed:", error);
    showToast(`❌ Failed to copy:  ${error.message}`, "error");
  }
}

/* ========================================
   TOAST NOTIFICATIONS
======================================== */

function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  
  const iconMap = {
    success: "✅",
    error: "❌",
    info: "ℹ️"
  };
  
  toast.innerHTML = `
    <span class="toast-icon">${iconMap[type] || "ℹ️"}</span>
    <span class="toast-message">${message}</span>
  `;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(400px)";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/* ========================================
   INITIALIZATION
======================================== */

console.log("✅ Screenshot Editor Loaded - v2.0");
updateHistoryButtons();