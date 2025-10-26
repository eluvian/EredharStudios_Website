// ===================================
// GAME STATE
// ===================================

let gameState = {
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

let gameInterval = null;

// All-Time Statistics (persists across games)
let allTimeStats = {
  longestSurvival: 0,
  totalGoldEarned: 0,
  totalFoodProduced: 0,
  totalBuildingsBuilt: 0,
  highestPopulation: 0,
  gamesPlayed: 0
};

// Rate limiting for button clicks
const buttonCooldowns = new Map();
