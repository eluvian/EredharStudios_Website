// ===================================
// GAME LOOP
// ===================================

function gameLoop() {
  if (gameState.gameOver || gameState.paused) return;
  
  const rates = calculateRates();
  const delta = BALANCE.GAME_LOOP_INTERVAL / 1000;
  
  const prevGold = gameState.gold;
  const prevFood = gameState.food;
  
  gameState.gold += rates.goldRate * delta;
  gameState.food += rates.foodRate * delta;
  gameState.research += rates.researchRate * delta;
  gameState.population += rates.popRate * delta;
  gameState.time += delta;
  gameState.totalTimePlayed += delta;
  
  if (gameState.gold > prevGold) {
    gameState.statistics.totalGoldEarned += (gameState.gold - prevGold);
  }
  if (gameState.food > prevFood) {
    gameState.statistics.totalFoodProduced += (gameState.food - prevFood);
  }
  gameState.statistics.maxPopulationReached = Math.max(
    gameState.statistics.maxPopulationReached,
    Math.floor(gameState.population)
  );
  gameState.statistics.longestSurvival = Math.max(
    gameState.statistics.longestSurvival,
    Math.floor(gameState.time)
  );
  
  gameState.gold = Math.max(0, gameState.gold);
  gameState.food = Math.max(0, gameState.food);
  gameState.research = Math.max(0, gameState.research);
  gameState.population = Math.max(0, Math.min(gameState.population, gameState.maxPopulation));
  
  if (gameState.population >= 1) {
    gameState.hasHadPopulation = true;
  }
  
  if (Math.floor(gameState.time * 10) % (BALANCE.SAVE_INTERVAL / 100) === 0) {
    saveGame();
    updateAllTimeStats();
    checkAchievements();
  }
  
  const timeSinceLastEvent = gameState.time - gameState.lastEventTime;
  
  if (timeSinceLastEvent >= gameState.nextEventInterval && !gameState.activeEvent && gameState.time > BALANCE.EVENT_START_DELAY) {
    triggerRandomEvent();
    gameState.lastEventTime = gameState.time;
    gameState.nextEventInterval = BALANCE.EVENT_MIN_INTERVAL + Math.random() * (BALANCE.EVENT_MAX_INTERVAL - BALANCE.EVENT_MIN_INTERVAL);
  }
  
  if (gameState.hasHadPopulation && gameState.population < 0.1) {
    endGame();
  }
  
  updateDisplay();
}

// ===================================
// GAME END/RESTART
// ===================================

function endGame() {
  gameState.gameOver = true;
  clearInterval(gameInterval);
  
  updateAllTimeStats();
  allTimeStats.gamesPlayed++;
  saveAllTimeStats();
  checkAchievements();
  
  debugLog('GAME', 'Game over', { time: gameState.time, buildings: gameState.statistics.totalBuildingsBuilt });
  
  document.getElementById('finalStats').innerHTML = 
    `You survived <strong style="color: var(--gold)">${formatTime(gameState.time)}</strong><br>` +
    `Built <strong style="color: var(--gold)">${gameState.buildings.farm + gameState.buildings.house + gameState.buildings.market + gameState.buildings.library}</strong> buildings<br>` +
    `Reached <strong style="color: var(--gold)">${Math.floor(gameState.population)}</strong> population<br>` +
    `Researched <strong style="color: var(--purple)">${gameState.statistics.technologiesPurchased}</strong> technologies`;
  document.getElementById('gameOver').classList.add('active');
}

function restartGame() {
  localStorage.removeItem('medievalKingdomSave');
  
  gameState = {
    version: GAME_VERSION,
    gold: BALANCE.STARTING_GOLD,
    food: 0,
    population: 0,
    maxPopulation: BALANCE.STARTING_MAX_POPULATION,
    research: 0,
    buildings: {
      farm: 0,
      house: 0,
      market: 0,
      library: 0
    },
    technologies: {},
    time: 0,
    gameOver: false,
    hasHadPopulation: false,
    paused: false,
    lastEventTime: 0,
    nextEventInterval: BALANCE.EVENT_MIN_INTERVAL + Math.random() * (BALANCE.EVENT_MAX_INTERVAL - BALANCE.EVENT_MIN_INTERVAL),
    activeEvent: null,
    eventLog: [],
    lastSaveTime: Date.now(),
    totalTimePlayed: 0,
    statistics: {
      totalGoldEarned: 0,
      totalFoodProduced: 0,
      totalBuildingsBuilt: 0,
      maxPopulationReached: 0,
      longestSurvival: 0,
      technologiesPurchased: 0
    }
  };
  
  document.getElementById('gameOver').classList.remove('active');
  document.getElementById('eventPopup').classList.remove('active');
  closeOverlay();
  updateEventLog();
  updateDisplay();
  gameInterval = setInterval(gameLoop, BALANCE.GAME_LOOP_INTERVAL);
  saveGame();
  
  debugLog('GAME', 'Game restarted');
}
