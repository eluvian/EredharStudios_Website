// ===================================
// OVERLAY SYSTEM
// ===================================

let currentOverlay = null;

function showOverlay(overlayId) {
  // Close current overlay if one is open
  if (currentOverlay) {
    closeOverlay();
  }
  
  // Show the requested overlay
  const overlay = document.getElementById(overlayId);
  if (overlay) {
    overlay.classList.add('active');
    currentOverlay = overlayId;
    
    // Update navigation button active states
    updateNavButtons(overlayId);
    
    // Update specific overlay content if needed
    if (overlayId === 'researchOverlay') {
      updateResearchDisplay();
    } else if (overlayId === 'statsOverlay') {
      updateStatisticsDisplay();
    }
    
    debugLog('OVERLAY', 'Opened overlay', overlayId);
  }
}

function closeOverlay() {
  if (currentOverlay) {
    const overlay = document.getElementById(currentOverlay);
    if (overlay) {
      overlay.classList.remove('active');
    }
    currentOverlay = null;
    
    // Remove all active states from nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    
    debugLog('OVERLAY', 'Closed overlay');
  }
}

function updateNavButtons(overlayId) {
  // Remove active from all buttons
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Map overlay IDs to navigation button IDs
  const navMapping = {
    'buildingsOverlay': 'navBuildings',
    'statsOverlay': 'navStats',
    'eventsOverlay': 'navEvents',
    'tradeOverlay': 'navTrade',
    'researchOverlay': 'navResearch',
    'aboutOverlay': 'navAbout'
  };
  
  // Add active to the corresponding button
  const buttonId = navMapping[overlayId];
  if (buttonId) {
    const button = document.getElementById(buttonId);
    if (button) {
      button.classList.add('active');
    }
  }
}

// Click outside overlay to close
document.addEventListener('click', (e) => {
  if (currentOverlay && e.target.classList.contains('game-viewport')) {
    closeOverlay();
  }
});

// ESC key to close overlay
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && currentOverlay) {
    closeOverlay();
  }
});

// Legacy function compatibility (for old popup system)
function showResearch() {
  showOverlay('researchOverlay');
}

function hideResearch() {
  closeOverlay();
}

function showStatistics() {
  showOverlay('statsOverlay');
}

function hideStatistics() {
  closeOverlay();
}

function showAbout() {
  showOverlay('aboutOverlay');
}

function hideAbout() {
  closeOverlay();
}
