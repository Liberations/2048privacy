// Night mode toggle functionality for WebView compatibility
(function() {
  var nightModeActive = false;
  
  function applyNightMode(enable) {
    var html = document.getElementsByTagName('html')[0];
    var body = document.getElementsByTagName('body')[0];
    var toggleBtn = document.getElementById('nightToggle');
    
    if (enable) {
      // Inline fallback (WebView safe)
      html.style.backgroundColor = '#2D302C';
      body.style.backgroundColor = '#2D302C';
      html.style.color = '#eae7df';
      body.style.color = '#eae7df';
      // Class-based theme (browser/WebView that support it)
      try { html.classList.add('night-mode'); body.classList.add('night-mode'); } catch (e) {}
      nightModeActive = true;
      if (toggleBtn) {
        try {
          toggleBtn.textContent = (window.i18n && i18n.get) ? i18n.get('day_mode') : 'Day Mode';
          toggleBtn.setAttribute('aria-pressed', 'true');
        } catch (e) {}
      }
    } else {
      // Reset inline fallback
      html.style.backgroundColor = '#faf8ef';
      body.style.backgroundColor = '#faf8ef';
      html.style.color = '#776e65';
      body.style.color = '#776e65';
      // Remove theme class
      try { html.classList.remove('night-mode'); body.classList.remove('night-mode'); } catch (e) {}
      nightModeActive = false;
      if (toggleBtn) {
        try {
          toggleBtn.textContent = (window.i18n && i18n.get) ? i18n.get('night_mode') : 'Night Mode';
          toggleBtn.setAttribute('aria-pressed', 'false');
        } catch (e) {}
      }
    }
  }
  
  function toggleNightMode() {
    var newMode = !nightModeActive;
    applyNightMode(newMode);
    // Try to save preference, but don't fail if localStorage is blocked
    try {
      localStorage.setItem('nightMode', newMode ? '1' : '0');
    } catch (e) {
      // WebView may block localStorage
    }
  }
  
  function initNightMode() {
    // Load saved preference
    var saved = false;
    try {
      saved = localStorage.getItem('nightMode') === '1';
    } catch (e) {
      // WebView may block localStorage
    }
    
    applyNightMode(saved);
    
    // Bind events with multiple fallback methods
    var toggleBtn = document.getElementById('nightToggle');
    var iconBtn = document.getElementById('nightbtn');
    var iconWrap = document.getElementById('night');
    
    var lastToggleAt = 0;
    function handleOnce(e) {
      try { e.stopPropagation(); } catch (err) {}
      try { e.preventDefault(); } catch (err) {}
      var now = Date.now();
      if (now - lastToggleAt < 350) {
        return false; // debounce to avoid touchend + click double-trigger
      }
      lastToggleAt = now;
      toggleNightMode();
      return false;
    }

    function bindClick(element) {
      if (!element) return;
      // onclick fallback
      element.onclick = handleOnce;
      // Prefer click and touchend only (avoid touchstart to prevent double toggle)
      try { element.addEventListener('click', handleOnce, true); } catch (e) {}
      try { element.addEventListener('touchend', handleOnce, true); } catch (e) {}
    }
    
    // Bind to all possible elements
    bindClick(toggleBtn);
    bindClick(iconBtn);
    bindClick(iconWrap);
  }
  
  // Multiple initialization attempts for WebView compatibility
  function tryInit() {
    try {
      initNightMode();
    } catch (e) {
      // Retry after a short delay
      setTimeout(tryInit, 100);
    }
  }
  
  // Initialize immediately if possible
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    tryInit();
  } else {
    // Wait for DOM
    if (document.addEventListener) {
      document.addEventListener('DOMContentLoaded', tryInit);
    }
    if (window.addEventListener) {
      window.addEventListener('load', tryInit);
    }
  }
  
  // Fallback: try again after a delay
  setTimeout(tryInit, 500);

  // Expose for native WebView to call
  try { window.__toggleNightMode = function() { tryInit(); toggleNightMode && toggleNightMode(); }; } catch (e) {}
})();
