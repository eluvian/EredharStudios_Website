// ===================================
// RANDOM EVENTS SYSTEM
// ===================================

const randomEvents = [
  {
    id: 'abundant_harvest',
    title: '🌾 Abundant Harvest',
    description: 'Your farms have yielded an exceptional harvest this season!',
    effect: () => {
      gameState.food += 50;
    },
    weight: 15
  },
  {
    id: 'traveling_merchant',
    title: '💰 Traveling Merchant',
    description: 'A wealthy merchant passes through, offering to buy your goods.',
    choices: [
      {
        text: 'Sell 30 Food for 20 Gold',
        condition: () => gameState.food >= 30,
        effect: () => {
          gameState.food -= 30;
          gameState.gold += 20;
        }
      },
      {
        text: 'Politely decline',
        effect: () => {}
      }
    ],
    weight: 12
  },
  {
    id: 'refugees',
    title: '👥 Refugees Arrive',
    description: 'A group of refugees from a distant land seeks shelter in your kingdom.',
    choices: [
      {
        getText: () => `Welcome them (+${5 + getRefugeeBonus()} Population, -20 Food)`,
        condition: () => gameState.food >= 20,
        effect: () => {
          gameState.population += 5 + getRefugeeBonus();
          gameState.food -= 20;
          if (gameState.population > gameState.maxPopulation) {
            gameState.maxPopulation = gameState.population;
          }
        }
      },
      {
        text: 'Turn them away',
        effect: () => {}
      }
    ],
    weight: 10
  },
  {
    id: 'gold_discovery',
    title: '✨ Gold Discovery',
    description: 'Your people discover a small cache of gold while working the fields!',
    effect: () => {
      gameState.gold += 30;
    },
    weight: 8
  },
  {
    id: 'harsh_winter',
    title: '❄️ Harsh Winter',
    description: 'An unexpectedly harsh winter destroys part of your food stores.',
    effect: () => {
      const loss = Math.floor(gameState.food * 0.3);
      gameState.food -= loss;
    },
    weight: 10
  },
  {
    id: 'disease_outbreak',
    title: '💀 Disease Outbreak',
    description: 'A sickness spreads through your population!',
    effect: () => {
      const damageReduction = getDiseaseDamageReduction();
      const baseLoss = Math.floor(gameState.population * 0.2);
      const actualLoss = Math.floor(baseLoss * (1 - damageReduction));
      gameState.population -= actualLoss;
      
      // Show immunity message if applicable
      if (damageReduction >= 1.0) {
        addCustomEventToLog({
          id: 'disease_prevented',
          title: '✅ Disease Prevented',
          description: 'Thanks to Public Health research, your people are immune!'
        }, 'positive');
      }
    },
    condition: () => gameState.population >= 5 && getDiseaseDamageReduction() < 1.0,
    weight: 8
  },
  {
    id: 'bandit_raid',
    title: '⚔️ Bandit Raid',
    description: 'Bandits raid your kingdom, stealing resources!',
    effect: () => {
      gameState.gold = Math.max(0, gameState.gold - 25);
      gameState.food = Math.max(0, gameState.food - 15);
    },
    condition: () => gameState.gold >= 10 || gameState.food >= 10,
    weight: 12
  },
  {
    id: 'farm_fire',
    title: '🔥 Farm Fire',
    description: 'A fire breaks out in one of your farms, destroying crops!',
    effect: () => {
      gameState.food = Math.max(0, gameState.food - 30);
    },
    condition: () => gameState.buildings.farm >= 1,
    weight: 9
  },
  {
    id: 'wandering_scholar',
    title: '📜 Wandering Scholar',
    description: 'A scholar offers to teach your people farming techniques for a fee.',
    choices: [
      {
        text: 'Pay 40 Gold (+20 food immediately)',
        condition: () => gameState.gold >= 40,
        effect: () => {
          gameState.gold -= 40;
          gameState.food += 20;
        }
      },
      {
        text: 'Decline the offer',
        effect: () => {}
      }
    ],
    weight: 8
  },
  {
    id: 'festival_proposal',
    title: '🎭 Festival Proposal',
    description: 'Your people wish to hold a festival to boost morale.',
    choices: [
      {
        text: 'Host Festival (30 Food, 20 Gold) - Attract +3 settlers',
        condition: () => gameState.food >= 30 && gameState.gold >= 20,
        effect: () => {
          gameState.food -= 30;
          gameState.gold -= 20;
          gameState.population += 3;
          if (gameState.population > gameState.maxPopulation) {
            gameState.maxPopulation = gameState.population;
          }
        }
      },
      {
        text: 'Times are too hard for festivities',
        effect: () => {}
      }
    ],
    condition: () => gameState.population >= 10,
    weight: 7
  }
];

// ===================================
// EVENT FUNCTIONS
// ===================================

function triggerRandomEvent() {
  const availableEvents = randomEvents.filter(event => 
    !event.condition || event.condition()
  );
  
  if (availableEvents.length === 0) return;
  
  const totalWeight = availableEvents.reduce((sum, event) => sum + event.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const event of availableEvents) {
    random -= event.weight;
    if (random <= 0) {
      showEvent(event);
      debugLog('EVENT', 'Triggering event', event.title);
      break;
    }
  }
}

function showEvent(event) {
  gameState.activeEvent = event;
  gameState.paused = true;
  
  addEventToLog(event);
  
  const popup = document.getElementById('eventPopup');
  document.getElementById('eventTitle').textContent = event.title;
  document.getElementById('eventDescription').textContent = event.description;
  
  const choicesDiv = document.getElementById('eventChoices');
  choicesDiv.innerHTML = '';
  
  if (event.choices) {
    event.choices.forEach((choice, index) => {
      const button = document.createElement('button');
      button.className = 'event-choice-btn';
      
      const canChoose = !choice.condition || choice.condition();
      
      const choiceText = choice.getText ? choice.getText() : choice.text;
      
      if (!canChoose) {
        button.disabled = true;
        button.style.opacity = '0.5';
        let requirement = '';
        if (choiceText.includes('Food')) {
          const foodMatch = choiceText.match(/(\d+)\s*Food/);
          if (foodMatch && gameState.food < parseInt(foodMatch[1])) {
            requirement = ` (Need ${foodMatch[1]} Food, have ${Math.floor(gameState.food)})`;
          }
        }
        if (choiceText.includes('Gold')) {
          const goldMatch = choiceText.match(/(\d+)\s*Gold/);
          if (goldMatch && gameState.gold < parseInt(goldMatch[1])) {
            requirement = ` (Need ${goldMatch[1]} Gold, have ${Math.floor(gameState.gold)})`;
          }
        }
        button.textContent = choiceText + requirement;
      } else {
        button.textContent = choiceText;
      }
      
      button.onclick = () => {
        if (canChoose) {
          choice.effect();
          closeEvent();
        }
      };
      
      choicesDiv.appendChild(button);
    });
  } else {
    const button = document.createElement('button');
    button.className = 'event-choice-btn';
    button.textContent = 'Continue';
    button.onclick = () => {
      event.effect();
      closeEvent();
    };
    choicesDiv.appendChild(button);
  }
  
  popup.classList.add('active');
}

function addEventToLog(event) {
  let eventType = 'neutral';
  if (['abundant_harvest', 'traveling_merchant', 'refugees', 'gold_discovery'].includes(event.id)) {
    eventType = 'positive';
  } else if (['harsh_winter', 'disease_outbreak', 'bandit_raid', 'farm_fire'].includes(event.id)) {
    eventType = 'negative';
  }
  
  const logEntry = {
    title: event.title,
    description: event.description,
    time: formatTime(gameState.time),
    type: eventType
  };
  
  gameState.eventLog.unshift(logEntry);
  
  if (gameState.eventLog.length > BALANCE.MAX_EVENT_LOG_ENTRIES) {
    gameState.eventLog.pop();
  }
  
  updateEventLog();
}

function addCustomEventToLog(event, type = 'neutral') {
  const logEntry = {
    title: event.title,
    description: event.description,
    time: formatTime(gameState.time),
    type: type
  };
  
  gameState.eventLog.unshift(logEntry);
  
  if (gameState.eventLog.length > BALANCE.MAX_EVENT_LOG_ENTRIES) {
    gameState.eventLog.pop();
  }
  
  updateEventLog();
}

function updateEventLog() {
  const logDiv = document.getElementById('eventLog');
  
  if (gameState.eventLog.length === 0) {
    logDiv.innerHTML = '<p class="event-log-empty">No events yet. Your kingdom awaits its fate...</p>';
    return;
  }
  
  logDiv.innerHTML = '';
  
  gameState.eventLog.forEach(entry => {
    const entryDiv = document.createElement('div');
    entryDiv.className = `event-log-entry ${entry.type}`;
    
    const titleDiv = document.createElement('div');
    titleDiv.className = 'event-log-title';
    titleDiv.textContent = entry.title;
    
    const descDiv = document.createElement('div');
    descDiv.className = 'event-log-desc';
    descDiv.textContent = entry.description;
    
    const timeDiv = document.createElement('div');
    timeDiv.className = 'event-log-time';
    timeDiv.textContent = `Time: ${entry.time}`;
    
    entryDiv.appendChild(titleDiv);
    entryDiv.appendChild(descDiv);
    entryDiv.appendChild(timeDiv);
    
    logDiv.appendChild(entryDiv);
  });
}

function closeEvent() {
  document.getElementById('eventPopup').classList.remove('active');
  gameState.activeEvent = null;
  gameState.paused = false;
  updateDisplay();
}
