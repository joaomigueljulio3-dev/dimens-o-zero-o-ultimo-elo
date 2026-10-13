// DIMENSÃO ZERO - Unified Input System (PC Keyboard/Mouse, Mobile Touch, Gamepad)

class InputSystem {
  constructor() {
    this.moveX = 0;
    this.moveZ = 0;
    this.lookDeltaX = 0;
    this.lookDeltaY = 0;

    this.attack = false;
    this.attackPressed = false;
    this.jump = false;
    this.jumpPressed = false;
    this.dodge = false;
    this.dodgePressed = false;
    this.sprint = false;
    this.skill1 = false;
    this.skill1Pressed = false;
    this.skill2 = false;
    this.skill2Pressed = false;
    this.skill3 = false;
    this.skill3Pressed = false;
    this.interact = false;
    this.interactPressed = false;
    this.lockTarget = false;
    this.lockTargetPressed = false;
    this.inventoryPressed = false;
    this.journalPressed = false;
    this.mapPressed = false;
    this.pausePressed = false;

    this.mode = 'touch'; // 'keyboard', 'touch', 'gamepad'
    this.cameraSensitivity = 1.0;
    this.invertY = false;
    this.gamepadConnected = false;
    this.gamepadIndex = null;

    // Joystick internal
    this.joystickActive = false;
    this.joystickTouchId = null;
    this.joystickOriginX = 0;
    this.joystickOriginY = 0;

    // Camera swipe internal
    this.cameraTouchId = null;
    this.lastTouchX = 0;
    this.lastTouchY = 0;

    // Key states
    this.keys = {};
    this.mouseButtons = {};
    this.isPointerLocked = false;

    this.setupKeyboard();
    this.setupTouch();
    this.setupGamepad();
  }

  setupKeyboard() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      this.mode = 'keyboard';

      if (e.code === 'KeyF') this.interactPressed = true;
      if (e.code === 'Space') this.jumpPressed = true;
      if (e.code === 'KeyQ') this.skill1Pressed = true;
      if (e.code === 'KeyE') this.skill2Pressed = true;
      if (e.code === 'KeyR') this.skill3Pressed = true;
      if (e.code === 'ControlLeft' || e.code === 'KeyC') this.dodgePressed = true;
      if (e.code === 'Tab') { e.preventDefault(); this.inventoryPressed = true; }
      if (e.code === 'KeyJ') this.journalPressed = true;
      if (e.code === 'KeyM') this.mapPressed = true;
      if (e.code === 'Escape') this.pausePressed = true;
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    const canvas = document.getElementById('canvas-container');
    if (canvas) {
      canvas.addEventListener('mousedown', (e) => {
        this.mode = 'keyboard';
        if (e.button === 0) {
          this.attackPressed = true;
          this.attack = true;
        }
      });

      canvas.addEventListener('mouseup', (e) => {
        if (e.button === 0) this.attack = false;
      });

      document.addEventListener('mousemove', (e) => {
        if (document.pointerLockElement === canvas) {
          const inv = this.invertY ? -1 : 1;
          this.lookDeltaX += e.movementX * 0.0025 * this.cameraSensitivity;
          this.lookDeltaY += e.movementY * 0.0025 * this.cameraSensitivity * inv;
        }
      });
    }
  }

  setupTouch() {
    const joyZone = document.getElementById('joystick-zone');
    const joyStick = document.getElementById('joystick-stick');
    const camZone = document.getElementById('camera-touch-zone');

    if (joyZone && joyStick) {
      joyZone.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.mode = 'touch';
        const touch = e.changedTouches[0];
        this.joystickTouchId = touch.identifier;
        const rect = joyZone.getBoundingClientRect();
        this.joystickOriginX = rect.left + rect.width / 2;
        this.joystickOriginY = rect.top + rect.height / 2;
        this.joystickActive = true;
        this.updateJoystick(touch.clientX, touch.clientY, joyStick);
      }, { passive: false });

      window.addEventListener('touchmove', (e) => {
        for (let i = 0; i < e.changedTouches.length; i++) {
          const touch = e.changedTouches[i];
          if (touch.identifier === this.joystickTouchId) {
            e.preventDefault();
            this.updateJoystick(touch.clientX, touch.clientY, joyStick);
          } else if (touch.identifier === this.cameraTouchId) {
            e.preventDefault();
            const dx = touch.clientX - this.lastTouchX;
            const dy = touch.clientY - this.lastTouchY;
            const inv = this.invertY ? -1 : 1;
            this.lookDeltaX += dx * 0.006 * this.cameraSensitivity;
            this.lookDeltaY += dy * 0.006 * this.cameraSensitivity * inv;
            this.lastTouchX = touch.clientX;
            this.lastTouchY = touch.clientY;
          }
        }
      }, { passive: false });

      const endJoy = (e) => {
        for (let i = 0; i < e.changedTouches.length; i++) {
          if (e.changedTouches[i].identifier === this.joystickTouchId) {
            this.joystickActive = false;
            this.joystickTouchId = null;
            this.moveX = 0;
            this.moveZ = 0;
            joyStick.style.transform = `translate(0px, 0px)`;
          }
          if (e.changedTouches[i].identifier === this.cameraTouchId) {
            this.cameraTouchId = null;
          }
        }
      };
      window.addEventListener('touchend', endJoy);
      window.addEventListener('touchcancel', endJoy);
    }

    if (camZone) {
      camZone.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.changedTouches[0];
        if (this.cameraTouchId === null) {
          this.cameraTouchId = touch.identifier;
          this.lastTouchX = touch.clientX;
          this.lastTouchY = touch.clientY;
        }
      }, { passive: false });
    }

    // Touch Action Buttons
    const bindTouchAction = (id, propName, isImpulse = false) => {
      const btn = document.getElementById(id);
      if (!btn) return;
      btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.mode = 'touch';
        this[propName] = true;
        if (isImpulse) this[propName + 'Pressed'] = true;
        btn.classList.add('pressed');
        this.triggerVibrate(25);
      }, { passive: false });

      const release = (e) => {
        e.preventDefault();
        this[propName] = false;
        btn.classList.remove('pressed');
      };
      btn.addEventListener('touchend', release);
      btn.addEventListener('touchcancel', release);
    };

    bindTouchAction('btn-attack', 'attack', true);
    bindTouchAction('btn-jump', 'jump', true);
    bindTouchAction('btn-dodge', 'dodge', true);
    bindTouchAction('btn-sprint', 'sprint', false);
    bindTouchAction('btn-skill-1', 'skill1', true);
    bindTouchAction('btn-skill-2', 'skill2', true);
    bindTouchAction('btn-skill-3', 'skill3', true);
    bindTouchAction('btn-lock', 'lockTarget', true);
    bindTouchAction('interact-prompt', 'interact', true);
  }

  updateJoystick(clientX, clientY, stickEl) {
    const maxRadius = 45;
    const dx = clientX - this.joystickOriginX;
    const dy = clientY - this.joystickOriginY;
    const dist = Math.hypot(dx, dy);
    const angle = Math.atan2(dy, dx);

    const clampedDist = Math.min(dist, maxRadius);
    const clampedX = Math.cos(angle) * clampedDist;
    const clampedY = Math.sin(angle) * clampedDist;

    stickEl.style.transform = `translate(${clampedX}px, ${clampedY}px)`;

    const norm = clampedDist / maxRadius;
    this.moveX = Math.cos(angle) * norm;
    this.moveZ = Math.sin(angle) * norm;
  }

  setupGamepad() {
    window.addEventListener('gamepadconnected', (e) => {
      this.gamepadConnected = true;
      this.gamepadIndex = e.gamepad.index;
      this.mode = 'gamepad';
      this.showGamepadBanner(e.gamepad.id);
    });

    window.addEventListener('gamepaddisconnected', (e) => {
      if (this.gamepadIndex === e.gamepad.index) {
        this.gamepadConnected = false;
        this.gamepadIndex = null;
        const ind = document.getElementById('gamepad-indicator');
        if (ind) ind.style.display = 'none';
      }
    });
  }

  showGamepadBanner(name) {
    const ind = document.getElementById('gamepad-indicator');
    if (ind) {
      ind.style.display = 'flex';
      ind.innerHTML = `🎮 CONTROLE: ${name.substring(0, 18)}`;
      setTimeout(() => { if (ind) ind.style.display = 'none'; }, 5000);
    }
  }

  triggerVibrate(duration = 40) {
    if (window.AndroidBridge && window.AndroidBridge.vibrate) {
      try { window.AndroidBridge.vibrate(duration); } catch (e) {}
    } else if (navigator.vibrate) {
      navigator.vibrate(duration);
    }
  }

  pollGamepad() {
    if (!navigator.getGamepads) return;
    const gamepads = navigator.getGamepads();
    const gp = gamepads[this.gamepadIndex] || gamepads[0];
    if (!gp) return;

    this.mode = 'gamepad';
    const deadzone = 0.18;

    // Movement (Left Stick)
    const axisX = gp.axes[0] || 0;
    const axisY = gp.axes[1] || 0;
    this.moveX = Math.abs(axisX) > deadzone ? axisX : 0;
    this.moveZ = Math.abs(axisY) > deadzone ? axisY : 0;

    // Camera (Right Stick)
    const camX = gp.axes[2] || 0;
    const camY = gp.axes[3] || 0;
    if (Math.abs(camX) > deadzone) {
      this.lookDeltaX += camX * 0.04 * this.cameraSensitivity;
    }
    if (Math.abs(camY) > deadzone) {
      const inv = this.invertY ? -1 : 1;
      this.lookDeltaY += camY * 0.04 * this.cameraSensitivity * inv;
    }

    // Buttons
    // 0: A/Cross (Jump), 1: B/Circle (Dodge), 2: X/Square (Attack), 3: Y/Triangle (Skill 1)
    // 4: L1 (Skill 2), 5: R1 (Skill 3), 6: L2 (Aim), 7: R2 (Heavy/Skill), 8: Select (Map), 9: Start (Pause)
    // 10: L3 (Sprint), 11: R3 (Lock Target), 12-15: D-pad
    if (gp.buttons[2] && gp.buttons[2].pressed) {
      if (!this.attack) this.attackPressed = true;
      this.attack = true;
    } else if (this.mode === 'gamepad') {
      this.attack = false;
    }

    if (gp.buttons[0] && gp.buttons[0].pressed && !this.jump) this.jumpPressed = true;
    this.jump = gp.buttons[0] && gp.buttons[0].pressed;

    if (gp.buttons[1] && gp.buttons[1].pressed && !this.dodge) this.dodgePressed = true;
    this.dodge = gp.buttons[1] && gp.buttons[1].pressed;

    this.sprint = (gp.buttons[10] && gp.buttons[10].pressed) || (gp.buttons[7] && gp.buttons[7].value > 0.5);

    if (gp.buttons[3] && gp.buttons[3].pressed && !this.skill1) this.skill1Pressed = true;
    this.skill1 = gp.buttons[3] && gp.buttons[3].pressed;

    if (gp.buttons[4] && gp.buttons[4].pressed && !this.skill2) this.skill2Pressed = true;
    this.skill2 = gp.buttons[4] && gp.buttons[4].pressed;

    if (gp.buttons[5] && gp.buttons[5].pressed && !this.skill3) this.skill3Pressed = true;
    this.skill3 = gp.buttons[5] && gp.buttons[5].pressed;

    if (gp.buttons[11] && gp.buttons[11].pressed && !this.lockTarget) this.lockTargetPressed = true;
    this.lockTarget = gp.buttons[11] && gp.buttons[11].pressed;

    if (gp.buttons[9] && gp.buttons[9].pressed && !this.pause) this.pausePressed = true;
    if (gp.buttons[8] && gp.buttons[8].pressed && !this.map) this.mapPressed = true;
  }

  update() {
    // Poll gamepad each frame
    this.pollGamepad();

    // If keyboard is primary input
    if (this.mode === 'keyboard') {
      let kx = 0;
      let kz = 0;
      if (this.keys['KeyA'] || this.keys['ArrowLeft']) kx -= 1;
      if (this.keys['KeyD'] || this.keys['ArrowRight']) kx += 1;
      if (this.keys['KeyW'] || this.keys['ArrowUp']) kz -= 1;
      if (this.keys['KeyS'] || this.keys['ArrowDown']) kz += 1;

      if (kx !== 0 || kz !== 0) {
        const len = Math.hypot(kx, kz);
        this.moveX = kx / len;
        this.moveZ = kz / len;
      } else if (!this.joystickActive && !this.gamepadConnected) {
        this.moveX = 0;
        this.moveZ = 0;
      }

      this.sprint = !!this.keys['ShiftLeft'];
      this.jump = !!this.keys['Space'];
      this.dodge = !!this.keys['ControlLeft'] || !!this.keys['KeyC'];
    }
  }

  // Clear single-frame impulses at end of frame
  resetImpulses() {
    this.lookDeltaX = 0;
    this.lookDeltaY = 0;
    this.attackPressed = false;
    this.jumpPressed = false;
    this.dodgePressed = false;
    this.skill1Pressed = false;
    this.skill2Pressed = false;
    this.skill3Pressed = false;
    this.interactPressed = false;
    this.lockTargetPressed = false;
    this.inventoryPressed = false;
    this.journalPressed = false;
    this.mapPressed = false;
    this.pausePressed = false;
  }
}

window.inputSystem = new InputSystem();
