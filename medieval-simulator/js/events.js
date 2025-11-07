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
      const faithReduction = getFaithReduction();
      const baseLoss = Math.floor(gameState.food * 0.3);
      const actualLoss = Math.floor(baseLoss * (1 - faithReduction));
      gameState.food -= actualLoss;
      
      if (faithReduction > 0.3) {
        addCustomEventToLog({
          id: 'faith_protection',
          title: '✨ Faith Protects',
          description: `Your people's faith reduced the winter's impact! (${Math.floor(faithReduction * 100)}% reduction)`
        }, 'positive');
      }
    },
    weight: 10
  },
  {
    id: 'disease_outbreak',
    title: '💀 Disease Outbreak',
    description: 'A sickness spreads through your population!',
    effect: () => {
      const techReduction = getDiseaseDamageReduction();
      const faithReduction = getFaithReduction();
      const totalReduction = Math.min(techReduction + faithReduction, 1.0);
      
      const baseLoss = Math.floor(gameState.population * 0.2);
      const actualLoss = Math.floor(baseLoss * (1 - totalReduction));
      gameState.population -= actualLoss;
      
      // Track if faith helped
      if (faithReduction > 0.2) {
        gameState.statistics.diseasesHealed++;
      }
      
      // Show immunity/protection message if applicable
      if (totalReduction >= 1.0) {
        addCustomEventToLog({
          id: 'disease_prevented',
          title: '✅ Disease Prevented',
          description: 'Thanks to medicine and faith, your people are protected!'
        }, 'positive');
      } else if (faithReduction > 0.2) {
        addCustomEventToLog({
          id: 'faith_healing',
          title: '✨ Faith Heals',
          description: `Your temples helped reduce disease impact! (${Math.floor(faithReduction * 100)}% reduction)`
        }, 'positive');
      }
    },
    condition: () => gameState.population >= 5,
    weight: 8
  },
  {
    id: 'bandit_raid',
    title: '⚔️ Bandit Raid',
    description: 'Bandits raid your kingdom!',
    effect: () => {
      const defenseReduction = getDefenseReduction();
      
      const baseGoldLoss = 25;
      const baseFoodLoss = 15;
      
      const actualGoldLoss = Math.floor(baseGoldLoss * (1 - defenseReduction));
      const actualFoodLoss = Math.floor(baseFoodLoss * (1 - defenseReduction));
      
      gameState.gold = Math.max(0, gameState.gold - actualGoldLoss);
      gameState.food = Math.max(0, gameState.food - actualFoodLoss);
      
      // Track successful defense
      if (defenseReduction >= 0.5) {
        gameState.statistics.raidsRepelled++;
        addCustomEventToLog({
          id: 'raid_repelled',
          title: '🛡️ Raid Repelled!',
          description: `Your barracks defended the kingdom! (${Math.floor(defenseReduction * 100)}% damage reduced)`
        }, 'positive');
      } else if (defenseReduction > 0.2) {
        addCustomEventToLog({
          id: 'partial_defense',
          title: '⚔️ Defenders Stand',
          description: `Your defenses reduced the raid's impact! (${Math.floor(defenseReduction * 100)}% reduction)`
        }, 'neutral');
      }
    },
    condition: () => gameState.gold >= 10 || gameState.food >= 10,
    weight: 12
  },
  {
    id: 'farm_fire',
    title: '🔥 Farm Fire',
    description: 'A fire breaks out in one of your farms, destroying crops!',
    effect: () => {
      const faithReduction = getFaithReduction();
      const baseLoss = 30;
      const actualLoss = Math.floor(baseLoss * (1 - faithReduction));
      gameState.food = Math.max(0, gameState.food - actualLoss);
      
      if (faithReduction > 0.3) {
        addCustomEventToLog({
          id: 'fire_protection',
          title: '✨ Divine Intervention',
          description: `Faith helped contain the fire! (${Math.floor(faithReduction * 100)}% reduction)`
        }, 'positive');
      }
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
  },
  {
    id: 'military_parade',
    title: '🎺 Military Parade',
    description: 'Your guards wish to host a parade to show the kingdom\'s strength.',
    choices: [
      {
        text: 'Host Parade (-15 Gold, +5 Defense temporarily)',
        condition: () => gameState.gold >= 15 && gameState.buildings.barracks >= 1,
        effect: () => {
          gameState.gold -= 15;
          gameState.defense += 5;
        }
      },
      {
        text: 'Not today',
        effect: () => {}
      }
    ],
    condition: () => gameState.buildings.barracks >= 2,
    weight: 6
  },
  {
    id: 'religious_pilgrimage',
    title: '🙏 Pilgrimage Arrives',
    description: 'Pilgrims visit your temples, bringing donations and faith.',
    effect: () => {
      const temples = gameState.buildings.temple || 0;
      const goldGain = temples * 5;
      const faithGain = temples * 2;
      gameState.gold += goldGain;
      gameState.faith += faithGain;
    },
    condition: () => gameState.buildings.temple >= 1,
    weight: 7
  },
  
  // ===================================
  // NEW EVENTS - PHASE 1 EXPANSION
  // ===================================
  
  // POSITIVE EVENTS
  {
    id: 'ancient_treasure',
    title: '💎 Ancient Treasure',
    description: 'Workers unearth an ancient vault filled with gold and artifacts!',
    effect: () => {
      gameState.gold += 100;
      gameState.research += 10;
    },
    weight: 6
  },
  {
    id: 'skilled_artisan',
    title: '🔨 Skilled Artisan Arrives',
    description: 'A master craftsman settles in your kingdom, improving productivity.',
    effect: () => {
      gameState.gold += 30;
      gameState.population += 2;
      if (gameState.population > gameState.maxPopulation) {
        gameState.maxPopulation = gameState.population;
      }
    },
    weight: 9
  },
  {
    id: 'bumper_crop',
    title: '🌻 Bumper Crop',
    description: 'Perfect weather conditions result in an exceptional harvest!',
    effect: () => {
      const farms = gameState.buildings.farm || 0;
      const foodGain = 30 + (farms * 10);
      gameState.food += foodGain;
    },
    condition: () => gameState.buildings.farm >= 1,
    weight: 10
  },
  {
    id: 'trade_caravan',
    title: '🐫 Trade Caravan',
    description: 'A wealthy trade caravan passes through, boosting your economy.',
    effect: () => {
      const markets = gameState.buildings.market || 0;
      const goldGain = 25 + (markets * 8);
      gameState.gold += goldGain;
    },
    condition: () => gameState.buildings.market >= 1,
    weight: 9
  },
  {
    id: 'baby_boom',
    title: '👶 Baby Boom',
    description: 'A wave of new births brings joy and growth to your kingdom!',
    effect: () => {
      const popGain = Math.floor(gameState.population * 0.15) + 3;
      gameState.population += popGain;
      if (gameState.population > gameState.maxPopulation) {
        gameState.maxPopulation = gameState.population;
      }
    },
    condition: () => gameState.population >= 15,
    weight: 8
  },
  {
    id: 'lucky_find',
    title: '🍀 Lucky Find',
    description: 'Your people discover valuable resources in unexpected places.',
    choices: [
      {
        text: 'Keep the gold (+50 Gold)',
        effect: () => {
          gameState.gold += 50;
        }
      },
      {
        text: 'Share with the people (+5 Population, +20 Food)',
        effect: () => {
          gameState.population += 5;
          gameState.food += 20;
          if (gameState.population > gameState.maxPopulation) {
            gameState.maxPopulation = gameState.population;
          }
        }
      }
    ],
    weight: 8
  },
  
  // NEGATIVE EVENTS
  {
    id: 'great_famine',
    title: '💀 Great Famine',
    description: 'A terrible famine grips the land. Food stores dwindle rapidly.',
    effect: () => {
      const faithReduction = getFaithReduction();
      const baseLoss = Math.floor(gameState.food * 0.5);
      const actualLoss = Math.floor(baseLoss * (1 - faithReduction));
      gameState.food = Math.max(0, gameState.food - actualLoss);
      
      if (faithReduction > 0.3) {
        addCustomEventToLog({
          id: 'famine_protection',
          title: '✨ Faith Sustains',
          description: `Your people's faith helped ration supplies! (${Math.floor(faithReduction * 100)}% reduction)`
        }, 'positive');
      }
    },
    condition: () => gameState.buildings.farm >= 2,
    weight: 7
  },
  {
    id: 'spreading_fire',
    title: '🔥 Fire Spreads',
    description: 'A fire breaks out and spreads through multiple buildings!',
    effect: () => {
      const faithReduction = getFaithReduction();
      const baseGoldLoss = 40;
      const baseFoodLoss = 25;
      const actualGoldLoss = Math.floor(baseGoldLoss * (1 - faithReduction));
      const actualFoodLoss = Math.floor(baseFoodLoss * (1 - faithReduction));
      
      gameState.gold = Math.max(0, gameState.gold - actualGoldLoss);
      gameState.food = Math.max(0, gameState.food - actualFoodLoss);
      
      if (faithReduction > 0.3) {
        addCustomEventToLog({
          id: 'fire_miracle',
          title: '✨ Miraculous Save',
          description: `Faith helped contain the fire! (${Math.floor(faithReduction * 100)}% reduction)`
        }, 'positive');
      }
    },
    weight: 8
  },
  {
    id: 'earthquake',
    title: '🌋 Earthquake',
    description: 'The ground shakes violently! Buildings are damaged.',
    effect: () => {
      const defenseReduction = getDefenseReduction();
      const faithReduction = getFaithReduction();
      const totalReduction = Math.min(defenseReduction + faithReduction, 0.9);
      
      const baseGoldLoss = 60;
      const actualLoss = Math.floor(baseGoldLoss * (1 - totalReduction));
      gameState.gold = Math.max(0, gameState.gold - actualLoss);
      
      if (totalReduction > 0.4) {
        addCustomEventToLog({
          id: 'earthquake_protection',
          title: '🛡️ Prepared Defenses',
          description: `Strong infrastructure reduced damage! (${Math.floor(totalReduction * 100)}% reduction)`
        }, 'positive');
      }
    },
    condition: () => gameState.statistics.totalBuildingsBuilt >= 10,
    weight: 6
  },
  {
    id: 'plague_rats',
    title: '🐀 Plague Rats',
    description: 'Disease-carrying rats infest your food stores!',
    effect: () => {
      const techReduction = getDiseaseDamageReduction();
      const faithReduction = getFaithReduction();
      const totalReduction = Math.min(techReduction + faithReduction, 1.0);
      
      const baseFoodLoss = Math.floor(gameState.food * 0.3);
      const basePopLoss = Math.floor(gameState.population * 0.1);
      
      const actualFoodLoss = Math.floor(baseFoodLoss * (1 - totalReduction));
      const actualPopLoss = Math.floor(basePopLoss * (1 - totalReduction));
      
      gameState.food = Math.max(0, gameState.food - actualFoodLoss);
      gameState.population = Math.max(0, gameState.population - actualPopLoss);
      
      if (totalReduction >= 0.8) {
        addCustomEventToLog({
          id: 'plague_prevented',
          title: '✅ Plague Contained',
          description: 'Medicine and faith prevented the worst!'
        }, 'positive');
      }
    },
    condition: () => gameState.population >= 20,
    weight: 7
  },
  {
    id: 'tax_revolt',
    title: '⚔️ Tax Revolt',
    description: 'Citizens rebel against high taxes! The treasury is raided.',
    effect: () => {
      const defenseReduction = getDefenseReduction();
      const baseGoldLoss = 50;
      const basePopLoss = 5;
      
      const actualGoldLoss = Math.floor(baseGoldLoss * (1 - defenseReduction));
      const actualPopLoss = Math.floor(basePopLoss * (1 - defenseReduction));
      
      gameState.gold = Math.max(0, gameState.gold - actualGoldLoss);
      gameState.population = Math.max(0, gameState.population - actualPopLoss);
      
      if (defenseReduction > 0.5) {
        addCustomEventToLog({
          id: 'revolt_suppressed',
          title: '🛡️ Order Restored',
          description: `Guards quickly restored order! (${Math.floor(defenseReduction * 100)}% reduction)`
        }, 'positive');
      }
    },
    condition: () => gameState.gold >= 40 && gameState.population >= 25,
    weight: 7
  },
  
  // CHOICE-BASED EVENTS
  {
    id: 'mysterious_stranger',
    title: '🎭 Mysterious Stranger',
    description: 'A hooded figure offers to share ancient knowledge... for a price.',
    choices: [
      {
        text: 'Pay 40 Gold for knowledge (+25 Research)',
        condition: () => gameState.gold >= 40,
        effect: () => {
          gameState.gold -= 40;
          gameState.research += 25;
        }
      },
      {
        text: 'Refuse politely',
        effect: () => {}
      },
      {
        text: 'Demand free knowledge (Risky!)',
        effect: () => {
          if (Math.random() < 0.5) {
            gameState.research += 30;
            addCustomEventToLog({
              id: 'stranger_generous',
              title: '✨ Generous Gift',
              description: 'The stranger was impressed and shared knowledge freely!'
            }, 'positive');
          } else {
            gameState.gold = Math.max(0, gameState.gold - 30);
            addCustomEventToLog({
              id: 'stranger_angry',
              title: '⚠️ Angered Stranger',
              description: 'The stranger cursed your greed and stole from you!'
            }, 'negative');
          }
        }
      }
    ],
    weight: 8
  },
  {
    id: 'noble_request',
    title: '👑 Noble\'s Request',
    description: 'A visiting noble asks for hospitality. This could be beneficial... or costly.',
    choices: [
      {
        text: 'Host lavishly (50 Gold, 30 Food) - Gain connection',
        condition: () => gameState.gold >= 50 && gameState.food >= 30,
        effect: () => {
          gameState.gold -= 50;
          gameState.food -= 30;
          gameState.gold += 80;
          gameState.population += 3;
          if (gameState.population > gameState.maxPopulation) {
            gameState.maxPopulation = gameState.population;
          }
        }
      },
      {
        text: 'Provide basic hospitality (20 Gold, 15 Food)',
        condition: () => gameState.gold >= 20 && gameState.food >= 15,
        effect: () => {
          gameState.gold -= 20;
          gameState.food -= 15;
          gameState.gold += 25;
        }
      },
      {
        text: 'Turn them away',
        effect: () => {
          gameState.gold = Math.max(0, gameState.gold - 10);
        }
      }
    ],
    condition: () => gameState.population >= 30,
    weight: 7
  },
  {
    id: 'border_dispute',
    title: '⚔️ Border Dispute',
    description: 'A neighboring settlement claims your land! How will you respond?',
    choices: [
      {
        text: 'Negotiate peacefully (30 Gold)',
        condition: () => gameState.gold >= 30,
        effect: () => {
          gameState.gold -= 30;
          gameState.population += 2;
          if (gameState.population > gameState.maxPopulation) {
            gameState.maxPopulation = gameState.population;
          }
        }
      },
      {
        text: 'Defend with force (Use Defense)',
        condition: () => gameState.defense >= 10,
        effect: () => {
          gameState.defense = Math.max(0, gameState.defense - 10);
          gameState.gold += 40;
          addCustomEventToLog({
            id: 'border_victory',
            title: '🏆 Border Secured',
            description: 'Your forces defended the border and seized enemy supplies!'
          }, 'positive');
        }
      },
      {
        text: 'Surrender the land',
        effect: () => {
          gameState.food = Math.max(0, gameState.food - 20);
        }
      }
    ],
    condition: () => gameState.population >= 20,
    weight: 7
  },
  {
    id: 'ancient_ruin',
    title: '🏛️ Ancient Ruin Discovered',
    description: 'Explorers find ruins nearby. Do you investigate?',
    choices: [
      {
        text: 'Send scholars (20 Research) - Safe',
        condition: () => gameState.research >= 20 && gameState.buildings.library >= 1,
        effect: () => {
          gameState.research -= 20;
          gameState.gold += 60;
          gameState.research += 15;
        }
      },
      {
        text: 'Send warriors (15 Defense) - Risky',
        condition: () => gameState.defense >= 15,
        effect: () => {
          gameState.defense -= 15;
          if (Math.random() < 0.6) {
            gameState.gold += 100;
            addCustomEventToLog({
              id: 'ruin_treasure',
              title: '💰 Ancient Treasure!',
              description: 'Your warriors found incredible riches!'
            }, 'positive');
          } else {
            gameState.population = Math.max(0, gameState.population - 3);
            addCustomEventToLog({
              id: 'ruin_trap',
              title: '⚠️ Ancient Trap',
              description: 'The ruins were dangerous. Warriors were lost.'
            }, 'negative');
          }
        }
      },
      {
        text: 'Ignore it',
        effect: () => {}
      }
    ],
    weight: 6
  },
  {
    id: 'traveling_prophet',
    title: '🔮 Traveling Prophet',
    description: 'A prophet offers visions of the future in exchange for devotion.',
    choices: [
      {
        text: 'Accept the blessing (20 Faith)',
        condition: () => gameState.faith >= 20 && gameState.buildings.temple >= 1,
        effect: () => {
          gameState.faith -= 20;
          gameState.research += 20;
          gameState.defense += 10;
        }
      },
      {
        text: 'Test their power (Gamble)',
        effect: () => {
          if (Math.random() < 0.5) {
            gameState.faith += 15;
            gameState.gold += 30;
            addCustomEventToLog({
              id: 'prophet_real',
              title: '✨ True Prophet',
              description: 'The prophet\'s visions came true!'
            }, 'positive');
          } else {
            gameState.population = Math.max(0, gameState.population - 4);
            addCustomEventToLog({
              id: 'prophet_false',
              title: '⚠️ False Prophet',
              description: 'The prophet was a charlatan who caused chaos!'
            }, 'negative');
          }
        }
      },
      {
        text: 'Send them away',
        effect: () => {}
      }
    ],
    weight: 6
  },
  {
    id: 'bandit_negotiation',
    title: '💰 Bandit Negotiation',
    description: 'Bandits offer a deal: pay tribute or face their wrath.',
    choices: [
      {
        text: 'Pay tribute (40 Gold) - Peace',
        condition: () => gameState.gold >= 40,
        effect: () => {
          gameState.gold -= 40;
        }
      },
      {
        text: 'Fight them off (Use Defense)',
        condition: () => gameState.defense >= 20,
        effect: () => {
          const defenseReduction = getDefenseReduction();
          gameState.defense = Math.max(0, gameState.defense - 20);
          
          if (defenseReduction > 0.6) {
            gameState.gold += 50;
            gameState.statistics.raidsRepelled++;
            addCustomEventToLog({
              id: 'bandits_defeated',
              title: '🏆 Bandits Defeated!',
              description: 'Your forces crushed them and took their gold!'
            }, 'positive');
          } else {
            gameState.gold = Math.max(0, gameState.gold - 20);
            gameState.food = Math.max(0, gameState.food - 15);
          }
        }
      },
      {
        text: 'Refuse and hide',
        effect: () => {
          gameState.gold = Math.max(0, gameState.gold - 25);
          gameState.food = Math.max(0, gameState.food - 20);
        }
      }
    ],
    condition: () => gameState.gold >= 20,
    weight: 8
  },
  
  // SPECIAL/RARE EVENTS
  {
    id: 'dragon_sighting',
    title: '🐉 Dragon Sighting',
    description: 'A dragon flies overhead! This is both terrifying and awe-inspiring.',
    choices: [
      {
        text: 'Offer tribute (100 Gold, 50 Food)',
        condition: () => gameState.gold >= 100 && gameState.food >= 50,
        effect: () => {
          gameState.gold -= 100;
          gameState.food -= 50;
          gameState.research += 50;
          gameState.defense += 20;
          gameState.faith += 10;
          addCustomEventToLog({
            id: 'dragon_blessing',
            title: '🐉 Dragon\'s Blessing',
            description: 'The dragon was pleased and blessed your kingdom!'
          }, 'positive');
        }
      },
      {
        text: 'Hide and hope it passes',
        effect: () => {
          if (Math.random() < 0.7) {
            // Lucky, it passed
          } else {
            gameState.gold = Math.max(0, gameState.gold - 50);
            gameState.food = Math.max(0, gameState.food - 40);
            gameState.population = Math.max(0, gameState.population - 5);
            addCustomEventToLog({
              id: 'dragon_attack',
              title: '🔥 Dragon Attack',
              description: 'The dragon attacked your kingdom!'
            }, 'negative');
          }
        }
      }
    ],
    condition: () => gameState.time >= 300 && gameState.population >= 40,
    weight: 2
  },
  {
    id: 'legendary_hero',
    title: '⚔️ Legendary Hero',
    description: 'A famous hero offers to train your people in exchange for shelter.',
    choices: [
      {
        text: 'Welcome them (50 Gold, 30 Food)',
        condition: () => gameState.gold >= 50 && gameState.food >= 30,
        effect: () => {
          gameState.gold -= 50;
          gameState.food -= 30;
          gameState.defense += 30;
          gameState.population += 5;
          if (gameState.population > gameState.maxPopulation) {
            gameState.maxPopulation = gameState.population;
          }
          addCustomEventToLog({
            id: 'hero_training',
            title: '⚔️ Hero\'s Training',
            description: 'The hero trained elite warriors for your kingdom!'
          }, 'positive');
        }
      },
      {
        text: 'Politely decline',
        effect: () => {}
      }
    ],
    condition: () => gameState.time >= 240 && gameState.buildings.barracks >= 2,
    weight: 3
  },
  {
    id: 'ancient_prophecy',
    title: '📜 Ancient Prophecy',
    description: 'Scholars discover a prophecy about your kingdom\'s destiny!',
    effect: () => {
      const libraries = gameState.buildings.library || 0;
      const temples = gameState.buildings.temple || 0;
      
      const researchGain = 30 + (libraries * 10);
      const faithGain = 15 + (temples * 5);
      
      gameState.research += researchGain;
      gameState.faith += faithGain;
      
      addCustomEventToLog({
        id: 'prophecy_revealed',
        title: '✨ Destiny Revealed',
        description: 'The prophecy speaks of greatness in your future!'
      }, 'positive');
    },
    condition: () => gameState.buildings.library >= 2 && gameState.buildings.temple >= 1 && gameState.time >= 180,
    weight: 3
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
  if (['abundant_harvest', 'traveling_merchant', 'refugees', 'gold_discovery', 'military_parade', 'religious_pilgrimage', 'ancient_treasure', 'skilled_artisan', 'bumper_crop', 'trade_caravan', 'baby_boom', 'lucky_find'].includes(event.id)) {
    eventType = 'positive';
  } else if (['harsh_winter', 'disease_outbreak', 'bandit_raid', 'farm_fire', 'great_famine', 'spreading_fire', 'earthquake', 'plague_rats', 'tax_revolt'].includes(event.id)) {
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
  if (!logDiv) return;
  
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
