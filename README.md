# 📸 Pro Screenshot Annotator

A powerful Chrome/Edge extension for capturing and annotating screenshots with professional-grade editing tools.  Perfect for creating tutorials, bug reports, documentation, and visual feedback.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Manifest](https://img.shields.io/badge/manifest-v3-orange)

## ✨ Features

### Screenshot Capture
- **Full Page Capture**: Automatically stitches multiple screenshots to capture entire web pages
- **Visible Area Capture**: Quick capture of current viewport
- **Context Menu Integration**: Right-click anywhere to capture
- **Keyboard Shortcut**: `Ctrl+Shift+S` (Windows/Linux) or `Cmd+Shift+S` (Mac)
- **Smart Scrolling**: Handles dynamic content and long pages
- **Progress Indicator**: Visual feedback during full-page captures

### Annotation Tools
- **✏️ Drawing Tools**
  - Freehand drawing
  - Arrows with customizable styles
  - Lines and shapes (rectangles, circles)
  - Step numbering for tutorials
  - Text annotations with customizable fonts
  - Highlighting tool

- **🎨 Customization**
  - Color picker with preset palette
  - Adjustable line width (1-20px)
  - Multiple color presets (Red, Blue, Yellow, Green, Purple, Orange, Black, White)
  - Custom colors via color picker

- **🌫️ Privacy Features**
  - Blur tool for sensitive information
  - Redaction capabilities

- **📐 Canvas Tools**
  - Pan and zoom
  - Undo/Redo (Ctrl+Z / Ctrl+Y)
  - Clear all annotations
  - Selection tool for moving/editing
  - Grid and guides (coming soon)

### Export Options
- **PNG Export**: High-quality image download
- **PDF Export**: Single or multi-page PDFs
- **Clipboard Copy**: Quick copy to paste anywhere


### Manual Installation (Developer Mode)

1. **Clone or Download the Repository**
   ```bash
   git clone https://github.com/vishnubishnoi17/annotated-screenshot-extension. git
   cd annotated-screenshot-extension
   ```

2. **Load in Chrome/Edge**
   - Open `chrome://extensions/` (or `edge://extensions/`)
   - Enable **Developer mode** (toggle in top-right corner)
   - Click **Load unpacked**
   - Select the extension directory

3. **Pin the Extension**
   - Click the extensions icon (puzzle piece) in your toolbar
   - Find "Pro Screenshot Annotator"
   - Click the pin icon to keep it visible

## 📖 Usage

### Capturing Screenshots

#### Method 1: Extension Popup
1. Click the extension icon in your toolbar
2. Choose either: 
   - **Full Page**:  Captures the entire scrollable page
   - **Visible Area**: Captures only what's currently visible

#### Method 2: Keyboard Shortcut
- Press `Ctrl+Shift+S` (Windows/Linux) or `Cmd+Shift+S` (Mac)

#### Method 3: Context Menu
- Right-click anywhere on a page
- Select "📸 Capture Full Page Screenshot"

### Annotating Screenshots

Once a screenshot is captured, the editor opens automatically (if enabled in settings):

1. **Select a Tool** from the top toolbar
2. **Choose a Color** from the color picker or presets
3. **Adjust Line Width** using the slider
4. **Draw on the Canvas**:
   - Click and drag to draw shapes
   - Click once for text tool, then type
   - Use step tool to add numbered markers
   - Use blur tool to redact sensitive info

5. **Export Your Work**:
   - Click **PNG** to download as image
   - Click **PDF** to export as PDF
   - Click **Copy** to copy to clipboard

### Keyboard Shortcuts

#### Global
| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+S` / `Cmd+Shift+S` | Capture screenshot |

#### Editor
| Shortcut | Action |
|----------|--------|
| `Ctrl+Z` / `Cmd+Z` | Undo |
| `Ctrl+Y` / `Cmd+Y` | Redo |
| `Delete` / `Backspace` | Delete selected object |
| `1-8` | Select tool (1=Select, 2=Arrow, etc.) |
| `Ctrl++` / `Cmd++` | Zoom in |
| `Ctrl+-` / `Cmd+-` | Zoom out |
| `Ctrl+0` / `Cmd+0` | Reset zoom |

## ⚙️ Settings

Access settings from the extension popup:

- **Auto-open Editor**:  Automatically open the editor after capturing
- **Play Sound Effects**: Audio feedback for actions
- **Capture Delay**:  Adjust timing for page rendering
  - Fast (300ms)
  - Normal (500ms) - Recommended
  - Slow (1s) - For heavy pages

## 🏗️ Project Structure

```
annotated-screenshot-extension/
├── manifest.json           # Extension configuration
├── assets/
│   └── icons/              # Extension icons
├── background/
│   └── serviceWorker.js    # Background service worker
├── popup/
│   ├── popup.html          # Extension popup UI
│   ├── popup. css           # Popup styles
│   └── popup.js            # Popup logic
├── editor/
│   ├── editor.html         # Screenshot editor UI
│   ├── editor. css          # Editor styles
│   └── editor.js           # Editor logic & canvas handling
├── content/
│   └── scroll.js           # Content script for scrolling
└── utils/
    └── stitch.js           # Image stitching utilities
```

## 🛠️ Technical Details

- **Manifest Version**: 3
- **Languages**: JavaScript (66. 9%), CSS (19.2%), HTML (13.9%)
- **Permissions**: 
  - `tabs` - Access to browser tabs
  - `scripting` - Inject scripts for page capture
  - `storage` - Save user preferences
  - `downloads` - Export screenshots
  - `activeTab` - Interact with active tab
  - `contextMenus` - Add right-click menu

## 🔒 Privacy

**Pro Screenshot Annotator respects your privacy:**

- **No Data Collection**: This extension does not collect or transmit any user data
- **Local Processing**: All screenshots and annotations are processed locally on your device
- **No External Servers**: No data is sent to external servers or third parties
- **No Analytics or Tracking**: We don't track your usage or behavior
- **Transparent Permissions**: Only requests necessary permissions for functionality

For full details, see our [Privacy Policy](PRIVACY.md).

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Setup

1. Clone the repository
2. Make your changes
3. Test in Chrome/Edge using Developer Mode
4. Submit a PR with a clear description

## 🐛 Known Issues & Limitations

- Cannot capture Chrome internal pages (`chrome://`, `edge://`, etc.)
- Some dynamic content may not render correctly during full-page capture
- Very long pages (>50,000px) may experience performance issues

## 📝 Changelog

### Version 1.0.0 (January 2026)
**Initial Opera Web Store Release**
- Professional screenshot capture with full-page support
- Advanced annotation tools (drawing, arrows, shapes, text, blur)
- Multiple export options (PNG, PDF, clipboard)
- Keyboard shortcuts and context menu integration
- Customizable settings and preferences
- Privacy-focused: all processing happens locally
- Manifest V3 compliance
- Complete documentation and privacy policy

*Previous internal version (2.0.0) was a development build and not publicly released.*

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Vishnu Bishnoi**
- GitHub: [@vishnubishnoi17](https://github.com/vishnubishnoi17)

## 🙏 Acknowledgments

- Thanks to all contributors who have helped improve this extension
- Inspired by tools like Awesome Screenshot and Nimbus Screenshot

## 📧 Support

If you encounter any issues or have questions: 
- Open an issue on [GitHub](https://github.com/vishnubishnoi17/annotated-screenshot-extension/issues)
- Check existing issues for solutions

---

**If you find this extension helpful, please ⭐ star the repository!**
