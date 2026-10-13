// DIMENSÃO ZERO - Save & Load System (Local Storage & Android Persistence)

class SaveSystem {
  constructor() {
    this.saveKey = 'DIMENSAO_ZERO_SAVE_V1';
  }

  save() {
    if (!window.gameInstance || !window.gameInstance.player) return;

    const data = {
      version: 1,
      timestamp: Date.now(),
      chapter: window.questSystem.currentChapter,
      stepIndex: window.questSystem.currentStepIndex,
      decisions: window.questSystem.decisions,
      completedLog: window.questSystem.completedLog,
      player: {
        level: window.gameInstance.player.level,
        xp: window.gameInstance.player.xp,
        nextXp: window.gameInstance.player.nextXp,
        health: window.gameInstance.player.health,
        maxHealth: window.gameInstance.player.maxHealth,
        energy: window.gameInstance.player.energy,
        maxEnergy: window.gameInstance.player.maxEnergy,
        attackPower: window.gameInstance.player.attackPower,
        defensePower: window.gameInstance.player.defensePower,
        x: window.gameInstance.player.position.x,
        z: window.gameInstance.player.position.z
      },
      rpg: {
        availableSkillPoints: window.rpgSystem.availableSkillPoints,
        skillsUnlocked: window.rpgSystem.skillsUnlocked,
        inventory: window.rpgSystem.inventory,
        collectedCores: window.rpgSystem.collectedCores
      }
    };

    const jsonStr = JSON.stringify(data);
    localStorage.setItem(this.saveKey, jsonStr);

    if (window.AndroidBridge && window.AndroidBridge.saveGameData) {
      try { window.AndroidBridge.saveGameData(jsonStr); } catch (e) {}
    }

    window.gameInstance.showBanner('PROGRESSO SALVO', 'Partida salva com sucesso no sistema local.');
    window.audioEngine.playBlip();
  }

  load() {
    let jsonStr = localStorage.getItem(this.saveKey);
    if (!jsonStr && window.AndroidBridge && window.AndroidBridge.loadGameData) {
      try { jsonStr = window.AndroidBridge.loadGameData(); } catch (e) {}
    }

    if (!jsonStr) {
      alert('Nenhum dado salvo encontrado!');
      return false;
    }

    try {
      const data = JSON.parse(jsonStr);

      window.questSystem.currentChapter = data.chapter || 1;
      window.questSystem.currentStepIndex = data.stepIndex || 0;
      window.questSystem.decisions = data.decisions || {};
      window.questSystem.completedLog = data.completedLog || [];

      if (data.rpg) {
        window.rpgSystem.availableSkillPoints = data.rpg.availableSkillPoints || 0;
        window.rpgSystem.skillsUnlocked = data.rpg.skillsUnlocked || {};
        window.rpgSystem.inventory = data.rpg.inventory || [];
        window.rpgSystem.collectedCores = data.rpg.collectedCores || [];
      }

      if (data.player && window.gameInstance.player) {
        const p = window.gameInstance.player;
        p.level = data.player.level || 1;
        p.xp = data.player.xp || 0;
        p.nextXp = data.player.nextXp || 100;
        p.health = data.player.health || 100;
        p.maxHealth = data.player.maxHealth || 100;
        p.energy = data.player.energy || 100;
        p.maxEnergy = data.player.maxEnergy || 100;
        p.attackPower = data.player.attackPower || 20;
        p.defensePower = data.player.defensePower || 5;
        p.position.set(data.player.x || 0, 0, data.player.z || 0);
      }

      const chap = window.questSystem.chapters[window.questSystem.currentChapter - 1];
      if (chap) {
        window.gameInstance.loadChapterWorld(chap.biome);
      }
      window.questSystem.updateHUD();
      window.rpgSystem.updateInventoryUI();
      window.rpgSystem.updateSkillTreeUI();

      window.gameInstance.showBanner('PARTIDA CARREGADA', `Retomando no ${chap ? chap.title : 'Modo Livre'}`);
      window.audioEngine.playLevelUp();
      return true;
    } catch (e) {
      console.error('Failed to load save game:', e);
      return false;
    }
  }

  hasSave() {
    return !!localStorage.getItem(this.saveKey);
  }
}

window.saveSystem = new SaveSystem();
