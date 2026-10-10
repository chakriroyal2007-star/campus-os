'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface GalaxyCanvasProps {
  onLoaded?: () => void;
  interactive?: boolean;
}

export default function GalaxyCanvas({ onLoaded, interactive = true }: GalaxyCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webGlSupported, setWebGlSupported] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;

    // Check WebGL support
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!gl) {
        setWebGlSupported(false);
        return;
      }
    } catch {
      setWebGlSupported(false);
      return;
    }

    const container = containerRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // Scene & Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030712, 0.0018);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 3000);
    // Positioned at an oblique tilted angle looking down into the spiral core
    camera.position.set(0, 180, 420);
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x030712, 1);
    container.appendChild(renderer.domElement);

    // Procedural Particle Glow Texture
    const createParticleTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d')!;
      const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.15, 'rgba(255, 240, 200, 0.9)');
      gradient.addColorStop(0.4, 'rgba(100, 180, 255, 0.4)');
      gradient.addColorStop(0.8, 'rgba(40, 80, 200, 0.1)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 64, 64);
      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      return texture;
    };

    const particleTexture = createParticleTexture();

    // 1. SPIRAL GALAXY PARTICLES
    const isMobile = width < 768;
    const particleCount = isMobile ? 18000 : 38000;
    const branches = 4;
    const galaxyRadius = 380;
    const spinFactor = 1.35;
    const coreRadius = 45;

    const galaxyGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    const colorInside = new THREE.Color('#ffe8a3'); // Luminous warm gold core
    const colorMid = new THREE.Color('#70d6ff');    // Icy electric cyan
    const colorOutside = new THREE.Color('#3a86ff'); // Deep celestial blue
    const colorDust = new THREE.Color('#c77dff');   // Cosmic violet dust

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      // Distance from center with cubic curve for dense core
      const r = Math.pow(Math.random(), 2.2) * galaxyRadius;
      const branchAngle = ((i % branches) / branches) * Math.PI * 2;
      const spinAngle = r * (spinFactor / galaxyRadius) * 4;

      // Random dispersion that widens toward the outer edges
      const spread = (r / galaxyRadius) * 28 + 3;
      const randomX = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * spread;
      const randomY = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * (spread * 0.55);
      const randomZ = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * spread;

      const angle = branchAngle + spinAngle;

      positions[i3] = Math.cos(angle) * r + randomX;
      positions[i3 + 1] = randomY + (Math.sin(r * 0.03) * 6); // subtle vertical wave
      positions[i3 + 2] = Math.sin(angle) * r + randomZ;

      // Color blending: warm core -> cyan mid -> deep blue/purple outer
      let mixedColor: THREE.Color;
      if (r < coreRadius) {
        const ratio = r / coreRadius;
        mixedColor = colorInside.clone().lerp(new THREE.Color('#ffffff'), 1 - ratio * 0.7);
      } else if (r < galaxyRadius * 0.55) {
        const ratio = (r - coreRadius) / (galaxyRadius * 0.55 - coreRadius);
        mixedColor = colorInside.clone().lerp(colorMid, ratio);
      } else {
        const ratio = (r - galaxyRadius * 0.55) / (galaxyRadius * 0.45);
        mixedColor = colorMid.clone().lerp(Math.random() > 0.3 ? colorOutside : colorDust, ratio);
      }

      colors[i3] = mixedColor.r;
      colors[i3 + 1] = mixedColor.g;
      colors[i3 + 2] = mixedColor.b;

      // Particle size based on radius & randomness
      if (r < coreRadius) {
        sizes[i] = (Math.random() * 4.5 + 2.5) * (isMobile ? 0.8 : 1.0);
      } else {
        sizes[i] = (Math.random() * 3.2 + 0.8) * (isMobile ? 0.75 : 1.0);
      }
    }

    galaxyGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    galaxyGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    galaxyGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const galaxyMaterial = new THREE.PointsMaterial({
      size: 3.2,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      map: particleTexture,
      transparent: true,
      opacity: 0.95,
    });

    const galaxyPoints = new THREE.Points(galaxyGeometry, galaxyMaterial);
    // Tilted galactic plane for dramatic cinematic view
    galaxyPoints.rotation.x = THREE.MathUtils.degToRad(32);
    galaxyPoints.rotation.z = THREE.MathUtils.degToRad(-15);
    scene.add(galaxyPoints);

    // 2. BRILLIANT CENTRAL CORE GLOW
    const coreGlowGeo = new THREE.SphereGeometry(18, 32, 32);
    const coreGlowMat = new THREE.MeshBasicMaterial({
      color: 0xffeedd,
      transparent: true,
      opacity: 0.85,
    });
    const coreMesh = new THREE.Mesh(coreGlowGeo, coreGlowMat);
    galaxyPoints.add(coreMesh);

    // Outer halo glow around core
    const haloGeo = new THREE.PlaneGeometry(160, 160);
    const haloMat = new THREE.MeshBasicMaterial({
      map: particleTexture,
      color: 0xffd166,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    haloMesh.rotation.x = Math.PI / 2;
    galaxyPoints.add(haloMesh);

    // 3. CELESTIAL ORBITAL ARCS (As in reference image)
    const orbitalGroup = new THREE.Group();
    const ringCount = 4;
    const ringRadii = [110, 180, 260, 340];
    const ringMaterials: THREE.LineBasicMaterial[] = [];

    ringRadii.forEach((radius, idx) => {
      const segments = 128;
      const ringGeo = new THREE.BufferGeometry();
      const ringPositions = new Float32Array((segments + 1) * 3);

      for (let s = 0; s <= segments; s++) {
        const theta = (s / segments) * Math.PI * 2;
        // Slight elliptical eccentricity
        const x = Math.cos(theta) * radius * 1.08;
        const z = Math.sin(theta) * radius * 0.94;
        const y = Math.sin(theta * 2 + idx) * (radius * 0.08);

        ringPositions[s * 3] = x;
        ringPositions[s * 3 + 1] = y;
        ringPositions[s * 3 + 2] = z;
      }

      ringGeo.setAttribute('position', new THREE.BufferAttribute(ringPositions, 3));

      const ringMat = new THREE.LineBasicMaterial({
        color: idx % 2 === 0 ? 0x70d6ff : 0xffd166,
        transparent: true,
        opacity: 0.22 - idx * 0.03,
        blending: THREE.AdditiveBlending,
      });
      ringMaterials.push(ringMat);

      const ringLine = new THREE.Line(ringGeo, ringMat);
      ringLine.rotation.x = (idx * 0.12) - 0.1;
      ringLine.rotation.y = (idx * 0.18);
      orbitalGroup.add(ringLine);
    });

    galaxyPoints.add(orbitalGroup);

    // 4. CONNECTED KNOWLEDGE CONSTELLATION NETWORK (Orbital Nodes & Connecting Synapse Lines)
    const nodeCount = isMobile ? 45 : 95;
    const nodePositions: THREE.Vector3[] = [];
    const nodeGeometry = new THREE.SphereGeometry(1.6, 12, 12);
    const nodeMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.9,
    });

    const nodeInstanced = new THREE.InstancedMesh(nodeGeometry, nodeMaterial, nodeCount);
    const dummy = new THREE.Object3D();

    for (let i = 0; i < nodeCount; i++) {
      // Pick nodes situated along orbital arcs and spiral arms
      const armIndex = i % branches;
      const progress = (i / nodeCount);
      const r = 50 + progress * (galaxyRadius * 0.85);
      const angle = (armIndex / branches) * Math.PI * 2 + r * (spinFactor / galaxyRadius) * 4 + (Math.random() - 0.5) * 0.3;

      const x = Math.cos(angle) * r;
      const y = (Math.random() - 0.5) * 16;
      const z = Math.sin(angle) * r;

      const pos = new THREE.Vector3(x, y, z);
      nodePositions.push(pos);

      dummy.position.copy(pos);
      const scale = Math.random() * 1.6 + 0.8;
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      nodeInstanced.setMatrixAt(i, dummy.matrix);

      // Node color: core gold or arm cyan
      const isGold = Math.random() > 0.65;
      nodeInstanced.setColorAt(
        i,
        isGold ? new THREE.Color('#ffe28a') : new THREE.Color('#90e0ef')
      );
    }
    nodeInstanced.instanceMatrix.needsUpdate = true;
    if (nodeInstanced.instanceColor) nodeInstanced.instanceColor.needsUpdate = true;
    galaxyPoints.add(nodeInstanced);

    // Connecting Network Lines
    const linePositions: number[] = [];
    const maxConnectionDist = 85;
    for (let i = 0; i < nodePositions.length; i++) {
      let connections = 0;
      for (let j = i + 1; j < nodePositions.length; j++) {
        const dist = nodePositions[i].distanceTo(nodePositions[j]);
        if (dist < maxConnectionDist && connections < 3) {
          linePositions.push(
            nodePositions[i].x, nodePositions[i].y, nodePositions[i].z,
            nodePositions[j].x, nodePositions[j].y, nodePositions[j].z
          );
          connections++;
        }
      }
    }

    const networkLineGeo = new THREE.BufferGeometry();
    networkLineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    const networkLineMat = new THREE.LineBasicMaterial({
      color: 0x70d6ff,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
    });
    const networkLines = new THREE.LineSegments(networkLineGeo, networkLineMat);
    galaxyPoints.add(networkLines);

    // 5. DEEP BACKGROUND STARFIELD
    const bgStarsCount = isMobile ? 1200 : 3200;
    const bgStarsGeo = new THREE.BufferGeometry();
    const bgPositions = new Float32Array(bgStarsCount * 3);
    const bgColors = new Float32Array(bgStarsCount * 3);

    for (let i = 0; i < bgStarsCount; i++) {
      const i3 = i * 3;
      const radius = THREE.MathUtils.randFloat(400, 1400);
      const theta = THREE.MathUtils.randFloat(0, Math.PI * 2);
      const phi = THREE.MathUtils.randFloat(0, Math.PI);

      bgPositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      bgPositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      bgPositions[i3 + 2] = radius * Math.cos(phi);

      const isWarm = Math.random() > 0.7;
      const starCol = isWarm
        ? new THREE.Color('#ffe5b4')
        : new THREE.Color('#bde0fe');

      bgColors[i3] = starCol.r;
      bgColors[i3 + 1] = starCol.g;
      bgColors[i3 + 2] = starCol.b;
    }

    bgStarsGeo.setAttribute('position', new THREE.BufferAttribute(bgPositions, 3));
    bgStarsGeo.setAttribute('color', new THREE.BufferAttribute(bgColors, 3));

    const bgStarsMat = new THREE.PointsMaterial({
      size: 2.2,
      sizeAttenuation: true,
      depthWrite: false,
      vertexColors: true,
      map: particleTexture,
      transparent: true,
      opacity: 0.65,
    });
    const bgStarField = new THREE.Points(bgStarsGeo, bgStarsMat);
    scene.add(bgStarField);

    // Interactive mouse / touch tracking with damping
    let mouseX = 0;
    let mouseY = 0;
    let targetCameraX = 0;
    let targetCameraY = 180;
    let targetCameraZ = 420;

    const handlePointerMove = (e: PointerEvent) => {
      if (!interactive) return;
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = -(e.clientY / window.innerHeight) * 2 + 1;

      mouseX = normX;
      mouseY = normY;

      targetCameraX = normX * 90;
      targetCameraY = 180 + normY * 60;
      targetCameraZ = 420 - normY * 40;
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    // Handle Window Resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const newW = containerRef.current.clientWidth || window.innerWidth;
      const newH = containerRef.current.clientHeight || window.innerHeight;

      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    window.addEventListener('resize', handleResize);

    // Reduced motion check
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      if (!prefersReducedMotion) {
        // Slow majestic rotation of galaxy disk
        galaxyPoints.rotation.y += delta * 0.045;
        // Background starfield counter-drift
        bgStarField.rotation.y -= delta * 0.008;

        // Orbital group subtle precession
        orbitalGroup.rotation.y += delta * 0.02;

        // Pulsing core glow effect
        const pulse = 1.0 + Math.sin(elapsedTime * 2.2) * 0.08;
        coreMesh.scale.set(pulse, pulse, pulse);
        haloMesh.scale.set(pulse * 1.05, pulse * 1.05, pulse * 1.05);

        // Smooth camera damping towards target
        camera.position.x += (targetCameraX - camera.position.x) * 0.04;
        camera.position.y += (targetCameraY - camera.position.y) * 0.04;
        camera.position.z += (targetCameraZ - camera.position.z) * 0.04;
        camera.lookAt(0, 0, 0);
      }

      renderer.render(scene, camera);
    };

    animate();

    if (onLoaded) {
      onLoaded();
    }

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('resize', handleResize);

      // Dispose geometries
      galaxyGeometry.dispose();
      coreGlowGeo.dispose();
      haloGeo.dispose();
      nodeGeometry.dispose();
      networkLineGeo.dispose();
      bgStarsGeo.dispose();

      // Dispose materials
      galaxyMaterial.dispose();
      coreGlowMat.dispose();
      haloMat.dispose();
      nodeMaterial.dispose();
      networkLineMat.dispose();
      bgStarsMat.dispose();
      ringMaterials.forEach((m) => m.dispose());
      particleTexture.dispose();

      // Dispose renderer
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [interactive, onLoaded]);

  if (!webGlSupported) {
    return (
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-[#060b19] to-slate-950 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full overflow-hidden pointer-events-auto"
      style={{ zIndex: 0 }}
    />
  );
}
