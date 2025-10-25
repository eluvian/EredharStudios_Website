// ===================================
// INITIALIZATION
// ===================================

document.getElementById('sellAmount').addEventListener('input', updateDisplay);

loadAllTimeStats();
const hasLoadedGame = loadGame();

gameInterval = setInterval(gameLoop, BALANCE.GAME_LOOP_INTERVAL);
updateEventLog();
updateDisplay();

debugLog('GAME', 'Game initialized', { version: GAME_VERSION, loadedSave: hasLoadedGame });
