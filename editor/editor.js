/* =======================
   CANVAS & STATE
======================= */

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let tool = null;
let stepCount = 1;

let baseImage = null;
let history = [];
let historyIndex = -1;

let startX = 0;
let startY = 0;

/* draw tool state */
let drawing = false;
let currentPath = [];

/* =======================
   TOOL SELECTION
======================= */

document.querySelectorAll("[data-tool]").forEach(btn => {
  btn.addEventListener("click", () => {
    tool = btn.dataset.tool;
  });
});

/* =======================
   UNDO / REDO
======================= */

document.getElementById("undo")?.addEventListener("click", undo);
document.getElementById("redo")?.addEventListener("click", redo);

/* =======================
   LOAD SCREENSHOT
======================= */

chrome.storage.local.get(["screenshots", "meta"], async ({ screenshots, meta }) => {
  if (!screenshots || !meta) return;

  canvas.width = meta.width;
  canvas.height = meta.totalHeight;

  baseImage = new Image();
  baseImage.src = await stitch(screenshots, meta);
  await baseImage.decode();

  redraw();
});

/* =======================
   MOUSE EVENTS
======================= */

canvas.addEventListener("mousedown", e => {
  startX = e.offsetX;
  startY = e.offsetY;

  if (tool === "draw") {
    drawing = true;
    currentPath = [{ x: startX, y: startY }];
  }
});

canvas.addEventListener("mousemove", e => {
  if (!drawing || tool !== "draw") return;

  const x = e.offsetX + (Math.random() - 0.5) * 2;
  const y = e.offsetY + (Math.random() - 0.5) * 2;

  currentPath.push({ x, y });

  redraw();
  drawPath({ path: currentPath });
});

canvas.addEventListener("mouseup", e => {
  const endX = e.offsetX;
  const endY = e.offsetY;

  let layer = null;

  if (tool === "arrow") {
    layer = { type: "arrow", x1: startX, y1: startY, x2: endX, y2: endY };
  }

  if (tool === "step") {
    layer = { type: "step", x: endX, y: endY, n: stepCount++ };
  }

  if (tool === "blur") {
    layer = {
      type: "blur",
      x: Math.min(startX, endX),
      y: Math.min(startY, endY),
      w: Math.abs(endX - startX),
      h: Math.abs(endY - startY)
    };
  }

  if (tool === "draw" && drawing) {
    layer = { type: "draw", path: [...currentPath] };
    drawing = false;
    currentPath = [];
  }

  if (layer) commit(layer);
});

/* =======================
   HISTORY MANAGEMENT
======================= */

function commit(layer) {
  history = history.slice(0, historyIndex + 1);
  history.push(layer);
  historyIndex++;
  redraw();
}

function undo() {
  if (historyIndex >= 0) {
    historyIndex--;
    redraw();
  }
}

function redo() {
  if (historyIndex < history.length - 1) {
    historyIndex++;
    redraw();
  }
}

/* =======================
   RENDERING
======================= */

function redraw() {
  if (!baseImage) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(baseImage, 0, 0);

  for (let i = 0; i <= historyIndex; i++) {
    drawLayer(history[i]);
  }
}

function drawLayer(l) {
  if (l.type === "arrow") drawArrow(l);
  if (l.type === "step") drawStep(l);
  if (l.type === "blur") drawBlur(l);
  if (l.type === "draw") drawPath(l);
}

/* =======================
   DRAW TOOLS
======================= */

function drawArrow({ x1, y1, x2, y2 }) {
  const angle = Math.atan2(y2 - y1, x2 - x1);

  ctx.strokeStyle = "red";
  ctx.fillStyle = "red";
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(
    x2 - 10 * Math.cos(angle - Math.PI / 6),
    y2 - 10 * Math.sin(angle - Math.PI / 6)
  );
  ctx.lineTo(
    x2 - 10 * Math.cos(angle + Math.PI / 6),
    y2 - 10 * Math.sin(angle + Math.PI / 6)
  );
  ctx.fill();
}

function drawStep({ x, y, n }) {
  ctx.fillStyle = "red";
  ctx.beginPath();
  ctx.arc(x, y, 14, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "white";
  ctx.font = "bold 14px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(n, x, y);
}

function drawBlur({ x, y, w, h }) {
  ctx.filter = "blur(6px)";
  ctx.drawImage(baseImage, x, y, w, h, x, y, w, h);
  ctx.filter = "none";
}

/* NEW DRAW TOOL */
function drawPath({ path }) {
  if (path.length < 2) return;

  ctx.strokeStyle = "red";
  ctx.lineWidth = 2;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  ctx.beginPath();
  ctx.moveTo(path[0].x, path[0].y);

  for (let i = 1; i < path.length; i++) {
    ctx.lineTo(path[i].x, path[i].y);
  }

  ctx.stroke();
}

/* =======================
   STITCHING
======================= */

async function stitch(images, meta) {
  const c = document.createElement("canvas");
  c.width = meta.width;
  c.height = meta.totalHeight;
  const cctx = c.getContext("2d");

  let y = 0;
  for (const src of images) {
    const img = new Image();
    img.src = src;
    await img.decode();
    cctx.drawImage(img, 0, y);
    y += meta.viewportHeight;
  }

  return c.toDataURL("image/png");
}

/* =======================
   EXPORTS
======================= */

document.getElementById("png").onclick = async () => {
  const { screenshots, meta } = await chrome.storage.local.get(["screenshots", "meta"]);

  const out = document.createElement("canvas");
  out.width = meta.width;
  out.height = meta.totalHeight;
  const octx = out.getContext("2d");

  let y = 0;
  for (const src of screenshots) {
    const img = new Image();
    img.src = src;
    await img.decode();
    octx.drawImage(img, 0, y);
    y += meta.viewportHeight;
  }

  out.toBlob(blob => {
    const url = URL.createObjectURL(blob);
    chrome.downloads.download({
      url,
      filename: "fullpage.png",
      saveAs: true
    });
  });
};


document.getElementById("pdf")?.addEventListener("click", exportMultiPagePDF);

async function exportMultiPagePDF() {
  const { screenshots, meta } = await chrome.storage.local.get(["screenshots", "meta"]);
  const { jsPDF } = window.jspdf;

  const pdf = new jsPDF("p", "pt", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  for (let i = 0; i < screenshots.length; i++) {
    if (i > 0) pdf.addPage();

    const img = new Image();
    img.src = screenshots[i];
    await img.decode();

    const scale = pageWidth / img.width;
    const h = img.height * scale;

    pdf.addImage(img, "PNG", 0, 0, pageWidth, h);
  }

  pdf.save("fullpage.pdf");
}


document.getElementById("clip")?.addEventListener("click", async () => {
  const blob = await new Promise(r => canvas.toBlob(r));
  await navigator.clipboard.write([
    new ClipboardItem({ "image/png": blob })
  ]);
});
