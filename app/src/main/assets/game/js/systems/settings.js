// DIMENSÃO ZERO - Settings & Performance Manager

class SettingsManager {
  constructor() {
    this.quality = 'medium'; // 'low', 'medium', 'high'
    this.bgmVol = 0.6;
    this.sfxVol = 0.8;
    this.camSens = 1.0;
    this.invertY = false;
    this.vibrate = true;

    this.loadSettings();
  }

  loadSettings() {
    const raw = localStorage.getItem('DIMENSAO_ZERO_SETTINGS');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        this.quality = parsed.quality || 'medium';
        this.bgmVol = parsed.bgmVol !== undefined ? parsed.bgmVol : 0.6;
        this.sfxVol = parsed.sfxVol !== undefined ? parsed.sfxVol : 0.8;
        this.camSens = parsed.camSens || 1.0;
        this.invertY = !!parsed.invertY;
        this.vibrate = parsed.vibrate !== undefined ? parsed.vibrate : true;
      } catch (e) {}
    }
  }

  saveSettings() {
    localStorage.setItem('DIMENSAO_ZERO_SETTINGS', JSON.stringify({
      quality: this.quality,
      bgmVol: this.bgmVol,
      sfxVol: this.sfxVol,
      camSens: this.camSens,
      invertY: this.invertY,
      vibrate: this.vibrate
    }));
  }

  applyToGame() {
    window.audioEngine.setBgmVolume(this.bgmVol);
    window.audioEngine.setSfxVolume(this.sfxVol);
    window.inputSystem.cameraSensitivity = this.camSens;
    window.inputSystem.invertY = this.invertY;

    if (window.gameInstance && window.gameInstance.renderer) {
      const r = window.gameInstance.renderer;
      if (this.quality === 'low') {
        r.setPixelRatio(1.0);
        r.shadowMap.enabled = false;
      } else if (this.quality === 'medium') {
        r.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        r.shadowMap.enabled = true;
      } else {
        r.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));
        r.shadowMap.enabled = true;
      }
    }
  }
}

window.settingsManager = new SettingsManager();
