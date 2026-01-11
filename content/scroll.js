/* ========================================
   SCROLL MANAGEMENT FOR SCREENSHOT CAPTURE
   This script is injected into pages to manage
   smooth scrolling during screenshot capture
======================================== */

(function() {
  'use strict';

  // Save original scroll position
  let originalScrollX = 0;
  let originalScrollY = 0;
  let originalOverflow = '';
  let isCapturing = false;

  /* ========================================
     INITIALIZE
  ======================================== */
  
  function init() {
    console.log('📜 Scroll manager initialized');
    
    // Listen for messages from background script
    chrome.runtime.onMessage.addListener(handleMessage);
  }

  /* ========================================
     MESSAGE HANDLER
  ======================================== */
  
  function handleMessage(request, sender, sendResponse) {
    switch (request.action) {
      case 'PREPARE_CAPTURE':
        prepareForCapture();
        sendResponse({ success: true });
        break;
        
      case 'SCROLL_TO':
        scrollToPosition(request.x, request.y);
        sendResponse({ success: true });
        break;
        
      case 'RESTORE_SCROLL':
        restoreScroll();
        sendResponse({ success: true });
        break;
        
      case 'GET_PAGE_INFO':
        sendResponse(getPageInfo());
        break;
        
      default:
        sendResponse({ success:  false, error: 'Unknown action' });
    }
    
    return true; // Keep message channel open for async response
  }

  /* ========================================
     PREPARE FOR CAPTURE
  ======================================== */
  
  function prepareForCapture() {
    console.log('🎬 Preparing page for capture...');
    
    // Save current scroll position
    originalScrollX = window.scrollX || window.pageXOffset;
    originalScrollY = window.scrollY || window.pageYOffset;
    
    // Save original overflow style
    originalOverflow = document.body.style.overflow;
    
    // Prevent scrolling during capture
    document.body.style.overflow = 'hidden';
    
    // Hide sticky elements temporarily
    hideFixedElements();
    
    // Disable smooth scrolling
    document.documentElement.style.scrollBehavior = 'auto';
    
    isCapturing = true;
    
    console.log(`💾 Saved scroll position: (${originalScrollX}, ${originalScrollY})`);
  }

  /* ========================================
     SCROLL TO POSITION
  ======================================== */
  
  function scrollToPosition(x, y) {
    if (!isCapturing) {
      console.warn('⚠️ Not in capture mode');
      return;
    }
    
    // Instant scroll (no smooth scrolling)
    window.scrollTo(x, y);
    
    // Force layout recalculation
    document.body.offsetHeight;
    
    console.log(`📍 Scrolled to:  (${x}, ${y})`);
  }

  /* ========================================
     RESTORE SCROLL
  ======================================== */
  
  function restoreScroll() {
    console.log('🔄 Restoring original scroll position.. .');
    
    // Restore scroll position
    window.scrollTo(originalScrollX, originalScrollY);
    
    // Restore overflow
    document.body.style.overflow = originalOverflow;
    
    // Show fixed elements again
    showFixedElements();
    
    // Re-enable smooth scrolling
    document.documentElement.style.scrollBehavior = '';
    
    isCapturing = false;
    
    console. log(`✅ Restored to:  (${originalScrollX}, ${originalScrollY})`);
  }

  /* ========================================
     GET PAGE INFO
  ======================================== */
  
  function getPageInfo() {
    const body = document.body;
    const html = document.documentElement;
    
    const info = {
      // Page dimensions
      width: Math.max(
        body.scrollWidth,
        body.offsetWidth,
        html.clientWidth,
        html.scrollWidth,
        html.offsetWidth
      ),
      height: Math.max(
        body.scrollHeight,
        body.offsetHeight,
        html.clientHeight,
        html.scrollHeight,
        html.offsetHeight
      ),
      
      // Viewport dimensions
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      
      // Current scroll position
      scrollX: window.scrollX || window.pageXOffset,
      scrollY: window.scrollY || window.pageYOffset,
      
      // Device pixel ratio
      devicePixelRatio: window.devicePixelRatio || 1,
      
      // Page metadata
      url: window.location.href,
      title: document.title,
      
      // Timing
      timestamp: Date.now()
    };
    
    console.log('📊 Page info:', info);
    return info;
  }

  /* ========================================
     HIDE/SHOW FIXED ELEMENTS
  ======================================== */
  
  const hiddenElements = new Set();
  
  function hideFixedElements() {
    // Find all fixed/sticky elements
    const fixedElements = document.querySelectorAll('*');
    
    fixedElements.forEach(element => {
      const style = window.getComputedStyle(element);
      const position = style.position;
      
      if (position === 'fixed' || position === 'sticky') {
        // Store original visibility
        element.dataset.originalVisibility = style.visibility;
        element.style.visibility = 'hidden';
        hiddenElements.add(element);
      }
    });
    
    console.log(`👻 Hidden ${hiddenElements.size} fixed/sticky elements`);
  }
  
  function showFixedElements() {
    hiddenElements.forEach(element => {
      // Restore original visibility
      const originalVisibility = element.dataset.originalVisibility;
      if (originalVisibility) {
        element.style.visibility = originalVisibility;
        delete element.dataset.originalVisibility;
      } else {
        element.style.visibility = '';
      }
    });
    
    hiddenElements.clear();
    console.log(' Restored fixed/sticky elements');
  }

  /* ========================================
     UTILITY FUNCTIONS
  ======================================== */
  
  // Smooth scroll to element (for future use)
  function scrollToElement(selector) {
    const element = document.querySelector(selector);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return true;
    }
    return false;
  }
  
  // Get scroll percentage
  function getScrollPercentage() {
    const scrollTop = window.scrollY || window.pageYOffset;
    const documentHeight = document.documentElement.scrollHeight;
    const windowHeight = window.innerHeight;
    const scrollableHeight = documentHeight - windowHeight;
    
    if (scrollableHeight <= 0) return 100;
    
    return Math.round((scrollTop / scrollableHeight) * 100);
  }
  
  // Check if page is scrollable
  function isPageScrollable() {
    const documentHeight = document.documentElement.scrollHeight;
    const windowHeight = window.innerHeight;
    return documentHeight > windowHeight;
  }

  /* ========================================
     AUTO-SCROLL FOR LAZY LOADING
  ======================================== */
  
  async function autoScrollForLazyLoad() {
    console.log('🔄 Auto-scrolling to load lazy content...');
    
    const documentHeight = document.documentElement.scrollHeight;
    const step = window.innerHeight;
    let currentY = 0;
    
    while (currentY < documentHeight) {
      window.scrollTo(0, currentY);
      await new Promise(resolve => setTimeout(resolve, 100));
      currentY += step;
      
      // Check if new content was loaded
      const newHeight = document.documentElement.scrollHeight;
      if (newHeight > documentHeight) {
        console.log(`📈 New content detected:  ${documentHeight}px → ${newHeight}px`);
      }
    }
    
    // Scroll back to top
    window.scrollTo(0, 0);
    console.log('✅ Auto-scroll complete');
  }

  /* ========================================
     EXPOSE PUBLIC API
  ======================================== */
  
  window.__screenshotScrollManager = {
    prepareForCapture,
    scrollToPosition,
    restoreScroll,
    getPageInfo,
    scrollToElement,
    getScrollPercentage,
    isPageScrollable,
    autoScrollForLazyLoad
  };

  /* ========================================
     INITIALIZE ON LOAD
  ======================================== */
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();