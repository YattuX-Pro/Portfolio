"use client";

import { useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, Line } from "@react-three/drei";
import * as THREE from "three";

type NodeDef = { name: string; level: number; color: string; pos: [number, number, number] };

const NODES: NodeDef[] = [
  { name: "Next.js",    level: 80, color: "#a78bfa", pos: [-2.5,  1.0,  0.0] },
  { name: "Angular",    level: 85, color: "#a78bfa", pos: [-2.0,  0.0,  0.3] },
  { name: "TypeScript", level: 76, color: "#a78bfa", pos: [-2.5, -0.8, -0.2] },
  { name: ".NET",       level: 92, color: "#67e8f9", pos: [ 2.3,  0.6,  0.1] },
  { name: "C#",         level: 88, color: "#67e8f9", pos: [ 2.0, -0.4, -0.1] },
  { name: "PostgreSQL", level: 74, color: "#f0abfc", pos: [-0.8, -1.5,  0.1] },
  { name: "Docker",     level: 70, color: "#f0abfc", pos: [ 0.2, -1.8, -0.1] },
  { name: "GitHub",     level: 78, color: "#f0abfc", pos: [ 1.1, -1.4,  0.2] },
  { name: "Bitbucket",  level: 68, color: "#f0abfc", pos: [ 0.1, -1.0,  0.3] },
];

const CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [0, 2],
  [3, 4],
  [5, 6], [6, 7], [7, 8], [5, 8],
  [1, 7],
];

function SkillOrb({ node, index }: { node: NodeDef; index: number }) {
  const meshRef  = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const [hovered, setHovered] = useState(false);
  const radius = 0.06 + (node.level / 100) * 0.16;

  useFrame(({ clock }) => {
    const el = meshRef.current;
    const lt = lightRef.current;
    if (!el || !lt) return;
    const t = clock.elapsedTime;
    el.position.y = Math.sin(t * 0.55 + index * 1.1) * 0.09;
    const s = THREE.MathUtils.lerp(el.scale.x, hovered ? 1.4 : 1.0, 0.12);
    el.scale.setScalar(s);
    const targetI = hovered ? 2.8 : 0.7 + Math.sin(t * 1.1 + index) * 0.3;
    lt.intensity = THREE.MathUtils.lerp(lt.intensity, targetI, 0.08);
    (el.material as THREE.MeshStandardMaterial).emissiveIntensity = THREE.MathUtils.lerp(
      (el.material as THREE.MeshStandardMaterial).emissiveIntensity,
      hovered ? 1.4 : 0.55 + Math.sin(t * 0.9 + index) * 0.2,
      0.08,
    );
  });

  return (
    <group position={node.pos}>
      <mesh
        ref={meshRef}
        onPointerEnter={() => { setHovered(true);  document.body.style.cursor = "pointer"; }}
        onPointerLeave={() => { setHovered(false); document.body.style.cursor = "default"; }}
      >
        <sphereGeometry args={[radius, 24, 24]} />
        <meshStandardMaterial
          color={node.color}
          emissive={node.color}
          emissiveIntensity={0.55}
          metalness={0.15}
          roughness={0.35}
          transparent
          opacity={0.92}
        />
      </mesh>

      <pointLight ref={lightRef} color={node.color} intensity={1.0} distance={2.2} decay={2} />

      {hovered && (
        <Html center distanceFactor={7} style={{ pointerEvents: "none", zIndex: 10 }}>
          <div style={{
            background: "rgba(4,2,18,0.92)",
            border: `1px solid ${node.color}55`,
            borderRadius: 8,
            padding: "4px 10px",
            color: node.color,
            fontSize: 11,
            fontWeight: 700,
            whiteSpace: "nowrap",
            backdropFilter: "blur(12px)",
            boxShadow: `0 0 20px ${node.color}44`,
            transform: "translateY(-42px)",
            fontFamily: "system-ui, sans-serif",
            letterSpacing: "0.04em",
          }}>
            {node.name} — {node.level}%
          </div>
        </Html>
      )}
    </group>
  );
}

function ConnectionLines() {
  return (
    <>
      {CONNECTIONS.map(([a, b], i) => (
        <Line
          key={i}
          points={[NODES[a].pos, NODES[b].pos]}
          color={NODES[a].color}
          lineWidth={0.8}
          transparent
          opacity={0.14}
        />
      ))}
    </>
  );
}

function Scene() {
  const groupRef = useRef<THREE.Group>(null);
  const { mouse } = useThree();

  useFrame(({ clock }) => {
    const g = groupRef.current;
    if (!g) return;
    g.rotation.y = clock.elapsedTime * 0.055;
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, mouse.y * -0.10, 0.04);
    g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, mouse.x *  0.05, 0.04);
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.12} />
      <ConnectionLines />
      {NODES.map((n, i) => <SkillOrb key={n.name} node={n} index={i} />)}
    </group>
  );
}

export default function SkillNebula3D() {
  return (
    <div className="w-full rounded-2xl" style={{ height: 320 }}>
      <Canvas
        camera={{ position: [0, 0, 5.8], fov: 55 }}
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 1.5]}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
