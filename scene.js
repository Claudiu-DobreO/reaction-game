import * as THREE from "https://unpkg.com/three@0.161.0/build/three.module.js";

const STATE_COLORS = {
  idle: "#3B82F6",
  waiting: "#EF4444",
  ready: "#22C55E",
  result: "#3B82F6",
  "false-start": "#EF4444",
};

export function createReactionScene(containerElement) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#0F172A");

  const camera = new THREE.PerspectiveCamera(
    50,
    containerElement.clientWidth / containerElement.clientHeight,
    0.1,
    100
  );
  camera.position.set(0, 0.4, 6.2);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false,
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(
    containerElement.clientWidth,
    containerElement.clientHeight
  );
  containerElement.appendChild(renderer.domElement);

  const ambientLight = new THREE.AmbientLight("#cbd5e1", 1.8);
  scene.add(ambientLight);

  const pointLight = new THREE.PointLight("#3B82F6", 10, 20, 2);
  pointLight.position.set(0, 1.8, 3.4);
  scene.add(pointLight);

  const rimLight = new THREE.PointLight("#60a5fa", 5, 20, 2);
  rimLight.position.set(-2.8, -0.8, -2.2);
  scene.add(rimLight);

  const floorGeometry = new THREE.CircleGeometry(3.2, 64);
  const floorMaterial = new THREE.MeshStandardMaterial({
    color: "#111827",
    transparent: true,
    opacity: 0.9,
    roughness: 0.9,
    metalness: 0.05,
  });
  const floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
  floorMesh.rotation.x = -Math.PI / 2;
  floorMesh.position.y = -1.65;
  scene.add(floorMesh);

  const orbGeometry = new THREE.IcosahedronGeometry(1.15, 12);
  const orbMaterial = new THREE.MeshPhysicalMaterial({
    color: STATE_COLORS.idle,
    emissive: STATE_COLORS.idle,
    emissiveIntensity: 0.65,
    roughness: 0.18,
    metalness: 0.25,
    clearcoat: 1,
    clearcoatRoughness: 0.16,
  });
  const orbMesh = new THREE.Mesh(orbGeometry, orbMaterial);
  orbMesh.position.y = 0.1;
  scene.add(orbMesh);

  const glowGeometry = new THREE.SphereGeometry(1.65, 48, 48);
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: STATE_COLORS.idle,
    transparent: true,
    opacity: 0.08,
  });
  const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
  glowMesh.position.copy(orbMesh.position);
  scene.add(glowMesh);

  const ringGeometry = new THREE.TorusGeometry(2.1, 0.03, 24, 120);
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: "#334155",
    transparent: true,
    opacity: 0.45,
  });
  const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
  ringMesh.rotation.x = Math.PI / 2;
  ringMesh.position.y = -0.7;
  scene.add(ringMesh);

  const clock = new THREE.Clock();
  let currentState = "idle";
  let animationFrameId = null;

  function applyState(nextState) {
    currentState = nextState;
    const nextColor = new THREE.Color(STATE_COLORS[nextState] || STATE_COLORS.idle);

    orbMaterial.color.copy(nextColor);
    orbMaterial.emissive.copy(nextColor);
    glowMaterial.color.copy(nextColor);
    pointLight.color.copy(nextColor);

    if (nextState === "ready") {
      orbMaterial.emissiveIntensity = 1.2;
      glowMaterial.opacity = 0.18;
      pointLight.intensity = 14;
      ringMaterial.color.set("#86efac");
      ringMaterial.opacity = 0.8;
    } else if (nextState === "waiting") {
      orbMaterial.emissiveIntensity = 0.45;
      glowMaterial.opacity = 0.06;
      pointLight.intensity = 7.5;
      ringMaterial.color.set("#f87171");
      ringMaterial.opacity = 0.55;
    } else if (nextState === "false-start") {
      orbMaterial.emissiveIntensity = 1;
      glowMaterial.opacity = 0.14;
      pointLight.intensity = 11;
      ringMaterial.color.set("#fca5a5");
      ringMaterial.opacity = 0.82;
    } else {
      orbMaterial.emissiveIntensity = 0.72;
      glowMaterial.opacity = 0.1;
      pointLight.intensity = 9.5;
      ringMaterial.color.set("#60a5fa");
      ringMaterial.opacity = 0.55;
    }
  }

  function animate() {
    animationFrameId = window.requestAnimationFrame(animate);

    const elapsedSeconds = clock.getElapsedTime();
    const baseFloat = Math.sin(elapsedSeconds * 1.4) * 0.08;
    const statePulseMultiplier = currentState === "ready" ? 1.8 : 1;

    orbMesh.rotation.x += 0.0035;
    orbMesh.rotation.y += 0.006;
    orbMesh.position.y = 0.1 + baseFloat;

    glowMesh.position.y = orbMesh.position.y;
    glowMesh.scale.setScalar(
      1 + Math.sin(elapsedSeconds * 2.6) * 0.02 * statePulseMultiplier
    );

    ringMesh.rotation.z += 0.0025 * statePulseMultiplier;
    pointLight.position.x = Math.sin(elapsedSeconds * 0.9) * 1.4;
    pointLight.position.y = 1.5 + Math.cos(elapsedSeconds * 1.1) * 0.35;

    renderer.render(scene, camera);
  }

  function handleResize() {
    const width = containerElement.clientWidth;
    const height = containerElement.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  applyState("idle");
  animate();
  window.addEventListener("resize", handleResize);

  return {
    setState: applyState,
    destroy() {
      window.removeEventListener("resize", handleResize);
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }

      orbGeometry.dispose();
      orbMaterial.dispose();
      glowGeometry.dispose();
      glowMaterial.dispose();
      floorGeometry.dispose();
      floorMaterial.dispose();
      ringGeometry.dispose();
      ringMaterial.dispose();
      renderer.dispose();

      if (renderer.domElement.parentNode === containerElement) {
        containerElement.removeChild(renderer.domElement);
      }
    },
  };
}