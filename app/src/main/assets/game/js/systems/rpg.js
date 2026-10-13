// DIMENSÃO ZERO - RPG System: Stats, Skill Tree, and Inventory

class RPGSystem {
  constructor() {
    this.availableSkillPoints = 1;
    this.skillsUnlocked = {
      fortitude: false,
      conduit: false,
      photon_burst: false,
      time_warp: false,
      ethereal_step: false
    };

    this.inventory = [
      { id: 'blade_basic', name: 'Lâmina do Templo', type: 'weapon', qty: 1, equipped: true, desc: 'Arma inicial forjada a partir dos fragmentos do templo.' },
      { id: 'ether_potion', name: 'Frasco de Éter Cósmico', type: 'consumable', qty: 3, desc: 'Restaura 50 pontos de Vida instantaneamente.' },
      { id: 'energy_cell', name: 'Célula de Energia', type: 'consumable', qty: 2, desc: 'Restaura 60 pontos de Energia dimensional.' }
    ];

    this.collectedCores = []; // Track 5 dimensional cores
  }

  addItem(name, qty = 1, type = 'item', desc = 'Recurso dimensional.') {
    const existing = this.inventory.find(i => i.name === name);
    if (existing) {
      existing.qty += qty;
    } else {
      this.inventory.push({
        id: 'item_' + Date.now(),
        name: name,
        type: type,
        qty: qty,
        desc: desc
      });
    }
    this.updateInventoryUI();
  }

  useItem(index) {
    const item = this.inventory[index];
    if (!item || item.qty <= 0) return;

    if (item.type === 'consumable') {
      if (item.name.includes('Éter')) {
        window.gameInstance.player.heal(50);
        window.audioEngine.playChest();
      } else if (item.name.includes('Energia')) {
        window.gameInstance.player.restoreEnergy(60);
        window.audioEngine.playChest();
      }

      item.qty--;
      if (item.qty <= 0) {
        this.inventory.splice(index, 1);
      }
      this.updateInventoryUI();
    }
  }

  unlockSkill(skillId) {
    if (this.availableSkillPoints <= 0 || this.skillsUnlocked[skillId]) return;

    this.skillsUnlocked[skillId] = true;
    this.availableSkillPoints--;
    window.audioEngine.playLevelUp();

    const player = window.gameInstance.player;
    if (skillId === 'fortitude') {
      player.maxHealth += 35;
      player.health += 35;
    } else if (skillId === 'conduit') {
      player.maxEnergy += 30;
      player.energyRegenRate += 8;
    } else if (skillId === 'photon_burst') {
      player.attackPower += 10;
    } else if (skillId === 'ethereal_step') {
      player.defensePower += 8;
    }

    this.updateSkillTreeUI();
  }

  addCore(coreName) {
    if (!this.collectedCores.includes(coreName)) {
      this.collectedCores.push(coreName);
      window.gameInstance.showBanner('NÚCLEO RECUPERADO!', `Núcleo Dimensional: ${coreName}`);
      window.audioEngine.playLevelUp();
    }
  }

  updateInventoryUI() {
    const container = document.getElementById('inventory-list');
    if (!container) return;

    container.innerHTML = '';
    this.inventory.forEach((item, idx) => {
      const card = document.createElement('div');
      card.className = 'rpg-card';
      card.style.display = 'flex';
      card.style.justifyContent = 'space-between';
      card.style.alignItems = 'center';
      card.style.marginBottom = '8px';

      card.innerHTML = `
        <div>
          <div style="font-weight: 700; color: #00e5ff;">${item.name} <span style="color: #94a3b8;">x${item.qty}</span></div>
          <div style="font-size: 11px; color: #cbd5e1;">${item.desc}</div>
        </div>
        ${item.type === 'consumable' ? `<button class="choice-btn" style="padding: 4px 10px; font-size: 11px;" onclick="window.rpgSystem.useItem(${idx})">USAR</button>` : `<span style="font-size: 10px; color: #ffd15c;">EQUIPADO</span>`}
      `;
      container.appendChild(card);
    });

    // Display Collected Cores
    const coresContainer = document.getElementById('cores-list');
    if (coresContainer) {
      coresContainer.innerHTML = '';
      const totalCores = ['Aurora', 'Floresta Cristalina', 'Órbitas Mortas', 'Eclipsia', 'Vazio Cósmico'];
      totalCores.forEach(name => {
        const hasIt = this.collectedCores.includes(name);
        const coreDiv = document.createElement('div');
        coreDiv.className = 'rpg-card';
        coreDiv.style.opacity = hasIt ? '1' : '0.4';
        coreDiv.innerHTML = `
          <div style="font-weight: 700; color: ${hasIt ? '#00e5ff' : '#64748b'};">💎 Núcleo de ${name}</div>
          <div style="font-size: 11px;">${hasIt ? 'Sincronizado com Kael' : 'Localização Desconhecida'}</div>
        `;
        coresContainer.appendChild(coreDiv);
      });
    }
  }

  updateSkillTreeUI() {
    const ptsEl = document.getElementById('skill-points-display');
    if (ptsEl) ptsEl.textContent = `Pontos Disponíveis: ${this.availableSkillPoints}`;

    const skillMap = [
      { id: 'fortitude', name: 'Fortitude Cósmica', desc: '+35 Vida Máxima' },
      { id: 'conduit', name: 'Condutores do Elo', desc: '+30 Energia e +Regeneração' },
      { id: 'photon_burst', name: 'Sobrecarga de Fótons', desc: '+10 Ataque Global' },
      { id: 'ethereal_step', name: 'Esquiva Etérea', desc: '+8 Defesa e Resistência' }
    ];

    const treeContainer = document.getElementById('skill-tree-list');
    if (!treeContainer) return;
    treeContainer.innerHTML = '';

    skillMap.forEach(skill => {
      const unlocked = this.skillsUnlocked[skill.id];
      const card = document.createElement('div');
      card.className = 'rpg-card';
      card.style.display = 'flex';
      card.style.justifyContent = 'space-between';
      card.style.alignItems = 'center';
      card.style.marginBottom = '8px';

      card.innerHTML = `
        <div>
          <div style="font-weight: 700; color: ${unlocked ? '#10b981' : '#fff'};">${unlocked ? '✓ ' : ''}${skill.name}</div>
          <div style="font-size: 11px; color: #cbd5e1;">${skill.desc}</div>
        </div>
        ${unlocked ? `<span style="color: #10b981; font-weight: 700; font-size: 11px;">ATIVO</span>` : `<button class="choice-btn" style="padding: 4px 10px; font-size: 11px;" ${this.availableSkillPoints <= 0 ? 'disabled style="opacity: 0.5;"' : ''} onclick="window.rpgSystem.unlockSkill('${skill.id}')">DESBLOQUEAR</button>`}
      `;
      treeContainer.appendChild(card);
    });
  }
}

window.rpgSystem = new RPGSystem();
