// ===================================
// GAME VERSION & CONSTANTS
// ===================================

const GAME_VERSION = "2.1.1"; // v2.1.1 - Mobile Optimization

// Debug mode (set to true to enable logging)
const DEBUG_MODE = false;

// Game Balance Constants
const BALANCE = {
  // Starting values
  STARTING_GOLD: 100,
  STARTING_MAX_POPULATION: 25,
  
  // Building costs and effects
  BUILDING_COST_MULTIPLIER: 1.15,
  
  FARM_BASE_COST: 50,
  FARM_FOOD_RATE: 0.5,
  
  HOUSE_BASE_COST: 40,
  HOUSE_POPULATION: 5,
  
  MARKET_BASE_COST: 60,
  MARKET_GOLD_RATE: 0.2,
  
  LIBRARY_BASE_COST: 80,
  LIBRARY_RESEARCH_RATE: 0.1,
  
  BARRACKS_BASE_COST: 100,
  BARRACKS_DEFENSE_RATE: 0.5,
  
  TEMPLE_BASE_COST: 90,
  TEMPLE_FAITH_RATE: 0.2,
  
  // Population mechanics
  POPULATION_TAX_RATE: 0.05,
  POPULATION_FOOD_CONSUMPTION: 0.1,
  POPULATION_STARVATION_PENALTY: -0.5,
  
  // Growth rates by food level
  POP_GROWTH_RATE_NONE: 0,      // < 20 food
  POP_GROWTH_RATE_LOW: 0.05,    // 20-50 food
  POP_GROWTH_RATE_MED: 0.1,     // 50-100 food
  POP_GROWTH_RATE_HIGH: 0.2,    // 100+ food
  
  // Food thresholds
  FOOD_STARVATION_THRESHOLD: 10,
  FOOD_GROWTH_THRESHOLD_LOW: 20,
  FOOD_GROWTH_THRESHOLD_MED: 50,
  FOOD_GROWTH_THRESHOLD_HIGH: 100,
  
  // Defense system
  DEFENSE_RAID_REDUCTION_RATE: 0.05,  // 5% reduction per defense point
  DEFENSE_MAX_REDUCTION: 0.9,          // Max 90% damage reduction
  
  // Faith system
  FAITH_EVENT_REDUCTION_RATE: 0.03,   // 3% reduction per faith point
  FAITH_MAX_REDUCTION: 0.8,            // Max 80% damage reduction
  
  // Trade
  FOOD_TO_GOLD_RATE: 0.5,
  
  // Events
  EVENT_MIN_INTERVAL: 30,
  EVENT_MAX_INTERVAL: 60,
  EVENT_START_DELAY: 10,
  MAX_EVENT_LOG_ENTRIES: 8,
  
  // System
  GAME_LOOP_INTERVAL: 100, // ms
  SAVE_INTERVAL: 10000, // ms
  MAX_OFFLINE_TIME: 28800, // 8 hours in seconds
  BUTTON_COOLDOWN: 100, // ms
};
