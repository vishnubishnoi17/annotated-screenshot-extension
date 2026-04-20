(() => {
  let activeOverlay;

  function removeOverlay() {
    if (activeOverlay?.root?.parentNode) {
      activeOverlay.root.parentNode.removeChild(activeOverlay.root);
    }
    activeOverlay = null;
  }

  function createOverlay() {
    const root = document.createElement('div');
    root.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 2147483647;
      background: rgba(15, 23, 42, 0.18);
      cursor: crosshair;
      user-select: none;
    `;

    const box = document.createElement('div');
    box.style.cssText = `
      position: fixed;
      border: 2px dashed #4f46e5;
      background: rgba(99, 102, 241, 0.16);
      pointer-events: none;
    `;

    const label = document.createElement('div');
    label.style.cssText = `
      position: fixed;
      top: 12px;
      left: 50%;
      transform: translateX(-50%);
      background: #0f172a;
      color: #fff;
      padding: 8px 12px;
      border-radius: 8px;
      font: 12px/1.2 -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif;
      box-shadow: 0 8px 20px rgba(2, 6, 23, 0.3);
      pointer-events: none;
    `;
    label.textContent = 'Drag to select capture area · Esc to cancel';

    root.appendChild(box);
    root.appendChild(label);
    document.documentElement.appendChild(root);

    return { root, box };
  }

  function selectRegion() {
    return new Promise((resolve) => {
      removeOverlay();
      activeOverlay = createOverlay();

      let startX = 0;
      let startY = 0;
      let currentRect = null;
      let dragging = false;

      const updateBox = (x1, y1, x2, y2) => {
        const left = Math.min(x1, x2);
        const top = Math.min(y1, y2);
        const width = Math.max(1, Math.abs(x2 - x1));
        const height = Math.max(1, Math.abs(y2 - y1));

        currentRect = { x: left, y: top, width, height };

        Object.assign(activeOverlay.box.style, {
          left: `${left}px`,
          top: `${top}px`,
          width: `${width}px`,
          height: `${height}px`
        });
      };

      const cleanup = (result) => {
        document.removeEventListener('keydown', onKeyDown, true);
        activeOverlay.root.removeEventListener('mousedown', onMouseDown, true);
        window.removeEventListener('mousemove', onMouseMove, true);
        window.removeEventListener('mouseup', onMouseUp, true);
        removeOverlay();
        resolve(result);
      };

      const onKeyDown = (event) => {
        if (event.key === 'Escape') cleanup({ ok: false, error: 'Selection canceled' });
      };

      const onMouseDown = (event) => {
        dragging = true;
        startX = event.clientX;
        startY = event.clientY;
        updateBox(startX, startY, startX, startY);
      };

      const onMouseMove = (event) => {
        if (!dragging) return;
        updateBox(startX, startY, event.clientX, event.clientY);
      };

      const onMouseUp = () => {
        dragging = false;
        if (!currentRect || currentRect.width < 6 || currentRect.height < 6) {
          cleanup({ ok: false, error: 'Selection too small' });
          return;
        }

        cleanup({
          ok: true,
          rect: currentRect,
          viewportWidth: window.innerWidth,
          viewportHeight: window.innerHeight
        });
      };

      document.addEventListener('keydown', onKeyDown, true);
      activeOverlay.root.addEventListener('mousedown', onMouseDown, true);
      window.addEventListener('mousemove', onMouseMove, true);
      window.addEventListener('mouseup', onMouseUp, true);
    });
  }

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.action === 'START_REGION_SELECTION') {
      selectRegion().then(sendResponse);
      return true;
    }
  });
})();
