// DIMENSÃO ZERO - 3D World & Biome Environment Generator

class WorldManager {
  constructor(scene) {
    this.scene = scene;
    this.currentBiome = null;
    this.worldObjects = [];
    this.colliders = []; // Obstacles player cannot walk through
    this.interactives = []; // Chests, memory crystals, portals, shrines
    this.particleSystem = null;

    this.ambientLight = null;
    this.dirLight = null;
    this.biomePointLight = null;
  }

  initLights() {
    this.ambientLight = new THREE.AmbientLight(0x1a2639, 1.2);
    this.scene.add(this.ambientLight);

    this.dirLight = new THREE.DirectionalLight(0x00e5ff, 1.4);
    this.dirLight.position.set(30, 60, 30);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 1024;
    this.dirLight.shadow.mapSize.height = 1024;
    this.dirLight.shadow.camera.near = 0.5;
    this.dirLight.shadow.camera.far = 150;
    const d = 50;
    this.dirLight.shadow.camera.left = -d;
    this.dirLight.shadow.camera.right = d;
    this.dirLight.shadow.camera.top = d;
    this.dirLight.shadow.camera.bottom = -d;
    this.scene.add(this.dirLight);

    this.biomePointLight = new THREE.PointLight(0x00e5ff, 2.0, 40);
    this.biomePointLight.position.set(0, 5, 0);
    this.scene.add(this.biomePointLight);

    this.createCosmicParticles();
  }

  createCosmicParticles() {
    const particleCount = 200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 120;
      positions[i + 1] = Math.random() * 25 + 0.5;
      positions[i + 2] = (Math.random() - 0.5) * 120;

      // Cyan to Gold/Violet motes
      colors[i] = 0.0 + Math.random() * 0.5;
      colors[i + 1] = 0.7 + Math.random() * 0.3;
      colors[i + 2] = 1.0;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.6,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    this.particleSystem = new THREE.Points(geometry, material);
    this.scene.add(this.particleSystem);
  }

  clearBiome() {
    for (const obj of this.worldObjects) {
      this.scene.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
        else obj.material.dispose();
      }
    }
    this.worldObjects = [];
    this.colliders = [];
    this.interactives = [];
  }

  loadBiome(biomeName) {
    this.clearBiome();
    this.currentBiome = biomeName;

    switch (biomeName) {
      case 'aurora':
        this.buildAuroraTemple();
        break;
      case 'forest':
        this.buildCrystalForest();
        break;
      case 'desert':
        this.buildDeadStarsDesert();
        break;
      case 'eclipsia':
        this.buildEclipsiaCity();
        break;
      case 'ferrum':
        this.buildFerrumRealm();
        break;
      case 'sanctuary':
        this.buildSanctuaryOfOrigins();
        break;
      case 'citadel':
      default:
        this.buildVoidCitadel();
        break;
    }
  }

  // Chapter 1: Aurora & Underground Temple
  buildAuroraTemple() {
    this.scene.fog = new THREE.FogExp2(0x07111e, 0.015);
    this.scene.background = new THREE.Color(0x060c18);
    this.dirLight.color.setHex(0x00e5ff);
    this.ambientLight.color.setHex(0x132035);

    // Main Ground Platform
    const floorGeo = new THREE.CylinderGeometry(60, 64, 4, 32);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x111c2b,
      roughness: 0.7,
      metalness: 0.3
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = -2;
    floor.receiveShadow = true;
    this.scene.add(floor);
    this.worldObjects.push(floor);

    // Ancient Temple Columns & Ruined Arches
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const radius = 32 + (i % 2) * 6;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const height = 8 + (i % 4) * 3;

      const colGeo = new THREE.BoxGeometry(2.5, height, 2.5);
      const colMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
      const col = new THREE.Mesh(colGeo, colMat);
      col.position.set(x, height / 2, z);
      col.castShadow = true;
      col.receiveShadow = true;
      this.scene.add(col);
      this.worldObjects.push(col);

      // Add as collider
      this.colliders.push({ x: x, z: z, radius: 2.0 });

      // Glowing rune bands on columns
      const bandGeo = new THREE.BoxGeometry(2.6, 0.6, 2.6);
      const bandMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
      const band = new THREE.Mesh(bandGeo, bandMat);
      band.position.set(x, height * 0.6, z);
      this.scene.add(band);
      this.worldObjects.push(band);
    }

    // Central Dimensional Portal Pedestal
    this.createPortalStructure(0, 0, 0x00e5ff, 'portal_forest', 'Portal para Floresta Cristalina');

    // Healing Recovery Shrine
    this.createRecoveryShrine(-16, 12);
  }

  // Chapter 2: Floresta Cristalina
  buildCrystalForest() {
    this.scene.fog = new THREE.FogExp2(0x06141a, 0.018);
    this.scene.background = new THREE.Color(0x041017);
    this.dirLight.color.setHex(0x00ffd5);
    this.ambientLight.color.setHex(0x0b2426);

    const floorGeo = new THREE.CylinderGeometry(65, 70, 4, 32);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x071e22, roughness: 0.9 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = -2;
    floor.receiveShadow = true;
    this.scene.add(floor);
    this.worldObjects.push(floor);

    // Giant Crystal Trees
    for (let i = 0; i < 18; i++) {
      const angle = (i / 18) * Math.PI * 2;
      const dist = 14 + Math.random() * 38;
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;

      // Trunk
      const trunkGeo = new THREE.CylinderGeometry(1.2, 2.0, 10, 8);
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x0e2e33, roughness: 0.7 });
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.set(x, 5, z);
      trunk.castShadow = true;
      this.scene.add(trunk);
      this.worldObjects.push(trunk);
      this.colliders.push({ x: x, z: z, radius: 1.8 });

      // Glowing Crystal Canopy
      const cryGeo = new THREE.OctahedronGeometry(3.5, 0);
      const cryMat = new THREE.MeshStandardMaterial({
        color: i % 2 === 0 ? 0x00ffd5 : 0x7000ff,
        emissive: i % 2 === 0 ? 0x00a388 : 0x420099,
        roughness: 0.2,
        metalness: 0.8
      });
      const cry = new THREE.Mesh(cryGeo, cryMat);
      cry.position.set(x, 11, z);
      cry.rotation.y = Math.random() * Math.PI;
      this.scene.add(cry);
      this.worldObjects.push(cry);
    }

    // Boss Arena Arch & Portal
    this.createPortalStructure(0, 36, 0x00ffd5, 'portal_desert', 'Portal para o Deserto das Estrelas');
    this.createRecoveryShrine(18, -10);
  }

  // Chapter 3: Deserto das Estrelas Mortas
  buildDeadStarsDesert() {
    this.scene.fog = new THREE.FogExp2(0x1a1205, 0.014);
    this.scene.background = new THREE.Color(0x130b02);
    this.dirLight.color.setHex(0xffaa33);
    this.ambientLight.color.setHex(0x2d1a08);

    const floorGeo = new THREE.CylinderGeometry(70, 75, 4, 32);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x3d260f, roughness: 0.95 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = -2;
    floor.receiveShadow = true;
    this.scene.add(floor);
    this.worldObjects.push(floor);

    // Floating metallic asteroids / planet fragments
    for (let i = 0; i < 14; i++) {
      const x = (Math.random() - 0.5) * 80;
      const z = (Math.random() - 0.5) * 80;
      const y = 8 + Math.random() * 12;
      const rockGeo = new THREE.DodecahedronGeometry(3 + Math.random() * 3, 0);
      const rockMat = new THREE.MeshStandardMaterial({ color: 0x5a4835, metalness: 0.6, roughness: 0.4 });
      const rock = new THREE.Mesh(rockGeo, rockMat);
      rock.position.set(x, y, z);
      rock.rotation.set(Math.random(), Math.random(), Math.random());
      this.scene.add(rock);
      this.worldObjects.push(rock);
    }

    // Crashed starship hull pieces
    const shipGeo = new THREE.ConeGeometry(4, 18, 5);
    const shipMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9, roughness: 0.2 });
    const ship = new THREE.Mesh(shipGeo, shipMat);
    ship.position.set(-25, 4, -15);
    ship.rotation.z = Math.PI / 3;
    this.scene.add(ship);
    this.worldObjects.push(ship);
    this.colliders.push({ x: -25, z: -15, radius: 4 });

    this.createPortalStructure(0, 38, 0xffaa33, 'portal_eclipsia', 'Fenda Temporal para Eclipsia');
    this.createRecoveryShrine(-15, 15);
  }

  // Chapter 4: Eclipsia, Cidade fora do tempo
  buildEclipsiaCity() {
    this.scene.fog = new THREE.FogExp2(0x130a21, 0.015);
    this.scene.background = new THREE.Color(0x0e0617);
    this.dirLight.color.setHex(0xd946ef);
    this.ambientLight.color.setHex(0x27123d);

    const floorGeo = new THREE.CylinderGeometry(65, 70, 4, 32);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x1f1430, roughness: 0.5, metalness: 0.5 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = -2;
    floor.receiveShadow = true;
    this.scene.add(floor);
    this.worldObjects.push(floor);

    // Floating giant Chrono clock rings
    for (let i = 0; i < 4; i++) {
      const ringGeo = new THREE.TorusGeometry(8 + i * 5, 0.6, 8, 32);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xd946ef, wireframe: true });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set(0, 15 + i * 4, 0);
      ring.rotation.x = Math.PI / 2 + (i * 0.2);
      this.scene.add(ring);
      this.worldObjects.push(ring);
    }

    this.createPortalStructure(0, 36, 0xd946ef, 'portal_ferrum', 'Portal para Ferrum');
    this.createRecoveryShrine(16, 16);
  }

  // Chapter 5: Ferrum, Reino das Máquinas Silenciosas
  buildFerrumRealm() {
    this.scene.fog = new THREE.FogExp2(0x17120e, 0.016);
    this.scene.background = new THREE.Color(0x0f0b08);
    this.dirLight.color.setHex(0xf97316);
    this.ambientLight.color.setHex(0x311e13);

    const floorGeo = new THREE.CylinderGeometry(65, 70, 4, 32);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x241d18, roughness: 0.4, metalness: 0.8 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = -2;
    floor.receiveShadow = true;
    this.scene.add(floor);
    this.worldObjects.push(floor);

    // Massive Industrial Gears & Smokestacks
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const x = Math.cos(angle) * 30;
      const z = Math.sin(angle) * 30;
      const stackGeo = new THREE.CylinderGeometry(2.5, 3.5, 20, 16);
      const stackMat = new THREE.MeshStandardMaterial({ color: 0x3a2c22, metalness: 0.8, roughness: 0.3 });
      const stack = new THREE.Mesh(stackGeo, stackMat);
      stack.position.set(x, 10, z);
      this.scene.add(stack);
      this.worldObjects.push(stack);
      this.colliders.push({ x: x, z: z, radius: 3.5 });
    }

    this.createPortalStructure(0, 36, 0xf97316, 'portal_sanctuary', 'Passagem para o Santuário das Origens');
    this.createRecoveryShrine(-18, -12);
  }

  // Chapter 6: Santuário das Origens
  buildSanctuaryOfOrigins() {
    this.scene.fog = new THREE.FogExp2(0x040817, 0.012);
    this.scene.background = new THREE.Color(0x02040d);
    this.dirLight.color.setHex(0x38bdf8);
    this.ambientLight.color.setHex(0x132144);

    const floorGeo = new THREE.CylinderGeometry(60, 64, 4, 32);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x0f1d38, roughness: 0.2, metalness: 0.7 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = -2;
    floor.receiveShadow = true;
    this.scene.add(floor);
    this.worldObjects.push(floor);

    // Stargate concentric arch
    const archGeo = new THREE.TorusGeometry(16, 1.2, 16, 64, Math.PI);
    const archMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0369a1, metalness: 0.9 });
    const arch = new THREE.Mesh(archGeo, archMat);
    arch.position.set(0, 0, 25);
    this.scene.add(arch);
    this.worldObjects.push(arch);

    this.createPortalStructure(0, 32, 0x38bdf8, 'portal_citadel', 'Confronto na Cidadela do Vazio');
    this.createRecoveryShrine(0, -20);
  }

  // Chapter 7 & 8: Cidadela do Vazio & Núcleo Final
  buildVoidCitadel() {
    this.scene.fog = new THREE.FogExp2(0x110214, 0.015);
    this.scene.background = new THREE.Color(0x0a010c);
    this.dirLight.color.setHex(0xff0055);
    this.ambientLight.color.setHex(0x280524);

    const floorGeo = new THREE.CylinderGeometry(60, 65, 4, 32);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x160419, roughness: 0.3, metalness: 0.9 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = -2;
    floor.receiveShadow = true;
    this.scene.add(floor);
    this.worldObjects.push(floor);

    // Inverted Void Monoliths
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2;
      const x = Math.cos(angle) * 34;
      const z = Math.sin(angle) * 34;
      const spireGeo = new THREE.ConeGeometry(3, 24, 4);
      const spireMat = new THREE.MeshStandardMaterial({ color: 0x050108, emissive: 0x4a0033, roughness: 0.1 });
      const spire = new THREE.Mesh(spireGeo, spireMat);
      spire.position.set(x, 10, z);
      spire.rotation.x = Math.PI; // Inverted
      this.scene.add(spire);
      this.worldObjects.push(spire);
      this.colliders.push({ x: x, z: z, radius: 2.5 });
    }

    this.createPortalStructure(0, 32, 0xff0055, 'portal_origins', 'Retorno ao Santuário (O Último Elo)');
    this.createRecoveryShrine(-15, 15);
  }

  // Helper: Portal Structure
  createPortalStructure(x, z, colorHex, portalId, label) {
    const frameGeo = new THREE.TorusGeometry(3.5, 0.4, 16, 32);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.set(x, 3.8, z);
    this.scene.add(frame);
    this.worldObjects.push(frame);

    // Energy Vortex
    const vortexGeo = new THREE.CircleGeometry(3.3, 32);
    const vortexMat = new THREE.MeshBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: 0.65,
      side: THREE.DoubleSide
    });
    const vortex = new THREE.Mesh(vortexGeo, vortexMat);
    vortex.position.set(x, 3.8, z);
    this.scene.add(vortex);
    this.worldObjects.push(vortex);

    this.interactives.push({
      type: 'portal',
      id: portalId,
      label: label,
      x: x,
      z: z,
      radius: 4.0,
      vortexMesh: vortex
    });
  }

  // Helper: Recovery Shrine
  createRecoveryShrine(x, z) {
    const baseGeo = new THREE.CylinderGeometry(2, 2.5, 1, 16);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.set(x, 0.5, z);
    this.scene.add(base);
    this.worldObjects.push(base);

    const gemGeo = new THREE.OctahedronGeometry(1.2, 0);
    const gemMat = new THREE.MeshBasicMaterial({ color: 0x00e676, wireframe: false });
    const gem = new THREE.Mesh(gemGeo, gemMat);
    gem.position.set(x, 2.2, z);
    this.scene.add(gem);
    this.worldObjects.push(gem);

    this.interactives.push({
      type: 'shrine',
      label: 'Santuário de Restauração (Recuperar Vida e Energia)',
      x: x,
      z: z,
      radius: 3.0,
      gemMesh: gem
    });
  }

  update(delta, time) {
    // Animate cosmic particles
    if (this.particleSystem) {
      const positions = this.particleSystem.geometry.attributes.position.array;
      for (let i = 1; i < positions.length; i += 3) {
        positions[i] -= 2.0 * delta;
        if (positions[i] < 0.2) positions[i] = 25.0;
      }
      this.particleSystem.geometry.attributes.position.needsUpdate = true;
      this.particleSystem.rotation.y = time * 0.04;
    }

    // Animate portals & shrines
    for (const item of this.interactives) {
      if (item.vortexMesh) {
        item.vortexMesh.rotation.z = time * 1.5;
      }
      if (item.gemMesh) {
        item.gemMesh.rotation.y = time * 2.0;
        item.gemMesh.position.y = 2.2 + Math.sin(time * 3.0) * 0.2;
      }
    }
  }
}

window.WorldManager = WorldManager;
