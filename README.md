# Annotated Screenshot Extension v2.0

A Manifest V3 screenshot extension with modular architecture, advanced annotation workflows, capture modes, and IndexedDB history.

## v2.0 highlights

- Modular architecture:
  - `capture/`
  - `annotation/`
  - `ui/`
  - `storage/`
  - `utils/`
- Capture modes:
  - Visible area
  - Full-page scroll + stitch
  - Region selection
  - Delayed capture
- Editor upgrades:
  - Floating toolbar
  - Tools: select, arrow, rectangle, ellipse, text, blur, highlight
  - Undo/redo stack
  - Draggable + resizable annotation workflow
  - Keyboard shortcuts and active tool indicators
- Storage/workflow:
  - IndexedDB screenshot storage
  - History panel and re-edit support
- Export:
  - PNG/JPEG download
  - Copy to clipboard
  - PDF export
  - Export with/without annotations
- Advanced modules:
  - OCR via lazy-loaded Tesseract.js
  - Smart blur regions for sensitive data masking
  - Pluggable AI annotation suggestions adapter
- Performance/quality:
  - Offscreen canvas processing in capture pipeline
  - Lazy loading of OCR dependency
  - ESLint + Prettier + TypeScript checking baseline

## Architecture

```text
annotated-screenshot-extension/
├── annotation/
│   ├── annotationEngine.js
│   └── renderer.js
├── background/
│   └── serviceWorker.js
├── capture/
│   ├── captureService.js
│   └── stitch.js
├── content/
│   └── scroll.js
├── editor/
│   ├── editor.css
│   ├── editor.html
│   ├── editor.js
│   └── lab/
├── popup/
│   ├── popup.css
│   ├── popup.html
│   └── popup.js
├── storage/
│   └── indexedDb.js
├── ui/
│   └── aiSuggestions.js
├── utils/
│   ├── constants.js
│   └── logger.js
├── eslint.config.js
├── manifest.json
├── package.json
├── tsconfig.json
└── README.md
```

## Development

```bash
npm install
npm run lint
npm run typecheck
```

Load unpacked extension from project root in `chrome://extensions`.

## Notes

- OCR is loaded only when the OCR action is triggered.
- AI suggestions module is intentionally pluggable and currently returns local suggestions.
- Capture and annotation state are persisted in IndexedDB for re-edit workflows.
