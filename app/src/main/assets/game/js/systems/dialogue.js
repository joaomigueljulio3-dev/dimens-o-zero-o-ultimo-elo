// DIMENSÃO ZERO - Interactive Dialogue System with Character Portraits & Branching Choices

class DialogueSystem {
  constructor() {
    this.isOpen = false;
    this.currentDialogue = null;
    this.typewriterInterval = null;
  }

  startDialogue(data) {
    this.isOpen = true;
    this.currentDialogue = data;

    const container = document.getElementById('dialogue-container');
    const speakerEl = document.getElementById('speaker-name');
    const avatarEl = document.getElementById('speaker-avatar');
    const textEl = document.getElementById('dialogue-text');
    const choicesEl = document.getElementById('dialogue-choices');

    if (!container || !textEl || !choicesEl) return;

    container.style.display = 'block';
    if (speakerEl) speakerEl.textContent = data.speaker || 'DESCONHECIDO';
    if (avatarEl) avatarEl.textContent = data.avatar || '💬';

    // Typewriter effect
    textEl.textContent = '';
    choicesEl.innerHTML = '';
    let charIdx = 0;
    const fullText = data.text;

    if (this.typewriterInterval) clearInterval(this.typewriterInterval);

    this.typewriterInterval = setInterval(() => {
      if (charIdx < fullText.length) {
        textEl.textContent += fullText[charIdx];
        if (charIdx % 3 === 0) window.audioEngine.playBlip();
        charIdx++;
      } else {
        clearInterval(this.typewriterInterval);
        this.renderChoices(data.choices, choicesEl);
      }
    }, 18);
  }

  renderChoices(choices, container) {
    container.innerHTML = '';
    if (!choices || choices.length === 0) {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.textContent = 'Continuar [F]';
      btn.onclick = () => this.close();
      container.appendChild(btn);
      return;
    }

    choices.forEach(ch => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.textContent = ch.label;
      btn.onclick = () => {
        window.audioEngine.playBlip();
        if (ch.action) ch.action();
        if (ch.next) {
          this.startDialogue(ch.next);
        } else {
          this.close();
        }
      };
      container.appendChild(btn);
    });
  }

  close() {
    this.isOpen = false;
    const container = document.getElementById('dialogue-container');
    if (container) container.style.display = 'none';
    if (this.typewriterInterval) clearInterval(this.typewriterInterval);
  }
}

window.dialogueSystem = new DialogueSystem();
