// ===================================
// TECHNOLOGY TREE DEFINITION
// ===================================

const technologies = {
  // Tier 1
  advancedFarming: {
    id: 'advancedFarming',
    name: 'Advanced Farming',
    icon: '🌾',
    desc: '+25% farm production',
    cost: 20,
    tier: 1,
    requires: null,
    effect: () => 0.25
  },
  efficientMarkets: {
    id: 'efficientMarkets',
    name: 'Efficient Markets',
    icon: '💰',
    desc: '+25% market income',
    cost: 20,
    tier: 1,
    requires: null,
    effect: () => 0.25
  },
  basicMedicine: {
    id: 'basicMedicine',
    name: 'Basic Medicine',
    icon: '🏥',
    desc: 'Disease damage -50%',
    cost: 15,
    tier: 1,
    requires: null,
    effect: () => 0.5
  },
  welcomingCulture: {
    id: 'welcomingCulture',
    name: 'Welcoming Culture',
    icon: '👥',
    desc: '+2 pop from refugee events',
    cost: 15,
    tier: 1,
    requires: null,
    effect: () => 2
  },
  
  // Tier 2
  irrigation: {
    id: 'irrigation',
    name: 'Irrigation',
    icon: '🌾',
    desc: '+50% farm production',
    cost: 50,
    tier: 2,
    requires: 'advancedFarming',
    effect: () => 0.5
  },
  tradeRoutes: {
    id: 'tradeRoutes',
    name: 'Trade Routes',
    icon: '💰',
    desc: '+50% market income',
    cost: 50,
    tier: 2,
    requires: 'efficientMarkets',
    effect: () => 0.5
  },
  hospitals: {
    id: 'hospitals',
    name: 'Hospitals',
    icon: '🏥',
    desc: 'Disease damage -75%',
    cost: 40,
    tier: 2,
    requires: 'basicMedicine',
    effect: () => 0.75
  },
  urbanPlanning: {
    id: 'urbanPlanning',
    name: 'Urban Planning',
    icon: '🏙️',
    desc: '+2 max pop per house',
    cost: 40,
    tier: 2,
    requires: null,
    effect: () => 2
  },
  
  // Tier 3
  agriculturalRevolution: {
    id: 'agriculturalRevolution',
    name: 'Agricultural Revolution',
    icon: '🌾',
    desc: '+100% farm production',
    cost: 100,
    tier: 3,
    requires: 'irrigation',
    effect: () => 1.0
  },
  economicProsperity: {
    id: 'economicProsperity',
    name: 'Economic Prosperity',
    icon: '💰',
    desc: '+100% market income',
    cost: 100,
    tier: 3,
    requires: 'tradeRoutes',
    effect: () => 1.0
  },
  publicHealth: {
    id: 'publicHealth',
    name: 'Public Health',
    icon: '🏥',
    desc: 'Immunity to disease',
    cost: 80,
    tier: 3,
    requires: 'hospitals',
    effect: () => 1.0
  },
  metropolitanGrowth: {
    id: 'metropolitanGrowth',
    name: 'Metropolitan Growth',
    icon: '👑',
    desc: '2x population growth',
    cost: 80,
    tier: 3,
    requires: 'urbanPlanning',
    effect: () => 2.0
  }
};

// ===================================
// TECHNOLOGY FUNCTIONS
// ===================================

function hasTech(techId) {
  return gameState.technologies[techId] === true;
}

function canPurchaseTechChain(tech) {
  if (tech.requires && !hasTech(tech.requires)) {
    return false;
  }
  return true;
}

function canPurchaseTech(tech) {
  if (hasTech(tech.id)) return false;
  if (gameState.research < tech.cost) return false;
  
  // Recursively check requirement chain
  if (tech.requires) {
    if (!hasTech(tech.requires)) return false;
    
    // Check if the required tech's requirements are also met
    const requiredTech = technologies[tech.requires];
    if (requiredTech && !canPurchaseTechChain(requiredTech)) return false;
  }
  
  return true;
}

function purchaseTechnology(techId) {
  const tech = technologies[techId];
  if (!canPurchaseTech(tech)) return;
  
  gameState.research -= tech.cost;
  gameState.technologies[techId] = true;
  gameState.statistics.technologiesPurchased++;
  
  debugLog('TECH', 'Purchased technology', { id: techId, cost: tech.cost });
  
  saveGame();
  updateResearchDisplay();
  updateDisplay();
  checkAchievements();
  
  showTechToast(tech);
}

function showTechToast(tech) {
  const toast = document.createElement('div');
  toast.style.position = 'fixed';
  toast.style.bottom = '20px';
  toast.style.right = '20px';
  toast.style.backgroundColor = '#161621';
  toast.style.border = '2px solid #ba68c8';
  toast.style.borderRadius = '8px';
  toast.style.padding = '15px 20px';
  toast.style.zIndex = '2000';
  toast.style.boxShadow = '0 0 20px rgba(186, 104, 200, 0.5)';
  toast.style.animation = 'slideInRight 0.3s ease';
  toast.innerHTML = `
    <div style="display: flex; align-items: center; gap: 15px;">
      <div style="font-size: 2rem;">${tech.icon}</div>
      <div>
        <div style="color: #ba68c8; font-weight: bold; margin-bottom: 4px;">Technology Researched!</div>
        <div style="color: #f5f5f5; font-size: 0.9rem;">${tech.name}</div>
        <div style="color: #ccc; font-size: 0.8rem;">${tech.desc}</div>
      </div>
    </div>
  `;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function getFarmMultiplier() {
  let multiplier = 1.0;
  if (hasTech('advancedFarming')) multiplier += technologies.advancedFarming.effect();
  if (hasTech('irrigation')) multiplier += technologies.irrigation.effect();
  if (hasTech('agriculturalRevolution')) multiplier += technologies.agriculturalRevolution.effect();
  return multiplier;
}

function getMarketMultiplier() {
  let multiplier = 1.0;
  if (hasTech('efficientMarkets')) multiplier += technologies.efficientMarkets.effect();
  if (hasTech('tradeRoutes')) multiplier += technologies.tradeRoutes.effect();
  if (hasTech('economicProsperity')) multiplier += technologies.economicProsperity.effect();
  return multiplier;
}

function getHouseBonus() {
  let bonus = 0;
  if (hasTech('urbanPlanning')) bonus += technologies.urbanPlanning.effect();
  return bonus;
}

function getPopGrowthMultiplier() {
  let multiplier = 1.0;
  if (hasTech('metropolitanGrowth')) multiplier *= technologies.metropolitanGrowth.effect();
  return multiplier;
}

function getDiseaseDamageReduction() {
  if (hasTech('publicHealth')) return 1.0;
  let reduction = 0;
  if (hasTech('basicMedicine')) reduction = Math.max(reduction, technologies.basicMedicine.effect());
  if (hasTech('hospitals')) reduction = Math.max(reduction, technologies.hospitals.effect());
  return reduction;
}

function getRefugeeBonus() {
  let bonus = 0;
  if (hasTech('welcomingCulture')) bonus += technologies.welcomingCulture.effect();
  return bonus;
}
