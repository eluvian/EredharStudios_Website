// ===================================
// BUILDING INFO MODAL
// ===================================

const buildingInfo = {
  farm: {
    name: '🌾 Farm',
    image: 'medieval-simulator/images/building-farm.png',
    description: 'Farms are the backbone of your kingdom\'s food production. They cultivate crops and provide sustenance for your growing population. The more farms you build, the more food you can stockpile for hard times.',
    stats: {
      'Base Cost': '50 Gold',
      'Cost Increase': '15% per building',
      'Food Production': '+0.5/sec (base)',
      'Bonus': 'Affected by farming technologies'
    }
  },
  house: {
    name: '🏠 House',
    image: 'medieval-simulator/images/building-house.png',
    description: 'Houses provide shelter for your citizens and increase your kingdom\'s population capacity. Without enough housing, your population cannot grow. Each house accommodates multiple families.',
    stats: {
      'Base Cost': '40 Gold',
      'Cost Increase': '15% per building',
      'Population Cap': '+5 (base)',
      'Bonus': 'Urban Planning tech adds +2'
    }
  },
  market: {
    name: '🏪 Market',
    image: 'medieval-simulator/images/building-market.png',
    description: 'Markets facilitate trade and commerce within your kingdom. Merchants sell goods and generate passive gold income. Markets are essential for maintaining a strong economy.',
    stats: {
      'Base Cost': '60 Gold',
      'Cost Increase': '15% per building',
      'Gold Production': '+0.2/sec (base)',
      'Bonus': 'Affected by market technologies'
    }
  },
  library: {
    name: '📚 Library',
    image: 'medieval-simulator/images/building-library.png',
    description: 'Libraries house scholars and generate research points. Research is used to unlock powerful technologies that provide permanent bonuses to your kingdom. Knowledge is power!',
    stats: {
      'Base Cost': '80 Gold',
      'Cost Increase': '15% per building',
      'Research': '+0.1/sec',
      'Purpose': 'Unlock technology upgrades'
    }
  }
};

function showBuildingInfo(type) {
  const modal = document.getElementById('buildingInfoModal');
  const info = buildingInfo[type];
  
  if (!info) return;
  
  // Set building image
  document.getElementById('modalBuildingImage').src = info.image;
  document.getElementById('modalBuildingImage').alt = info.name;
  
  // Set building title
  document.getElementById('modalBuildingTitle').textContent = info.name;
  
  // Set building description
  document.getElementById('modalBuildingDesc').textContent = info.description;
  
  // Set building stats
  const statsDiv = document.getElementById('modalBuildingStats');
  statsDiv.innerHTML = '';
  
  for (const [label, value] of Object.entries(info.stats)) {
    const statRow = document.createElement('p');
    statRow.innerHTML = `
      <span class="stat-label">${label}:</span>
      <span class="stat-value">${value}</span>
    `;
    statsDiv.appendChild(statRow);
  }
  
  // Show the current cost
  const currentCost = getBuildingCost(type);
  const currentCostRow = document.createElement('p');
  currentCostRow.innerHTML = `
    <span class="stat-label">Current Cost:</span>
    <span class="stat-value">${currentCost} Gold</span>
  `;
  currentCostRow.style.borderTop = '1px solid rgba(255, 224, 130, 0.3)';
  currentCostRow.style.paddingTop = '10px';
  currentCostRow.style.marginTop = '10px';
  statsDiv.appendChild(currentCostRow);
  
  // Show modal
  modal.classList.add('active');
  gameState.paused = true;
}

function closeBuildingInfo() {
  const modal = document.getElementById('buildingInfoModal');
  modal.classList.remove('active');
  gameState.paused = false;
}
