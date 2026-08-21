'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'
// @ts-ignore
import * as random from 'maath/random/dist/maath-random.esm'

const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024

/* ═══════════════════════════════════════════════════════════════════════════
   STAR LAYERS — 3 couches colorées avec parallaxe souris
   ═══════════════════════════════════════════════════════════════════════════ */
interface StarLayerProps {
  count: number; radius: number; size: number; color: string
  speedX: number; speedY: number; mouseF: number
}
function StarLayer({ count, radius, size, color, speedX, speedY, mouseF }: StarLayerProps) {
  const ref = useRef<any>(null)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const positions = useMemo(() => random.inSphere(new Float32Array(count * 3), { radius }), [])

  useFrame((state, delta) => {
    if (!ref.current) return
    ref.current.rotation.x -= delta * speedX
    ref.current.rotation.y -= delta * speedY
    ref.current.rotation.x += state.mouse.y * delta * mouseF
    ref.current.rotation.y += state.mouse.x * delta * mouseF
  })

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={positions} stride={3} frustumCulled>
        <PointMaterial transparent color={color} size={size} sizeAttenuation depthWrite={false} opacity={0.82} />
      </Points>
    </group>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   SKILLS SCENE — barres 3D lumineuses à Z = -20
   ═══════════════════════════════════════════════════════════════════════════ */
const SKILL_DATA = [
  { level: 80, color: '#a78bfa' }, // Next.js
  { level: 85, color: '#67e8f9' }, // Angular
  { level: 76, color: '#e879f9' }, // TypeScript
  { level: 92, color: '#a78bfa' }, // .NET
  { level: 88, color: '#67e8f9' }, // C#
  { level: 74, color: '#e879f9' }, // PostgreSQL
  { level: 70, color: '#a78bfa' }, // Docker
  { level: 78, color: '#67e8f9' }, // GitHub
  { level: 68, color: '#e879f9' }, // Bitbucket
]

function SkillsScene() {
  const spacing = 0.58
  const totalW = (SKILL_DATA.length - 1) * spacing

  return (
    <group position={[0, -1, -20]}>
      <pointLight position={[0, 7, 3]}   color="#a78bfa" intensity={20} distance={30} />
      <pointLight position={[5, 4, 1]}   color="#67e8f9" intensity={14} distance={24} />
      <pointLight position={[-5, 3, 1]}  color="#e879f9" intensity={10} distance={20} />

      {/* Grille au sol */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.12, 0]}>
        <planeGeometry args={[totalW + 3, 5.5, 9, 6]} />
        <meshStandardMaterial
          color="#030014" wireframe
          emissive="#a78bfa" emissiveIntensity={0.1}
          transparent opacity={0.45}
        />
      </mesh>

      {SKILL_DATA.map((s, i) => {
        const x = -totalW / 2 + i * spacing
        const h = (s.level / 100) * 5
        return (
          <Float key={i} speed={0.7 + i * 0.08} floatIntensity={0.05} rotationIntensity={0}>
            <group position={[x, h / 2, 0]}>
              <mesh>
                <boxGeometry args={[0.30, h, 0.30]} />
                <meshStandardMaterial
                  color={s.color} emissive={s.color} emissiveIntensity={0.50}
                  metalness={0.85} roughness={0.10} transparent opacity={0.92}
                />
              </mesh>
              <pointLight position={[0, h / 2 + 0.2, 0]} color={s.color} intensity={3} distance={3.5} />
            </group>
          </Float>
        )
      })}
    </group>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   PROJECTS SCENE — panneaux 3D en arc à Z = -38
   ═══════════════════════════════════════════════════════════════════════════ */
const PROJECT_COLORS = ['#7c3aed', '#0891b2', '#4f46e5', '#db2777', '#059669'] as const

function ProjectsScene() {
  const groupRef = useRef<THREE.Group>(null!)
  useFrame((state) => {
    if (!groupRef.current) return
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.12) * 0.07
  })

  return (
    <group position={[0, 0, -38]} ref={groupRef}>
      <pointLight position={[0, 5, 5]}   color="#a78bfa" intensity={16} distance={30} />
      <pointLight position={[-4, 3, 2]}  color="#67e8f9" intensity={12} distance={24} />
      <pointLight position={[4, 2, 2]}   color="#e879f9" intensity={8}  distance={20} />

      {PROJECT_COLORS.map((color, i) => {
        const t = ((i - 2) / 4) * Math.PI * 0.65
        const r = 4.2
        const x = Math.sin(t) * r
        const ry = -t * 0.5

        return (
          <Float key={i} speed={0.55 + i * 0.1} floatIntensity={0.14} rotationIntensity={0}>
            <group position={[x, 0, 0]} rotation={[0, ry, 0]}>
              {/* Face de la carte */}
              <mesh>
                <planeGeometry args={[1.55, 2.15]} />
                <meshStandardMaterial
                  color="#06031a" emissive={color} emissiveIntensity={0.07}
                  metalness={0.4} roughness={0.5} transparent opacity={0.93}
                />
              </mesh>
              {/* Bordures lumineuses */}
              {([
                { p: [0,  1.075, 0.006] as [number,number,number], g: [1.55, 0.022, 0.01] as [number,number,number] },
                { p: [0, -1.075, 0.006] as [number,number,number], g: [1.55, 0.022, 0.01] as [number,number,number] },
                { p: [-0.775, 0, 0.006] as [number,number,number], g: [0.022, 2.15, 0.01] as [number,number,number] },
                { p: [ 0.775, 0, 0.006] as [number,number,number], g: [0.022, 2.15, 0.01] as [number,number,number] },
              ] as const).map((b, bi) => (
                <mesh key={bi} position={b.p}>
                  <boxGeometry args={b.g} />
                  <meshStandardMaterial color={color} emissive={color} emissiveIntensity={3.5} />
                </mesh>
              ))}
              <pointLight position={[0, 0, 0.5]} color={color} intensity={5} distance={5.5} />
            </group>
          </Float>
        )
      })}
    </group>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   FOOTER SCENE — anneau d'orbes rotatif à Z = -56
   ═══════════════════════════════════════════════════════════════════════════ */
function FooterScene() {
  const ringRef = useRef<THREE.Group>(null!)
  useFrame((_, delta) => {
    if (!ringRef.current) return
    ringRef.current.rotation.y += delta * 0.30
  })

  const COLORS = ['#a78bfa', '#67e8f9', '#e879f9', '#a78bfa', '#67e8f9', '#e879f9'] as const

  return (
    <group position={[0, 0, -56]}>
      <pointLight position={[0, 5, 4]}   color="#67e8f9" intensity={16} distance={30} />
      <pointLight position={[-4, 3, 0]}  color="#a78bfa" intensity={12} distance={24} />
      <pointLight position={[4, 2, 0]}   color="#e879f9" intensity={8}  distance={18} />

      {/* Anneau de sphères */}
      <group ref={ringRef}>
        {COLORS.map((color, i) => {
          const angle = (i / COLORS.length) * Math.PI * 2
          const rx = Math.cos(angle) * 2.5
          const ry = Math.sin(angle) * 0.5
          const rz = Math.sin(angle) * 1.0
          return (
            <group key={i}>
              <mesh position={[rx, ry, rz]}>
                <sphereGeometry args={[0.22, 20, 20]} />
                <meshStandardMaterial
                  color={color} emissive={color} emissiveIntensity={2.2}
                  metalness={0.9} roughness={0.05}
                />
              </mesh>
              <pointLight position={[rx, ry, rz]} color={color} intensity={4} distance={5.5} />
            </group>
          )
        })}
      </group>

      {/* Halo au sol */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.2, 0]}>
        <ringGeometry args={[2, 6, 72]} />
        <meshStandardMaterial
          color="#030014" emissive="#a78bfa" emissiveIntensity={0.18}
          transparent opacity={0.65} side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   CAMERA RIG — voyage Z = 5 → -62 piloté par window.scrollY
   ═══════════════════════════════════════════════════════════════════════════ */
function CameraRig() {
  useFrame((state) => {
    const max = Math.max(1, document.body.scrollHeight - window.innerHeight)
    const progress = Math.min(1, window.scrollY / max)

    const targetZ = 5 - progress * 67   // Z voyage : 5 → -62
    const targetY = -progress * 1.8     // légère descente
    const targetX = state.mouse.x * 0.9 // parallaxe souris

    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetZ, 0.06)
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetY, 0.04)
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, targetX, 0.04)
  })
  return null
}

/* ═══════════════════════════════════════════════════════════════════════════
   EXPORT — scène complète
   ═══════════════════════════════════════════════════════════════════════════ */
export default function Scene3D() {
  return (
    <>
      <CameraRig />

      {/* Étoiles — 3 couches */}
      <StarLayer count={isMobile ? 800 : 2500} radius={1.8} size={0.0014} color="#e8e0ff" speedX={0.06} speedY={0.05} mouseF={0.008} />
      <StarLayer count={isMobile ? 250 : 700}  radius={1.3} size={0.0030} color="#a78bfa" speedX={0.10} speedY={0.08} mouseF={0.022} />
      <StarLayer count={isMobile ? 150 : 450}  radius={1.0} size={0.0025} color="#67e8f9" speedX={0.14} speedY={0.11} mouseF={0.040} />

      {/* Objets 3D des sections */}
      <SkillsScene />
      <ProjectsScene />
      <FooterScene />
    </>
  )
}
