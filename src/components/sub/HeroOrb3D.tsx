'use client'

import { useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

function OrbScene() {
  const mesh = useRef<THREE.Mesh>(null!)
  const { mouse } = useThree()
  const base = useRef({ x: 0, y: 0 })

  useFrame((state, delta) => {
    // Continuous auto-rotation
    base.current.x += delta * 0.22
    base.current.y += delta * 0.32

    // Smooth mouse-reactive tilt layered on top of base rotation
    mesh.current.rotation.x = THREE.MathUtils.lerp(
      mesh.current.rotation.x,
      base.current.x + mouse.y * 0.5,
      0.05
    )
    mesh.current.rotation.y = THREE.MathUtils.lerp(
      mesh.current.rotation.y,
      base.current.y + mouse.x * 0.5,
      0.05
    )

    // Breathing emissive pulse
    const mat = mesh.current.material as THREE.MeshStandardMaterial
    mat.emissiveIntensity = 0.9 + Math.sin(state.clock.elapsedTime * 0.9) * 0.35
  })

  return (
    <>
      <ambientLight intensity={0.12} />
      {/* Purple key light */}
      <pointLight position={[1.8, 2.0, 2.0]} color="#a78bfa" intensity={12} />
      {/* Cyan fill light */}
      <pointLight position={[-2.0, -1.0, -1.5]} color="#67e8f9" intensity={9} />
      {/* Magenta rim light */}
      <pointLight position={[0.5, -2.5, 1.0]} color="#e879f9" intensity={6} />

      <mesh ref={mesh}>
        {/* radius=0.62, tube=0.21, tubularSegments=128, radialSegments=16 */}
        <torusKnotGeometry args={[0.62, 0.21, 128, 16]} />
        <meshStandardMaterial
          color="#3b0764"
          emissive="#7c3aed"
          emissiveIntensity={0.9}
          metalness={0.88}
          roughness={0.12}
        />
      </mesh>
    </>
  )
}

export default function HeroOrb3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 2.3], fov: 58 }}
      gl={{ alpha: true, antialias: true }}
      dpr={[1, 1.5]}
      style={{ background: 'transparent', width: '100%', height: '100%' }}
    >
      <OrbScene />
    </Canvas>
  )
}
