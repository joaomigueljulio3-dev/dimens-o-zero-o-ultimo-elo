// DIMENSÃO ZERO - Boss Entities: Vesper, Morvak, and O Nada

class Boss {
  constructor(scene, bossType, x, z) {
    this.scene = scene;
    this.type = bossType; // 'vesper', 'morvak', 'onada'
    this.mesh = new THREE.Group();
    this.position = this.mesh.position;
    this.position.set(x, 0, z);

    this.phase = 1;
    this.isDead = false;
    this.attackCooldown = 0;
    this.specialAttackTimer = 8.0;

    this.initBossStats();
    this.buildMesh();
    this.scene.add(this.mesh);

    this.showBossBar();
  }

  initBossStats() {
    if (this.type === 'vesper') {
      this.name = 'Vesper, o Guardião Enraizado';
      this.maxHealth = 400;
      this.health = 400;
      this.attackPower = 24;
      this.speed = 3.2;
    } else if (this.type === 'morvak') {
      this.name = 'MORVAK, o Devorador de Órbitas';
      this.maxHealth = 650;
      this.health = 650;
      this.attackPower = 32;
      this.speed = 3.8;
    } else {
      // O NADA (Final Boss)
      this.name = 'O NADA - Consciência do Abismo';
      this.maxHealth = 950;
      this.health = 950;
      this.attackPower = 42;
      this.speed = 4.2;
    }
  }

  buildMesh() {
    if (this.type === 'vesper') {
      // Corrupted Ancient Tree Colossus
      const woodMat = new THREE.MeshStandardMaterial({ color: 0x1b130e, roughness: 0.9 });
      const crystalMat = new THREE.MeshStandardMaterial({
        color: 0x7c3aed,
        emissive: 0x4c1d95,
        roughness: 0.2
      });

      const trunkGeo = new THREE.CylinderGeometry(1.8, 2.6, 5.5, 8);
      this.body = new THREE.Mesh(trunkGeo, woodMat);
      this.body.position.y = 2.75;
      this.mesh.add(this.body);

      // Root Arms
      const armGeo = new THREE.CylinderGeometry(0.5, 0.9, 4.0, 6);
      this.armL = new THREE.Mesh(armGeo, woodMat);
      this.armL.position.set(-2.4, 3.2, 0);
      this.armL.rotation.z = Math.PI / 6;
      this.mesh.add(this.armL);

      this.armR = new THREE.Mesh(armGeo, woodMat);
      this.armR.position.set(2.4, 3.2, 0);
      this.armR.rotation.z = -Math.PI / 6;
      this.mesh.add(this.armR);

      // Heart Crystal Core
      const coreGeo = new THREE.OctahedronGeometry(1.0, 0);
      this.core = new THREE.Mesh(coreGeo, crystalMat);
      this.core.position.set(0, 3.5, 1.2);
      this.mesh.add(this.core);

    } else if (this.type === 'morvak') {
      // Heavy Orbital Mech Engine
      const metalMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.85, roughness: 0.25 });
      const coreMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });

      const hullGeo = new THREE.DodecahedronGeometry(2.4, 1);
      this.body = new THREE.Mesh(hullGeo, metalMat);
      this.body.position.y = 3.6;
      this.mesh.add(this.body);

      // Orbiting Debris Ring
      const ringGeo = new THREE.TorusGeometry(4.2, 0.35, 8, 32);
      this.ring = new THREE.Mesh(ringGeo, metalMat);
      this.ring.position.y = 3.6;
      this.ring.rotation.x = Math.PI / 2.5;
      this.mesh.add(this.ring);

      const eyeGeo = new THREE.SphereGeometry(0.8, 16, 16);
      this.core = new THREE.Mesh(eyeGeo, coreMat);
      this.core.position.set(0, 3.6, 1.6);
      this.mesh.add(this.core);

    } else {
      // O NADA - Geometric Void Singularity
      const darkMat = new THREE.MeshStandardMaterial({
        color: 0x050008,
        emissive: 0x2e022b,
        roughness: 0.1,
        metalness: 0.9
      });
      const riftMat = new THREE.MeshBasicMaterial({ color: 0xff0055, wireframe: true });

      const polyGeo = new THREE.IcosahedronGeometry(2.8, 1);
      this.body = new THREE.Mesh(polyGeo, darkMat);
      this.body.position.y = 4.0;
      this.mesh.add(this.body);

      const wireGeo = new THREE.IcosahedronGeometry(3.6, 1);
      this.wire = new THREE.Mesh(wireGeo, riftMat);
      this.wire.position.y = 4.0;
      this.mesh.add(this.wire);

      // Floating Void Wings
      const wingGeo = new THREE.ConeGeometry(0.8, 6.0, 4);
      for (let i = 0; i < 4; i++) {
        const wing = new THREE.Mesh(wingGeo, darkMat);
        const ang = (i / 4) * Math.PI * 2;
        wing.position.set(Math.cos(ang) * 3.5, 4.0, Math.sin(ang) * 3.5);
        this.mesh.add(wing);
      }
    }
  }

  showBossBar() {
    const barWrap = document.getElementById('boss-bar-container');
    const nameEl = document.getElementById('boss-name-label');
    if (barWrap && nameEl) {
      nameEl.textContent = this.name;
      barWrap.style.display = 'block';
      this.updateBossBar();
    }
  }

  updateBossBar() {
    const fillEl = document.getElementById('boss-hp-fill');
    if (fillEl) {
      const pct = Math.max(0, (this.health / this.maxHealth) * 100);
      fillEl.style.width = `${pct}%`;
    }
  }

  takeDamage(amount) {
    if (this.isDead) return;
    this.health -= amount;
    this.updateBossBar();

    window.audioEngine.playImpact();
    window.gameInstance.spawnFloatingText(`${amount}`, this.position.x, this.position.y + 3.5, this.position.z, 'crit-hit');

    // Phase shift at 50% HP
    if (this.phase === 1 && this.health <= this.maxHealth * 0.5) {
      this.phase = 2;
      this.attackPower = Math.round(this.attackPower * 1.3);
      window.gameInstance.showBanner('FÚRIA DIMENSIONAL!', `${this.name} entrou na Fase 2!`);
      window.audioEngine.playSkillTimeRift();
    }

    if (this.health <= 0) {
      this.die();
    }
  }

  die() {
    this.isDead = true;
    const barWrap = document.getElementById('boss-bar-container');
    if (barWrap) barWrap.style.display = 'none';

    window.gameInstance.player.addXp(400);
    window.gameInstance.showBanner('VITÓRIA!', `${this.name} foi derrotado!`);
    window.audioEngine.playLevelUp();

    // Notify Quest System
    if (window.questSystem) {
      window.questSystem.onBossDefeated(this.type);
    }

    // Shrink explosion
    const anim = () => {
      this.mesh.scale.multiplyScalar(0.9);
      if (this.mesh.scale.x > 0.05) {
        requestAnimationFrame(anim);
      } else {
        this.scene.remove(this.mesh);
      }
    };
    anim();
  }

  update(delta, player) {
    if (this.isDead) return;
    const time = performance.now() * 0.002;

    if (this.attackCooldown > 0) this.attackCooldown -= delta;
    if (this.specialAttackTimer > 0) this.specialAttackTimer -= delta;

    // Movement towards player
    const distToPlayer = Math.hypot(player.position.x - this.position.x, player.position.z - this.position.z);
    const angle = Math.atan2(player.position.x - this.position.x, player.position.z - this.position.z);
    this.mesh.rotation.y = angle;

    if (distToPlayer > 4.5) {
      this.position.x += Math.sin(angle) * this.speed * delta;
      this.position.z += Math.cos(angle) * this.speed * delta;
    } else {
      // Melee slam attack
      if (this.attackCooldown <= 0) {
        this.executeMeleeSlam(player);
      }
    }

    // Special AoE attacks
    if (this.specialAttackTimer <= 0) {
      this.executeSpecialAbility(player);
    }

    // Boss animations
    if (this.type === 'morvak' && this.ring) {
      this.ring.rotation.z = time * 2.5;
    } else if (this.type === 'onada' && this.wire) {
      this.wire.rotation.x = time * 1.5;
      this.wire.rotation.y = time * 2.0;
    }
  }

  executeMeleeSlam(player) {
    this.attackCooldown = 2.4;
    window.audioEngine.playSkillPulse();
    window.gameInstance.cameraSystem.shake(0.4, 0.35);

    const dist = Math.hypot(player.position.x - this.position.x, player.position.z - this.position.z);
    if (dist <= 5.5) {
      player.takeDamage(this.attackPower);
    }
  }

  executeSpecialAbility(player) {
    this.specialAttackTimer = this.phase === 2 ? 6.0 : 10.0;
    window.audioEngine.playSkillTimeRift();

    // Full arena shockwave or summon
    window.gameInstance.showBanner('AVISO DE ATAQUE', `${this.name} canalizou uma Onda Dimensional!`);
    window.gameInstance.cameraSystem.shake(0.6, 0.5);

    // If player is not dodging or jumping, take heavy damage
    setTimeout(() => {
      if (!this.isDead && player.health > 0) {
        const dist = Math.hypot(player.position.x - this.position.x, player.position.z - this.position.z);
        if (dist <= 18.0 && !player.isInvulnerable && player.position.y < 1.2) {
          player.takeDamage(this.attackPower * 1.4);
        }
      }
    }, 600);
  }
}

window.Boss = Boss;
