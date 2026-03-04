// ===================================
// POPUPS & UI HELPERS
// ===================================

// Render the achievements list in the stats overlay
function renderAchievements() {
  const achievementsList = document.getElementById('achievementsList');
  if (!achievementsList) return;

  achievementsList.innerHTML = '';

  achievements.forEach(achievement => {
    const card = document.createElement('div');
    const isUnlocked = unlockedAchievements.includes(achievement.id);
    card.className = `achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`;

    let progressText = '';
    if (!isUnlocked) {
      function extractTarget(desc) {
        const match = desc.match(/(\d[\d,]*)/);
        return match ? parseInt(match[1].replace(',', '')) : null;
      }

      if (achievement.id.includes('population')) {
        const target = extractTarget(achievement.desc);
        if (target) {
          const current = Math.floor(gameState.population);
          progressText = `<div class="achievement-progress">${current.toLocaleString()}/${target.toLocaleString()}</div>`;
        }
      } else if (achievement.id.includes('gold') || achievement.id.includes('rich')) {
        const target = extractTarget(achievement.desc);
        if (target) {
          const current = achievement.id.includes('all') ?
            Math.floor(allTimeStats.totalGoldEarned) : Math.floor(gameState.statistics.totalGoldEarned);
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
    defense: 0,
    faith: 0,
    buildings: {
      farm: 0,
      house: 0,
      market: 0,
      library: 0,
      barracks: 0,
      temple: 0
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
      technologiesPurchased: 0,
      raidsRepelled: 0,
      diseasesHealed: 0
    }
  };

  closeOverlay();
  updateEventLog();
  updateDisplay();

  alert("✅ All progress has been reset!\n\nYour kingdom starts anew.");
  debugLog('RESET', 'All progress reset');
}

// ─── CHANGELOG TOGGLES ────────────────────────────────────────────────────────

// Toggle the main changelog section (expand/collapse the entire changelog block).
// The CSS in medieval-simulator.html uses the class "open", so we toggle that.
// The .changelog-main-content is a SIBLING of .changelog-main-section, so we
// must explicitly toggle its class too.
function toggleChangelogSection(element) {
  element.classList.toggle('open');
  const content = element.nextElementSibling;
  if (content && content.classList.contains('changelog-main-content')) {
    content.classList.toggle('open');
  }
}

// Toggle individual changelog version entries.
function toggleChangelog(element) {
  // Stop event propagation so the parent toggleChangelogSection doesn't fire.
  event.stopPropagation();
  element.classList.toggle('open');
}
