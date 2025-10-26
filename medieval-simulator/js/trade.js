// ===================================
// TRADE FUNCTIONS
// ===================================

function sellFood() {
  const inputValue = document.getElementById('sellAmount').value;
  let amount = parseInt(inputValue) || 0;
  
  amount = Math.max(0, Math.min(amount, Math.floor(gameState.food)));
  
  document.getElementById('sellAmount').value = amount;
  
  if (amount > 0 && !gameState.gameOver) {
    gameState.food -= amount;
    gameState.gold += amount * BALANCE.FOOD_TO_GOLD_RATE;
    
    showResourceChange(`Sold ${amount} food for ${(amount * BALANCE.FOOD_TO_GOLD_RATE).toFixed(1)} gold`);
    
    debugLog('TRADE', 'Sold food', { amount, gold: amount * BALANCE.FOOD_TO_GOLD_RATE });
    
    saveGame();
    updateDisplay();
  }
}

function quickSell(amount) {
  if (amount === 'all') {
    document.getElementById('sellAmount').value = Math.floor(gameState.food);
  } else {
    document.getElementById('sellAmount').value = amount;
  }
  sellFood();
}
