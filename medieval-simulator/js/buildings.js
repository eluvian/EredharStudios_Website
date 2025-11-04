// ===================================
// BUILDING DEFINITIONS & FUNCTIONS
// ===================================

const buildings = {
  farm: { baseCost: BALANCE.FARM_BASE_COST, foodRate: BALANCE.FARM_FOOD_RATE },
  house: { baseCost: BALANCE.HOUSE_BASE_COST, popIncrease: BALANCE.HOUSE_POPULATION },
  market: { baseCost: BALANCE.MARKET_BASE_COST, goldRate: BALANCE.MARKET_GOLD_RATE },
  library: { baseCost: BALANCE.LIBRARY_BASE_COST, researchRate: BALANCE.LIBRARY_RESEARCH_RATE },
  barracks: { baseCost: BALANCE.BARRACKS_BASE_COST, defenseRate: BALANCE.BARRACKS_DEFENSE_RATE },
  temple: { baseCost: BALANCE.TEMPLE_BASE_COST, faithRate: BALANCE.TEMPLE_FAITH_RATE }
};

function getBuildingCost(type) {
  const basePrice = buildings[type].baseCost;
  const owned = gameState.buildings[type];
  return Math.floor(basePrice * Math.pow(BALANCE.BUILDING_COST_MULTIPLIER, owned));
}

function getPopGrowthRate() {
  // Allow growth from 0 population, but prevent going negative
  if (gameState.population < 0) return 0;
  
  // Starvation causes population loss
  if (gameState.food < BALANCE.FOOD_STARVATION_THRESHOLD) return BALANCE.POPULATION_STARVATION_PENALTY;
  
  // Can't grow beyond capacity
  if (gameState.population >= gameState.maxPopulation) return 0;
  
  // Calculate growth rate based on food availability
  const food = gameState.food;
  let baseRate = BALANCE.POP_GROWTH_RATE_NONE;
  if (food < BALANCE.FOOD_GROWTH_THRESHOLD_LOW) baseRate = BALANCE.POP_GROWTH_RATE_NONE;
  else if (food < BALANCE.FOOD_GROWTH_THRESHOLD_MED) baseRate = BALANCE.POP_GROWTH_RATE_LOW;
  else if (food < BALANCE.FOOD_GROWTH_THRESHOLD_HIGH) baseRate = BALANCE.POP_GROWTH_RATE_MED;
  else baseRate = BALANCE.POP_GROWTH_RATE_HIGH;
  
  return baseRate * getPopGrowthMultiplier();
}

function calculateRates() {
  const farmMultiplier = getFarmMultiplier();
  const marketMultiplier = getMarketMultiplier();
  
  const farms = gameState.buildings.farm || 0;
  const markets = gameState.buildings.market || 0;
  const libraries = gameState.buildings.library || 0;
  const barracks = gameState.buildings.barracks || 0;
  const temples = gameState.buildings.temple || 0;
  const population = gameState.population || 0;
  
  const foodRate = farms * buildings.farm.foodRate * farmMultiplier - population * BALANCE.POPULATION_FOOD_CONSUMPTION;
  const goldRate = markets * buildings.market.goldRate * marketMultiplier + population * BALANCE.POPULATION_TAX_RATE;
  const researchRate = libraries * buildings.library.researchRate;
  const defenseRate = barracks * buildings.barracks.defenseRate;
  const faithRate = temples * buildings.temple.faithRate;
  const popRate = getPopGrowthRate();
  
  return { foodRate, goldRate, researchRate, defenseRate, faithRate, popRate };
}

function getDefenseReduction() {
  const defense = gameState.defense || 0;
  const reduction = Math.min(defense * BALANCE.DEFENSE_RAID_REDUCTION_RATE, BALANCE.DEFENSE_MAX_REDUCTION);
  return reduction;
}

function getFaithReduction() {
  const faith = gameState.faith || 0;
  const reduction = Math.min(faith * BALANCE.FAITH_EVENT_REDUCTION_RATE, BALANCE.FAITH_MAX_REDUCTION);
  return reduction;
}

function buyBuilding(type) {
  const buttonId = `buy_${type}`;
  
  if (isButtonOnCooldown(buttonId)) return;
  setButtonCooldown(buttonId);
  
  const cost = getBuildingCost(type);
  
  if (gameState.gold >= cost && !gameState.gameOver) {
    gameState.gold -= cost;
    gameState.buildings[type]++;
    gameState.statistics.totalBuildingsBuilt++;
    
    if (type === 'house') {
      const houseBonus = getHouseBonus();
      gameState.maxPopulation += buildings.house.popIncrease + houseBonus;
    }
    
    const typeName = type.charAt(0).toUpperCase() + type.slice(1);
    showResourceChange(`Built ${typeName}!`);
    
    debugLog('BUILDING', `Built ${type}`, { cost, total: gameState.buildings[type] });
    
    saveGame();
    updateDisplay();
    checkAchievements();
  }
}
