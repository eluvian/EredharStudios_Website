// ===================================
// UTILITY FUNCTIONS
// ===================================

function debugLog(category, message, data = null) {
  if (!DEBUG_MODE) return;
  
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  console.log(`[${timestamp}] [${category}]`, message, data || '');
}

function isButtonOnCooldown(buttonId) {
  const lastClick = buttonCooldowns.get(buttonId);
  if (!lastClick) return false;
  return Date.now() - lastClick < BALANCE.BUTTON_COOLDOWN;
}

function setButtonCooldown(buttonId) {
  buttonCooldowns.set(buttonId, Date.now());
}

function formatTime(seconds) {
  const totalSeconds = Math.floor(seconds);
  
  if (totalSeconds < 1) {
    return 'Just started';
  }
  
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

function showResourceChange(message) {
  const feedback = document.createElement('div');
  feedback.style.position = 'fixed';
  feedback.style.top = '50%';
  feedback.style.left = '50%';
  feedback.style.transform = 'translate(-50%, -50%)';
  feedback.style.backgroundColor = 'rgba(22, 22, 33, 0.95)';
  feedback.style.color = '#ffe082';
  feedback.style.padding = '15px 30px';
  feedback.style.borderRadius = '8px';
  feedback.style.border = '2px solid #ffe082';
  feedback.style.zIndex = '9999';
  feedback.style.fontSize = '1.1rem';
  feedback.style.fontWeight = 'bold';
  feedback.textContent = message;
  document.body.appendChild(feedback);
  
  setTimeout(() => {
    feedback.style.transition = 'opacity 0.3s ease';
    feedback.style.opacity = '0';
    setTimeout(() => feedback.remove(), 300);
  }, 1500);
}

// ===================================
// DISPLAY FUNCTIONS
// ===================================

function updateDisplay() {
  const rates = calculateRates();
  
  document.getElementById('gold').textContent = Math.floor(gameState.gold);
  document.getElementById('food').textContent = Math.floor(gameState.food);
  document.getElementById('population').textContent = Math.floor(gameState.population);
  document.getElementById('research').textContent = Math.floor(gameState.research);
  document.getElementById('time').textContent = formatTime(gameState.time);
  
  document.getElementById('goldRate').textContent = `${rates.goldRate >= 0 ? '+' : ''}${rates.goldRate.toFixed(1)}/sec`;
  document.getElementById('foodRate').textContent = `${rates.foodRate >= 0 ? '+' : ''}${rates.foodRate.toFixed(1)}/sec`;
  document.getElementById('researchRate').textContent = `${rates.researchRate >= 0 ? '+' : ''}${rates.researchRate.toFixed(1)}/sec`;
  
  // Show 0 growth when population is 0 (cleaner display than negative)
  const displayPopRate = (gameState.population <= 0 && rates.popRate < 0) ? 0 : rates.popRate;
  document.getElementById('popRate').textContent = `${displayPopRate >= 0 ? '+' : ''}${displayPopRate.toFixed(2)}/sec`;
  
  const farmMultiplier = getFarmMultiplier();
  const marketMultiplier = getMarketMultiplier();
  const houseBonus = getHouseBonus();
  
  const foodProduction = gameState.buildings.farm * buildings.farm.foodRate * farmMultiplier;
  const foodConsumption = gameState.population * BALANCE.POPULATION_FOOD_CONSUMPTION;
  const netFood = foodProduction - foodConsumption;
  const taxIncome = gameState.population * BALANCE.POPULATION_TAX_RATE;
  
  document.getElementById('summaryPopulation').textContent = Math.floor(gameState.population);
  document.getElementById('summaryTaxIncome').textContent = `+${taxIncome.toFixed(2)}/sec`;
  document.getElementById('summaryFoodConsume').textContent = `-${foodConsumption.toFixed(1)}/sec`;
  document.getElementById('summaryFarms').textContent = gameState.buildings.farm;
  document.getElementById('summaryHouses').textContent = gameState.buildings.house;
  document.getElementById('summaryMarkets').textContent = gameState.buildings.market;
  document.getElementById('summaryLibraries').textContent = gameState.buildings.library;
  document.getElementById('summaryFoodProd').textContent = 
    `Net: ${netFood >= 0 ? '+' : ''}${netFood.toFixed(1)}/sec (${foodProduction.toFixed(1)} - ${foodConsumption.toFixed(1)})`;
  document.getElementById('summaryPopCap').textContent = gameState.maxPopulation;
  document.getElementById('summaryGoldIncome').textContent = `+${(gameState.buildings.market * buildings.market.goldRate * marketMultiplier).toFixed(1)}/sec`;
  document.getElementById('summaryResearchRate').textContent = `+${rates.researchRate.toFixed(1)}/sec`;
  
  document.getElementById('farmCount').textContent = gameState.buildings.farm;
  document.getElementById('houseCount').textContent = gameState.buildings.house;
  document.getElementById('marketCount').textContent = gameState.buildings.market;
  document.getElementById('libraryCount').textContent = gameState.buildings.library;
  
  const farmCost = getBuildingCost('farm');
  const houseCost = getBuildingCost('house');
  const marketCost = getBuildingCost('market');
  const libraryCost = getBuildingCost('library');
  
  const farmProduction = (buildings.farm.foodRate * farmMultiplier).toFixed(1);
  const marketIncome = (buildings.market.goldRate * marketMultiplier).toFixed(1);
  const housePop = buildings.house.popIncrease + houseBonus;
  
  document.getElementById('farmCost').textContent = `Cost: ${farmCost} Gold | +${farmProduction} Food/sec`;
  document.getElementById('houseCost').textContent = `Cost: ${houseCost} Gold | +${housePop} Max Pop`;
  document.getElementById('marketCost').textContent = `Cost: ${marketCost} Gold | +${marketIncome} Gold/sec`;
  document.getElementById('libraryCost').textContent = `Cost: ${libraryCost} Gold | +0.1 Research/sec`;
  
  document.querySelectorAll('.buy-btn').forEach((btn, index) => {
    const types = ['farm', 'house', 'market', 'library'];
    const cost = getBuildingCost(types[index]);
    btn.disabled = gameState.gold < cost;
  });
  
  const sellAmount = parseInt(document.getElementById('sellAmount').value) || 0;
  document.getElementById('sellBtn').disabled = sellAmount <= 0 || sellAmount > gameState.food;
  document.getElementById('sellBtn').textContent = 
    `Sell ${sellAmount} Food → +${(sellAmount * BALANCE.FOOD_TO_GOLD_RATE).toFixed(1)} Gold`;
}
