// ===================================
// INITIALIZATION
// ===================================

const sellAmountInput = document.getElementById('sellAmount');
if (sellAmountInput) {
  sellAmountInput.addEventListener('input', updateDisplay);
}

loadAllTimeStats();
const hasLoadedGame = loadGame();

// Initialize lastUpdateTime to current time
gameState.lastUpdateTime = Date.now();

gameInterval = setInterval(gameLoop, BALANCE.GAME_LOOP_INTERVAL);
updateEventLog();
updateDisplay();

debugLog('GAME', 'Game initialized', { version: GAME_VERSION, loadedSave: hasLoadedGame });
