// ===================================
// ACHIEVEMENT DEFINITIONS
// ===================================

const achievements = [
  // Survival Achievements
  { id: 'survive_5min', icon: '🥉', name: 'First Steps', desc: 'Survive 5 minutes', check: () => gameState.time >= 300 },
  { id: 'survive_15min', icon: '🥈', name: 'Endurance', desc: 'Survive 15 minutes', check: () => gameState.time >= 900 },
  { id: 'survive_30min', icon: '🥇', name: 'Resilient', desc: 'Survive 30 minutes', check: () => gameState.time >= 1800 },
  { id: 'survive_1hour', icon: '💎', name: 'Legendary', desc: 'Survive 1 hour', check: () => gameState.time >= 3600 },
  
  // Building Achievements
  { id: 'build_5', icon: '🗺️', name: 'Architect', desc: 'Build 5 buildings', check: () => gameState.statistics.totalBuildingsBuilt >= 5 },
  { id: 'build_20', icon: '🏙️', name: 'Town Planner', desc: 'Build 20 buildings', check: () => gameState.statistics.totalBuildingsBuilt >= 20 },
  { id: 'build_50', icon: '🏰', name: 'Master Builder', desc: 'Build 50 buildings (all-time)', check: () => allTimeStats.totalBuildingsBuilt >= 50 },
  
  // Population Achievements
  { id: 'pop_25', icon: '👥', name: 'Village', desc: 'Reach 25 population', check: () => gameState.statistics.maxPopulationReached >= 25 },
  { id: 'pop_50', icon: '🏙️', name: 'Town', desc: 'Reach 50 population', check: () => gameState.statistics.maxPopulationReached >= 50 },
  { id: 'pop_100', icon: '👑', name: 'Kingdom', desc: 'Reach 100 population', check: () => gameState.statistics.maxPopulationReached >= 100 },
  
  // Resource Achievements
  { id: 'gold_1000', icon: '💰', name: 'Wealthy', desc: 'Earn 1000 gold', check: () => gameState.statistics.totalGoldEarned >= 1000 },
  { id: 'gold_10000', icon: '💎', name: 'Prosperous', desc: 'Earn 10000 gold (all-time)', check: () => allTimeStats.totalGoldEarned >= 10000 },
  { id: 'food_1000', icon: '🌾', name: 'Well Fed', desc: 'Produce 1000 food', check: () => gameState.statistics.totalFoodProduced >= 1000 },
  
  // Technology Achievements
  { id: 'tech_1', icon: '🔬', name: 'Scholar', desc: 'Research 1 technology', check: () => gameState.statistics.technologiesPurchased >= 1 },
  { id: 'tech_5', icon: '📚', name: 'Innovator', desc: 'Research 5 technologies', check: () => gameState.statistics.technologiesPurchased >= 5 },
  { id: 'tech_all', icon: '🎓', name: 'Renaissance', desc: 'Research all technologies', check: () => gameState.statistics.technologiesPurchased >= Object.keys(technologies).length },
  
  // Specific Building Achievements
  { id: 'farm_10', icon: '🌾', name: 'Farmer King', desc: 'Build 10 farms', check: () => gameState.buildings.farm >= 10 },
  { id: 'house_10', icon: '🏠', name: 'Housing Baron', desc: 'Build 10 houses', check: () => gameState.buildings.house >= 10 },
  { id: 'library_5', icon: '📚', name: 'Enlightened', desc: 'Build 5 libraries', check: () => gameState.buildings.library >= 5 },
  { id: 'barracks_5', icon: '⚔️', name: 'Warlord', desc: 'Build 5 barracks', check: () => gameState.buildings.barracks >= 5 },
  { id: 'temple_5', icon: '⛪', name: 'Faithful', desc: 'Build 5 temples', check: () => gameState.buildings.temple >= 5 },
  
  // Defense & Faith Achievements
  { id: 'repel_raid', icon: '🛡️', name: 'Defender', desc: 'Successfully repel a raid', check: () => gameState.statistics.raidsRepelled >= 1 },
  { id: 'repel_10_raids', icon: '🏰', name: 'Fortress', desc: 'Repel 10 raids (all-time)', check: () => allTimeStats.totalRaidsRepelled >= 10 },
  { id: 'heal_disease', icon: '✨', name: 'Healer', desc: 'Reduce disease impact with faith', check: () => gameState.statistics.diseasesHealed >= 1 },
  
  // Special Achievements
  { id: 'games_10', icon: '🔄', name: 'Persistent', desc: 'Play 10 games', check: () => allTimeStats.gamesPlayed >= 10 },
  { id: 'defense_50', icon: '🛡️', name: 'Impenetrable', desc: 'Reach 50 defense', check: () => gameState.defense >= 50 },
  { id: 'faith_30', icon: '✨', name: 'Divine', desc: 'Reach 30 faith', check: () => gameState.faith >= 30 }
];

let unlockedAchievements = [];

// ===================================
// ACHIEVEMENT FUNCTIONS
// ===================================

function checkAchievements() {
  let newUnlocks = false;
  achievements.forEach(achievement => {
    if (!unlockedAchievements.includes(achievement.id) && achievement.check()) {
      unlockedAchievements.push(achievement.id);
      newUnlocks = true;
      showAchievementToast(achievement);
      debugLog('ACHIEVEMENT', 'Unlocked', achievement.name);
    }
  });
  if (newUnlocks) {
    saveAllTimeStats();
  }
}

function showAchievementToast(achievement) {
  const toast = document.createElement('div');
  toast.style.position = 'fixed';
  toast.style.bottom = '20px';
  toast.style.right = '20px';
  toast.style.backgroundColor = '#161621';
  toast.style.border = '2px solid #ffe082';
  toast.style.borderRadius = '8px';
  toast.style.padding = '15px 20px';
  toast.style.zIndex = '2000';
  toast.style.boxShadow = '0 0 20px rgba(255, 224, 130, 0.5)';
  toast.style.animation = 'slideInRight 0.3s ease';
  toast.innerHTML = `
    <div style="display: flex; align-items: center; gap: 15px;">
      <div style="font-size: 2rem;">${achievement.icon}</div>
      <div>
        <div style="color: #ffe082; font-weight: bold; margin-bottom: 4px;">Achievement Unlocked!</div>
        <div style="color: #f5f5f5; font-size: 0.9rem;">${achievement.name}</div>
        <div style="color: #ccc; font-size: 0.8rem;">${achievement.desc}</div>
      </div>
    </div>
  `;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
