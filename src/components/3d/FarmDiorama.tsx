/**
 * AR360X — Interactive 3D Farm & Empire Diorama
 * Built with Three.js following all procedural modeling, PBR lighting, and lossless loop standards.
 */
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { GameState } from '../../types/game';
import { Camera, Sun, Moon, Eye, Maximize2, Minimize2, EyeOff } from 'lucide-react';

interface FarmDioramaProps {
  gameState: GameState;
  onClose?: () => void;
  isModal?: boolean;
}

export const FarmDiorama: React.FC<FarmDioramaProps> = ({ gameState, onClose, isModal = false }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activeView, setActiveView] = useState<'overview' | 'cow' | 'barn' | 'fields' | 'vault'>('overview');
  const [timeOfDay, setTimeOfDay] = useState<'day' | 'sunset' | 'night'>('day');
  const [showControls, setShowControls] = useState(true);
  const [inspectInfo, setInspectInfo] = useState<string>('Hover or click 3D assets to inspect your empire.');

  // Store mutable refs for animation loop
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const windmillBladesRef = useRef<THREE.Group | null>(null);
  const cowTailRef = useRef<THREE.Group | null>(null);
  const tractorRef = useRef<THREE.Group | null>(null);
  const targetCamPos = useRef(new THREE.Vector3(26, 20, 32));
  const targetLookAt = useRef(new THREE.Vector3(0, 2, 0));
  const currentLookAt = useRef(new THREE.Vector3(0, 2, 0));
  const dirLightRef = useRef<THREE.DirectionalLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color('#0a1118');
    scene.fog = new THREE.FogExp2('#0a1118', 0.015);

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || (isModal ? window.innerHeight : 500);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 300);
    camera.position.set(26, 20, 32);
    cameraRef.current = camera;

    // 2. Renderer with ACESFilmic & PBR tone mapping
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 3. Studio Environment Map (PMREMGenerator + RoomEnvironment)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 4. Lighting Rig (Warm Key Light + Cool Hemisphere Fill)
    const hemiLight = new THREE.HemisphereLight('#b1e1ff', '#3b4226', 0.7);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    const dirLight = new THREE.DirectionalLight('#fff4e0', 1.8);
    dirLight.position.set(30, 45, 25);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 1;
    dirLight.shadow.camera.far = 120;
    const d = 35;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    dirLight.shadow.bias = -0.0003;
    dirLight.shadow.normalBias = 0.02;
    scene.add(dirLight);
    dirLightRef.current = dirLight;

    // Procedural Ground Texture via 2D Canvas (No external 404s!)
    const groundCanvas = document.createElement('canvas');
    groundCanvas.width = 512;
    groundCanvas.height = 512;
    const gctx = groundCanvas.getContext('2d')!;
    gctx.fillStyle = '#22381f';
    gctx.fillRect(0, 0, 512, 512);
    // Subtle procedural grass noise
    for (let i = 0; i < 4000; i++) {
      gctx.fillStyle = Math.random() < 0.5 ? '#2c4728' : '#1d311b';
      gctx.fillRect(Math.random() * 512, Math.random() * 512, 3, 3);
    }
    const groundTexture = new THREE.CanvasTexture(groundCanvas);
    groundTexture.wrapS = THREE.RepeatWrapping;
    groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set(12, 12);
    groundTexture.colorSpace = THREE.SRGBColorSpace;

    // Ground Plane with contact shadow capability
    const groundGeo = new THREE.PlaneGeometry(120, 120, 32, 32);
    const groundMat = new THREE.MeshStandardMaterial({
      map: groundTexture,
      roughness: 0.85,
      metalness: 0.05,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    scene.add(ground);

    // Soft Radial Contact Shadow under main structures
    const createContactShadow = (x: number, z: number, radius: number, opacity = 0.4) => {
      const shadowCanvas = document.createElement('canvas');
      shadowCanvas.width = 128;
      shadowCanvas.height = 128;
      const sctx = shadowCanvas.getContext('2d')!;
      const grad = sctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      grad.addColorStop(0, `rgba(0,0,0,${opacity})`);
      grad.addColorStop(0.5, `rgba(0,0,0,${opacity * 0.4})`);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      sctx.fillStyle = grad;
      sctx.fillRect(0, 0, 128, 128);

      const sTex = new THREE.CanvasTexture(shadowCanvas);
      const sGeo = new THREE.PlaneGeometry(radius * 2, radius * 2);
      const sMat = new THREE.MeshBasicMaterial({ map: sTex, transparent: true, depthWrite: false });
      const sm = new THREE.Mesh(sGeo, sMat);
      sm.rotation.x = -Math.PI / 2;
      sm.position.set(x, 0.02, z);
      scene.add(sm);
    };

    // ==========================================
    // PROCEDURAL MODELS (Composite 3-12 Parts)
    // ==========================================

    // 1. HERO COW MODEL (Composite 8-Part THREE.Group)
    const cowGroup = new THREE.Group();
    cowGroup.position.set(-4, 0, 4);

    const cowWhiteMat = new THREE.MeshStandardMaterial({ color: '#f3f4f6', roughness: 0.75, metalness: 0.05 });
    const cowSpotMat = new THREE.MeshStandardMaterial({ color: '#1f2937', roughness: 0.85, metalness: 0.05 });
    const cowPinkMat = new THREE.MeshStandardMaterial({ color: '#f472b6', roughness: 0.5, metalness: 0.0 });
    const cowHornMat = new THREE.MeshStandardMaterial({ color: '#e5e7eb', roughness: 0.3, metalness: 0.2 });
    const cowHoofMat = new THREE.MeshStandardMaterial({ color: '#111827', roughness: 0.4, metalness: 0.3 });

    // Torso / Belly
    const bodyMesh = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.6, 3.6), cowWhiteMat);
    bodyMesh.position.y = 2.0;
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    cowGroup.add(bodyMesh);

    // Decorative black patches
    const spot1 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.9, 1.4), cowSpotMat);
    spot1.position.set(0.65, 2.1, 0.4);
    cowGroup.add(spot1);

    const spot2 = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.8, 1.2), cowSpotMat);
    spot2.position.set(-0.7, 1.9, -0.6);
    cowGroup.add(spot2);

    // Cow Head
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 2.6, 2.2);

    const headMesh = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 1.3), cowWhiteMat);
    headMesh.castShadow = true;
    headGroup.add(headMesh);

    // Snout
    const snoutMesh = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.6, 0.7), cowPinkMat);
    snoutMesh.position.set(0, -0.3, 0.7);
    headGroup.add(snoutMesh);

    // Horns
    const hornGeo = new THREE.ConeGeometry(0.12, 0.6, 8);
    const leftHorn = new THREE.Mesh(hornGeo, cowHornMat);
    leftHorn.rotation.z = Math.PI / 4;
    leftHorn.position.set(-0.6, 0.7, 0.1);
    headGroup.add(leftHorn);

    const rightHorn = new THREE.Mesh(hornGeo, cowHornMat);
    rightHorn.rotation.z = -Math.PI / 4;
    rightHorn.position.set(0.6, 0.7, 0.1);
    headGroup.add(rightHorn);

    // Ears
    const earGeo = new THREE.BoxGeometry(0.4, 0.18, 0.1);
    const leftEar = new THREE.Mesh(earGeo, cowWhiteMat);
    leftEar.position.set(-0.7, 0.4, -0.1);
    headGroup.add(leftEar);

    const rightEar = new THREE.Mesh(earGeo, cowWhiteMat);
    rightEar.position.set(0.7, 0.4, -0.1);
    headGroup.add(rightEar);

    cowGroup.add(headGroup);

    // Udder
    const udderMesh = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.5, 1.0), cowPinkMat);
    udderMesh.position.set(0, 1.2, -0.4);
    cowGroup.add(udderMesh);

    // Four Legs with hooves
    const legPositions = [
      [-0.8, -1.0],
      [0.8, -1.0],
      [-0.8, 1.0],
      [0.8, 1.0],
    ];
    legPositions.forEach(([lx, lz]) => {
      const legGroup = new THREE.Group();
      legGroup.position.set(lx, 0, lz);

      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.42, 1.4, 0.42), cowWhiteMat);
      leg.position.y = 0.9;
      leg.castShadow = true;
      legGroup.add(leg);

      const hoof = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.25, 0.44), cowHoofMat);
      hoof.position.y = 0.125;
      legGroup.add(hoof);

      cowGroup.add(legGroup);
    });

    // Tail
    const tailGroup = new THREE.Group();
    tailGroup.position.set(0, 2.4, -1.8);
    const tailStick = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.2), cowWhiteMat);
    tailStick.position.y = -0.6;
    tailGroup.add(tailStick);
    const tailTuft = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), cowSpotMat);
    tailTuft.position.y = -1.2;
    tailGroup.add(tailTuft);
    cowGroup.add(tailGroup);
    cowTailRef.current = tailGroup;

    scene.add(cowGroup);
    createContactShadow(-4, 4, 3, 0.4);

    // 2. RED BARN & SILO (Composite 7-Part Group)
    const barnGroup = new THREE.Group();
    barnGroup.position.set(8, 0, -6);

    const barnWoodMat = new THREE.MeshStandardMaterial({ color: '#8b1e1e', roughness: 0.8, metalness: 0.05 });
    const roofMat = new THREE.MeshStandardMaterial({ color: '#374151', roughness: 0.7, metalness: 0.1 });
    const siloMat = new THREE.MeshStandardMaterial({ color: '#cbd5e1', roughness: 0.4, metalness: 0.6 });
    const trimMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.6, metalness: 0.0 });

    // Barn Body
    const barnBody = new THREE.Mesh(new THREE.BoxGeometry(8, 5, 10), barnWoodMat);
    barnBody.position.y = 2.5;
    barnBody.castShadow = true;
    barnBody.receiveShadow = true;
    barnGroup.add(barnBody);

    // Gabled Roof
    const roofShape = new THREE.ConeGeometry(6.2, 3.2, 4);
    const roof = new THREE.Mesh(roofShape, roofMat);
    roof.rotation.y = Math.PI / 4;
    roof.position.y = 6.6;
    roof.castShadow = true;
    barnGroup.add(roof);

    // Barn Doors with White Cross Trims
    const door = new THREE.Mesh(new THREE.BoxGeometry(2.4, 3.2, 0.2), trimMat);
    door.position.set(0, 1.6, 5.05);
    barnGroup.add(door);

    // Silo Tower
    const siloBody = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.8, 8, 16), siloMat);
    siloBody.position.set(6, 4, -2);
    siloBody.castShadow = true;
    barnGroup.add(siloBody);

    const siloDome = new THREE.Mesh(new THREE.SphereGeometry(1.8, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), siloMat);
    siloDome.position.set(6, 8, -2);
    siloDome.castShadow = true;
    barnGroup.add(siloDome);

    scene.add(barnGroup);
    createContactShadow(8, -6, 7, 0.45);

    // 3. DUTCH WINDMILL WITH ROTATING BLADES (Composite 6-Part Group)
    const windmillGroup = new THREE.Group();
    windmillGroup.position.set(-14, 0, -12);

    const wmBase = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 3.8, 10, 8), new THREE.MeshStandardMaterial({ color: '#e2e8f0', roughness: 0.7 }));
    wmBase.position.y = 5;
    wmBase.castShadow = true;
    windmillGroup.add(wmBase);

    const wmCap = new THREE.Mesh(new THREE.ConeGeometry(2.8, 2.5, 8), new THREE.MeshStandardMaterial({ color: '#78350f', roughness: 0.8 }));
    wmCap.position.y = 11.2;
    wmCap.castShadow = true;
    windmillGroup.add(wmCap);

    // Rotating Blades
    const bladesGroup = new THREE.Group();
    bladesGroup.position.set(0, 9.8, 2.8);

    const hub = new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 8), new THREE.MeshStandardMaterial({ color: '#475569', metalness: 0.6, roughness: 0.3 }));
    bladesGroup.add(hub);

    for (let b = 0; b < 4; b++) {
      const bladeArm = new THREE.Group();
      bladeArm.rotation.z = (b * Math.PI) / 2;

      const spar = new THREE.Mesh(new THREE.BoxGeometry(0.2, 5.5, 0.1), new THREE.MeshStandardMaterial({ color: '#78350f' }));
      spar.position.y = 3.0;
      bladeArm.add(spar);

      const sail = new THREE.Mesh(new THREE.BoxGeometry(1.0, 4.2, 0.05), new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.9 }));
      sail.position.set(0.4, 3.2, 0);
      bladeArm.add(sail);

      bladesGroup.add(bladeArm);
    }
    windmillGroup.add(bladesGroup);
    windmillBladesRef.current = bladesGroup;

    scene.add(windmillGroup);
    createContactShadow(-14, -12, 5, 0.4);

    // 4. FARM TRACTOR (Composite 6-Part Group)
    const tractorGroup = new THREE.Group();
    tractorGroup.position.set(12, 0, 8);
    tractorGroup.rotation.y = -Math.PI / 3;

    const greenMetalMat = new THREE.MeshStandardMaterial({ color: '#15803d', roughness: 0.3, metalness: 0.7 });
    const tireMat = new THREE.MeshStandardMaterial({ color: '#18181b', roughness: 0.9, metalness: 0.1 });
    const yellowHubMat = new THREE.MeshStandardMaterial({ color: '#facc15', roughness: 0.3, metalness: 0.5 });

    // Body chassis
    const tBody = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.2, 3.2), greenMetalMat);
    tBody.position.y = 1.3;
    tBody.castShadow = true;
    tractorGroup.add(tBody);

    // Cab glass
    const cab = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.4, 1.6), new THREE.MeshPhysicalMaterial({ color: '#38bdf8', transmission: 0.6, roughness: 0.1, thickness: 0.5 }));
    cab.position.set(0, 2.4, -0.6);
    tractorGroup.add(cab);

    // Exhaust Pipe
    const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.6), new THREE.MeshStandardMaterial({ color: '#3f3f46', metalness: 0.9, roughness: 0.2 }));
    exhaust.position.set(0.7, 2.4, 1.0);
    tractorGroup.add(exhaust);

    // Big Rear Wheels
    [-1.0, 1.0].forEach((wx) => {
      const rw = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 0.6, 16), tireMat);
      rw.rotation.z = Math.PI / 2;
      rw.position.set(wx, 1.1, -1.0);
      rw.castShadow = true;
      tractorGroup.add(rw);

      const rhub = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.65, 12), yellowHubMat);
      rhub.rotation.z = Math.PI / 2;
      rhub.position.set(wx, 1.1, -1.0);
      tractorGroup.add(rhub);
    });

    // Smaller Front Wheels
    [-0.95, 0.95].forEach((wx) => {
      const fw = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 0.45, 16), tireMat);
      fw.rotation.z = Math.PI / 2;
      fw.position.set(wx, 0.65, 1.1);
      fw.castShadow = true;
      tractorGroup.add(fw);
    });

    tractorRef.current = tractorGroup;
    scene.add(tractorGroup);
    createContactShadow(12, 8, 3, 0.35);

    // 5. CROP FIELDS & TREES (Instanced & Multi-Part)
    const fieldGeo = new THREE.PlaneGeometry(16, 12);
    const wheatFieldMat = new THREE.MeshStandardMaterial({ color: '#ca8a04', roughness: 0.9 });
    const wheatField = new THREE.Mesh(fieldGeo, wheatFieldMat);
    wheatField.rotation.x = -Math.PI / 2;
    wheatField.position.set(-12, 0.04, 10);
    scene.add(wheatField);

    const paddyFieldMat = new THREE.MeshStandardMaterial({ color: '#4d7c0f', roughness: 0.8 });
    const paddyField = new THREE.Mesh(new THREE.PlaneGeometry(14, 12), paddyFieldMat);
    paddyField.rotation.x = -Math.PI / 2;
    paddyField.position.set(-12, 0.04, -4);
    scene.add(paddyField);

    // Procedural Trees with layered foliage spheres
    const treePositions = [
      [-18, 4],
      [-22, -2],
      [-20, -18],
      [18, -14],
      [22, -8],
      [16, 18],
      [-6, -18],
    ];
    treePositions.forEach(([tx, tz]) => {
      const treeGroup = new THREE.Group();
      treeGroup.position.set(tx, 0, tz);

      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.5, 3.5, 8), new THREE.MeshStandardMaterial({ color: '#451a03', roughness: 0.9 }));
      trunk.position.y = 1.75;
      trunk.castShadow = true;
      treeGroup.add(trunk);

      const leavesMat = new THREE.MeshStandardMaterial({ color: '#166534', roughness: 0.7 });
      const foliage1 = new THREE.Mesh(new THREE.SphereGeometry(1.6, 10, 8), leavesMat);
      foliage1.position.y = 3.8;
      foliage1.castShadow = true;
      treeGroup.add(foliage1);

      const foliage2 = new THREE.Mesh(new THREE.SphereGeometry(1.2, 8, 8), leavesMat);
      foliage2.position.set(0.4, 4.8, 0.2);
      treeGroup.add(foliage2);

      scene.add(treeGroup);
      createContactShadow(tx, tz, 2.2, 0.35);
    });

    // 6. GOLD VAULT / BANK STRUCTURE
    const bankGroup = new THREE.Group();
    bankGroup.position.set(0, 0, -16);

    const marbleMat = new THREE.MeshStandardMaterial({ color: '#f1f5f9', roughness: 0.3, metalness: 0.1 });
    const goldPillarMat = new THREE.MeshStandardMaterial({ color: '#ffd700', roughness: 0.2, metalness: 0.9 });

    const bankPlinth = new THREE.Mesh(new THREE.BoxGeometry(10, 1.2, 8), marbleMat);
    bankPlinth.position.y = 0.6;
    bankPlinth.castShadow = true;
    bankGroup.add(bankPlinth);

    // Columns
    for (let c = -3.6; c <= 3.6; c += 2.4) {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 4.5, 12), goldPillarMat);
      col.position.set(c, 3.3, 3.2);
      col.castShadow = true;
      bankGroup.add(col);
    }

    const bankPediment = new THREE.Mesh(new THREE.ConeGeometry(7, 2.5, 4), marbleMat);
    bankPediment.rotation.y = Math.PI / 4;
    bankPediment.position.set(0, 6.8, 0);
    bankPediment.castShadow = true;
    bankGroup.add(bankPediment);

    scene.add(bankGroup);
    createContactShadow(0, -16, 7, 0.45);

    // Floating Dust / Leaf Motes
    const particleCount = 200;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      pPos[i] = (Math.random() - 0.5) * 60;
      pPos[i + 1] = Math.random() * 18 + 0.5;
      pPos[i + 2] = (Math.random() - 0.5) * 60;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: '#ffd700', size: 0.25, transparent: true, opacity: 0.6 });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // Pre-warm shaders
    renderer.compile(scene, camera);

    // Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.05);
      const time = clock.getElapsedTime();

      // Spin windmill blades
      if (windmillBladesRef.current) {
        windmillBladesRef.current.rotation.z -= delta * 1.2;
      }

      // Idle cow tail flick & gentle body breathing
      if (cowTailRef.current) {
        cowTailRef.current.rotation.z = Math.sin(time * 3) * 0.25;
      }
      bodyMesh.scale.y = 1.0 + Math.sin(time * 2) * 0.02;

      // Camera Exponential Damping
      camera.position.x = THREE.MathUtils.damp(camera.position.x, targetCamPos.current.x, 3.5, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, targetCamPos.current.y, 3.5, delta);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, targetCamPos.current.z, 3.5, delta);

      currentLookAt.current.x = THREE.MathUtils.damp(currentLookAt.current.x, targetLookAt.current.x, 3.5, delta);
      currentLookAt.current.y = THREE.MathUtils.damp(currentLookAt.current.y, targetLookAt.current.y, 3.5, delta);
      currentLookAt.current.z = THREE.MathUtils.damp(currentLookAt.current.z, targetLookAt.current.z, 3.5, delta);
      camera.lookAt(currentLookAt.current);

      // Rotate particles subtly
      particles.rotation.y = time * 0.03;

      renderer.render(scene, camera);
    };

    animate();

    // Mouse Dragging to Pan / Inspect
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onMouseDown = (e: MouseEvent) => {
      if ((e.target as HTMLElement).tagName !== 'CANVAS') return;
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = (e.clientX - prevMouseX) * 0.01;
      const dy = (e.clientY - prevMouseY) * 0.01;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      // Orbit camera target position around lookAt
      const offset = targetCamPos.current.clone().sub(targetLookAt.current);
      const radius = offset.length();
      let theta = Math.atan2(offset.x, offset.z);
      let phi = Math.acos(Math.max(-1, Math.min(1, offset.y / radius)));

      theta -= dx * 1.5;
      phi = Math.max(0.15, Math.min(Math.PI / 2.1, phi - dy * 1.5));

      targetCamPos.current.x = targetLookAt.current.x + radius * Math.sin(phi) * Math.sin(theta);
      targetCamPos.current.y = targetLookAt.current.y + radius * Math.cos(phi);
      targetCamPos.current.z = targetLookAt.current.z + radius * Math.sin(phi) * Math.cos(theta);
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const offset = targetCamPos.current.clone().sub(targetLookAt.current);
      const zoom = 1 + Math.sign(e.deltaY) * 0.1;
      const newRadius = Math.max(6, Math.min(80, offset.length() * zoom));
      offset.normalize().multiplyScalar(newRadius);
      targetCamPos.current.copy(targetLookAt.current).add(offset);
    };

    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('wheel', onWheel, { passive: false });

    const handleResize = () => {
      if (!container || !cameraRef.current) return;
      const newW = container.clientWidth || window.innerWidth;
      const newH = container.clientHeight || (isModal ? window.innerHeight : 500);
      cameraRef.current.aspect = newW / newH;
      cameraRef.current.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('wheel', onWheel);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      scene.clear();
    };
  }, [isModal]);

  // Handle Preset Camera Views
  const setCameraPreset = (view: 'overview' | 'cow' | 'barn' | 'fields' | 'vault') => {
    setActiveView(view);
    if (view === 'overview') {
      targetCamPos.current.set(26, 20, 32);
      targetLookAt.current.set(0, 2, 0);
      setInspectInfo('Ranch Overview: Inspect all your assets, pastures, silos, and facilities.');
    } else if (view === 'cow') {
      targetCamPos.current.set(-2, 4, 10);
      targetLookAt.current.set(-4, 2, 4);
      setInspectInfo(`Dairy Pasture: Cows (${gameState.livestock.Cow.count}), Goats (${gameState.livestock.Goat.count}), Sheep (${gameState.livestock.Sheep.count}), Chickens (${gameState.livestock.Chicken.count}). Health: ${gameState.livestock.Cow.health}%.`);
    } else if (view === 'barn') {
      targetCamPos.current.set(16, 8, 4);
      targetLookAt.current.set(8, 4, -6);
      setInspectInfo('Storage Barn & Silo: Raw Milk, Cheese, Ghee, and Feed reserves stored securely.');
    } else if (view === 'fields') {
      targetCamPos.current.set(-6, 12, 22);
      targetLookAt.current.set(-12, 1, 6);
      setInspectInfo(`Agricultural Fields: Wheat (${gameState.agriculture.wheatArea} ac), Paddy (${gameState.agriculture.paddyArea} ac), Trees (${gameState.agriculture.treeCount}).`);
    } else if (view === 'vault') {
      targetCamPos.current.set(6, 6, -8);
      targetLookAt.current.set(0, 3, -16);
      setInspectInfo(`Bank & Commercial Vault: Cash ₹${gameState.finances.cash.toLocaleString()} · Bank Balance ₹${(gameState.bankAccounts.reduce((s, a) => s + a.balance, 0) + gameState.finances.bankLegacy).toLocaleString()}.`);
    }
  };

  // Handle Day/Sunset/Night lighting toggle
  const setLighting = (mode: 'day' | 'sunset' | 'night') => {
    setTimeOfDay(mode);
    if (!sceneRef.current || !dirLightRef.current || !hemiLightRef.current) return;
    if (mode === 'day') {
      sceneRef.current.background = new THREE.Color('#0a1118');
      sceneRef.current.fog = new THREE.FogExp2('#0a1118', 0.015);
      dirLightRef.current.color.set('#fff4e0');
      dirLightRef.current.intensity = 1.8;
      hemiLightRef.current.color.set('#b1e1ff');
      hemiLightRef.current.groundColor.set('#3b4226');
    } else if (mode === 'sunset') {
      sceneRef.current.background = new THREE.Color('#1c0f16');
      sceneRef.current.fog = new THREE.FogExp2('#1c0f16', 0.018);
      dirLightRef.current.color.set('#f97316');
      dirLightRef.current.intensity = 2.2;
      hemiLightRef.current.color.set('#fdba74');
      hemiLightRef.current.groundColor.set('#451a03');
    } else if (mode === 'night') {
      sceneRef.current.background = new THREE.Color('#030712');
      sceneRef.current.fog = new THREE.FogExp2('#030712', 0.022);
      dirLightRef.current.color.set('#93c5fd');
      dirLightRef.current.intensity = 0.6;
      hemiLightRef.current.color.set('#1e1b4b');
      hemiLightRef.current.groundColor.set('#0f172a');
    }
  };

  return (
    <div className={`relative w-full overflow-hidden ${isModal ? 'h-screen w-screen fixed inset-0 z-50 bg-[#0a1118]' : 'h-[520px] rounded-2xl border border-border shadow-2xl bg-[#0a1118]'}`}>
      {/* 3D Canvas Mount */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Floating Header Banner */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
        <div className="bg-[#111827]/90 border border-white/10 rounded-xl px-4 py-2.5 shadow-xl pointer-events-auto backdrop-blur-none flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
          <div>
            <div className="text-xs uppercase tracking-wider text-emerald-400 font-bold font-mono">AR360X 3D Live Simulation</div>
            <div className="text-sm font-semibold text-white">Interactive Empire Diorama</div>
          </div>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => setShowControls(!showControls)}
            className="bg-[#111827]/90 hover:bg-[#1f2937] text-gray-300 hover:text-white border border-white/10 rounded-xl px-3 py-2 text-xs font-medium transition-colors flex items-center gap-1.5"
            title="Toggle Controls"
          >
            {showControls ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {showControls ? 'Zen Mode' : 'Controls'}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-xl px-3 py-2 text-xs font-semibold transition-colors"
            >
              Close 3D
            </button>
          )}
        </div>
      </div>

      {/* Floating Info Banner */}
      <div className="absolute top-20 left-4 max-w-md pointer-events-none">
        <div className="bg-[#111827]/85 border border-white/10 rounded-xl p-3 shadow-lg text-xs text-gray-200">
          <span className="text-emerald-400 font-bold mr-1.5">● INFO:</span>
          {inspectInfo}
        </div>
      </div>

      {/* Collapsible Ergonomic Bottom Dock (Zero Center Viewport Occlusion) */}
      <div
        className={`absolute bottom-5 left-1/2 -translate-x-1/2 w-full max-w-3xl px-4 transition-all duration-300 pointer-events-none ${
          showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16 pointer-events-none'
        }`}
      >
        <div className="bg-[#111827] border border-white/10 rounded-2xl p-3 shadow-2xl pointer-events-auto flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Preset Camera Views */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-none">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-2 flex items-center gap-1">
              <Camera className="w-3 h-3 text-emerald-400" />
              Cam:
            </span>
            <button
              onClick={() => setCameraPreset('overview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeView === 'overview' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'text-gray-300 hover:bg-white/5 border border-transparent'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setCameraPreset('cow')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeView === 'cow' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'text-gray-300 hover:bg-white/5 border border-transparent'
              }`}
            >
              🐄 Livestock
            </button>
            <button
              onClick={() => setCameraPreset('barn')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeView === 'barn' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'text-gray-300 hover:bg-white/5 border border-transparent'
              }`}
            >
              🏭 Barn & Silo
            </button>
            <button
              onClick={() => setCameraPreset('fields')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeView === 'fields' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'text-gray-300 hover:bg-white/5 border border-transparent'
              }`}
            >
              🌾 Crop Fields
            </button>
            <button
              onClick={() => setCameraPreset('vault')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeView === 'vault' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'text-gray-300 hover:bg-white/5 border border-transparent'
              }`}
            >
              🏛️ Bank Vault
            </button>
          </div>

          {/* Lighting Ambience Selector */}
          <div className="flex items-center gap-1.5 border-t md:border-t-0 md:border-l border-white/10 pt-2 md:pt-0 md:pl-3">
            <button
              onClick={() => setLighting('day')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                timeOfDay === 'day' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-gray-400 hover:text-white'
              }`}
              title="Day Sunlight"
            >
              <Sun className="w-3.5 h-3.5" /> Day
            </button>
            <button
              onClick={() => setLighting('sunset')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                timeOfDay === 'sunset' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40' : 'text-gray-400 hover:text-white'
              }`}
              title="Golden Sunset"
            >
              Sunset
            </button>
            <button
              onClick={() => setLighting('night')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                timeOfDay === 'night' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' : 'text-gray-400 hover:text-white'
              }`}
              title="Moonlit Night"
            >
              <Moon className="w-3.5 h-3.5" /> Night
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
