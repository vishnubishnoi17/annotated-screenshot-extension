# 📸 Pro Screenshot Annotator - Chrome Extension

> **Professional screenshot tool with advanced annotation features**

![Version](https://img.shields.io/badge/version-2.0. 0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Chrome](https://img.shields.io/badge/chrome-extension-yellow)

## ✨ Features

### 🎯 Capture Modes
- **Full Page Screenshot** - Automatically scrolls and captures entire web pages
- **Visible Area** - Quick capture of current viewport
- **Right-click Context Menu** - Capture from anywhere
- **Keyboard Shortcut** - `Ctrl+Shift+S` (or `Cmd+Shift+S` on Mac)

### 🎨 Annotation Tools
| Tool | Icon | Shortcut | Description |
|------|------|----------|-------------|
| Select | ↖️ | `V` | Select and move annotations |
| Arrow | ➡️ | `A` | Draw arrows to point things out |
| Line | 📏 | `L` | Draw straight lines |
| Rectangle | ⬜ | `R` | Draw rectangular boxes |
| Circle | ⭕ | `C` | Draw circles |
| Text | 📝 | `T` | Add custom text |
| Draw | ✏️ | `D` | Free-hand drawing |
| Highlight | 🖍️ | `H` | Transparent highlighter |
| Number | 🔢 | `N` | Add numbered step markers |
| Blur | 🌫️ | `B` | Blur sensitive areas |

### 🎨 Customization
- **Color Picker** - Choose any color
- **6 Color Presets** - Quick access to common colors
- **Line Width** - Adjustable from 1-20px
- **Text Formatting** - Bold, italic, custom sizes (10-100px)

### 💾 Export Options
- **PNG** - High-quality image export
- **PDF** - Professional PDF documents
- **Clipboard** - Quick copy & paste

### ⚡ Advanced Features
- **Unlimited Undo/Redo** - Full history management
- **Zoom** - Up to 300% (scroll wheel or buttons)
- **Auto-save Settings** - Remembers your preferences
- **Toast Notifications** - Real-time feedback
- **Keyboard Shortcuts** - Speed up your workflow
- **Progress Indicator** - See capture progress in real-time

## 🚀 Installation

### Method 1: From Source (Developer Mode)

1. **Download the Extension**
   ```bash
   git clone https://github.com/vishnubishnoi17/annotated-screenshot-extension.git
   cd annotated-screenshot-extension
   ```

2. **Create Icon** (Required)
   - Create a 128x128 PNG icon
   - Save it as `assets/icons/icon128.png`
   - Or use this placeholder command:
   ```bash
   mkdir -p assets/icons
   # Use any image editor to create a 128x128 icon
   ```

3. **Load in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable **Developer mode** (toggle in top-right)
   - Click **Load unpacked**
   - Select the extension folder
   - Done!  🎉

### Method 2: Quick Icon Creation

Use this SVG and convert to PNG at 128x128:

```svg
<svg width="128" height="128" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="128" height="128" rx="24" fill="url(#grad)"/>
  <text x="64" y="85" font-size="60" text-anchor="middle" fill="white">📸</text>
</svg>
```

Convert at:  [SVG to PNG Converter](https://cloudconvert.com/svg-to-png)

## 📖 Usage Guide

### Capturing Screenshots

1. **Click Extension Icon** → Select capture mode
2. **Right-click** on any page → "📸 Capture Full Page Screenshot"
3. **Keyboard**:  `Ctrl+Shift+S` (Windows/Linux) or `Cmd+Shift+S` (Mac)

### Annotating

1. **Select a Tool** from the toolbar
2. **Choose a Color** (click color picker or presets)
3. **Adjust Line Width** with the slider
4. **Draw on Canvas** - Click and drag
5. **Add Text** - Click where you want text, type, and confirm

### Exporting

- **PNG**:  Click 💾 PNG button → Choose save location
- **PDF**: Click 📄 PDF button → Auto-downloads
- **Clipboard**: Click 📋 Copy → Paste anywhere

## ⌨️ Keyboard Shortcuts

### Global
| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+S` | Capture screenshot |

### Editor
| Shortcut | Action |
|----------|--------|
| `Ctrl+Z` | Undo |
| `Ctrl+Y` | Redo |
| `Ctrl++` | Zoom in |
| `Ctrl+-` | Zoom out |
| `Ctrl+0` | Reset zoom |
| `V` | Select tool |
| `A` | Arrow tool |
| `L` | Line tool |
| `R` | Rectangle tool |
| `C` | Circle tool |
| `T` | Text tool |
| `D` | Draw tool |
| `H` | Highlight tool |
| `N` | Number tool |
| `B` | Blur tool |
| `Delete` | Delete selected |

## 🛠️ Project Structure

```
annotated-screenshot-extension/
├── manifest.json                 # Extension configuration
├── background/
│   └── serviceWorker.js         # Background tasks & capture logic
├── popup/
│   ├── popup.html               # Extension popup UI
│   ├── popup.js                 # Popup interactions
│   └── popup. css                # Popup styling
├── editor/
│   ├── editor.html              # Editor UI
│   ├── editor.js                # Editor logic & tools
│   ├── editor.css               # Editor styling
│   └── lab/
│       └── jspdf.umd.min.js    # PDF export library
├── assets/
│   └── icons/
│       └── icon128.png          # Extension icon
└── README.md                    # Documentation
```

## 🔧 Technical Details

- **Manifest Version**: 3
- **Minimum Chrome Version**: 88+
- **Permissions**: 
  - `tabs` - Access to tab information
  - `scripting` - Inject capture scripts
  - `storage` - Save screenshots and settings
  - `downloads` - Export files
  - `activeTab` - Capture visible content
  - `contextMenus` - Right-click menu
- **Libraries**: 
  - jsPDF 2.5.1 - PDF generation

## 🐛 Troubleshooting

### "No screenshot data found"
- Make sure you captured a screenshot before opening the editor
- Try capturing again

### Icon not showing
- Ensure `assets/icons/icon128.png` exists
- Image must be exactly 128x128 pixels
- Format must be PNG

### PDF export not working
- Check that `editor/lab/jspdf.umd.min.js` exists
- Download from: [jsPDF](https://github.com/parallax/jsPDF/releases)
- File size should be ~360KB

### Cannot capture some pages
- Chrome internal pages (`chrome://`) cannot be captured
- Extension pages cannot be captured
- Some sites block screenshots (rare)

### Capture is incomplete
- Increase capture delay in popup settings
- Some dynamic pages need more time to load

## 🎯 Tips & Tricks

1. **Use Number Tool** for step-by-step tutorials
2. **Blur Tool** is perfect for hiding passwords/sensitive data
3. **Highlight + Light Yellow** works great for emphasizing text
4. **Arrow + Red** draws attention to important elements
5. **Text Tool** with white color + bold = perfect callouts
6. **Zoom In** (Ctrl++) for precise annotations
7. **Undo** (Ctrl+Z) is your friend - experiment freely!

## 🔒 Privacy

- **All processing is local** - Nothing sent to external servers
- **No tracking or analytics**
- **No data collection**
- **Screenshots stored temporarily** in browser storage
- **Cleared on browser close** (unless saved)

## 📝 License

MIT License - See [LICENSE](LICENSE) file for details

## 🤝 Contributing

Contributions are welcome! Please: 

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 💖 Support

If you find this extension helpful: 
- ⭐ Star this repository
- 🐛 Report bugs via [Issues](https://github.com/vishnubishnoi17/annotated-screenshot-extension/issues)
- 💡 Suggest features
- 📢 Share with others

## 📧 Contact

**Author**:  Vishnu Bishnoi  
**GitHub**: [@vishnubishnoi17](https://github.com/vishnubishnoi17)

## 🎉 Changelog

### v2.0.0 (Current)
- ✨ 10 annotation tools
- 🎨 Full color customization
- 📝 Text with formatting
- 🔍 Zoom functionality
- ⌨️ Keyboard shortcuts
- 🎯 Right-click context menu
- 💾 Multiple export formats
- 🌟 Modern UI design

### v1.0.0
- Basic screenshot capture
- Simple annotations
- PNG export

---

**Made with ❤️ by Vishnu Bishnoi**