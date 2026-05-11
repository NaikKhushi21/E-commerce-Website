"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useReducedMotion } from "framer-motion";

export function ParticlesWavesMoment() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x090d15, 0.0018);

    const camera = new THREE.PerspectiveCamera(62, 1, 1, 3000);
    camera.position.set(0, 190, 560);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const amountX = 120;
    const amountZ = 80;
    const separation = 11;
    const numParticles = amountX * amountZ;

    const positions = new Float32Array(numParticles * 3);
    const baseX = new Float32Array(numParticles);
    const baseZ = new Float32Array(numParticles);

    let i = 0;
    for (let ix = 0; ix < amountX; ix += 1) {
      for (let iz = 0; iz < amountZ; iz += 1) {
        const x = ix * separation - ((amountX * separation) / 2);
        const z = iz * separation - ((amountZ * separation) / 2);

        positions[i * 3] = x;
        positions[i * 3 + 1] = 0;
        positions[i * 3 + 2] = z;

        baseX[i] = x;
        baseZ[i] = z;
        i += 1;
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0x9fd6ff,
      size: 3.6,
      transparent: true,
      opacity: 0.74,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const points = new THREE.Points(geometry, material);
    points.position.y = -34;
    points.rotation.x = -0.22;
    scene.add(points);

    const glowGeometry = new THREE.PlaneGeometry(1450, 700);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x9ec4ff,
      transparent: true,
      opacity: 0.11,
    });
    const glowPlane = new THREE.Mesh(glowGeometry, glowMaterial);
    glowPlane.position.set(0, -68, -220);
    glowPlane.rotation.x = -0.3;
    scene.add(glowPlane);

    const resize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
    };

    resize();
    window.addEventListener("resize", resize);

    let frame = 0;

    const render = () => {
      const t = Date.now() * 0.0014;
      const pos = geometry.attributes.position.array as Float32Array;

      for (let idx = 0; idx < numParticles; idx += 1) {
        const y =
          Math.sin((baseX[idx] * 0.016) + t * 1.5) * 14 +
          Math.cos((baseZ[idx] * 0.014) + t * 1.1) * 11;
        pos[idx * 3 + 1] = y;
      }

      geometry.attributes.position.needsUpdate = true;

      points.rotation.y = Math.sin(t * 0.1) * 0.1;
      glowPlane.material.opacity = 0.08 + Math.sin(t * 0.45) * 0.03;

      renderer.render(scene, camera);
      frame = window.requestAnimationFrame(render);
    };

    if (reduceMotion) {
      renderer.render(scene, camera);
    } else {
      frame = window.requestAnimationFrame(render);
    }

    return () => {
      window.removeEventListener("resize", resize);
      if (frame) {
        window.cancelAnimationFrame(frame);
      }

      geometry.dispose();
      material.dispose();
      glowGeometry.dispose();
      glowMaterial.dispose();
      renderer.dispose();

      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [reduceMotion]);

  return (
    <section className="theme-aurora relative overflow-hidden rounded-[2.1rem] border border-[var(--line)] bg-[var(--bg)] px-6 py-12 text-[var(--text)] md:px-10 md:py-16">
      <div className="relative z-10 grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="micro-copy text-white/62">Ambient Wave Field</p>
          <h3 className="text-display mt-3 max-w-3xl">One signature atmosphere, always alive.</h3>
        </div>
        <p className="max-w-sm text-body text-white/70 md:text-body">
          A restrained particle field inspired by Three.js waves for depth and calm motion without a media gallery.
        </p>
      </div>

      <div className="relative mt-8 h-[420px] overflow-hidden rounded-[1.8rem] border border-white/10 bg-[radial-gradient(circle_at_50%_0%,rgba(138,186,255,0.12),transparent_62%)] md:h-[500px]">
        <div ref={containerRef} className="absolute inset-0" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(85%_70%_at_50%_100%,rgba(0,0,0,0.44),transparent_72%)]" />
      </div>
    </section>
  );
}
