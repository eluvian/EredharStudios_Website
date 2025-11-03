// ===================================
// POPUP/OVERLAY FUNCTIONS
// ===================================

// Research Display
function updateResearchDisplay() {
  document.getElementById('researchAvailable').textContent = Math.floor(gameState.research);
  
  const tier1 = Object.values(technologies).filter(t => t.tier === 1);
  const tier2 = Object.values(technologies).filter(t => t.tier === 2);
  const tier3 = Object.values(technologies).filter(t => t.tier === 3);
  
  renderTechTier('tier1Grid', tier1);
  renderTechTier('tier2Grid', tier2);
  renderTechTier('tier3Grid', tier3);
}

function renderTechTier(gridId, techs) {
  const grid = document.getElementById(gridId);
  if (!grid) return;
  
  grid.innerHTML = '';
  
  techs.forEach(tech => {
    const isPurchased = hasTech(tech.id);
    const canPurchase = canPurchaseTech(tech);
    const isLocked = !canPurchase && !isPurchased;
    
    const card = document.createElement('div');
    card.className = `tech-card ${isPurchased ? 'tech-purchased' : ''} ${isLocked ? 'tech-locked' : ''}`;
    
    let requirementText = '';
    if (tech.requires && !hasTech(tech.requires)) {
      const reqTech = technologies[tech.requires];
      requirementText = `<div class="tech-requirement">Requires: ${reqTech.name}</div>`;
    }
    
    let costText = isPurchased ? 'RESEARCHED ✓' : `${tech.cost} RP`;
    
    card.innerHTML = `
      <div class="tech-icon">${tech.icon}</div>
      <div class="tech-name">${tech.name}</div>
      <div class="tech-desc">${tech.desc}</div>
      <div class="tech-cost">${costText}</div>
      ${requirementText}
    `;
    
    if (canPurchase) {
      card.style.cursor = 'pointer';
      card.onclick = () => purchaseTechnology(tech.id);
    }
    
    grid.appendChild(card);
  });
}

// Statistics Display - FIXED VERSION
function updateStatisticsDisplay() {
  // Update all-time statistics (these IDs DO exist in the HTML)
  document.getElementById('statAllTimeTime').textContent = formatTime(allTimeStats.longestSurvival);
  document.getElementById('statAllTimeGold').textContent = Math.floor(allTimeStats.totalGoldEarned).toLocaleString();
  document.getElementById('statAllTimeFood').textContent = Math.floor(allTimeStats.totalFoodProduced).toLocaleString();
  document.getElementById('statAllTimeBuildings').textContent = allTimeStats.totalBuildingsBuilt;
  document.getElementById('statAllTimePopulation').textContent = allTimeStats.highestPopulation;

  // Update achievements list
  const achievementsList = document.getElementById('achievementsList');
  if (!achievementsList) return;
  
  achievementsList.innerHTML = '';
  
  const extractTarget = (desc) => {
    const cleanDesc = desc.replace(/,/g, '');
    const match = cleanDesc.match(/\d+/);
    return match ? parseInt(match[0]) : null;
  };
  
  achievements.forEach(achievement => {
    const isUnlocked = unlockedAchievements.includes(achievement.id);
    const card = document.createElement('div');
    card.className = `achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`;
    
    let progressText = '';
    if (!isUnlocked) {
      if (achievement.id.includes('survive')) {
        const target = extractTarget(achievement.desc);
        if (target) {
          const current = Math.floor(gameState.time / 60);
          progressText = `<div class="achievement-progress">${current}/${target} min</div>`;
        }
      } else if (achievement.id.includes('build')) {
        const target = extractTarget(achievement.desc);
        if (target) {
          const current = achievement.id === 'build_50' ? allTimeStats.totalBuildingsBuilt : gameState.statistics.totalBuildingsBuilt;
          progressText = `<div class="achievement-progress">${current}/${target}</div>`;
        }
      } else if (achievement.id.includes('pop')) {
        const target = extractTarget(achievement.desc);
        if (target) {
          const current = gameState.statistics.maxPopulationReached;
          progressText = `<div class="achievement-progress">${current}/${target}</div>`;
        }
      } else if (achievement.id.includes('gold')) {
        const target = extractTarget(achievement.desc);
        if (target) {
          const current = achievement.id === 'gold_10000' ? Math.floor(allTimeStats.totalGoldEarned) : Math.floor(gameState.statistics.totalGoldEarned);
          progressText = `<div class="achievement-progress">${current.toLocaleString()}/${target.toLocaleString()}</div>`;
        }
      } else if (achievement.id.includes('food')) {
        const target = extractTarget(achievement.desc);
        if (target) {
          const current = Math.floor(gameState.statistics.totalFoodProduced);
          progressText = `<div class="achievement-progress">${current.toLocaleString()}/${target.toLocaleString()}</div>`;
        }
      } else if (achievement.id.includes('tech')) {
        if (achievement.id === 'tech_all') {
          const target = Object.keys(technologies).length;
          const current = gameState.statistics.technologiesPurchased;
          progressText = `<div class="achievement-progress">${current}/${target}</div>`;
        } else {
          const target = extractTarget(achievement.desc);
          if (target) {
            const current = gameState.statistics.technologiesPurchased;
            progressText = `<div class="achievement-progress">${current}/${target}</div>`;
          }
        }
      } else if (achievement.id.includes('farm') || achievement.id.includes('house') || achievement.id.includes('library')) {
        const target = extractTarget(achievement.desc);
        if (target) {
          let current = 0;
          if (achievement.id.includes('farm')) current = gameState.buildings.farm;
          else if (achievement.id.includes('house')) current = gameState.buildings.house;
          else if (achievement.id.includes('library')) current = gameState.buildings.library;
          progressText = `<div class="achievement-progress">${current}/${target}</div>`;
        }
      } else if (achievement.id.includes('games')) {
        const target = extractTarget(achievement.desc);
        if (target) {
          progressText = `<div class="achievement-progress">${allTimeStats.gamesPlayed}/${target}</div>`;
        }
      }
    }
    
    card.innerHTML = `
      <div class="achievement-icon">${achievement.icon}</div>
      <div class="achievement-name">${achievement.name}</div>
      <div class="achievement-desc">${achievement.desc}</div>
      ${progressText}
    `;
    achievementsList.appendChild(card);
  });
}

function confirmResetAll() {
  const confirmed = confirm(
    "⚠️ WARNING ⚠️\n\n" +
    "This will permanently delete:\n" +
    "• All saved games\n" +
    "• All-time statistics\n" +
    "• All unlocked achievements\n" +
    "• Everything will be lost!\n\n" +
    "Are you absolutely sure?"
  );
  
  if (confirmed) {
    const doubleConfirmed = confirm(
      "🗑️ FINAL WARNING 🗑️\n\n" +
      "This action CANNOT be undone!\n\n" +
      "Click OK to DELETE EVERYTHING\n" +
      "Click Cancel to keep your progress"
    );
    
    if (doubleConfirmed) {
      resetAllProgress();
    }
  }
}

function resetAllProgress() {
  localStorage.removeItem('medievalKingdomSave');
  localStorage.removeItem('medievalKingdomAllTime');
  localStorage.removeItem('medievalKingdomAchievements');
  
  allTimeStats = {
    longestSurvival: 0,
    totalGoldEarned: 0,
    totalFoodProduced: 0,
    totalBuildingsBuilt: 0,
    highestPopulation: 0,
    gamesPlayed: 0
  };
  
  unlockedAchievements = [];
  
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
  
  closeOverlay();
  updateEventLog();
  updateDisplay();
  
  alert("✅ All progress has been reset!\n\nYour kingdom starts anew.");
  debugLog('RESET', 'All progress reset');
}

function toggleChangelog(element) {
  element.classList.toggle('expanded');
}
