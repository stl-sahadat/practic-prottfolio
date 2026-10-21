import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { soundManager } from '../../utils/sound';

interface CorridorPortalDoorProps {
  position: [number, number, number];
  corridorHeight?: number;
  corridorWidth?: number;
}

export const CorridorPortalDoor: React.FC<CorridorPortalDoorProps> = ({
  position,
  corridorHeight = 4.5,
  corridorWidth = 7.6,
}) => {
  const { camera } = useThree();
  const leftDoorRef = useRef<THREE.Group>(null);
  const rightDoorRef = useRef<THREE.Group>(null);
  const leftHandleRef = useRef<THREE.Group>(null);
  const rightHandleRef = useRef<THREE.Group>(null);
  const isOpenRef = useRef(false);

  // Door dimensions from itomdev.com reference
  const doorHeight = 2.7;
  const leafWidth = doorHeight * 0.391; // ~1.05m per leaf
  const totalDoorWidth = leafWidth * 2; // ~2.1m total doorway
  const wallThickness = 0.14;
  const frameWidth = totalDoorWidth + 0.22;
  const frameHeight = frameWidth * (1 / 0.818);
  const sideWallWidth = (corridorWidth - totalDoorWidth) / 2;
  const yOffset = -0.15; // Vertical alignment relative to floor

  // Load authentic hand-drawn portal textures
  const [
    wallTex,
    frameTex,
    doorLeftTex,
    doorRightTex,
    doorBackTex,
    handleLeftTex,
    handleRightTex,
    pienTex,
    loopTex,
    coffeeTex,
    ideaTex,
  ] = useTexture([
    '/textures/corridor/wall_texture.webp',
    '/textures/corridor/doors/frame_sketch.webp',
    '/textures/corridor/doors/doorrleft.webp',
    '/textures/corridor/doors/dorright.webp',
    '/textures/corridor/doors/door_back.webp',
    '/textures/corridor/doors/handle_left_sketch.webp',
    '/textures/corridor/doors/handle_right_sketch.webp',
    '/textures/corridor/doors/pien.webp',
    '/textures/corridor/decorations/while_true_loop.webp',
    '/textures/corridor/decorations/coffee_debug.webp',
    '/textures/corridor/decorations/idea_process.webp',
  ]);

  // Configure textures
  [
    wallTex,
    frameTex,
    doorLeftTex,
    doorRightTex,
    doorBackTex,
    handleLeftTex,
    handleRightTex,
    pienTex,
    loopTex,
    coffeeTex,
    ideaTex,
  ].forEach((t) => {
    if (t) {
      t.colorSpace = THREE.SRGBColorSpace;
    }
  });

  useFrame(() => {
    if (!leftDoorRef.current || !rightDoorRef.current) return;

    // Check distance between camera and portal door
    const distZ = camera.position.z - position[2];
    const distX = Math.abs(camera.position.x - position[0]);

    // Open when camera is approaching within 15 units or passing through (-8 to +15)
    const shouldBeOpen = distZ < 15 && distZ > -10 && distX < 2.8;

    if (shouldBeOpen && !isOpenRef.current) {
      isOpenRef.current = true;
      soundManager.playDoorOpen();

      // Handles turn
      if (leftHandleRef.current) {
        gsap.to(leftHandleRef.current.rotation, { z: 0.4, duration: 0.15, ease: 'power2.out', overwrite: true });
      }
      if (rightHandleRef.current) {
        gsap.to(rightHandleRef.current.rotation, { z: -0.4, duration: 0.15, ease: 'power2.out', overwrite: true });
      }

      // Doors swing open wide
      gsap.to(leftDoorRef.current.rotation, {
        y: -Math.PI * 0.55,
        duration: 0.9,
        ease: 'power2.out',
        overwrite: true,
      });
      gsap.to(rightDoorRef.current.rotation, {
        y: Math.PI * 0.55,
        duration: 0.9,
        ease: 'power2.out',
        overwrite: true,
      });
    } else if (!shouldBeOpen && isOpenRef.current) {
      isOpenRef.current = false;
      soundManager.playDoorClose();

      // Doors close smoothly
      gsap.to(leftDoorRef.current.rotation, {
        y: 0,
        duration: 0.75,
        ease: 'power2.inOut',
        overwrite: true,
      });
      gsap.to(rightDoorRef.current.rotation, {
        y: 0,
        duration: 0.75,
        ease: 'power2.inOut',
        overwrite: true,
      });

      if (leftHandleRef.current) {
        gsap.to(leftHandleRef.current.rotation, { z: 0, duration: 0.2, ease: 'power2.out', delay: 0.5, overwrite: true });
      }
      if (rightHandleRef.current) {
        gsap.to(rightHandleRef.current.rotation, { z: 0, duration: 0.2, ease: 'power2.out', delay: 0.5, overwrite: true });
      }
    }
  });

  return (
    <group position={position}>
      {/* Left Wall Partition beside Door */}
      <mesh position={[-(totalDoorWidth / 2 + sideWallWidth / 2), 1.6 + yOffset, 0]}>
        <planeGeometry args={[sideWallWidth, corridorHeight]} />
        <meshBasicMaterial map={wallTex} transparent alphaTest={0.01} side={THREE.DoubleSide} color="#f7f5f0" />
      </mesh>
      {/* Poster on Left Partition: Idea Process */}
      <mesh
        position={[-(totalDoorWidth / 2 + sideWallWidth / 2), 1.6 + yOffset, 0.08]}
        rotation={[0, 0, 0.04]}
      >
        <planeGeometry args={[1.3, 1.3 / 0.402]} />
        <meshBasicMaterial map={ideaTex} transparent alphaTest={0.08} side={THREE.DoubleSide} />
      </mesh>

      {/* Right Wall Partition beside Door */}
      <mesh position={[totalDoorWidth / 2 + sideWallWidth / 2, 1.6 + yOffset, 0]}>
        <planeGeometry args={[sideWallWidth, corridorHeight]} />
        <meshBasicMaterial map={wallTex} transparent alphaTest={0.01} side={THREE.DoubleSide} color="#f7f5f0" />
      </mesh>
      {/* Poster on Right Partition: Coffee Debug */}
      <mesh
        position={[totalDoorWidth / 2 + sideWallWidth / 2, 1.6 + yOffset, 0.08]}
        rotation={[0, 0, -0.04]}
      >
        <planeGeometry args={[1.8, 1.8 / 1.833]} />
        <meshBasicMaterial map={coffeeTex} transparent alphaTest={0.08} side={THREE.DoubleSide} />
      </mesh>

      {/* Top Lintel Wall Partition above Door */}
      <mesh position={[0, doorHeight + (corridorHeight - doorHeight) / 2 + yOffset - 0.3, 0]}>
        <planeGeometry args={[totalDoorWidth, corridorHeight - doorHeight + 0.6]} />
        <meshBasicMaterial map={wallTex} transparent alphaTest={0.01} side={THREE.DoubleSide} color="#f7f5f0" />
      </mesh>
      {/* Banner above Door: While True Loop */}
      <mesh position={[0, doorHeight + 0.45 + yOffset, 0.08]}>
        <planeGeometry args={[2.2, 0.65]} />
        <meshBasicMaterial map={loopTex} transparent alphaTest={0.08} side={THREE.DoubleSide} />
      </mesh>

      {/* Door Outer Frame */}
      <mesh position={[0, frameHeight / 2 + yOffset - 0.2, 0.03]}>
        <planeGeometry args={[frameWidth, frameHeight]} />
        <meshBasicMaterial map={frameTex} transparent alphaTest={0.05} side={THREE.DoubleSide} />
      </mesh>

      {/* Base Trunk Threshold */}
      <mesh position={[0, yOffset - 0.05, 0.04]}>
        <planeGeometry args={[totalDoorWidth * 1.15, 0.35]} />
        <meshBasicMaterial map={pienTex} transparent alphaTest={0.05} side={THREE.DoubleSide} />
      </mesh>

      {/* Left Door Leaf (Hinged at left edge: -totalDoorWidth / 2) */}
      <group ref={leftDoorRef} position={[-totalDoorWidth / 2, 0, 0.04]}>
        {/* Door mesh positioned so hinge is at x=0 */}
        <mesh position={[leafWidth / 2, doorHeight / 2 + yOffset, 0]}>
          <planeGeometry args={[leafWidth, doorHeight]} />
          <meshBasicMaterial map={doorLeftTex} transparent alphaTest={0.05} side={THREE.DoubleSide} />
        </mesh>
        {/* Back face of left door */}
        <mesh position={[leafWidth / 2, doorHeight / 2 + yOffset, -0.01]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[leafWidth, doorHeight]} />
          <meshBasicMaterial map={doorBackTex} transparent alphaTest={0.05} side={THREE.DoubleSide} />
        </mesh>

        {/* Left Handle */}
        <group ref={leftHandleRef} position={[leafWidth - 0.15, doorHeight / 2 + yOffset - 0.15, 0.03]}>
          <mesh>
            <planeGeometry args={[0.22, 0.4]} />
            <meshBasicMaterial map={handleLeftTex} transparent alphaTest={0.05} side={THREE.DoubleSide} />
          </mesh>
        </group>
      </group>

      {/* Right Door Leaf (Hinged at right edge: +totalDoorWidth / 2) */}
      <group ref={rightDoorRef} position={[totalDoorWidth / 2, 0, 0.04]}>
        {/* Door mesh positioned so hinge is at x=0 */}
        <mesh position={[-leafWidth / 2, doorHeight / 2 + yOffset, 0]}>
          <planeGeometry args={[leafWidth, doorHeight]} />
          <meshBasicMaterial map={doorRightTex} transparent alphaTest={0.05} side={THREE.DoubleSide} />
        </mesh>
        {/* Back face of right door */}
        <mesh position={[-leafWidth / 2, doorHeight / 2 + yOffset, -0.01]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[leafWidth, doorHeight]} />
          <meshBasicMaterial map={doorBackTex} transparent alphaTest={0.05} side={THREE.DoubleSide} />
        </mesh>

        {/* Right Handle */}
        <group ref={rightHandleRef} position={[-leafWidth + 0.15, doorHeight / 2 + yOffset - 0.15, 0.03]}>
          <mesh>
            <planeGeometry args={[0.22, 0.4]} />
            <meshBasicMaterial map={handleRightTex} transparent alphaTest={0.05} side={THREE.DoubleSide} />
          </mesh>
        </group>
      </group>
    </group>
  );
};
