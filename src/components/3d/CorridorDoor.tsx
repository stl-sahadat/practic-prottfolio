import React, { useRef, useState } from 'react';
import { useTexture, Html } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { soundManager } from '../../utils/sound';

interface CorridorDoorProps {
  roomId: 'gallery' | 'studio' | 'about' | 'contact';
  position: [number, number, number];
  side: 'left' | 'right';
  sketchUrl: string;
  paintedUrl: string;
  onEnter: (roomId: 'gallery' | 'studio' | 'about' | 'contact', worldZ: number) => void;
  isTransitioningRef: React.MutableRefObject<boolean>;
}

const ROOM_TITLES: Record<string, string> = {
  gallery: 'GALLERY',
  studio: 'STUDIO',
  about: 'ABOUT',
  contact: 'CONTACT',
};

export const CorridorDoor: React.FC<CorridorDoorProps> = ({
  roomId,
  position,
  side,
  sketchUrl,
  paintedUrl,
  onEnter,
  isTransitioningRef,
}) => {
  const { camera } = useThree();
  const [isHovered, setIsHovered] = useState(false);
  const isOpeningRef = useRef(false);
  const doorLeafRef = useRef<THREE.Group>(null);
  const handleRef = useRef<THREE.Group>(null);

  const isLeft = side === 'left';

  // Load single door frame & handle textures
  const [frameTex, handleSketchTex, handlePaintedTex, sketchDoorTex, paintedDoorTex] = useTexture([
    '/textures/corridor/doors/ramkasingledoors.webp',
    '/textures/corridor/doors/klamkadodrzwi.webp',
    '/textures/corridor/doors/klamkadodrzwi_painted.webp',
    sketchUrl,
    paintedUrl,
  ]);

  [frameTex, handleSketchTex, handlePaintedTex, sketchDoorTex, paintedDoorTex].forEach((t) => {
    if (t) t.colorSpace = THREE.SRGBColorSpace;
  });

  const doorWidth = 1.6;
  const doorHeight = 2.6;
  const hingeX = isLeft ? -doorWidth * 0.48 : doorWidth * 0.48;
  const meshOffsetX = isLeft ? doorWidth * 0.48 : -doorWidth * 0.48;
  const handleOffsetX = isLeft ? doorWidth * 0.8 : -doorWidth * 0.8;

  // Fluid, natural GSAP door opening and room entering animation
  const handleDoorClick = (e?: any) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (isTransitioningRef.current || isOpeningRef.current) return;

    const worldZ = position[2];
    const distZ = Math.abs(camera.position.z - worldZ);
    // Ignore clicks if user is too far down the corridor (> 22 units)
    if (distZ > 22) return;

    isOpeningRef.current = true;
    isTransitioningRef.current = true;
    setIsHovered(false);
    document.body.style.cursor = 'auto';

    soundManager.playDoorOpen();

    // Kill any conflicting tweens
    gsap.killTweensOf(camera.position);
    gsap.killTweensOf(camera.rotation);

    const tl = gsap.timeline({
      onComplete: () => {
        isOpeningRef.current = false;
        isTransitioningRef.current = false;
        // Reset door leaf and handle for when user returns to corridor
        if (doorLeafRef.current) doorLeafRef.current.rotation.y = 0;
        if (handleRef.current) handleRef.current.rotation.z = 0;
        // Position camera cleanly in the center of corridor at this door's Z
        camera.position.set(0, 1.6, worldZ);
        camera.rotation.set(0, 0, 0);
        onEnter(roomId, worldZ);
      },
    });

    // 1. Handle turns down smoothly (0 to 0.22s)
    if (handleRef.current) {
      tl.to(handleRef.current.rotation, {
        z: isLeft ? -0.38 : 0.38,
        duration: 0.22,
        ease: 'power2.out',
      }, 0);
    }

    // 2. Door swings open fluidly INWARD into the room (0.1s to 0.95s)
    if (doorLeafRef.current) {
      tl.to(doorLeafRef.current.rotation, {
        y: isLeft ? Math.PI * 0.55 : -Math.PI * 0.55,
        duration: 0.85,
        ease: 'power2.inOut',
      }, 0.1);
    }

    // 3. Camera smoothly turns toward the doorway as the door opens (0.15s to 0.85s)
    const targetRotY = isLeft ? Math.PI * 0.48 : -Math.PI * 0.48;
    tl.to(camera.rotation, {
      y: targetRotY,
      x: 0,
      z: 0,
      duration: 0.7,
      ease: 'power2.inOut',
    }, 0.15);

    // 4. Camera smoothly glides forward into and through the open doorway (0.2s to 1.1s)
    // No pulling back or jerking! Glides directly through the door frame into the room.
    tl.to(camera.position, {
      x: isLeft ? -4.5 : 4.5,
      z: worldZ,
      y: 1.6,
      duration: 0.9,
      ease: 'power2.inOut',
    }, 0.2);
  };

  const handlePointerEnter = (e: any) => {
    e.stopPropagation();
    if (isTransitioningRef.current || isOpeningRef.current) return;
    const distZ = Math.abs(camera.position.z - position[2]);
    if (distZ > 20) return;
    setIsHovered(true);
    document.body.style.cursor = 'pointer';
    soundManager.playHoverChime();
  };

  const handlePointerLeave = (e: any) => {
    e.stopPropagation();
    setIsHovered(false);
    document.body.style.cursor = 'auto';
  };

  return (
    <group
      position={position}
      rotation={[0, isLeft ? Math.PI / 2 : -Math.PI / 2, 0]}
    >
      {/* Outer Door Frame */}
      <mesh
        position={[0, 0, 0.02]}
        scale={[isLeft ? 1 : -1, 1, 1]}
        onClick={handleDoorClick}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
      >
        <planeGeometry args={[doorWidth * 1.15, doorHeight * 1.08]} />
        <meshBasicMaterial map={frameTex} transparent alphaTest={0.05} side={THREE.DoubleSide} />
      </mesh>

      {/* Floating Hand-Drawn Room Title Badge on Hover */}
      {isHovered && !isOpeningRef.current && (
        <Html
          center
          position={[meshOffsetX, 1.45, 0.1]}
          className="pointer-events-none select-none"
        >
          <div className="font-sketch text-xs sm:text-sm font-bold bg-white text-black border-2 border-black px-2.5 py-1 rounded shadow-[2px_2px_0px_#000] whitespace-nowrap uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
            <span>{ROOM_TITLES[roomId]}</span>
            <span>→</span>
          </div>
        </Html>
      )}

      {/* Door Leaf (Pivoting at hinge) */}
      <group ref={doorLeafRef} position={[hingeX, 0, 0.04]}>
        <mesh
          position={[meshOffsetX, 0, 0]}
          onClick={handleDoorClick}
          onPointerEnter={handlePointerEnter}
          onPointerLeave={handlePointerLeave}
        >
          <planeGeometry args={[doorWidth, doorHeight]} />
          <meshBasicMaterial
            map={isHovered ? paintedDoorTex : sketchDoorTex}
            transparent
            alphaTest={0.05}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Handle */}
        <group
          ref={handleRef}
          position={[handleOffsetX, -0.15, 0.03]}
          onClick={handleDoorClick}
          onPointerEnter={handlePointerEnter}
          onPointerLeave={handlePointerLeave}
        >
          <mesh>
            <planeGeometry args={[0.26, 0.45]} />
            <meshBasicMaterial
              map={isHovered ? handlePaintedTex : handleSketchTex}
              transparent
              alphaTest={0.05}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      </group>
    </group>
  );
};
