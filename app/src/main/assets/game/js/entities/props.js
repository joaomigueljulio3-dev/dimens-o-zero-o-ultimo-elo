// DIMENSÃO ZERO - Interactive Props (Chests, Memory Obelisks & Artifacts)

class PropChest {
  constructor(scene, x, z, loot = { type: 'potion', name: 'Frasco de Éter Cósmico', qty: 2 }) {
    this.scene = scene;
    this.loot = loot;
    this.opened = false;
    this.mesh = new THREE.Group();
    this.position = this.mesh.position;
    this.position.set(x, 0, z);

    this.buildMesh();
    this.scene.add(this.mesh);
  }

  buildMesh() {
    const chestMat = new THREE.MeshStandardMaterial({ color: 0x3b2f2f, metalness: 0.8, roughness: 0.3 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xffd15c, metalness: 0.9, roughness: 0.2 });

    // Base Box
    const baseGeo = new THREE.BoxGeometry(1.2, 0.7, 0.9);
    this.base = new THREE.Mesh(baseGeo, chestMat);
    this.base.position.y = 0.35;
    this.mesh.add(this.base);

    // Lid (Hinged)
    const lidGeo = new THREE.BoxGeometry(1.24, 0.35, 0.94);
    this.lid = new THREE.Mesh(lidGeo, goldMat);
    this.lid.position.set(0, 0.85, 0);
    this.mesh.add(this.lid);
  }

  open() {
    if (this.opened) return;
    this.opened = true;
    window.audioEngine.playChest();

    // Open animation
    this.lid.rotation.x = -Math.PI / 2.5;
    this.lid.position.y = 1.1;
    this.lid.position.z = -0.4;

    // Award loot to player inventory
    if (window.rpgSystem) {
      window.rpgSystem.addItem(this.loot.name, this.loot.qty, this.loot.type);
    }
    window.gameInstance.showBanner('BAÚ ABERTO!', `Obteve: ${this.loot.name} (x${this.loot.qty})`);
  }
}

class PropMemoryObelisk {
  constructor(scene, x, z, title, text) {
    this.scene = scene;
    this.title = title;
    this.text = text;
    this.mesh = new THREE.Group();
    this.position = this.mesh.position;
    this.position.set(x, 0, z);

    this.buildMesh();
    this.scene.add(this.mesh);
  }

  buildMesh() {
    const pillarGeo = new THREE.CylinderGeometry(0.5, 0.8, 3.5, 6);
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });
    const pillar = new THREE.Mesh(pillarGeo, pillarMat);
    pillar.position.y = 1.75;
    this.mesh.add(pillar);

    const runeGeo = new THREE.OctahedronGeometry(0.4, 0);
    const runeMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
    this.rune = new THREE.Mesh(runeGeo, runeMat);
    this.rune.position.set(0, 3.8, 0);
    this.mesh.add(this.rune);
  }

  inspect() {
    window.audioEngine.playBlip();
    window.dialogueSystem.startDialogue({
      speaker: 'ECO DO PASSADO',
      avatar: '📜',
      text: `[${this.title}]\n"${this.text}"`,
      choices: [
        { label: 'Guardar lembrança na mente', next: null }
      ]
    });
    if (window.questSystem) {
      window.questSystem.onMemoryDiscovered(this.title);
    }
  }

  update(time) {
    if (this.rune) {
      this.rune.rotation.y = time * 2.0;
      this.rune.position.y = 3.8 + Math.sin(time * 3.0) * 0.15;
    }
  }
}

window.PropChest = PropChest;
window.PropMemoryObelisk = PropMemoryObelisk;
