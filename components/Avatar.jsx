'use client'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { useEffect, useRef } from 'react'

function AvatarModel({ emotion }) {
  // Use your embedded materials as-is
  const { scene, animations } = useGLTF('/models/character.glb', true)
  const mixer = useRef()
  const actions = useRef({})
  const currentEmotion = useRef('idle')

  useEffect(() => {
    if (!scene) return

    // ✅ DO NOT override materials — keep what’s in the GLB
    // Just ensure textures/materials render with proper color/tone mapping
    scene.traverse((obj) => {
      if (obj.isMesh && obj.material) {
        // If baseColor/base map exists, make sure it’s in sRGB
        const m = obj.material
        if (m.map) m.map.colorSpace = THREE.SRGBColorSpace
        // Normal/roughness/metalness stay linear (default)
        m.needsUpdate = true
        obj.castShadow = true
        obj.receiveShadow = true
      }
    })

    // Animations
    mixer.current = new THREE.AnimationMixer(scene)
    if (animations && animations.length) {
      animations.forEach((clip) => {
        const key = clip.name.toLowerCase()
        actions.current[key] = mixer.current.clipAction(clip)
      })
      // Auto-play first clip if any
      const first = Object.keys(actions.current)[0]
      if (first) {
        actions.current[first].reset().play()
        actions.current[first].setLoop(THREE.LoopRepeat)
        currentEmotion.current = first
      }
    }
  }, [scene, animations])

  // Change gestures by name (angry, waving, talking, defeated, etc.)
  useEffect(() => {
    if (!mixer.current) return
    if (!emotion) return
    const curr = actions.current[currentEmotion.current]
    const next = actions.current[emotion]
    if (curr) curr.stop()
    if (next) {
      currentEmotion.current = emotion
      next.reset().play()
      next.clampWhenFinished = true
      next.loop = THREE.LoopOnce
      next.onFinished = () => {
        const first = Object.keys(actions.current)[0]
        if (first) {
          actions.current[first].reset().play()
          actions.current[first].setLoop(THREE.LoopRepeat)
          currentEmotion.current = first
        }
      }
    }
  }, [emotion])

  useFrame((_, dt) => mixer.current && mixer.current.update(dt))

  if (!scene) {
    return (
      <mesh>
        <boxGeometry args={[1, 2, 0.5]} />
        <meshStandardMaterial />
      </mesh>
    )
  }

  return <primitive object={scene} scale={1.2} position={[0, -2.5, 0]} />
}

useGLTF.preload('/models/character.glb')

export default function Avatar({ emotion }) {
  return (
    <Canvas
      style={{ width: '100%', height: '100%' }}
      // ✅ Correct color space (gamma) like the glTF viewer
      gl={{ outputColorSpace: THREE.SRGBColorSpace, physicallyCorrectLights: true }}
      camera={{ position: [0, 0, 5], fov: 50, near: 0.1, far: 1000 }}
      shadows
      dpr={[1, 2]}
    >
      {/* neutral lighting; add an HDRI for accurate materials */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={1.0} castShadow />
      <Environment preset="studio" />

      <color attach="background" args={['#b3d9ff']} />
      <AvatarModel emotion={emotion} />
      <OrbitControls
        enableZoom
        enablePan={false}
        enableRotate
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={Math.PI / 6}
        maxDistance={10}
        minDistance={2}
        target={[0, 0, 0]}
        enableDamping
        dampingFactor={0.05}
      />
    </Canvas>
  )
}
