// ===================================
// SAVE/LOAD FUNCTIONS
// ===================================

function saveGame() {
  try {
    gameState.lastSaveTime = Date.now();
    const saveData = JSON.stringify(gameState);
    localStorage.setItem('medievalKingdomSave', saveData);
    debugLog('SAVE', 'Game saved successfully', { size: saveData.length });
  } catch (e) {
    console.error('Failed to save game:', e);
    debugLog('ERROR', 'Save failed', e);
  }
}

function migrateSaveData(loaded) {
  const oldVersion = loaded.version || "1.0.0";
  let migrated = false;
  
  if (loaded.research === undefined) {
    loaded.research = 0;
    migrated = true;
  }
  
  if (!loaded.buildings.library) {
    loaded.buildings.library = 0;
    migrated = true;
  }
  
  if (!loaded.technologies) {
    loaded.technologies = {};
    migrated = true;
  }
  
  if (loaded.statistics && loaded.statistics.technologiesPurchased === undefined) {
    loaded.statistics.technologiesPurchased = 0;
    migrated = true;
  }
  
  loaded.version = GAME_VERSION;
  
  if (migrated) {
    debugLog('MIGRATION', `Save data migrated from v${oldVersion} to v${GAME_VERSION}`);
  }
  
  return loaded;
}

function loadGame() {
  try {
    const saveData = localStorage.getItem('medievalKingdomSave');
    if (saveData) {
      let loaded = JSON.parse(saveData);
      
      loaded = migrateSaveData(loaded);
      
      const now = Date.now();
      const timeSinceLastSave = (now - loaded.lastSaveTime) / 1000;
      
      if (timeSinceLastSave > 5) {
        calculateOfflineProgress(loaded, timeSinceLastSave);
      }
      
      Object.assign(gameState, loaded);
      gameState.activeEvent = null;
      gameState.paused = false;
      gameState.gameOver = false;
      
      debugLog('LOAD', 'Game loaded successfully');
      
      return true;
    }
  } catch (e) {
    console.error('Failed to load game:', e);
    debugLog('ERROR', 'Load failed', e);
  }
  return false;
}

function calculateOfflineProgress(savedState, timeAway) {
  const cappedTime = Math.min(timeAway, BALANCE.MAX_OFFLINE_TIME);
  
  const tempTechs = savedState.technologies || {};
  const oldTechs = gameState.technologies;
  gameState.technologies = tempTechs;
  
  const farmMultiplier = getFarmMultiplier();
  const marketMultiplier = getMarketMultiplier();
  
  gameState.technologies = oldTechs;
  
  const farmRate = savedState.buildings.farm * BALANCE.FARM_FOOD_RATE * farmMultiplier;
  const marketRate = savedState.buildings.market * BALANCE.MARKET_GOLD_RATE * marketMultiplier;
  const libraryRate = savedState.buildings.library * BALANCE.LIBRARY_RESEARCH_RATE;
  const popTax = savedState.population * BALANCE.POPULATION_TAX_RATE;
  const foodConsumption = savedState.population * BALANCE.POPULATION_FOOD_CONSUMPTION;
  
  const netFoodRate = farmRate - foodConsumption;
  const netGoldRate = marketRate + popTax;
  
  const offlineGold = Math.max(0, netGoldRate * cappedTime);
  const offlineFood = Math.max(0, netFoodRate * cappedTime);
  const offlineResearch = Math.max(0, libraryRate * cappedTime);
  
  let offlinePopulation = 0;
  if (savedState.food > 20 && savedState.population < savedState.maxPopulation) {
    const avgPopGrowth = 0.1 * getPopGrowthMultiplier();
    offlinePopulation = Math.min(
      avgPopGrowth * cappedTime,
      savedState.maxPopulation - savedState.population
    );
  }
  
  showWelcomeBack(cappedTime, offlineGold, offlineFood, offlinePopulation, offlineResearch);
  
  savedState.gold += offlineGold;
  savedState.food += offlineFood;
  savedState.research += offlineResearch;
  savedState.population = Math.min(
    savedState.population + offlinePopulation,
    savedState.maxPopulation
  );
  savedState.time += cappedTime;
  savedState.totalTimePlayed += cappedTime;
  
  savedState.statistics.totalGoldEarned += offlineGold;
  savedState.statistics.totalFoodProduced += offlineFood;
  savedState.statistics.maxPopulationReached = Math.max(
    savedState.statistics.maxPopulationReached,
    Math.floor(savedState.population)
  );
}

function showWelcomeBack(timeAway, gold, food, population, research) {
  const popup = document.getElementById('eventPopup');
  document.getElementById('eventTitle').textContent = '🏰 Welcome Back!';
  
  const timeAwayFormatted = formatTime(timeAway);
  let description = `You were away for ${timeAwayFormatted}.\n\nWhile you were gone, your kingdom produced:\n\n`;
  
  if (gold > 0) description += `💰 +${Math.floor(gold)} Gold\n`;
  if (food > 0) description += `🌾 +${Math.floor(food)} Food\n`;
  if (population > 0) description += `👥 +${Math.floor(population)} Population\n`;
  if (research > 0) description += `📚 +${Math.floor(research)} Research\n`;
  
  if (gold === 0 && food === 0 && population === 0 && research === 0) {
    description = `You were away for ${timeAwayFormatted}.\n\nYour kingdom maintained its current state.`;
  }
  
  document.getElementById('eventDescription').textContent = description;
  
  const choicesDiv = document.getElementById('eventChoices');
  choicesDiv.innerHTML = '';
  
  const button = document.createElement('button');
  button.className = 'event-choice-btn';
  button.textContent = 'Continue Ruling';
  button.onclick = () => {
    popup.classList.remove('active');
    gameState.paused = false;
  };
  
  choicesDiv.appendChild(button);
  popup.classList.add('active');
  gameState.paused = true;
}

function loadAllTimeStats() {
  try {
    const saved = localStorage.getItem('medievalKingdomAllTime');
    if (saved) {
      Object.assign(allTimeStats, JSON.parse(saved));
    }
    const savedAchievements = localStorage.getItem('medievalKingdomAchievements');
    if (savedAchievements) {
      unlockedAchievements = JSON.parse(savedAchievements);
    }
    debugLog('LOAD', 'All-time stats loaded');
  } catch (e) {
    console.error('Failed to load all-time stats:', e);
    debugLog('ERROR', 'All-time stats load failed', e);
  }
}

function saveAllTimeStats() {
  try {
    localStorage.setItem('medievalKingdomAllTime', JSON.stringify(allTimeStats));
    localStorage.setItem('medievalKingdomAchievements', JSON.stringify(unlockedAchievements));
    debugLog('SAVE', 'All-time stats saved');
  } catch (e) {
    console.error('Failed to save all-time stats:', e);
    debugLog('ERROR', 'All-time stats save failed', e);
  }
}

function updateAllTimeStats() {
  allTimeStats.longestSurvival = Math.max(allTimeStats.longestSurvival, Math.floor(gameState.time));
  allTimeStats.totalGoldEarned = Math.max(allTimeStats.totalGoldEarned, gameState.statistics.totalGoldEarned);
  allTimeStats.totalFoodProduced = Math.max(allTimeStats.totalFoodProduced, gameState.statistics.totalFoodProduced);
  allTimeStats.totalBuildingsBuilt = Math.max(allTimeStats.totalBuildingsBuilt, gameState.statistics.totalBuildingsBuilt);
  allTimeStats.highestPopulation = Math.max(allTimeStats.highestPopulation, gameState.statistics.maxPopulationReached);
  saveAllTimeStats();
}
