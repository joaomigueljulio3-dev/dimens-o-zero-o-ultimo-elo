// DIMENSÃO ZERO - Enemy Entities & State Machine AI

class Enemy {
  constructor(scene, type, x, z, level = 1) {
    this.scene = scene;
    this.type = type;
    this.level = level;
    this.mesh = new THREE.Group();
    this.position = this.mesh.position;
    this.position.set(x, 0, z);
    this.spawnPos = new THREE.Vector3(x, 0, z);

    // Stats
    this.maxHealth = 50 + level * 25;
    this.health = this.maxHealth;
    this.attackPower = 8 + level * 4;
    this.defense = 2 + level * 2;
    this.speed = 4.5;
    this.xpReward = 25 + level * 15;

    // AI States: 'idle', 'chase', 'attack', 'hurt', 'dead'
    this.state = 'idle';
    this.patrolTimer = 0;
    this.patrolTarget = new THREE.Vector3(x, 0, z);
    this.attackRange = 2.2;
    this.detectionRange = 16.0;
    this.attackCooldown = 0;
    this.attackTelegraphTimer = 0;
    this.hurtTimer = 0;
    this.isDead = false;

    this.buildMesh();
    this.scene.add(this.mesh);
  }

  buildMesh() {
    if (this.type === 'stalker') {
      // Abyss Stalker (Agile Shadow Beast)
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0x0f0717, roughness: 0.8, metalness: 0.2 });
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0x9333ea });

      const torsoGeo = new THREE.ConeGeometry(0.7, 1.8, 6);
      this.body = new THREE.Mesh(torsoGeo, bodyMat);
      this.body.position.y = 1.0;
      this.body.rotation.x = Math.PI / 2;
      this.mesh.add(this.body);

      // Claws
      const clawGeo = new THREE.BoxGeometry(0.18, 0.9, 0.18);
      this.clawL = new THREE.Mesh(clawGeo, bodyMat);
      this.clawL.position.set(-0.6, 0.7, 0.5);
      this.mesh.add(this.clawL);

      this.clawR = new THREE.Mesh(clawGeo, bodyMat);
      this.clawR.position.set(0.6, 0.7, 0.5);
      this.mesh.add(this.clawR);

      // Glowing Abyss Eyes
      const eyeGeo = new THREE.SphereGeometry(0.1, 8, 8);
      const eye1 = new THREE.Mesh(eyeGeo, eyeMat);
      eye1.position.set(-0.2, 1.2, 0.6);
      this.mesh.add(eye1);
      const eye2 = new THREE.Mesh(eyeGeo, eyeMat);
      eye2.position.set(0.2, 1.2, 0.6);
      this.mesh.add(eye2);

    } else if (this.type === 'sentinel') {
      // Corrupted Sentinel (Floating Tech Eye)
      this.attackRange = 12.0;
      this.speed = 3.0;
      const metalMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.2 });
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });

      const orbGeo = new THREE.SphereGeometry(0.6, 16, 16);
      this.body = new THREE.Mesh(orbGeo, metalMat);
      this.body.position.y = 1.8;
      this.mesh.add(this.body);

      const eyeGeo = new THREE.SphereGeometry(0.22, 12, 12);
      this.eye = new THREE.Mesh(eyeGeo, eyeMat);
      this.eye.position.set(0, 1.8, 0.45);
      this.mesh.add(this.eye);

    } else {
      // Void Brute (Heavy Tank)
      this.maxHealth *= 2;
      this.health = this.maxHealth;
      this.speed = 2.8;
      this.attackPower *= 1.5;
      const rockMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 0.9 });
      const coreMat = new THREE.MeshBasicMaterial({ color: 0x7c3aed });

      const torsoGeo = new THREE.BoxGeometry(1.6, 1.8, 1.2);
      this.body = new THREE.Mesh(torsoGeo, rockMat);
      this.body.position.y = 1.6;
      this.mesh.add(this.body);

      const coreGeo = new THREE.OctahedronGeometry(0.35, 0);
      const core = new THREE.Mesh(coreGeo, coreMat);
      core.position.set(0, 1.6, 0.65);
      this.mesh.add(core);
    }
  }

  takeDamage(amount, knockbackDir = null) {
    if (this.isDead) return;
    const actualDmg = Math.max(1, Math.round(amount * (100 / (100 + this.defense))));
    this.health -= actualDmg;
    this.state = 'hurt';
    this.hurtTimer = 0.25;

    window.audioEngine.playImpact();
    window.gameInstance.spawnFloatingText(`${actualDmg}`, this.position.x, this.position.y + 1.8, this.position.z, 'enemy-hit');

    // Knockback
    if (knockbackDir) {
      this.position.x += knockbackDir.x * 1.5;
      this.position.z += knockbackDir.z * 1.5;
    }

    if (this.health <= 0) {
      this.die();
    }
  }

  die() {
    this.isDead = true;
    this.state = 'dead';
    window.gameInstance.player.addXp(this.xpReward);

    // Dissolve scale down animation
    const removeAnim = () => {
      this.mesh.scale.multiplyScalar(0.85);
      if (this.mesh.scale.x > 0.1) {
        requestAnimationFrame(removeAnim);
      } else {
        this.scene.remove(this.mesh);
      }
    };
    removeAnim();

    // Notify Quest System for enemy defeats
    if (window.questSystem) {
      window.questSystem.onEnemyKilled(this.type);
    }
  }

  update(delta, player, colliders) {
    if (this.isDead) return;

    if (this.attackCooldown > 0) this.attackCooldown -= delta;
    if (this.hurtTimer > 0) {
      this.hurtTimer -= delta;
      return;
    }

    const distToPlayer = Math.hypot(player.position.x - this.position.x, player.position.z - this.position.z);

    // AI Behavior Loop
    if (distToPlayer <= this.detectionRange && player.health > 0) {
      // Face player
      const angle = Math.atan2(player.position.x - this.position.x, player.position.z - this.position.z);
      this.mesh.rotation.y = angle;

      if (distToPlayer <= this.attackRange) {
        // Attack range
        if (this.attackCooldown <= 0) {
          this.executeAttack(player);
        }
      } else {
        // Chase player
        this.state = 'chase';
        const dirX = Math.sin(angle);
        const dirZ = Math.cos(angle);
        this.position.x += dirX * this.speed * delta;
        this.position.z += dirZ * this.speed * delta;
      }
    } else {
      // Idle patrol
      this.state = 'idle';
      this.patrolTimer -= delta;
      if (this.patrolTimer <= 0) {
        this.patrolTimer = 3.0 + Math.random() * 3.0;
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * 6.0;
        this.patrolTarget.set(this.spawnPos.x + Math.cos(angle) * dist, 0, this.spawnPos.z + Math.sin(angle) * dist);
      }
      const pDist = Math.hypot(this.patrolTarget.x - this.position.x, this.patrolTarget.z - this.position.z);
      if (pDist > 0.5) {
        const pAngle = Math.atan2(this.patrolTarget.x - this.position.x, this.patrolTarget.z - this.position.z);
        this.mesh.rotation.y = pAngle;
        this.position.x += Math.sin(pAngle) * (this.speed * 0.4) * delta;
        this.position.z += Math.cos(pAngle) * (this.speed * 0.4) * delta;
      }
    }

    // Float hover for sentinel
    if (this.type === 'sentinel' && this.body) {
      this.body.position.y = 1.8 + Math.sin(performance.now() * 0.005) * 0.2;
    }
  }

  executeAttack(player) {
    this.attackCooldown = 1.6;
    window.audioEngine.playSlash();

    // Damage player if in range
    const dist = Math.hypot(player.position.x - this.position.x, player.position.z - this.position.z);
    if (dist <= this.attackRange + 0.8) {
      player.takeDamage(this.attackPower);
    }
  }
}

window.Enemy = Enemy;
