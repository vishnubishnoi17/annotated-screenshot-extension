# Opera Web Store Submission Guide

## Extension Information for Store Listing

### Basic Information
- **Extension Name**: Pro Screenshot Annotator
- **Version**: 1.0.0
- **Category**: Productivity
- **License**: MIT License
- **Support Website**: https://github.com/vishnubishnoi17/annotated-screenshot-extension
- **Privacy Policy**: See PRIVACY.md

### Store Listing Content

#### Short Description (132 characters max)
Professional screenshot tool with advanced annotation features. Capture, annotate, and export screenshots with ease.

#### Detailed Description
Pro Screenshot Annotator is a powerful browser extension for capturing and annotating screenshots with professional-grade editing tools. Perfect for creating tutorials, bug reports, documentation, and visual feedback.

**Key Features:**

📸 **Flexible Screenshot Capture**
- Full page capture with automatic scrolling and stitching
- Visible area capture for quick screenshots
- Right-click context menu integration
- Keyboard shortcut support (Ctrl+Shift+S)
- Smart handling of dynamic content

✏️ **Professional Annotation Tools**
- Freehand drawing with customizable colors and widths
- Arrows, lines, rectangles, and circles
- Text annotations with custom fonts
- Step numbering for tutorials
- Blur tool for privacy protection
- Selection and editing of annotations

🎨 **Customization Options**
- Color picker with preset palette
- Adjustable line width (1-20px)
- Multiple color presets
- Pan and zoom controls
- Undo/Redo support

💾 **Export Options**
- PNG image export
- PDF export (single or multi-page)
- Copy to clipboard
- Direct download to your device

⚙️ **User Settings**
- Auto-open editor option
- Sound effects toggle
- Adjustable capture delay for different page types

🔒 **Privacy Focused**
- No data collection or tracking
- All processing happens locally
- No external servers or connections
- Open source and transparent

**Permissions Explained:**
- tabs: Capture screenshots of web pages
- scripting: Inject capture scripts
- storage: Save your preferences locally
- downloads: Save screenshots to your device
- activeTab: Access current tab for capture
- contextMenus: Add right-click menu
- <all_urls>: Capture screenshots on any website

**Perfect for:**
- Creating software tutorials
- Bug reporting with visual annotations
- Documentation with screenshots
- Providing visual feedback
- Educational content creation

**System Requirements:**
- Opera browser (or any Chromium-based browser)
- Manifest V3 compatible

**Open Source:**
This extension is open source under the MIT License. View the code, contribute, or report issues on GitHub.

### Screenshots for Store Listing
(To be added by repository owner)

Recommended screenshots to capture:
1. Extension popup showing capture options
2. Full page screenshot capture in progress
3. Screenshot editor with annotation tools highlighted
4. Example annotated screenshot (tutorial style)
5. Settings panel
6. Export options (PNG/PDF/Copy)

### Promotional Images
- **Small tile**: 440x280 pixels
- **Large tile**: 920x680 pixels
- **Marquee**: 1400x560 pixels

### Keywords/Tags
screenshot, annotate, capture, screen capture, annotation, markup, drawing, highlight, blur, redact, tutorial, documentation, bug report, productivity, editor

## Pre-Submission Checklist

### Required Files
- [x] manifest.json with correct metadata
- [x] Icon files (16x16, 48x48, 128x128)
- [x] Privacy policy (PRIVACY.md)
- [x] MIT License (LICENSE)
- [x] README.md documentation
- [x] All source code files

### Icon Requirements
- [x] 16x16 PNG with transparency
- [x] 48x48 PNG with transparency
- [x] 128x128 PNG with transparency
- [x] All icons properly anti-aliased

### Manifest.json Validation
- [x] Version format: 1.0.0
- [x] Author field present
- [x] Homepage URL present
- [x] All icon paths correct
- [x] Valid JSON syntax
- [x] Manifest version 3

### Content Guidelines
- [x] No copyrighted material
- [x] No misleading claims
- [x] Clear permission explanations
- [x] Privacy policy present
- [x] Support/contact information

### Testing
- [x] Extension loads without errors
- [x] All features work as expected
- [x] Icons display correctly
- [x] No console errors
- [x] Tested on latest Opera version

## Packaging for Submission

### Step 1: Create Extension Package
```bash
# Navigate to extension directory
cd annotated-screenshot-extension

# Create a zip file excluding unnecessary files
zip -r pro-screenshot-annotator-v1.0.0.zip . \
  -x "*.git*" \
  -x "node_modules/*" \
  -x "*.log" \
  -x ".DS_Store" \
  -x "OPERA_STORE_GUIDE.md"
```

### Step 2: Verify Package Contents
Ensure the zip file contains:
- manifest.json
- All assets/ directory contents
- All background/ directory contents
- All content/ directory contents
- All editor/ directory contents
- All popup/ directory contents
- All utils/ directory contents
- PRIVACY.md
- README.md
- LICENSE

### Step 3: Submit to Opera Web Store

1. **Go to Opera Add-ons Developer Dashboard**
   - Visit: https://addons.opera.com/developer/
   - Sign in with your Opera account

2. **Upload Extension**
   - Click "Upload new version"
   - Upload the zip file
   - Fill in all required information

3. **Store Listing**
   - Enter extension name: "Pro Screenshot Annotator"
   - Choose category: Productivity
   - Enter short and detailed descriptions
   - Upload screenshots (6-8 recommended)
   - Upload promotional images

4. **Additional Information**
   - Link to privacy policy: https://github.com/vishnubishnoi17/annotated-screenshot-extension/blob/main/PRIVACY.md
   - Support website: https://github.com/vishnubishnoi17/annotated-screenshot-extension
   - Support email: (your email)

5. **Review and Submit**
   - Review all information
   - Submit for review
   - Wait for Opera team approval (typically 2-5 business days)

## Opera Web Store Review Guidelines

### What Opera Reviews:
- Code quality and security
- Privacy policy compliance
- Correct use of permissions
- User interface and experience
- Description accuracy
- Icon and screenshot quality

### Common Rejection Reasons to Avoid:
- Misleading descriptions
- Excessive permissions
- Missing or inadequate privacy policy
- Low-quality icons or screenshots
- Copyright violations
- Broken functionality

### Response Time:
- Initial review: 2-5 business days
- Re-review after changes: 1-3 business days

## Post-Submission

### After Approval:
1. Extension will be published on Opera Add-ons
2. Update README.md with Opera Store link
3. Monitor user reviews and ratings
4. Respond to user feedback
5. Plan future updates

### Updating the Extension:
1. Increment version number in manifest.json
2. Update README.md changelog
3. Create new package zip
4. Upload to Opera dashboard
5. Describe changes in update notes

## Support and Maintenance

### User Support:
- Monitor GitHub issues
- Respond to Opera Store reviews
- Update documentation as needed
- Fix bugs promptly

### Marketing:
- Share on social media
- Add Opera Store badge to README
- Request user reviews
- Create tutorial videos

## Additional Resources

- **Opera Add-ons Documentation**: https://dev.opera.com/extensions/
- **Opera Add-ons Acceptance Criteria**: https://dev.opera.com/extensions/acceptance-criteria/
- **Manifest V3 Guide**: https://developer.chrome.com/docs/extensions/mv3/
- **Extension Best Practices**: https://developer.chrome.com/docs/extensions/mv3/quality_guidelines/

## Contact

For questions about this submission guide:
- GitHub Issues: https://github.com/vishnubishnoi17/annotated-screenshot-extension/issues
- Repository: https://github.com/vishnubishnoi17/annotated-screenshot-extension

---

**Note**: This guide is current as of January 2026. Opera's submission process may change over time. Always refer to the official Opera Add-ons documentation for the most up-to-date information.
