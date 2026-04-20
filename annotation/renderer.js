function drawArrow(ctx, item) {
  const { x1, y1, x2, y2, color, width } = item;
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const head = 16 + width;

  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - head * Math.cos(angle - Math.PI / 6), y2 - head * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(x2 - head * Math.cos(angle + Math.PI / 6), y2 - head * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fill();
}

function drawRectLike(ctx, item, ellipse = false) {
  ctx.strokeStyle = item.color;
  ctx.lineWidth = item.width;
  ctx.fillStyle = item.fill || 'transparent';

  if (ellipse) {
    ctx.beginPath();
    ctx.ellipse(item.x + item.w / 2, item.y + item.h / 2, Math.abs(item.w) / 2, Math.abs(item.h) / 2, 0, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    ctx.strokeRect(item.x, item.y, item.w, item.h);
  }
}

function drawText(ctx, item) {
  const style = `${item.bold ? 'bold ' : ''}${item.italic ? 'italic ' : ''}${item.size}px Arial`;
  ctx.font = style;
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  const width = Math.max(20, ctx.measureText(item.text).width + 8);
  const height = item.size + 8;
  ctx.fillRect(item.x - 4, item.y - 4, width, height);
  ctx.fillStyle = item.color;
  ctx.fillText(item.text, item.x, item.y + item.size);
}

function drawPath(ctx, item) {
  if (!item.points?.length) return;
  ctx.strokeStyle = item.color;
  ctx.lineWidth = item.width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  ctx.moveTo(item.points[0].x, item.points[0].y);
  for (let i = 1; i < item.points.length; i++) {
    ctx.lineTo(item.points[i].x, item.points[i].y);
  }
  ctx.stroke();
}

function drawBlur(ctx, image, item) {
  ctx.save();
  ctx.filter = 'blur(8px)';
  ctx.drawImage(image, item.x, item.y, item.w, item.h, item.x, item.y, item.w, item.h);
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = 'rgba(15,23,42,0.35)';
  ctx.setLineDash([5, 4]);
  ctx.strokeRect(item.x, item.y, item.w, item.h);
  ctx.restore();
}

function drawHighlight(ctx, item) {
  ctx.save();
  ctx.fillStyle = item.color;
  ctx.globalAlpha = 0.25;
  ctx.fillRect(item.x, item.y, item.w, item.h);
  ctx.restore();
}

export function drawAnnotation(ctx, image, item) {
  switch (item.type) {
    case 'arrow':
      drawArrow(ctx, item);
      break;
    case 'rectangle':
      drawRectLike(ctx, item, false);
      break;
    case 'ellipse':
      drawRectLike(ctx, item, true);
      break;
    case 'text':
      drawText(ctx, item);
      break;
    case 'blur':
      drawBlur(ctx, image, item);
      break;
    case 'highlight':
      drawHighlight(ctx, item);
      break;
    case 'draw':
      drawPath(ctx, item);
      break;
    default:
      break;
  }
}

export function drawSelection(ctx, bounds) {
  if (!bounds) return;
  ctx.save();
  ctx.strokeStyle = '#2563eb';
  ctx.setLineDash([6, 4]);
  ctx.strokeRect(bounds.x, bounds.y, bounds.w, bounds.h);
  ctx.setLineDash([]);

  const handles = [
    [bounds.x, bounds.y],
    [bounds.x + bounds.w, bounds.y],
    [bounds.x, bounds.y + bounds.h],
    [bounds.x + bounds.w, bounds.y + bounds.h]
  ];

  ctx.fillStyle = '#2563eb';
  handles.forEach(([x, y]) => ctx.fillRect(x - 4, y - 4, 8, 8));
  ctx.restore();
}
