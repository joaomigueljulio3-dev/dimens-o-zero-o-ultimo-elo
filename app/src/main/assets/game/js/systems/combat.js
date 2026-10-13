// DIMENSÃO ZERO - Combat System (Hit Detection, Skills, Combos & Projectiles)

class CombatSystem {
  constructor(scene) {
    this.scene = scene;
    this.projectiles = [];
    this.timeRifts = [];
  }

  checkPlayerMeleeHit(player, comboStep) {
    const forwardX = Math.sin(player.rotation);
    const forwardZ = Math.cos(player.rotation);
    const attackCenter = new THREE.Vector3(
      player.position.x + forwardX * 1.6,
      player.position.y + 1.2,
      player.position.z + forwardZ * 1.6
    );

    const hitRadius = 2.4;
    const baseDmg = player.attackPower;
    const multiplier = comboStep === 2 ? 1.8 : comboStep === 1 ? 1.3 : 1.0;
    const finalDmg = Math.round(baseDmg * multiplier);

    // Hit regular enemies
    if (window.gameInstance.enemies) {
      for (const enemy of window.gameInstance.enemies) {
        if (enemy.isDead) continue;
        const dist = attackCenter.distanceTo(enemy.position);
        if (dist <= hitRadius + 0.8) {
          const knockbackDir = new THREE.Vector3(forwardX, 0, forwardZ);
          enemy.takeDamage(finalDmg, knockbackDir);
        }
      }
    }

    // Hit Boss
    if (window.gameInstance.boss && !window.gameInstance.boss.isDead) {
      const dist = attackCenter.distanceTo(window.gameInstance.boss.position);
      if (dist <= hitRadius + 2.5) {
        window.gameInstance.boss.takeDamage(finalDmg);
      }
    }
  }

  castDimensionalPulse(player) {
    const pulseGeo = new THREE.RingGeometry(0.5, 6.5, 32);
    const pulseMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8
    });
    const pulse = new THREE.Mesh(pulseGeo, pulseMat);
    pulse.position.copy(player.position);
    pulse.position.y = 0.2;
    pulse.rotation.x = Math.PI / 2;
    this.scene.add(pulse);

    // Expand pulse animation
    let scale = 1.0;
    const anim = () => {
      scale += 0.35;
      pulse.scale.set(scale, scale, scale);
      pulseMat.opacity -= 0.05;
      if (pulseMat.opacity > 0) {
        requestAnimationFrame(anim);
      } else {
        this.scene.remove(pulse);
      }
    };
    anim();

    // Damage all surrounding enemies within 7m
    const dmg = Math.round(player.attackPower * 2.2);
    if (window.gameInstance.enemies) {
      for (const enemy of window.gameInstance.enemies) {
        if (enemy.isDead) continue;
        const dist = player.position.distanceTo(enemy.position);
        if (dist <= 7.0) {
          const knockback = new THREE.Vector3().subVectors(enemy.position, player.position).normalize();
          enemy.takeDamage(dmg, knockback);
        }
      }
    }

    if (window.gameInstance.boss && !window.gameInstance.boss.isDead) {
      const dist = player.position.distanceTo(window.gameInstance.boss.position);
      if (dist <= 8.5) {
        window.gameInstance.boss.takeDamage(dmg);
      }
    }
  }

  castPhotonBlade(player) {
    const forwardX = Math.sin(player.rotation);
    const forwardZ = Math.cos(player.rotation);

    // Piercing energy beam mesh
    const beamGeo = new THREE.CylinderGeometry(0.6, 0.6, 14.0, 16);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xffd15c,
      transparent: true,
      opacity: 0.9
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.set(
      player.position.x + forwardX * 7.0,
      player.position.y + 1.2,
      player.position.z + forwardZ * 7.0
    );
    beam.rotation.x = Math.PI / 2;
    beam.rotation.z = -player.rotation;
    this.scene.add(beam);

    setTimeout(() => {
      this.scene.remove(beam);
    }, 280);

    const dmg = Math.round(player.attackPower * 3.0);
    // Line intersection damage
    if (window.gameInstance.enemies) {
      for (const enemy of window.gameInstance.enemies) {
        if (enemy.isDead) continue;
        const toEnemy = new THREE.Vector3().subVectors(enemy.position, player.position);
        const dot = toEnemy.x * forwardX + toEnemy.z * forwardZ;
        if (dot > 0 && dot < 14.0) {
          const perpDist = Math.abs(toEnemy.x * forwardZ - toEnemy.z * forwardX);
          if (perpDist < 2.0) {
            enemy.takeDamage(dmg);
          }
        }
      }
    }

    if (window.gameInstance.boss && !window.gameInstance.boss.isDead) {
      const toBoss = new THREE.Vector3().subVectors(window.gameInstance.boss.position, player.position);
      const dot = toBoss.x * forwardX + toBoss.z * forwardZ;
      if (dot > 0 && dot < 15.0) {
        window.gameInstance.boss.takeDamage(dmg);
      }
    }
  }

  castTimeRift(player) {
    const riftGeo = new THREE.SphereGeometry(3.5, 16, 16);
    const riftMat = new THREE.MeshBasicMaterial({
      color: 0xd946ef,
      wireframe: true,
      transparent: true,
      opacity: 0.6
    });
    const rift = new THREE.Mesh(riftGeo, riftMat);
    rift.position.copy(player.position);
    rift.position.y = 1.0;
    this.scene.add(rift);

    const riftData = {
      mesh: rift,
      pos: player.position.clone(),
      radius: 5.5,
      duration: 5.0
    };
    this.timeRifts.push(riftData);
  }

  update(delta) {
    // Process Time Rifts
    for (let i = this.timeRifts.length - 1; i >= 0; i--) {
      const r = this.timeRifts[i];
      r.duration -= delta;
      r.mesh.rotation.y += 2.0 * delta;

      // Slow nearby enemies
      if (window.gameInstance.enemies) {
        for (const enemy of window.gameInstance.enemies) {
          if (enemy.isDead) continue;
          if (enemy.position.distanceTo(r.pos) <= r.radius) {
            enemy.speed = 1.2; // Severely slowed
            enemy.takeDamage(12 * delta); // tick damage
          } else {
            enemy.speed = 4.5;
          }
        }
      }

      if (r.duration <= 0) {
        this.scene.remove(r.mesh);
        this.timeRifts.splice(i, 1);
        // Reset enemy speeds
        if (window.gameInstance.enemies) {
          for (const enemy of window.gameInstance.enemies) {
            if (!enemy.isDead) enemy.speed = 4.5;
          }
        }
      }
    }
  }
}

window.combatSystem = new CombatSystem();
