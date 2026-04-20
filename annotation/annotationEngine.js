const clone = (value) => JSON.parse(JSON.stringify(value));

export class AnnotationEngine {
  constructor() {
    this.annotations = [];
    this.undoStack = [];
    this.redoStack = [];
    this.selectedId = null;
  }

  load(items = []) {
    this.annotations = clone(items);
    this.undoStack = [];
    this.redoStack = [];
    this.selectedId = null;
  }

  snapshot() {
    this.undoStack.push(clone(this.annotations));
    if (this.undoStack.length > 100) this.undoStack.shift();
    this.redoStack = [];
  }

  add(annotation) {
    this.snapshot();
    this.annotations.push({ ...annotation, id: annotation.id || crypto.randomUUID() });
  }

  replaceAll(next) {
    this.snapshot();
    this.annotations = clone(next);
  }

  update(id, patch) {
    const index = this.annotations.findIndex((item) => item.id === id);
    if (index === -1) return;
    this.snapshot();
    this.annotations[index] = { ...this.annotations[index], ...patch };
  }

  undo() {
    if (!this.undoStack.length) return false;
    this.redoStack.push(clone(this.annotations));
    this.annotations = this.undoStack.pop();
    this.selectedId = null;
    return true;
  }

  redo() {
    if (!this.redoStack.length) return false;
    this.undoStack.push(clone(this.annotations));
    this.annotations = this.redoStack.pop();
    this.selectedId = null;
    return true;
  }

  setSelected(id) {
    this.selectedId = id;
  }

  clearSelection() {
    this.selectedId = null;
  }

  getSelected() {
    return this.annotations.find((item) => item.id === this.selectedId) || null;
  }

  moveSelected(dx, dy) {
    const target = this.getSelected();
    if (!target) return;

    this.update(target.id, this.translate(target, dx, dy));
  }

  resizeSelected(anchor, dx, dy) {
    const target = this.getSelected();
    if (!target) return;

    if (!['rectangle', 'ellipse', 'blur', 'highlight'].includes(target.type)) return;

    const next = { ...target };
    if (anchor.includes('e')) next.w += dx;
    if (anchor.includes('s')) next.h += dy;
    if (anchor.includes('w')) {
      next.x += dx;
      next.w -= dx;
    }
    if (anchor.includes('n')) {
      next.y += dy;
      next.h -= dy;
    }

    next.w = Math.max(4, next.w);
    next.h = Math.max(4, next.h);
    this.update(target.id, next);
  }

  translate(item, dx, dy) {
    const next = { ...item };
    if ('x' in next) next.x += dx;
    if ('y' in next) next.y += dy;
    if ('x1' in next) next.x1 += dx;
    if ('y1' in next) next.y1 += dy;
    if ('x2' in next) next.x2 += dx;
    if ('y2' in next) next.y2 += dy;
    if (next.points) next.points = next.points.map((p) => ({ x: p.x + dx, y: p.y + dy }));
    return next;
  }

  getAll() {
    return clone(this.annotations);
  }

  getBounds(item) {
    switch (item.type) {
      case 'arrow':
        return {
          x: Math.min(item.x1, item.x2),
          y: Math.min(item.y1, item.y2),
          w: Math.abs(item.x2 - item.x1),
          h: Math.abs(item.y2 - item.y1)
        };
      case 'rectangle':
      case 'ellipse':
      case 'blur':
      case 'highlight':
        return { x: item.x, y: item.y, w: item.w, h: item.h };
      case 'text':
        return { x: item.x, y: item.y, w: Math.max(60, item.text.length * item.size * 0.6), h: item.size + 8 };
      default:
        if (item.points?.length) {
          const xs = item.points.map((p) => p.x);
          const ys = item.points.map((p) => p.y);
          return {
            x: Math.min(...xs),
            y: Math.min(...ys),
            w: Math.max(...xs) - Math.min(...xs),
            h: Math.max(...ys) - Math.min(...ys)
          };
        }
        return { x: 0, y: 0, w: 0, h: 0 };
    }
  }

  hitTest(x, y) {
    for (let i = this.annotations.length - 1; i >= 0; i--) {
      const item = this.annotations[i];
      const b = this.getBounds(item);
      if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) {
        return item;
      }
    }
    return null;
  }

  getResizeHandle(x, y) {
    const selected = this.getSelected();
    if (!selected) return null;

    const b = this.getBounds(selected);
    const size = 8;
    const handles = [
      { key: 'nw', x: b.x, y: b.y },
      { key: 'ne', x: b.x + b.w, y: b.y },
      { key: 'sw', x: b.x, y: b.y + b.h },
      { key: 'se', x: b.x + b.w, y: b.y + b.h }
    ];

    return handles.find((h) => Math.abs(x - h.x) <= size && Math.abs(y - h.y) <= size)?.key || null;
  }
}
