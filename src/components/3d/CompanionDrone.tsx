import React, { useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { soundManager } from '../../utils/sound';

interface CompanionDroneProps {
  onDiscover?: () => void;
  theme?: 'classic' | 'blueprint';
}

export const CompanionDrone: React.FC<CompanionDroneProps> = ({ onDiscover, theme = 'classic' }) => {
  const { camera } = useThree();
  const droneGroupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Mesh>(null);
  const rotorLeftRef = useRef<THREE.Mesh>(null);
  const rotorRightRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [speech, setSpeech] = useState<string | null>(null);

  const isBlueprint = theme === 'blueprint';

  // Float smoothly near top-right of camera viewport
  useFrame((state) => {
    if (!droneGroupRef.current) return;
    const t = state.clock.elapsedTime;

    // Follow camera with slight elastic damping
    const targetZ = camera.position.z - 3.8;
    const targetX = camera.position.x + 1.6 + Math.sin(t * 1.5) * 0.15;
    const targetY = camera.position.y + 0.8 + Math.cos(t * 2) * 0.12;

    droneGroupRef.current.position.x = THREE.MathUtils.lerp(
      droneGroupRef.current.position.x,
      targetX,
      0.08
    );
    droneGroupRef.current.position.y = THREE.MathUtils.lerp(
      droneGroupRef.current.position.y,
      targetY,
      0.08
    );
    droneGroupRef.current.position.z = THREE.MathUtils.lerp(
      droneGroupRef.current.position.z,
      targetZ,
      0.1
    );

    // Natural banking/tilting
    droneGroupRef.current.rotation.z = Math.sin(t * 1.5) * 0.08;
    droneGroupRef.current.rotation.x = Math.cos(t * 1.2) * 0.05;

    // Spin propellers
    if (rotorLeftRef.current) rotorLeftRef.current.rotation.y += 0.4;
    if (rotorRightRef.current) rotorRightRef.current.rotation.y -= 0.4;
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    soundManager.playAchievement();
    onDiscover?.();

    if (droneGroupRef.current) {
      // 360 spin somersault
      gsap.to(droneGroupRef.current.rotation, {
        y: droneGroupRef.current.rotation.y + Math.PI * 2,
        duration: 0.6,
        ease: 'power2.out',
      });
    }

    setSpeech('⚡ Autonomous AI Agent at your service, Sahadat vai!');
    setTimeout(() => setSpeech(null), 3500);
  };

  return (
    <group
      ref={droneGroupRef}
      position={[1.6, 2.2, 0]}
      onClick={handleClick}
      onPointerEnter={() => {
        setHovered(true);
        document.body.style.cursor = 'pointer';
        soundManager.playHoverChime();
      }}
      onPointerLeave={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
    >
      {/* Mini Drone Spherical/Origami Body */}
      <mesh ref={bodyRef}>
        <dodecahedronGeometry args={[0.22, 0]} />
        <meshBasicMaterial
          color={isBlueprint ? '#8bc5ff' : '#222222'}
          wireframe
        />
      </mesh>

      {/* Inner glowing eye / AI sensor */}
      <mesh position={[0, 0, 0.12]}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshBasicMaterial color={isBlueprint ? '#00e5ff' : '#e65100'} />
      </mesh>

      {/* Left Rotor Arm & Blade */}
      <group position={[-0.26, 0.12, 0]}>
        <mesh ref={rotorLeftRef}>
          <boxGeometry args={[0.28, 0.02, 0.04]} />
          <meshBasicMaterial color={isBlueprint ? '#cce8ff' : '#444444'} />
        </mesh>
      </group>

      {/* Right Rotor Arm & Blade */}
      <group position={[0.26, 0.12, 0]}>
        <mesh ref={rotorRightRef}>
          <boxGeometry args={[0.28, 0.02, 0.04]} />
          <meshBasicMaterial color={isBlueprint ? '#cce8ff' : '#444444'} />
        </mesh>
      </group>

      {/* Speech Pill when clicked or hovered */}
      {(speech || hovered) && (
        <group position={[0, 0.45, 0]}>
          <mesh>
            <planeGeometry args={[2.2, 0.38]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.92} />
          </mesh>
        </group>
      )}
    </group>
  );
};
