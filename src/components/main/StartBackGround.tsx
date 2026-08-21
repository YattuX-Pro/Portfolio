'use client'

import React, { Suspense, useRef, useMemo } from 'react'
import * as THREE from 'three'

// @ts-ignore
import * as random from 'maath/random/dist/maath-random.esm'
import { Canvas, useFrame } from '@react-three/fiber'
import { PointMaterial, Points } from '@react-three/drei'

const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

interface StarLayerProps {
  count: number
  radius: number
  size: number
  color: string
  rotSpeedX: number
  rotSpeedY: number
  mouseInfluence: number
}

function StarLayer({ count, radius, size, color, rotSpeedX, rotSpeedY, mouseInfluence }: StarLayerProps) {
  const ref = useRef<any>(null)
  const positions = useMemo(
    () => random.inSphere(new Float32Array(count * 3), { radius }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  useFrame((state, delta) => {
    if (!ref.current) return
    ref.current.rotation.x -= delta * rotSpeedX
    ref.current.rotation.y -= delta * rotSpeedY
    // Parallax : each layer shifts at a different speed based on mouse position
    ref.current.rotation.x += state.mouse.y * delta * mouseInfluence
    ref.current.rotation.y += state.mouse.x * delta * mouseInfluence
  })

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={positions} stride={3} frustumCulled>
        <PointMaterial
          transparent
          color={color}
          size={size}
          sizeAttenuation
          depthWrite={false}
          opacity={0.75}
        />
      </Points>
    </group>
  )
}

/* Caméra réactive au scroll — zoom léger vers l'avant en descendant */
function ScrollCamera() {
  useFrame((state) => {
    const maxScroll = Math.max(1, document.body.scrollHeight - window.innerHeight)
    const progress = window.scrollY / maxScroll
    state.camera.position.z = THREE.MathUtils.lerp(
      state.camera.position.z,
      1 - progress * 0.22,
      0.025
    )
  })
  return null
}

export function StartBackGround() {
  return (
    <>
      {/* Layer 1 — distant white stars, very slow */}
      <StarLayer
        count={isMobile ? 1000 : 3000}
        radius={1.4}
        size={0.0014}
        color="#e8e0ff"
        rotSpeedX={0.06}
        rotSpeedY={0.05}
        mouseInfluence={0.008}
      />
      {/* Layer 2 — mid purple stars, medium speed */}
      <StarLayer
        count={isMobile ? 250 : 700}
        radius={1.0}
        size={0.0030}
        color="#a78bfa"
        rotSpeedX={0.10}
        rotSpeedY={0.08}
        mouseInfluence={0.022}
      />
      {/* Layer 3 — close cyan stars, faster, strongest parallax */}
      <StarLayer
        count={isMobile ? 150 : 450}
        radius={0.75}
        size={0.0025}
        color="#67e8f9"
        rotSpeedX={0.14}
        rotSpeedY={0.11}
        mouseInfluence={0.040}
      />
    </>
  )
}

export default function StarsCanvas() {
  return (
    <div className="w-full h-auto fixed inset-0 z-[20] pointer-events-none">
      <Canvas camera={{ position: [0, 0, 1] }} style={{ pointerEvents: 'none' }}>
        <Suspense fallback={null}>
          <StartBackGround />
          <ScrollCamera />
        </Suspense>
      </Canvas>
    </div>
  )
}
