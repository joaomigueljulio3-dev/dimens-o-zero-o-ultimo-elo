// DIMENSÃO ZERO - Third-Person Follow & Target Lock Camera

class ThirdPersonCamera {
  constructor(camera, target) {
    this.camera = camera;
    this.target = target; // Mesh or Object3D of player

    this.yaw = 0; // Horizontal angle (radians)
    this.pitch = 0.25; // Vertical angle (radians)
    this.distance = 7.0;
    this.targetHeight = 1.6;

    this.minPitch = -0.3;
    this.maxPitch = 1.1;

    this.lockedTarget = null;
    this.shakeIntensity = 0;
    this.shakeDuration = 0;

    this.currentPosition = new THREE.Vector3();
    this.currentTarget = new THREE.Vector3();
  }

  shake(intensity = 0.3, duration = 0.25) {
    this.shakeIntensity = intensity;
    this.shakeDuration = duration;
  }

  lockOn(enemy) {
    if (this.lockedTarget === enemy) {
      this.lockedTarget = null;
    } else {
      this.lockedTarget = enemy;
    }
    const reticle = document.getElementById('target-reticle');
    if (reticle) {
      reticle.style.display = this.lockedTarget ? 'block' : 'none';
    }
  }

  update(delta, input) {
    // Apply camera rotation inputs
    if (this.lockedTarget && this.lockedTarget.health > 0) {
      // Auto orient towards locked target
      const dx = this.lockedTarget.position.x - this.target.position.x;
      const dz = this.lockedTarget.position.z - this.target.position.z;
      const targetYaw = Math.atan2(dx, dz) + Math.PI;
      // Soft angle lerp
      let diff = targetYaw - this.yaw;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      this.yaw += diff * 8.0 * delta;
      this.pitch = 0.22;
    } else {
      if (this.lockedTarget && this.lockedTarget.health <= 0) {
        this.lockOn(null);
      }
      this.yaw -= input.lookDeltaX;
      this.pitch = Math.max(this.minPitch, Math.min(this.maxPitch, this.pitch + input.lookDeltaY));
    }

    // Shake dampening
    let shakeOffset = new THREE.Vector3(0, 0, 0);
    if (this.shakeDuration > 0) {
      this.shakeDuration -= delta;
      shakeOffset.set(
        (Math.random() - 0.5) * this.shakeIntensity,
        (Math.random() - 0.5) * this.shakeIntensity,
        (Math.random() - 0.5) * this.shakeIntensity
      );
    }

    // Target focal point
    const focusPos = new THREE.Vector3(
      this.target.position.x,
      this.target.position.y + this.targetHeight,
      this.target.position.z
    );

    // Compute ideal camera position in spherical coordinates
    const horizontalDist = this.distance * Math.cos(this.pitch);
    const verticalDist = this.distance * Math.sin(this.pitch);

    const idealCamX = focusPos.x + horizontalDist * Math.sin(this.yaw);
    const idealCamY = focusPos.y + verticalDist;
    const idealCamZ = focusPos.z + horizontalDist * Math.cos(this.yaw);

    const idealPos = new THREE.Vector3(idealCamX, idealCamY, idealCamZ).add(shakeOffset);

    // Smooth camera lag
    this.camera.position.lerp(idealPos, Math.min(1.0, 14.0 * delta));

    // Look at player focal point (or midpoint between player and locked enemy)
    let lookTarget = focusPos;
    if (this.lockedTarget && this.lockedTarget.health > 0) {
      lookTarget = new THREE.Vector3().lerpVectors(
        focusPos,
        new THREE.Vector3(this.lockedTarget.position.x, this.lockedTarget.position.y + 1.2, this.lockedTarget.position.z),
        0.35
      );
    }

    this.currentTarget.lerp(lookTarget, Math.min(1.0, 18.0 * delta));
    this.camera.lookAt(this.currentTarget);
  }
}

window.ThirdPersonCamera = ThirdPersonCamera;
