// DIMENSÃO ZERO: O ÚLTIMO ELO - Main Game Architecture & Scene Coordinator

class Game {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.clock = new THREE.Clock();

    this.player = null;
    this.companion = null;
    this.cameraSystem = null;
    this.worldManager = null;

    this.enemies = [];
    this.boss = null;
    this.props = [];

    this.isRunning = false;
    this.isPaused = false;
    this.nearestInteractive = null;

    this.init();
  }

  init() {
    const container = document.getElementById('canvas-container');

    // 1. Scene & Camera
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);

    // 2. WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    container.appendChild(this.renderer.domElement);

    // 3. Systems & World Setup
    this.worldManager = new WorldManager(this.scene);
    this.worldManager.initLights();

    this.player = new Player(this.scene);
    this.companion = new NEXCompanion(this.scene, this.player);
    window.companion = this.companion;

    this.cameraSystem = new ThirdPersonCamera(this.camera, this.player.mesh);

    // Window Resize Handler
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Apply Settings
    window.settingsManager.applyToGame();

    // Setup UI button handlers
    this.setupUIHandlers();

    // Start in Chapter 1: Aurora
    this.loadChapterWorld('aurora');

    // Start Animation Loop
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  setupUIHandlers() {
    // Menu buttons
    const btnNewGame = document.getElementById('btn-new-game');
    const btnContinue = document.getElementById('btn-continue');
    const btnSettings = document.getElementById('btn-settings');
    const btnCloseSettings = document.getElementById('btn-close-settings');
    const btnPause = document.getElementById('btn-pause');
    const btnResume = document.getElementById('btn-resume');
    const btnInventory = document.getElementById('btn-inventory');
    const btnJournal = document.getElementById('btn-journal');

    if (btnNewGame) {
      btnNewGame.onclick = () => {
        document.getElementById('title-screen').style.display = 'none';
        this.startPrologue();
      };
    }

    if (btnContinue) {
      if (!window.saveSystem.hasSave()) {
        btnContinue.style.opacity = '0.5';
      }
      btnContinue.onclick = () => {
        if (window.saveSystem.load()) {
          document.getElementById('title-screen').style.display = 'none';
          this.isRunning = true;
          window.audioEngine.playMusic('ambient');
        }
      };
    }

    if (btnSettings) {
      btnSettings.onclick = () => {
        document.getElementById('settings-modal').style.display = 'flex';
      };
    }

    if (btnCloseSettings) {
      btnCloseSettings.onclick = () => {
        document.getElementById('settings-modal').style.display = 'none';
        window.settingsManager.saveSettings();
        window.settingsManager.applyToGame();
      };
    }

    if (btnPause) {
      btnPause.onclick = () => this.togglePause();
    }

    if (btnResume) {
      btnResume.onclick = () => this.togglePause();
    }

    if (btnInventory) {
      btnInventory.onclick = () => {
        const modal = document.getElementById('rpg-modal');
        modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
        if (modal.style.display === 'flex') {
          window.rpgSystem.updateInventoryUI();
          window.rpgSystem.updateSkillTreeUI();
        }
      };
    }

    if (btnJournal) {
      btnJournal.onclick = () => {
        const modal = document.getElementById('journal-modal');
        modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
        if (modal.style.display === 'flex') {
          window.questSystem.updateJournalUI();
        }
      };
    }

    // Modal Close X buttons
    document.querySelectorAll('.modal-close-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.target.closest('.modal-overlay').style.display = 'none';
      };
    });

    // Tab buttons
    document.querySelectorAll('.tab-btn').forEach(tab => {
      tab.onclick = () => {
        const parent = tab.closest('.modal-card');
        parent.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const target = tab.getAttribute('data-target');
        parent.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
        const activeContent = document.getElementById(target);
        if (activeContent) activeContent.style.display = 'block';
      };
    });
  }

  startPrologue() {
    this.isRunning = true;
    window.audioEngine.playMusic('ambient');

    // Cinematic Intro Dialogue
    window.dialogueSystem.startDialogue({
      speaker: 'KAEL',
      avatar: '🗡️',
      text: 'O Festival das Lanternas... o céu escureceu de repente e o portal desmoronou. Lyra desapareceu tentando salvar os moradores... e esta luz estranha se fundiu à minha mão.',
      choices: [
        {
          label: 'Examinar o fragmento brilhante na mão',
          next: {
            speaker: 'NEX',
            avatar: '🌐',
            text: 'Parâmetros vitais sincronizados. Saudações, Kael. Sou NEX, inteligência de custódia do Elo Primordial. O fragmento em sua mão é o elo final da criação. O Abismo está vindo.',
            choices: [
              {
                label: '"O que aconteceu com a Lyra? Onde ela está?"',
                next: {
                  speaker: 'NEX',
                  avatar: '🌐',
                  text: 'Detectei assinaturas dimensionais em outros planos de realidade. Para encontrá-la e restaurar o equilíbrio, precisamos reunir os cinco núcleos espalhados pela Ruptura.',
                  choices: [
                    {
                      label: 'Erguer a lâmina de fótons e lutar!',
                      action: () => {
                        this.showBanner('CAPÍTULO 1', 'O Despertar do Desconhecido');
                        window.companion.speak('Kael, use o analógico ou WASD para mover. O botão de ataque canaliza sua energia!');
                      }
                    }
                  ]
                }
              }
            ]
          }
        }
      ]
    });
  }

  loadChapterWorld(biome) {
    this.worldManager.loadBiome(biome);

    // Clear previous entities
    for (const e of this.enemies) {
      this.scene.remove(e.mesh);
    }
    this.enemies = [];

    for (const p of this.props) {
      this.scene.remove(p.mesh);
    }
    this.props = [];

    if (this.boss) {
      this.scene.remove(this.boss.mesh);
      this.boss = null;
    }

    // Reset Player position to safe zone
    this.player.position.set(0, 0, -10);

    // Populate Biome with Enemies, Props & Bosses
    if (biome === 'aurora') {
      this.enemies.push(new Enemy(this.scene, 'stalker', 10, 12, 1));
      this.enemies.push(new Enemy(this.scene, 'stalker', -12, 14, 1));
      this.enemies.push(new Enemy(this.scene, 'stalker', 0, 20, 2));

      this.props.push(new PropChest(this.scene, -10, -5));
      this.props.push(new PropMemoryObelisk(this.scene, 14, 5, 'Origem de Aurora', 'As ruínas do templo já sustentavam o mundo antes de qualquer memória humana existir.'));

    } else if (biome === 'forest') {
      this.enemies.push(new Enemy(this.scene, 'sentinel', 12, 8, 2));
      this.enemies.push(new Enemy(this.scene, 'sentinel', -14, 12, 2));
      this.enemies.push(new Enemy(this.scene, 'stalker', 6, 22, 2));

      this.props.push(new PropChest(this.scene, 12, -8));
      this.props.push(new PropMemoryObelisk(this.scene, -15, 8, 'A Lembrança das Árvores', 'Kael... por que você aparece aqui em visões gravadas há mais de mil anos?'));

      // Spawn Boss: Vesper
      this.boss = new Boss(this.scene, 'vesper', 0, 25);
      window.audioEngine.playMusic('boss');

    } else if (biome === 'desert') {
      this.enemies.push(new Enemy(this.scene, 'brute', -14, 12, 3));
      this.enemies.push(new Enemy(this.scene, 'sentinel', 15, 15, 3));
      this.enemies.push(new Enemy(this.scene, 'stalker', 0, 18, 3));

      this.props.push(new PropChest(this.scene, -18, -10, { type: 'gear', name: 'Lâmina de Fótons Estelar', qty: 1 }));
      this.props.push(new PropMemoryObelisk(this.scene, 12, 12, 'Registros de Asterion', 'Asterion não agiu sozinho. Os outros guardiões ocultaram a verdade sobre a Ruptura.'));

      this.boss = new Boss(this.scene, 'morvak', 0, 26);
      window.audioEngine.playMusic('boss');

    } else if (biome === 'eclipsia') {
      this.enemies.push(new Enemy(this.scene, 'sentinel', 10, 10, 4));
      this.enemies.push(new Enemy(this.scene, 'stalker', -12, 12, 4));
      this.enemies.push(new Enemy(this.scene, 'brute', 0, 20, 4));

      this.props.push(new PropMemoryObelisk(this.scene, 0, 8, 'Observatório de Lyra', 'Eu encontrei você dentro de uma cápsula ancestral, Kael. Não havia registros biológicos.'));

    } else if (biome === 'ferrum') {
      this.enemies.push(new Enemy(this.scene, 'brute', -15, 10, 5));
      this.enemies.push(new Enemy(this.scene, 'sentinel', 15, 12, 5));
      this.enemies.push(new Enemy(this.scene, 'stalker', 0, 18, 5));

    } else if (biome === 'sanctuary') {
      this.props.push(new PropMemoryObelisk(this.scene, 0, 10, 'A Verdade Revelada', 'Kael é a consciência unificada dos Guardiões, reencarnada para corrigir a Ruptura.'));

    } else if (biome === 'citadel') {
      this.enemies.push(new Enemy(this.scene, 'brute', -10, 10, 6));
      this.enemies.push(new Enemy(this.scene, 'stalker', 10, 10, 6));

      // Final Boss: O NADA
      this.boss = new Boss(this.scene, 'onada', 0, 22);
      window.audioEngine.playMusic('boss');
    }

    window.questSystem.updateHUD();
  }

  showBanner(sub, title) {
    const banner = document.getElementById('banner-notification');
    const subEl = document.getElementById('banner-sub');
    const titleEl = document.getElementById('banner-main');
    if (banner && subEl && titleEl) {
      subEl.textContent = sub;
      titleEl.textContent = title;
      banner.classList.add('visible');
      setTimeout(() => { banner.classList.remove('visible'); }, 3800);
    }
  }

  showCompanionBubble(text, duration = 4500) {
    const bubble = document.getElementById('companion-bubble');
    const bubbleText = document.getElementById('companion-bubble-text');
    if (bubble && bubbleText) {
      bubbleText.textContent = text;
      bubble.style.display = 'block';
      setTimeout(() => { bubble.style.display = 'none'; }, duration);
    }
  }

  spawnFloatingText(text, x, y, z, cssClass = 'enemy-hit') {
    const el = document.createElement('div');
    el.className = `floating-dmg ${cssClass}`;
    el.textContent = text;
    document.body.appendChild(el);

    // Project 3D coordinate to 2D screen coordinate
    const v = new THREE.Vector3(x, y, z);
    v.project(this.camera);

    const screenX = (v.x * 0.5 + 0.5) * window.innerWidth;
    const screenY = (-(v.y * 0.5) + 0.5) * window.innerHeight;

    el.style.left = `${screenX}px`;
    el.style.top = `${screenY}px`;

    setTimeout(() => {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 1000);
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    const modal = document.getElementById('pause-modal');
    if (modal) {
      modal.style.display = this.isPaused ? 'flex' : 'none';
    }
  }

  showEndingModal() {
    const modal = document.getElementById('ending-modal');
    if (modal) modal.style.display = 'flex';
  }

  selectEnding(endingNumber) {
    document.getElementById('ending-modal').style.display = 'none';
    let endingTitle = '';
    let endingText = '';

    if (endingNumber === 1) {
      endingTitle = 'FINAL 1: RECONSTRUÇÃO';
      endingText = 'Kael restaura o Elo Primordial e reconecta todos os mundos conhecidos. O Abismo é expulso, mas os núcleos perdem seus poderes lendários. A humanidade agora traça seu próprio destino entre as estrelas.';
    } else if (endingNumber === 2) {
      endingTitle = 'FINAL 2: SACRIFÍCIO DOS MUNDOS';
      endingText = 'Kael utiliza os núcleos para selar permanentemente o Abismo, isolando as dimensões para sempre. A ameaça do Nada desaparece, e cada dimensão floresce em completa e pacífica solidão cósmica.';
    } else {
      endingTitle = 'FINAL 3: O NOVO UNIVERSO';
      endingText = 'Kael cria uma nova estrutura cósmica livre do controle absoluto de qualquer guardião. Lyra é resgatada e observa ao lado de Kael o céu de Aurora voltar a brilhar. "Os mundos estão conectados novamente. Desta vez, ninguém controla o caminho."';
    }

    window.dialogueSystem.startDialogue({
      speaker: endingTitle,
      avatar: '🌌',
      text: endingText,
      choices: [
        {
          label: 'Continuar no Modo Livre (Pós-Campanha)',
          action: () => {
            this.showBanner('EXPLORAÇÃO LIVRE', 'O mundo dimensional permanece aberto!');
          }
        }
      ]
    });
  }

  checkInteractions() {
    const prompt = document.getElementById('interact-prompt');
    const promptLabel = document.getElementById('interact-label');
    const pPos = this.player.position;
    this.nearestInteractive = null;

    // 1. World Portals & Shrines
    for (const item of this.worldManager.interactives) {
      const dist = Math.hypot(pPos.x - item.x, pPos.z - item.z);
      if (dist <= item.radius) {
        this.nearestInteractive = item;
        break;
      }
    }

    // 2. Props (Chests & Obelisks)
    if (!this.nearestInteractive) {
      for (const prop of this.props) {
        const dist = Math.hypot(pPos.x - prop.position.x, pPos.z - prop.position.z);
        if (dist <= 3.2) {
          if (prop instanceof PropChest && !prop.opened) {
            this.nearestInteractive = { type: 'chest', prop: prop, label: 'Abrir Baú Ancestral' };
            break;
          } else if (prop instanceof PropMemoryObelisk) {
            this.nearestInteractive = { type: 'obelisk', prop: prop, label: 'Inspecionar Eco da Memória' };
            break;
          }
        }
      }
    }

    if (this.nearestInteractive && prompt && promptLabel) {
      prompt.style.display = 'flex';
      promptLabel.textContent = this.nearestInteractive.label;

      if (window.inputSystem.interactPressed) {
        this.executeInteraction(this.nearestInteractive);
      }
    } else if (prompt) {
      prompt.style.display = 'none';
    }
  }

  executeInteraction(item) {
    if (item.type === 'portal') {
      window.audioEngine.playSkillTimeRift();
      window.questSystem.completeChapter();
    } else if (item.type === 'shrine') {
      this.player.heal(100);
      this.player.restoreEnergy(100);
      window.audioEngine.playLevelUp();
      this.showBanner('RESTAURAÇÃO COMPLETA', 'Vida e Energia regeneradas pelo Santuário.');
      window.saveSystem.save();
    } else if (item.type === 'chest') {
      item.prop.open();
    } else if (item.type === 'obelisk') {
      item.prop.inspect();
    }
  }

  animate() {
    requestAnimationFrame(this.animate);

    const delta = Math.min(this.clock.getDelta(), 0.1);
    const time = this.clock.getElapsedTime();

    if (!this.isRunning || this.isPaused) return;

    // 1. Input Update
    window.inputSystem.update();

    // Check Pause / UI shortcuts
    if (window.inputSystem.pausePressed) this.togglePause();
    if (window.inputSystem.inventoryPressed) {
      const modal = document.getElementById('rpg-modal');
      modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
      if (modal.style.display === 'flex') {
        window.rpgSystem.updateInventoryUI();
        window.rpgSystem.updateSkillTreeUI();
      }
    }
    if (window.inputSystem.journalPressed) {
      const modal = document.getElementById('journal-modal');
      modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
      if (modal.style.display === 'flex') window.questSystem.updateJournalUI();
    }

    // 2. Player Update
    this.player.update(delta, window.inputSystem, this.cameraSystem.yaw, this.worldManager.colliders);

    // 3. Companion Update
    this.companion.update(delta, time);

    // 4. Combat System Update
    window.combatSystem.update(delta);

    // 5. Enemies Update
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      enemy.update(delta, this.player, this.worldManager.colliders);
      if (enemy.isDead && enemy.mesh.scale.x <= 0.1) {
        this.enemies.splice(i, 1);
      }
    }

    // 6. Boss Update
    if (this.boss) {
      this.boss.update(delta, this.player);
      if (this.boss.isDead && this.boss.mesh.scale.x <= 0.05) {
        this.boss = null;
      }
    }

    // 7. Props Update
    for (const prop of this.props) {
      if (prop.update) prop.update(time);
    }

    // 8. World Animations
    this.worldManager.update(delta, time);

    // 9. Camera Orbit & Target Lock
    if (window.inputSystem.lockTargetPressed) {
      // Find closest enemy
      let closest = null;
      let minD = 22.0;
      for (const e of this.enemies) {
        if (e.isDead) continue;
        const d = this.player.position.distanceTo(e.position);
        if (d < minD) { minD = d; closest = e; }
      }
      if (this.boss && !this.boss.isDead) {
        const d = this.player.position.distanceTo(this.boss.position);
        if (d < minD) { closest = this.boss; }
      }
      this.cameraSystem.lockOn(closest);
    }
    this.cameraSystem.update(delta, window.inputSystem);

    // 10. Check Proximity Interactions
    this.checkInteractions();

    // 11. Update HUD Bars
    this.updateHUD();

    // 12. Render Scene
    this.renderer.render(this.scene, this.camera);

    // Reset input single-frame impulses
    window.inputSystem.resetImpulses();
  }

  updateHUD() {
    const hpBar = document.getElementById('player-hp-bar');
    const energyBar = document.getElementById('player-energy-bar');
    const xpBar = document.getElementById('player-xp-bar');
    const hpVal = document.getElementById('player-hp-val');
    const energyVal = document.getElementById('player-energy-val');
    const lvlVal = document.getElementById('player-level-val');

    if (hpBar) hpBar.style.width = `${(this.player.health / this.player.maxHealth) * 100}%`;
    if (energyBar) energyBar.style.width = `${(this.player.energy / this.player.maxEnergy) * 100}%`;
    if (xpBar) xpBar.style.width = `${(this.player.xp / this.player.nextXp) * 100}%`;
    if (hpVal) hpVal.textContent = `${Math.round(this.player.health)}/${this.player.maxHealth}`;
    if (energyVal) energyVal.textContent = `${Math.round(this.player.energy)}/${this.player.maxEnergy}`;
    if (lvlVal) lvlVal.textContent = `NV ${this.player.level}`;
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.gameInstance = new Game();
});
