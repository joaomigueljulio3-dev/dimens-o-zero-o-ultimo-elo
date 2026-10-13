// DIMENSÃO ZERO - Narrative Quest & Chapter Progression System (Chapters 1 to 8 + Side Quests)

class QuestSystem {
  constructor() {
    this.currentChapter = 1;
    this.currentStepIndex = 0;

    // Full campaign chapters data
    this.chapters = [
      {
        id: 1,
        title: 'Capítulo 1: O Despertar do Desconhecido',
        biome: 'aurora',
        steps: [
          { text: 'Explore as ruínas do templo subterrâneo de Aurora.', target: 'explore_temple' },
          { text: 'Elimine as criaturas de sombra que invadiram o templo (0/3).', target: 'kill_shadows', count: 0, required: 3 },
          { text: 'Sincronize com o terminal ancestral e converse com NEX.', target: 'talk_nex' },
          { text: 'Ative o portal dimensional para a Floresta Cristalina.', target: 'activate_portal_1' }
        ]
      },
      {
        id: 2,
        title: 'Capítulo 2: A Floresta que se Lembra',
        biome: 'forest',
        steps: [
          { text: 'Investigue as árvores de memória luminosas na floresta.', target: 'inspect_memory' },
          { text: 'Purifique as sentinelas corrompidas pelo Abismo (0/3).', target: 'kill_sentinels', count: 0, required: 3 },
          { text: 'Derrote Vesper, o Guardião Enraizado, e liberte o 1º Núcleo.', target: 'boss_vesper' },
          { text: 'Atravesse a fenda estelar em direção ao Deserto.', target: 'activate_portal_2' }
        ]
      },
      {
        id: 3,
        title: 'Capítulo 3: O Deserto das Estrelas Mortas',
        biome: 'desert',
        steps: [
          { text: 'Localize os destroços da nave de Riven nas dunas cósmicas.', target: 'find_riven' },
          { text: 'Recupere peças de propulsão nos destroços metálicos.', target: 'gather_parts' },
          { text: 'Derrote MORVAK, o Devorador de Órbitas, e recupere o 2º Núcleo.', target: 'boss_morvak' },
          { text: 'Abra a passagem temporal para a cidade de Eclipsia.', target: 'activate_portal_3' }
        ]
      },
      {
        id: 4,
        title: 'Capítulo 4: A Cidade Fora do Tempo',
        biome: 'eclipsia',
        steps: [
          { text: 'Explore os anéis cronológicos da cidade suspensa.', target: 'explore_clocks' },
          { text: 'Encontre Lyra no observatório e descubra a verdade da sua origem.', target: 'talk_lyra' },
          { text: 'Sobreviva ao ataque dos agentes do Abismo (0/4).', target: 'kill_abyss_agents', count: 0, required: 4 },
          { text: 'Escape com o 3º Núcleo através do condutor dimensional.', target: 'activate_portal_4' }
        ]
      },
      {
        id: 5,
        title: 'Capítulo 5: O Reino das Máquinas Silenciosas',
        biome: 'ferrum',
        steps: [
          { text: 'Atravesse o complexo industrial abandonado de Ferrum.', target: 'explore_ferrum' },
          { text: 'Confronte o Comandante Solen da Ordem do Horizonte.', target: 'talk_solen' },
          { text: 'Desative os autômatos blindados em revolta (0/3).', target: 'kill_automatons', count: 0, required: 3 },
          { text: 'Recupere o 4º Núcleo Dimensional do gerador central.', target: 'activate_portal_5' }
        ]
      },
      {
        id: 6,
        title: 'Capítulo 6: A Verdade sobre Kael',
        biome: 'sanctuary',
        steps: [
          { text: 'Acesse o pedestal do Santuário das Origens.', target: 'access_sanctuary' },
          { text: 'Ouça o eco deixado por Asterion sobre o Elo Primordial.', target: 'hear_asterion' },
          { text: 'Prepare-se para invadir o coração do Abismo.', target: 'activate_portal_6' }
        ]
      },
      {
        id: 7,
        title: 'Capítulo 7: A Cidadela do Vazio',
        biome: 'citadel',
        steps: [
          { text: 'Avance pelos monólitos invertidos da cidadela.', target: 'explore_citadel' },
          { text: 'Derrote os três generais sombrios do Abismo (0/3).', target: 'kill_generals', count: 0, required: 3 },
          { text: 'Confronte a entidade primordial: O NADA.', target: 'boss_onada' }
        ]
      },
      {
        id: 8,
        title: 'Capítulo 8: O Último Elo',
        biome: 'sanctuary',
        steps: [
          { text: 'Retorne ao Santuário com os 5 Núcleos reunidos.', target: 'final_nexus' },
          { text: 'Decida o destino de toda a realidade no Elo Primordial.', target: 'choose_ending' }
        ]
      }
    ];

    // Secondary Quests
    this.sideQuests = [
      {
        id: 'sq_lyra',
        title: 'O Diário Secreto de Lyra',
        desc: 'Colete lembranças antigas dispersas pelos mundos dimensionais.',
        progress: '1/3 Fragmentos encontrados',
        reward: 'Armadura da Exploradora (+15 Defesa)',
        completed: false
      },
      {
        id: 'sq_riven',
        title: 'O Propulsor de Riven',
        desc: 'Ajude Riven a calibrar o motor gravitacional de sua nave.',
        progress: 'Concluído',
        reward: 'Célula de Energia Ancestral',
        completed: true
      }
    ];

    this.completedLog = [];
    this.decisions = {
      trustedSolen: false,
      savedLyraMemories: true,
      foundAsterionSecret: false
    };
  }

  getCurrentStep() {
    const chap = this.chapters[this.currentChapter - 1];
    if (!chap) return { text: 'Campanha Concluída! Modo Livre Ativo.' };
    return chap.steps[this.currentStepIndex] || { text: 'Capítulo Concluído!' };
  }

  updateHUD() {
    const titleEl = document.getElementById('quest-tracker-title');
    const nameEl = document.getElementById('quest-tracker-name');
    const objEl = document.getElementById('quest-tracker-obj');

    const chap = this.chapters[this.currentChapter - 1];
    if (titleEl && nameEl && objEl) {
      if (chap) {
        titleEl.textContent = `MISSÃO PRINCIPAL`;
        nameEl.textContent = chap.title;
        objEl.textContent = this.getCurrentStep().text;
      } else {
        titleEl.textContent = `PÓS-CAMPANHA`;
        nameEl.textContent = `Exploração Livre dos Mundos`;
        objEl.textContent = `Todos os 5 Núcleos restaurados. Explore os segredos do universo!`;
      }
    }
  }

  advanceStep() {
    const chap = this.chapters[this.currentChapter - 1];
    if (!chap) return;

    this.currentStepIndex++;
    if (this.currentStepIndex >= chap.steps.length) {
      this.completeChapter();
    } else {
      window.audioEngine.playBlip();
      window.gameInstance.showBanner('OBJETIVO ATUALIZADO', this.getCurrentStep().text);
      this.updateHUD();
    }
  }

  completeChapter() {
    const chap = this.chapters[this.currentChapter - 1];
    this.completedLog.push(chap.title);
    window.gameInstance.showBanner('CAPÍTULO CONCLUÍDO!', `${chap.title} finalizado com sucesso!`);
    window.audioEngine.playLevelUp();

    // Check reward core
    if (this.currentChapter === 2) window.rpgSystem.addCore('Floresta Cristalina');
    if (this.currentChapter === 3) window.rpgSystem.addCore('Órbitas Mortas');
    if (this.currentChapter === 4) window.rpgSystem.addCore('Eclipsia');
    if (this.currentChapter === 7) window.rpgSystem.addCore('Vazio Cósmico');

    this.currentChapter++;
    this.currentStepIndex = 0;

    if (this.currentChapter <= this.chapters.length) {
      const nextChap = this.chapters[this.currentChapter - 1];
      window.gameInstance.loadChapterWorld(nextChap.biome);
    } else {
      // Reached Epilogue / Free Roam
      window.gameInstance.showEndingModal();
    }
    this.updateHUD();
  }

  onEnemyKilled(type) {
    const step = this.getCurrentStep();
    if (step && step.required) {
      step.count = (step.count || 0) + 1;
      step.text = step.text.replace(/\(\d+\/\d+\)/, `(${step.count}/${step.required})`);
      this.updateHUD();
      if (step.count >= step.required) {
        this.advanceStep();
      }
    }
  }

  onBossDefeated(bossType) {
    const step = this.getCurrentStep();
    if (step && (step.target === 'boss_vesper' || step.target === 'boss_morvak' || step.target === 'boss_onada')) {
      this.advanceStep();
    }
  }

  onMemoryDiscovered(title) {
    window.companion.speak(`Kael, registrei um eco da memória: "${title}". Isto revela a conexão do Elo!`);
    const step = this.getCurrentStep();
    if (step && (step.target === 'inspect_memory' || step.target === 'explore_temple')) {
      this.advanceStep();
    }
  }

  updateJournalUI() {
    const mainList = document.getElementById('journal-main-list');
    const sideList = document.getElementById('journal-side-list');
    const completedList = document.getElementById('journal-completed-list');

    if (mainList) {
      const chap = this.chapters[this.currentChapter - 1];
      if (chap) {
        mainList.innerHTML = `
          <div class="rpg-card">
            <div style="font-weight: 700; color: #00e5ff; font-size: 15px;">${chap.title}</div>
            <div style="margin-top: 8px; color: #f1f5f9; font-size: 13px;">Objetivo Atual:</div>
            <div style="color: #ffd15c; font-weight: 600; margin-top: 2px;">• ${this.getCurrentStep().text}</div>
          </div>
        `;
      } else {
        mainList.innerHTML = `<div class="rpg-card" style="color: #10b981;">Toda a campanha principal foi concluída com honra!</div>`;
      }
    }

    if (sideList) {
      sideList.innerHTML = '';
      this.sideQuests.forEach(sq => {
        const div = document.createElement('div');
        div.className = 'rpg-card';
        div.style.marginBottom = '8px';
        div.innerHTML = `
          <div style="display: flex; justify-content: space-between;">
            <span style="font-weight: 700; color: #ffd15c;">${sq.title}</span>
            <span style="font-size: 11px; color: ${sq.completed ? '#10b981' : '#94a3b8'};">${sq.completed ? 'CONCLUÍDA' : 'EM ANDAMENTO'}</span>
          </div>
          <div style="font-size: 12px; color: #cbd5e1; margin-top: 4px;">${sq.desc}</div>
          <div style="font-size: 11px; color: #00e5ff; margin-top: 4px;">Recompensa: ${sq.reward}</div>
        `;
        sideList.appendChild(div);
      });
    }

    if (completedList) {
      completedList.innerHTML = '';
      if (this.completedLog.length === 0) {
        completedList.innerHTML = `<div style="color: #64748b; font-size: 12px;">Nenhum capítulo concluído ainda.</div>`;
      } else {
        this.completedLog.forEach(title => {
          const div = document.createElement('div');
          div.className = 'rpg-card';
          div.style.marginBottom = '6px';
          div.style.color = '#10b981';
          div.innerHTML = `✓ ${title}`;
          completedList.appendChild(div);
        });
      }
    }
  }
}

window.questSystem = new QuestSystem();
