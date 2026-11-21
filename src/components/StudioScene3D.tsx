import React, { useRef, useMemo, Suspense, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  Environment,
  Float,
  Sparkles,
  MeshReflectorMaterial,
  OrbitControls,
  Html,
} from '@react-three/drei';
import * as THREE from 'three';
import { Photo } from '../types';

interface StudioScene3DProps {
  photos: Photo[];
  onSelectPhoto: (photo: Photo) => void;
  activePreset: 'hero' | 'lens' | 'gallery';
  shutterFlash: number;
}

function CinemaCameraRig({
  activePreset,
  shutterFlash,
}: {
  activePreset: 'hero' | 'lens' | 'gallery';
  shutterFlash: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const focusRingRef = useRef<THREE.Mesh>(null);
  const zoomRingRef = useRef<THREE.Mesh>(null);
  const apertureRef = useRef<THREE.Group>(null);
  const flashLightRef = useRef<THREE.PointLight>(null);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();

    if (groupRef.current) {
      const baseRotY =
        activePreset === 'lens' ? -0.35 : activePreset === 'gallery' ? 0.25 : 0;
      const targetRotY = baseRotY + state.pointer.x * 0.48 + Math.sin(t * 0.35) * 0.1;
      const targetRotX = -state.pointer.y * 0.24 + Math.cos(t * 0.28) * 0.05;

      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetRotY,
        0.06
      );
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        targetRotX,
        0.06
      );

      const targetPosX = activePreset === 'lens' ? -0.45 : 0;
      const targetPosY = activePreset === 'gallery' ? 0.55 : 0.15;
      groupRef.current.position.x = THREE.MathUtils.lerp(
        groupRef.current.position.x,
        targetPosX,
        0.06
      );
      groupRef.current.position.y = THREE.MathUtils.lerp(
        groupRef.current.position.y,
        targetPosY,
        0.06
      );
    }

    if (focusRingRef.current) {
      focusRingRef.current.rotation.z = Math.sin(t * 0.9) * 0.45;
    }
    if (zoomRingRef.current) {
      zoomRingRef.current.rotation.z = -Math.cos(t * 0.65) * 0.3;
    }
    if (apertureRef.current) {
      const pulse = activePreset === 'lens' ? 1.15 : 1;
      apertureRef.current.rotation.z += delta * 0.35 * pulse;
    }

    // Studio Strobe Flash Decay when user clicks "Trigger Studio Shutter"
    if (flashLightRef.current) {
      flashLightRef.current.intensity = THREE.MathUtils.lerp(
        flashLightRef.current.intensity,
        0,
        0.12
      );
    }
  });

  useEffect(() => {
    if (shutterFlash > 0 && flashLightRef.current) {
      flashLightRef.current.intensity = 28;
    }
  }, [shutterFlash]);

  const blades = useMemo(
    () => Array.from({ length: 9 }, (_, i) => (i * Math.PI * 2) / 9),
    []
  );

  return (
    <Float speed={1.5} rotationIntensity={0.15} floatIntensity={0.38}>
      <group ref={groupRef} position={[0, 0.15, 0]} scale={1.12}>
        {/* Studio Strobe Flash Bulb */}
        <pointLight
          ref={flashLightRef}
          position={[0.8, 1.3, 1.8]}
          intensity={0}
          distance={14}
          color="#FFF7DC"
        />

        {/* Cinema Camera Body - Anodized Magnesium Alloy */}
        <mesh castShadow receiveShadow position={[0, 0, -0.48]}>
          <boxGeometry args={[2.65, 1.62, 1.2]} />
          <meshStandardMaterial color="#0e0e13" metalness={0.82} roughness={0.28} />
        </mesh>

        {/* Textured Leatherette Grip Pad */}
        <mesh position={[-1.08, -0.02, -0.35]}>
          <boxGeometry args={[0.55, 1.48, 1.05]} />
          <meshStandardMaterial color="#18181f" metalness={0.2} roughness={0.85} />
        </mesh>

        {/* Top Viewfinder & EVF Housing */}
        <mesh position={[0, 0.98, -0.42]}>
          <boxGeometry args={[1.15, 0.5, 1.0]} />
          <meshStandardMaterial color="#131318" metalness={0.85} roughness={0.24} />
        </mesh>

        {/* Champagne Gold Top & Bottom Accent Rails */}
        <mesh position={[0, 0.82, -0.48]}>
          <boxGeometry args={[2.68, 0.045, 1.23]} />
          <meshStandardMaterial color="#D4AF37" metalness={0.96} roughness={0.16} />
        </mesh>
        <mesh position={[0, -0.82, -0.48]}>
          <boxGeometry args={[2.68, 0.045, 1.23]} />
          <meshStandardMaterial color="#D4AF37" metalness={0.96} roughness={0.16} />
        </mesh>

        {/* Gold Control Dials & Mode Selector */}
        <mesh position={[-0.9, 0.95, -0.45]}>
          <cylinderGeometry args={[0.24, 0.24, 0.24, 36]} />
          <meshStandardMaterial color="#D4AF37" metalness={0.95} roughness={0.18} />
        </mesh>
        <mesh position={[0.92, 0.93, -0.45]}>
          <cylinderGeometry args={[0.2, 0.2, 0.22, 36]} />
          <meshStandardMaterial color="#D4AF37" metalness={0.95} roughness={0.18} />
        </mesh>

        {/* Gold Shutter Button */}
        <mesh position={[0.96, 0.89, 0.04]}>
          <cylinderGeometry args={[0.11, 0.12, 0.14, 28]} />
          <meshStandardMaterial color="#F5E6B3" metalness={0.98} roughness={0.1} />
        </mesh>

        {/* Cinema Follow-Focus Side Rod & Gold Gear */}
        <mesh position={[-1.48, -0.55, 0.35]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.045, 0.045, 2.2, 20]} />
          <meshStandardMaterial color="#272730" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[-0.95, -0.45, 0.78]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.28, 0.28, 0.16, 32]} />
          <meshStandardMaterial color="#D4AF37" metalness={0.95} roughness={0.2} />
        </mesh>

        {/* Gold PL/EF Lens Mount Flange */}
        <mesh position={[0, -0.04, 0.14]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.84, 0.88, 0.16, 48]} />
          <meshStandardMaterial color="#D4AF37" metalness={0.96} roughness={0.15} />
        </mesh>

        {/* 85mm f/1.2 Master Cinema Prime Barrel */}
        <mesh position={[0, -0.04, 0.78]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.78, 0.81, 1.18, 48]} />
          <meshStandardMaterial color="#0b0b0f" metalness={0.88} roughness={0.22} />
        </mesh>

        {/* Dual Gold Focus & Aperture Rings */}
        <mesh ref={focusRingRef} position={[0, -0.04, 0.62]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.8, 0.042, 16, 64]} />
          <meshStandardMaterial color="#D4AF37" metalness={0.96} roughness={0.14} />
        </mesh>
        <mesh ref={zoomRingRef} position={[0, -0.04, 0.96]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.79, 0.036, 16, 64]} />
          <meshStandardMaterial color="#F5E6B3" metalness={0.96} roughness={0.14} />
        </mesh>

        {/* Front Hood Bezel */}
        <mesh position={[0, -0.04, 1.36]}>
          <torusGeometry args={[0.77, 0.032, 16, 64]} />
          <meshStandardMaterial color="#D4AF37" metalness={0.98} roughness={0.12} />
        </mesh>

        {/* 9-Blade Cinema Iris Diaphragm */}
        <group ref={apertureRef} position={[0, -0.04, 1.22]}>
          {blades.map((angle, idx) => (
            <mesh
              key={idx}
              position={[Math.cos(angle) * 0.36, Math.sin(angle) * 0.36, 0]}
              rotation={[0, 0, angle + 0.58]}
            >
              <boxGeometry args={[0.45, 0.16, 0.02]} />
              <meshStandardMaterial color="#1a1a22" metalness={0.92} roughness={0.22} />
            </mesh>
          ))}
        </group>

        {/* Multi-Coated Sapphire Front Element */}
        <mesh position={[0, -0.04, 1.32]} rotation={[Math.PI / 2, 0, 0]}>
          <sphereGeometry args={[0.71, 36, 36, 0, Math.PI * 2, 0, 0.48]} />
          <meshPhysicalMaterial
            color="#16213e"
            emissive="#D4AF37"
            emissiveIntensity={0.12}
            metalness={0.15}
            roughness={0.04}
            transmission={0.82}
            ior={1.7}
            thickness={0.45}
          />
        </mesh>
      </group>
    </Float>
  );
}

function LiveGalleryFrames3D({
  photos,
  onSelectPhoto,
}: {
  photos: Photo[];
  onSelectPhoto: (photo: Photo) => void;
}) {
  const slots = [
    { pos: [-3.55, 1.05, -1.5] as [number, number, number], rot: [0.04, 0.46, -0.03] as [number, number, number], w: 1.45, h: 1.85 },
    { pos: [3.65, 0.95, -1.45] as [number, number, number], rot: [-0.04, -0.48, 0.04] as [number, number, number], w: 1.5, h: 1.85 },
    { pos: [-2.95, -1.1, -0.95] as [number, number, number], rot: [-0.06, 0.38, 0.02] as [number, number, number], w: 1.6, h: 1.1 },
    { pos: [3.05, -1.15, -1.0] as [number, number, number], rot: [0.05, -0.4, -0.03] as [number, number, number], w: 1.55, h: 1.1 },
  ];

  return (
    <>
      {slots.map((slot, idx) => {
        const photo = photos[idx];
        return (
          <Float key={idx} speed={1.15 + idx * 0.2} rotationIntensity={0.14} floatIntensity={0.35}>
            <group position={slot.pos} rotation={slot.rot}>
              {/* Outer Gold Gallery Frame */}
              <mesh>
                <boxGeometry args={[slot.w + 0.1, slot.h + 0.1, 0.05]} />
                <meshStandardMaterial color="#D4AF37" metalness={0.94} roughness={0.18} />
              </mesh>
              {/* Inner Velvet Backing */}
              <mesh position={[0, 0, 0.03]}>
                <planeGeometry args={[slot.w, slot.h]} />
                <meshStandardMaterial color="#0e0e14" metalness={0.3} roughness={0.6} />
              </mesh>

              {/* Live Uploaded Photo or Elegant Gold Frame Emblem */}
              <Html
                transform
                occlude
                position={[0, 0, 0.035]}
                scale={0.24}
                style={{ pointerEvents: 'auto' }}
              >
                {photo ? (
                  <div
                    onClick={() => onSelectPhoto(photo)}
                    className="w-[220px] h-[270px] overflow-hidden rounded-sm border border-[#D4AF37]/60 bg-black cursor-pointer group relative shadow-2xl"
                  >
                    <img
                      src={photo.image_url}
                      alt={photo.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-2.5">
                      <p className="text-[11px] font-semibold text-[#F5E6B3] truncate">
                        {photo.title}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="w-[220px] h-[270px] flex flex-col items-center justify-center border border-[#D4AF37]/25 bg-[#09090d]/95 text-center p-4 select-none">
                    <span className="text-[9px] uppercase tracking-[0.35em] text-[#D4AF37]">
                      DSP STUDIO
                    </span>
                    <span className="font-serif text-base text-[#F7F6F2]/80 mt-1">
                      Frame 0{idx + 1}
                    </span>
                    <span className="text-[9px] text-[#8E8E93] mt-1">
                      Awaiting Upload
                    </span>
                  </div>
                )}
              </Html>
            </group>
          </Float>
        );
      })}
    </>
  );
}

export const StudioScene3D: React.FC<StudioScene3DProps> = ({
  photos,
  onSelectPhoto,
  activePreset,
  shutterFlash,
}) => {
  const [webGLSupported, setWebGLSupported] = useState(true);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setWebGLSupported(false);
    } catch {
      setWebGLSupported(false);
    }
  }, []);

  if (!webGLSupported) {
    return (
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#1b170d_0%,#050507_72%)]" />
    );
  }

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-auto">
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0.25, 5.6], fov: 42 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={['#050507']} />
        <fog attach="fog" args={['#050507', 6.5, 17]} />

        {/* Luxury Rim & Key Studio Lights */}
        <ambientLight intensity={0.42} />
        <spotLight position={[4.5, 6.5, 5]} angle={0.45} penumbra={0.85} intensity={3.6} color="#F5E6B3" />
        <spotLight position={[-5.5, 3.5, 3]} angle={0.5} penumbra={0.9} intensity={2.4} color="#D4AF37" />
        <pointLight position={[0, -1.8, 3.5]} intensity={1.3} color="#ffffff" />

        <Suspense fallback={null}>
          <CinemaCameraRig activePreset={activePreset} shutterFlash={shutterFlash} />
          <LiveGalleryFrames3D photos={photos} onSelectPhoto={onSelectPhoto} />
          <Sparkles count={70} scale={10} size={2} speed={0.32} opacity={0.5} color="#D4AF37" />
          <Environment preset="studio" />

          {/* Obsidian Studio Floor Reflection */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.1, 0]}>
            <planeGeometry args={[30, 30]} />
            <MeshReflectorMaterial
              blur={[300, 100]}
              resolution={512}
              mixBlur={1}
              mixStrength={40}
              roughness={0.72}
              depthScale={1.1}
              minDepthThreshold={0.4}
              maxDepthThreshold={1.4}
              color="#07070a"
              metalness={0.65}
              mirror={0.38}
            />
          </mesh>
        </Suspense>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 2.4}
          maxPolarAngle={Math.PI / 1.85}
          minAzimuthAngle={-Math.PI / 4}
          maxAzimuthAngle={Math.PI / 4}
        />
      </Canvas>
    </div>
  );
};
