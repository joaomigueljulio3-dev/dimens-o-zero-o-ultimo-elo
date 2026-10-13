// DIMENSÃO ZERO - Companion: NEX (Ancestral Holographic AI Drone)

class NEXCompanion {
  constructor(scene, player) {
    this.scene = scene;
    this.player = player;
    this.mesh = new THREE.Group();

    this.orbitRadius = 1.6;
    this.orbitAngle = 0;
    this.heightOffset = 1.9;

    this.speechTimer = 0;
    this.buildMesh();
    this.scene.add(this.mesh);
  }

  buildMesh() {
    // Core Eye Orb
    const coreGeo = new THREE.SphereGeometry(0.2, 16, 16);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
    this.core = new THREE.Mesh(coreGeo, coreMat);
    this.mesh.add(this.core);

    // Holographic Gyro Rings
    const ringGeo1 = new THREE.TorusGeometry(0.32, 0.025, 8, 24);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      metalness: 0.9,
      roughness: 0.1
    });
    this.ring1 = new THREE.Mesh(ringGeo1, ringMat);
    this.mesh.add(this.ring1);

    const ringGeo2 = new THREE.TorusGeometry(0.42, 0.02, 8, 24);
    this.ring2 = new THREE.Mesh(ringGeo2, ringMat);
    this.ring2.rotation.x = Math.PI / 3;
    this.mesh.add(this.ring2);

    // Holographic Scanner Cone
    const coneGeo = new THREE.ConeGeometry(0.2, 0.5, 8, 1, true);
    const coneMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide
    });
    this.scanCone = new THREE.Mesh(coneGeo, coneMat);
    this.scanCone.position.set(0, -0.3, 0.1);
    this.scanCone.rotation.x = Math.PI;
    this.mesh.add(this.scanCone);
  }

  speak(text, durationMs = 5000) {
    window.gameInstance.showCompanionBubble(text, durationMs);
    window.audioEngine.playBlip();
  }

  update(delta, time) {
    // Smooth follow around player shoulder
    this.orbitAngle += 0.8 * delta;
    const targetX = this.player.position.x + Math.cos(this.orbitAngle) * this.orbitRadius;
    const targetZ = this.player.position.z + Math.sin(this.orbitAngle) * this.orbitRadius;
    const targetY = this.player.position.y + this.heightOffset + Math.sin(time * 2.5) * 0.15;

    this.mesh.position.lerp(new THREE.Vector3(targetX, targetY, targetZ), 8.0 * delta);

    // Rotate holographic rings
    this.ring1.rotation.x = time * 2.0;
    this.ring1.rotation.y = time * 1.5;
    this.ring2.rotation.y = -time * 1.8;
    this.ring2.rotation.z = time * 1.2;

    // Scan pulse
    this.scanCone.scale.y = 1.0 + Math.sin(time * 6.0) * 0.3;
  }
}

window.NEXCompanion = NEXCompanion;
