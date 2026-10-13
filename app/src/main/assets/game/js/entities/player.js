// DIMENSÃO ZERO - Protagonist: Kael (3D Model, Rigging & Animations)

class Player {
  constructor(scene) {
    this.scene = scene;
    this.mesh = new THREE.Group();

    // Stats
    this.maxHealth = 100;
    this.health = 100;
    this.maxEnergy = 100;
    this.energy = 100;
    this.energyRegenRate = 15; // per sec
    this.level = 1;
    this.xp = 0;
    this.nextXp = 100;
    this.attackPower = 20;
    this.defensePower = 5;

    // Movement & Physics
    this.position = this.mesh.position;
    this.velocity = new THREE.Vector3();
    this.speed = 8.5;
    this.sprintMultiplier = 1.5;
    this.rotation = 0;
    this.isGrounded = true;
    this.jumpForce = 11.0;
    this.gravity = -26.0;

    // Combat states
    this.isAttacking = false;
    this.comboStep = 0; // 0, 1, 2
    this.comboTimer = 0;
    this.attackCooldown = 0;
    this.isDodging = false;
    this.dodgeTimer = 0;
    this.dodgeDuration = 0.38;
    this.dodgeDirection = new THREE.Vector3();
    this.isInvulnerable = false;
    this.isCastingSkill = false;
    this.skillLockTimer = 0;

    // Build procedural 3D model
    this.buildMesh();
    this.scene.add(this.mesh);
  }

  buildMesh() {
    const armorMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.7,
      roughness: 0.3
    });
    const energyGlowMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.6 });
    const visorMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });

    // Torso / Chest Armor
    const torsoGeo = new THREE.BoxGeometry(0.85, 1.1, 0.45);
    this.torso = new THREE.Mesh(torsoGeo, armorMat);
    this.torso.position.y = 1.35;
    this.torso.castShadow = true;
    this.mesh.add(this.torso);

    // Glowing Chest Core (Fragment of the Link)
    const coreGeo = new THREE.OctahedronGeometry(0.18, 0);
    this.chestCore = new THREE.Mesh(coreGeo, energyGlowMat);
    this.chestCore.position.set(0, 1.45, 0.25);
    this.mesh.add(this.chestCore);

    // Head
    const headGeo = new THREE.BoxGeometry(0.42, 0.45, 0.42);
    this.head = new THREE.Mesh(headGeo, skinMat);
    this.head.position.set(0, 2.15, 0);
    this.head.castShadow = true;
    this.mesh.add(this.head);

    // Visor / Cyber Mask
    const visorGeo = new THREE.BoxGeometry(0.44, 0.14, 0.2);
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(0, 2.18, 0.16);
    this.mesh.add(visor);

    // Scarf / Cape of Aurora
    const capeGeo = new THREE.BoxGeometry(0.7, 0.9, 0.08);
    const capeMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.9 });
    this.cape = new THREE.Mesh(capeGeo, capeMat);
    this.cape.position.set(0, 1.3, -0.26);
    this.mesh.add(this.cape);

    // Left Arm
    const armGeo = new THREE.BoxGeometry(0.24, 0.85, 0.24);
    this.leftArm = new THREE.Mesh(armGeo, armorMat);
    this.leftArm.position.set(-0.6, 1.4, 0);
    this.leftArm.castShadow = true;
    this.mesh.add(this.leftArm);

    // Right Arm (Weapon Arm)
    this.rightArm = new THREE.Mesh(armGeo, armorMat);
    this.rightArm.position.set(0.6, 1.4, 0);
    this.rightArm.castShadow = true;
    this.mesh.add(this.rightArm);

    // Energy Blade (Photon Blade of the Link)
    const hiltGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.35, 8);
    const hiltMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9 });
    this.bladeHilt = new THREE.Mesh(hiltGeo, hiltMat);
    this.bladeHilt.position.set(0.6, 0.9, 0.2);
    this.bladeHilt.rotation.x = Math.PI / 2;
    this.mesh.add(this.bladeHilt);

    const bladeGeo = new THREE.BoxGeometry(0.06, 1.3, 0.22);
    this.bladeMesh = new THREE.Mesh(bladeGeo, energyGlowMat);
    this.bladeMesh.position.set(0.6, 1.0, 0.9);
    this.bladeMesh.rotation.x = Math.PI / 2;
    this.bladeMesh.castShadow = true;
    this.mesh.add(this.bladeMesh);

    // Left Leg
    const legGeo = new THREE.BoxGeometry(0.28, 0.9, 0.3);
    this.leftLeg = new THREE.Mesh(legGeo, armorMat);
    this.leftLeg.position.set(-0.25, 0.45, 0);
    this.leftLeg.castShadow = true;
    this.mesh.add(this.leftLeg);

    // Right Leg
    this.rightLeg = new THREE.Mesh(legGeo, armorMat);
    this.rightLeg.position.set(0.25, 0.45, 0);
    this.rightLeg.castShadow = true;
    this.mesh.add(this.rightLeg);
  }

  takeDamage(amount) {
    if (this.isInvulnerable) return 0;
    const actualDmg = Math.max(1, Math.round(amount * (100 / (100 + this.defensePower))));
    this.health = Math.max(0, this.health - actualDmg);
    window.audioEngine.playImpact();
    window.gameInstance.spawnFloatingText(`-${actualDmg}`, this.position.x, this.position.y + 1.8, this.position.z, 'player-hit');
    window.inputSystem.triggerVibrate(60);
    if (window.gameInstance.cameraSystem) {
      window.gameInstance.cameraSystem.shake(0.35, 0.25);
    }
    return actualDmg;
  }

  heal(amount) {
    const actualHeal = Math.min(this.maxHealth - this.health, amount);
    this.health = Math.min(this.maxHealth, this.health + amount);
    window.gameInstance.spawnFloatingText(`+${actualHeal}`, this.position.x, this.position.y + 1.8, this.position.z, 'heal');
  }

  restoreEnergy(amount) {
    this.energy = Math.min(this.maxEnergy, this.energy + amount);
  }

  addXp(amount) {
    this.xp += amount;
    window.gameInstance.spawnFloatingText(`+${amount} XP`, this.position.x, this.position.y + 2.2, this.position.z, 'enemy-hit');
    if (this.xp >= this.nextXp) {
      this.levelUp();
    }
  }

  levelUp() {
    this.level++;
    this.xp -= this.nextXp;
    this.nextXp = Math.round(this.nextXp * 1.5);
    this.maxHealth += 20;
    this.health = this.maxHealth;
    this.maxEnergy += 15;
    this.energy = this.maxEnergy;
    this.attackPower += 5;
    this.defensePower += 3;
    window.audioEngine.playLevelUp();
    window.gameInstance.showBanner('NÍVEL SUPERIOR!', `Kael alcançou o Nível ${this.level}`);
    if (window.rpgSystem) window.rpgSystem.availableSkillPoints++;
  }

  startAttack() {
    if (this.isAttacking || this.isDodging || this.isCastingSkill) return;
    this.isAttacking = true;
    this.comboStep = (this.comboStep + 1) % 3;
    this.comboTimer = 0.35;
    this.attackCooldown = 0.35;
    window.audioEngine.playSlash();
    window.inputSystem.triggerVibrate(30);

    // Check hit against nearby enemies
    window.combatSystem.checkPlayerMeleeHit(this, this.comboStep);
  }

  startDodge(moveDir) {
    if (this.isDodging || this.energy < 15) return;
    this.energy -= 15;
    this.isDodging = true;
    this.isInvulnerable = true;
    this.dodgeTimer = this.dodgeDuration;
    window.audioEngine.playDodge();
    window.inputSystem.triggerVibrate(35);

    if (moveDir.lengthSq() > 0.01) {
      this.dodgeDirection.copy(moveDir).normalize();
    } else {
      // Dodge backward
      this.dodgeDirection.set(-Math.sin(this.rotation), 0, -Math.cos(this.rotation));
    }
  }

  castSkill1() {
    // Pulso Dimensional (Cost 25 energy)
    if (this.energy < 25 || this.isCastingSkill) return;
    this.energy -= 25;
    this.isCastingSkill = true;
    this.skillLockTimer = 0.45;
    window.audioEngine.playSkillPulse();
    window.inputSystem.triggerVibrate(50);
    window.combatSystem.castDimensionalPulse(this);
  }

  castSkill2() {
    // Lâmina de Fótons (Cost 35 energy)
    if (this.energy < 35 || this.isCastingSkill) return;
    this.energy -= 35;
    this.isCastingSkill = true;
    this.skillLockTimer = 0.45;
    window.audioEngine.playSkillPhoton();
    window.inputSystem.triggerVibrate(50);
    window.combatSystem.castPhotonBlade(this);
  }

  castSkill3() {
    // Fenda Temporal (Cost 50 energy)
    if (this.energy < 50 || this.isCastingSkill) return;
    this.energy -= 50;
    this.isCastingSkill = true;
    this.skillLockTimer = 0.5;
    window.audioEngine.playSkillTimeRift();
    window.inputSystem.triggerVibrate(70);
    window.combatSystem.castTimeRift(this);
  }

  update(delta, input, cameraYaw, colliders) {
    // Energy regeneration
    if (!this.isDodging && !this.isCastingSkill) {
      this.energy = Math.min(this.maxEnergy, this.energy + this.energyRegenRate * delta);
    }

    // Cooldown timers
    if (this.attackCooldown > 0) {
      this.attackCooldown -= delta;
      if (this.attackCooldown <= 0) {
        this.isAttacking = false;
      }
    }
    if (this.comboTimer > 0) {
      this.comboTimer -= delta;
      if (this.comboTimer <= 0) {
        this.comboStep = 0;
      }
    }
    if (this.skillLockTimer > 0) {
      this.skillLockTimer -= delta;
      if (this.skillLockTimer <= 0) {
        this.isCastingSkill = false;
      }
    }

    // Process inputs
    if (input.attackPressed) this.startAttack();

    // Movement direction relative to camera yaw
    let moveDir = new THREE.Vector3();
    if (Math.abs(input.moveX) > 0.05 || Math.abs(input.moveZ) > 0.05) {
      const angle = Math.atan2(input.moveX, input.moveZ);
      const combinedAngle = angle + cameraYaw;
      moveDir.set(Math.sin(combinedAngle), 0, Math.cos(combinedAngle));
    }

    if (input.dodgePressed) this.startDodge(moveDir);
    if (input.skill1Pressed) this.castSkill1();
    if (input.skill2Pressed) this.castSkill2();
    if (input.skill3Pressed) this.castSkill3();

    // Dodge Physics
    if (this.isDodging) {
      this.dodgeTimer -= delta;
      const dodgeSpeed = 18.0;
      this.velocity.x = this.dodgeDirection.x * dodgeSpeed;
      this.velocity.z = this.dodgeDirection.z * dodgeSpeed;

      if (this.dodgeTimer <= 0) {
        this.isDodging = false;
        this.isInvulnerable = false;
      }
    } else if (!this.isCastingSkill) {
      // Normal walk / sprint
      if (moveDir.lengthSq() > 0.01) {
        const curSpeed = input.sprint ? this.speed * this.sprintMultiplier : this.speed;
        this.velocity.x = moveDir.x * curSpeed;
        this.velocity.z = moveDir.z * curSpeed;

        // Smooth face target direction
        const targetRot = Math.atan2(moveDir.x, moveDir.z);
        let diff = targetRot - this.rotation;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        this.rotation += diff * 14.0 * delta;
        this.mesh.rotation.y = this.rotation;
      } else {
        this.velocity.x *= 0.7;
        this.velocity.z *= 0.7;
      }
    } else {
      this.velocity.x *= 0.5;
      this.velocity.z *= 0.5;
    }

    // Jump & Gravity
    if (input.jumpPressed && this.isGrounded && !this.isDodging) {
      this.velocity.y = this.jumpForce;
      this.isGrounded = false;
      window.audioEngine.playJump();
    }

    this.velocity.y += this.gravity * delta;
    this.position.y += this.velocity.y * delta;

    if (this.position.y <= 0) {
      this.position.y = 0;
      this.velocity.y = 0;
      this.isGrounded = true;
    }

    // Collision check against world obstacles
    const nextX = this.position.x + this.velocity.x * delta;
    const nextZ = this.position.z + this.velocity.z * delta;
    let canMoveX = true;
    let canMoveZ = true;

    for (const col of colliders) {
      const distSqX = Math.hypot(nextX - col.x, this.position.z - col.z);
      if (distSqX < col.radius + 0.6) canMoveX = false;

      const distSqZ = Math.hypot(this.position.x - col.x, nextZ - col.z);
      if (distSqZ < col.radius + 0.6) canMoveZ = false;
    }

    // Keep inside arena island (radius 58)
    const distFromCenter = Math.hypot(nextX, nextZ);
    if (distFromCenter > 56) {
      canMoveX = false;
      canMoveZ = false;
    }

    if (canMoveX) this.position.x = nextX;
    if (canMoveZ) this.position.z = nextZ;

    // Procedural Animations
    this.animateBones(delta);
  }

  animateBones(delta) {
    const isMoving = Math.hypot(this.velocity.x, this.velocity.z) > 0.8;
    const t = performance.now() * 0.008;

    // Pulse chest core
    const corePulse = 1.0 + Math.sin(t * 3.0) * 0.2;
    this.chestCore.scale.set(corePulse, corePulse, corePulse);

    if (this.isDodging) {
      // Spin roll
      this.mesh.rotation.x = -Math.PI * (1 - this.dodgeTimer / this.dodgeDuration) * 2;
      this.torso.position.y = 0.8;
    } else {
      this.mesh.rotation.x = 0;
      this.torso.position.y = 1.35;

      if (this.isAttacking) {
        // Sword slash pose
        this.rightArm.rotation.x = -Math.PI / 2 + Math.sin(t * 20) * 0.8;
        this.rightArm.rotation.y = -Math.PI / 4;
        this.bladeMesh.scale.y = 1.4;
      } else {
        this.bladeMesh.scale.y = 1.0;
        if (isMoving && this.isGrounded) {
          // Walk / Run cycle
          this.leftLeg.rotation.x = Math.sin(t) * 0.8;
          this.rightLeg.rotation.x = -Math.sin(t) * 0.8;
          this.leftArm.rotation.x = -Math.sin(t) * 0.7;
          this.rightArm.rotation.x = Math.sin(t) * 0.7;
          this.cape.rotation.x = 0.4 + Math.abs(Math.sin(t)) * 0.3;
        } else {
          // Idle breathing
          this.leftLeg.rotation.x = 0;
          this.rightLeg.rotation.x = 0;
          this.leftArm.rotation.x = Math.sin(t * 0.3) * 0.05;
          this.rightArm.rotation.x = -Math.sin(t * 0.3) * 0.05;
          this.cape.rotation.x = 0.1 + Math.sin(t * 0.4) * 0.05;
        }
      }
    }
  }
}

window.Player = Player;
