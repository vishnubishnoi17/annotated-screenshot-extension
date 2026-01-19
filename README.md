# 📸 Annotated Screenshot Extension

> A powerful browser extension for capturing, annotating, and editing screenshots with professional-grade tools.  Built for developers, designers, and anyone who needs to communicate visually. 

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue? style=for-the-badge)
![Chrome](https://img.shields.io/badge/Chrome-Compatible-green?style=for-the-badge&logo=googlechrome)
![Edge](https://img.shields.io/badge/Edge-Compatible-blue?style=for-the-badge&logo=microsoftedge)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)

[Demo](#-demo) • [Features](#-features) • [Installation](#-installation) • [Usage](#-usage)

</div>

---

## 🎯 Why This Extension?

Traditional screenshot tools are limited.  This extension combines **powerful capture capabilities** with **professional annotation tools** to create the perfect workflow for: 

-  Creating tutorials and documentation
-  Filing detailed bug reports
-  Visual feedback and collaboration
-  Design annotations and mockups
-  Presentations and walkthroughs

##  Features

### Smart Capture

| Feature | Description |
|---------|-------------|
| **Full Page Capture** | Automatically stitches screenshots for entire scrollable pages |
| **Visible Area** | Quick capture of current viewport |
| **Smart Scrolling** | Handles dynamic content and lazy-loaded elements |
| **Multi-trigger** | Keyboard shortcut (`Ctrl+Shift+S`), context menu, or popup |
| **Progress Feedback** | Visual indicator during long captures |

###  Professional Annotation Tools

**Drawing & Shapes**
-  Freehand drawing with pressure sensitivity
-  Arrows with customizable arrowheads
-  Lines, rectangles, and circles
-  **Crop tool** to focus on specific areas
-  Step numbering for tutorials
-  Highlighting with transparency

**Text & Privacy**
-  Rich text annotations with custom fonts
-  Blur tool for sensitive information
-  8 preset colors + custom color picker
-  Adjustable line width (1-20px)

**Canvas Controls**
-  Undo/Redo (unlimited history)
-  Pan and zoom for precision
-  Full keyboard shortcut support
-  Clear all or individual elements

### 💾 Flexible Export

- **PNG** - High-quality raster export
- **PDF** - Single or multi-page documents
- **Clipboard** - One-click copy for instant sharing

##  Demo

```
[Add screenshots or GIF here showing: 
 1.  Capturing a screenshot
 2. Annotating with various tools
 3. Exporting the final result]
```

## 🚀 Installation

### Option 1: From Source (Recommended for Development)

```bash
# Clone the repository
git clone https://github.com/vishnubishnoi17/annotated-screenshot-extension.git
cd annotated-screenshot-extension

# Load in browser
# 1. Open chrome://extensions/ (or edge://extensions/)
# 2. Enable "Developer mode" (top right)
# 3. Click "Load unpacked"
# 4. Select the extension directory
```

### Option 2: Chrome Web Store *(Coming Soon)*

The extension will be available on the Chrome Web Store for one-click installation.

## 📖 Usage

### Quick Start

1. **Capture** - Click the extension icon or press `Ctrl+Shift+S`
2. **Annotate** - Use the toolbar to add arrows, text, shapes, etc.
3. **Export** - Download as PNG/PDF or copy to clipboard

### Keyboard Shortcuts

#### Global Shortcuts
| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+S` | Capture screenshot |
| `Cmd+Shift+S` | Capture (Mac) |

#### Editor Shortcuts
| Shortcut | Action |
|----------|--------|
| `V` | Select tool |
| `A` | Arrow tool |
| `L` | Line tool |
| `R` | Rectangle |
| `C` | Circle |
| `T` | Text |
| `D` | Draw (freehand) |
| `H` | Highlight |
| `N` | Number/Step |
| `B` | Blur |
| `K` | Crop |
| `Ctrl+Z` | Undo |
| `Ctrl+Y` | Redo |
| `Ctrl++` | Zoom in |
| `Ctrl+-` | Zoom out |
| `Ctrl+0` | Reset zoom |

### Advanced Features

**Crop Tool**
1. Select the crop tool (✂️) or press `K`
2. Click and drag to select the area
3. Click "Apply Crop" to finalize

**Full Page Capture**
1. Right-click anywhere → "📸 Capture Full Page Screenshot"
2. Wait for the progress indicator
3. Auto-opens in editor

**Customization**
- Access settings via the extension popup
- Adjust capture delay for slow-loading pages
- Enable/disable auto-open editor
- Configure keyboard shortcuts

##  Tech Stack

```
├─ Manifest V3       # Latest Chrome extension architecture
├─ Vanilla JavaScript # 67. 8% - No frameworks, pure performance
├─ Modern CSS        # 19.8% - Gradient UI, animations
└─ HTML5 Canvas      # 12.4% - Real-time rendering
```

**Key Technologies:**
- Chrome Extension API
- HTML5 Canvas for annotation rendering
- Local Storage for settings persistence
- jsPDF for PDF export
- Custom image stitching algorithm

## 📁 Project Structure

```
annotated-screenshot-extension/
│
├── manifest.json              # Extension configuration
│
├── assets/icons/              # Extension icons
│
├── background/
│   └── serviceWorker.js       # Background processes
│
├── popup/
│   ├── popup.html             # Extension popup UI
│   ├── popup.css              # Popup styling
│   └── popup. js               # Popup logic
│
├── editor/
│   ├── editor.html            # Screenshot editor
│   ├── editor.css             # Editor styling
│   └── editor.js              # Canvas & annotation logic
│
├── content/
│   └── scroll.js              # Page scroll handling
│
└── utils/
    └── stitch. js              # Image stitching utility
```

##  Privacy & Security

**100% Local Processing** - Your data never leaves your device. 

-  No data collection or analytics
-  No external servers or API calls
-  Screenshots stored temporarily in browser storage
-  All annotations processed locally
-  No user tracking

**Required Permissions:**
- `tabs` - Capture screenshots of active tabs
- `scripting` - Inject capture scripts
- `storage` - Save user preferences locally
- `downloads` - Export screenshots to disk
- `activeTab` - Access current tab
- `contextMenus` - Right-click menu integration

##  Known Limitations

- Cannot capture Chrome internal pages (`chrome://`, `edge://`)
- Some dynamically loaded content may require manual scrolling
- Very long pages (>50,000px height) may experience slower processing

##  Roadmap

###  Version 1.0.0 (Current)
- Full page & visible area capture
- 10+ annotation tools
- PNG/PDF/Clipboard export
- Keyboard shortcuts
- Crop functionality

###  Future Enhancements
- [ ] Cloud storage integration (Google Drive, Dropbox)
- [ ] Video/GIF recording
- [ ] Shape library & templates
- [ ] OCR text extraction
- [ ] Batch screenshot processing
- [ ] Browser sync across devices
- [ ] Firefox & Safari versions

## 📄 License

This project is licensed under the **MIT License**. 

```
MIT License - Copyright (c) 2026 Vishnu Bishnoi

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files... 
```

See [LICENSE](LICENSE) for full details.

## 👤 Author

**Vishnu Bishnoi**

- GitHub: [@vishnubishnoi17](https://github.com/vishnubishnoi17)
- Project: [annotated-screenshot-extension](https://github.com/vishnubishnoi17/annotated-screenshot-extension)

## 💬 Feedback & Support

Found a bug or have a feature request? 

- 🐛 [Report an Issue](https://github.com/vishnubishnoi17/annotated-screenshot-extension/issues/new)
- �� [Request a Feature](https://github.com/vishnubishnoi17/annotated-screenshot-extension/issues/new? labels=enhancement)
- 📖 [View Documentation](https://github.com/vishnubishnoi17/annotated-screenshot-extension#readme)

---

<div align="center">

**If this extension helped you, consider giving it a ⭐ on GitHub!**

Made with ❤️ for the developer community

</div>
