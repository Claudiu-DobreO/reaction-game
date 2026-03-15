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
    45,
    containerElement.clientWidth / containerElement.clientHeight,
    0.1,
    100
  );
  camera.position.set(0, 0, 7.8);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false,
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(containerElement.clientWidth, containerElement.clientHeight);
  containerElement.appendChild(renderer.domElement);

  const ambientLight = new THREE.AmbientLight("#cbd5e1", 1.8);
  scene.add(ambientLight);

  const pointLight = new THREE.PointLight("#3B82F6", 9, 20, 2);
  pointLight.position.set(0, 1.3, 3.2);
  scene.add(pointLight);

  const rimLight = new THREE.PointLight("#60a5fa", 4.5, 20, 2);
  rimLight.position.set(-2.2, -0.8, -2);
  scene.add(rimLight);

  const floorGeometry = new THREE.CircleGeometry(2.4, 64);
  const floorMaterial = new THREE.MeshStandardMaterial({
    color: "#111827",
    transparent: true,
    opacity: 0.82,
    roughness: 0.9,
    metalness: 0.05,
  });
  const floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
  floorMesh.rotation.x = -Math.PI / 2;
  floorMesh.position.y = -1.65;
  scene.add(floorMesh);

  const orbGeometry = new THREE.IcosahedronGeometry(0.82, 12);
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
  orbMesh.position.set(0, 0, 0);
  scene.add(orbMesh);

  const glowGeometry = new THREE.SphereGeometry(1.15, 48, 48);
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: STATE_COLORS.idle,
    transparent: true,
    opacity: 0.08,
  });
  const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
  glowMesh.position.copy(orbMesh.position);
  scene.add(glowMesh);

  const ringGeometry = new THREE.TorusGeometry(1.5, 0.028, 24, 120);
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: "#334155",
    transparent: true,
    opacity: 0.42,
  });
  const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
  ringMesh.rotation.x = Math.PI / 2;
  ringMesh.position.y = -0.42;
  scene.add(ringMesh);

  const clock = new THREE.Clock();
  let currentState = "idle";
  let animationFrameId = null;

  function applyState(nextState) {
    currentState = nextState;
    const nextColor = new THREE.Color(
      STATE_COLORS[nextState] || STATE_COLORS.idle
    );

    orbMaterial.color.copy(nextColor);
    orbMaterial.emissive.copy(nextColor);
    glowMaterial.color.copy(nextColor);
    pointLight.color.copy(nextColor);

    if (nextState === "ready") {
      orbMaterial.emissiveIntensity = 1.2;
      glowMaterial.opacity = 0.18;
      pointLight.intensity = 13;
      ringMaterial.color.set("#86efac");
      ringMaterial.opacity = 0.82;
      orbMesh.scale.setScalar(1.08);
    } else if (nextState === "waiting") {
      orbMaterial.emissiveIntensity = 0.42;
      glowMaterial.opacity = 0.06;
      pointLight.intensity = 7;
      ringMaterial.color.set("#f87171");
      ringMaterial.opacity = 0.52;
      orbMesh.scale.setScalar(1);
    } else if (nextState === "false-start") {
      orbMaterial.emissiveIntensity = 0.95;
      glowMaterial.opacity = 0.14;
      pointLight.intensity = 10.8;
      ringMaterial.color.set("#fca5a5");
      ringMaterial.opacity = 0.8;
      orbMesh.scale.setScalar(1);
    } else {
      orbMaterial.emissiveIntensity = 0.72;
      glowMaterial.opacity = 0.1;
      pointLight.intensity = 9;
      ringMaterial.color.set("#60a5fa");
      ringMaterial.opacity = 0.54;
      orbMesh.scale.setScalar(1);
    }
  }

  function animate() {
    animationFrameId = window.requestAnimationFrame(animate);

    const elapsedSeconds = clock.getElapsedTime();
    const pulseMultiplier = currentState === "ready" ? 1.7 : 1;

    orbMesh.rotation.x += 0.003;
    orbMesh.rotation.y += 0.005;
    orbMesh.position.y = Math.sin(elapsedSeconds * 1.3) * 0.045;

    glowMesh.position.copy(orbMesh.position);
    glowMesh.scale.setScalar(
      1 + Math.sin(elapsedSeconds * 2.4) * 0.015 * pulseMultiplier
    );

    ringMesh.rotation.z += 0.002 * pulseMultiplier;
    pointLight.position.x = Math.sin(elapsedSeconds * 0.8) * 0.9;
    pointLight.position.y = 1.25 + Math.cos(elapsedSeconds * 1.05) * 0.2;

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