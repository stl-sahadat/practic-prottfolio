import React, { useRef, useState } from 'react';
import { useTexture, Text } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
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

// Ensure asset URLs are reliably prefixed with base URL on subpath deployments (e.g. GitHub Pages)
const resolveAsset = (path: string) => {
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  const clean = path.replace(/^\//, '');
  return `${import.meta.env.BASE_URL}${clean}`;
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
  const pivotGroupRef = useRef<THREE.Group>(null);
  const doorLeafRef = useRef<THREE.Group>(null);
  const handleRef = useRef<THREE.Group>(null);
  const currentAngleRef = useRef(0.02);

  const isLeft = side === 'left';

  const fontCabinBold = resolveAsset('fonts/CabinSketch-Bold.ttf');

  // Load door textures, signboard, back of door, sketch arrows, and wall alcove
  const [
    frameTex,
    handleSketchTex,
    handlePaintedTex,
    sketchDoorTex,
    paintedDoorTex,
    backTex,
    signTex,
    arrowTex,
    thresholdTex,
    wallTex,
  ] = useTexture([
    resolveAsset('textures/corridor/doors/ramkasingledoors.webp'),
    resolveAsset('textures/corridor/doors/klamkadodrzwi.webp'),
    resolveAsset('textures/corridor/doors/klamkadodrzwi_painted.webp'),
    resolveAsset(sketchUrl),
    resolveAsset(paintedUrl),
    resolveAsset('textures/corridor/doors/backsingledoors.webp'),
    resolveAsset('textures/corridor/pustatabliczka.webp'),
    resolveAsset('textures/corridor/strzalka.webp'),
    resolveAsset('textures/corridor/texturadoprogow.webp'),
    resolveAsset('textures/corridor/wall_texture.webp'),
  ]);

  [
    frameTex,
    handleSketchTex,
    handlePaintedTex,
    sketchDoorTex,
    paintedDoorTex,
    backTex,
    signTex,
    arrowTex,
    thresholdTex,
    wallTex,
  ].forEach((t) => {
    if (t) t.colorSpace = THREE.SRGBColorSpace;
  });

  const doorWidth = 1.35;
  const doorHeight = 2.55;
  const hingeX = isLeft ? -doorWidth * 0.48 : doorWidth * 0.48;
  const meshOffsetX = isLeft ? doorWidth * 0.48 : -doorWidth * 0.48;
  const handleOffsetX = isLeft ? doorWidth * 0.82 : -doorWidth * 0.82;

  // Authentic Dynamic Angled Presentation: Door tilts outward into corridor facing user on approach
  useFrame((_, delta) => {
    if (isOpeningRef.current || isTransitioningRef.current) return;

    const safeDelta = Math.min(delta, 0.05);
    const camZ = camera.position.z;
    const doorZ = position[2];
    const distZ = Math.abs(camZ - doorZ);

    // As user approaches from 16m away down to 3m:
    let targetAngle = 0.02;
    if (distZ < 16 && distZ > 3.0) {
      const t = (16 - distZ) / (16 - 3.0);
      const eased = t * (2 - t);
      targetAngle = 0.02 + 0.50 * eased; // ~30 degrees outward
    } else if (distZ <= 3.0) {
      targetAngle = 0.52; // Stands angled forward waiting for click!
    }

    currentAngleRef.current = THREE.MathUtils.damp(
      currentAngleRef.current,
      targetAngle,
      7.0,
      safeDelta
    );

    if (pivotGroupRef.current) {
      const baseRot = isLeft ? Math.PI / 2 : -Math.PI / 2;
      const rotDir = isLeft ? -1 : 1;
      pivotGroupRef.current.rotation.y = baseRot + currentAngleRef.current * rotDir;
    }
  });

  // Natural GSAP door opening and room entering animation
  const handleDoorClick = (e?: any) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (isTransitioningRef.current || isOpeningRef.current) return;

    const worldZ = position[2];
    const distZ = Math.abs(camera.position.z - worldZ);
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

    // 1. Handle turns down smoothly (0 to 0.18s)
    if (handleRef.current) {
      tl.to(
        handleRef.current.rotation,
        {
          z: isLeft ? -0.4 : 0.4,
          duration: 0.18,
          ease: 'power2.out',
        },
        0
      );
    }

    // 2. Door swings open fluidly INWARD into the room (0.1s to 0.95s)
    if (doorLeafRef.current) {
      tl.to(
        doorLeafRef.current.rotation,
        {
          y: isLeft ? Math.PI * 0.58 : -Math.PI * 0.58,
          duration: 0.85,
          ease: 'power2.inOut',
        },
        0.1
      );
    }

    // 3. Camera smoothly turns toward the doorway as the door opens (0.12s to 0.85s)
    const targetRotY = isLeft ? Math.PI * 0.45 : -Math.PI * 0.45;
    tl.to(
      camera.rotation,
      {
        y: targetRotY,
        x: 0,
        z: 0,
        duration: 0.75,
        ease: 'power2.inOut',
      },
      0.12
    );

    // 4. Camera smoothly glides forward into and through the open doorway (0.18s to 1.1s)
    tl.to(
      camera.position,
      {
        x: isLeft ? -4.6 : 4.6,
        z: worldZ,
        y: 1.6,
        duration: 0.95,
        ease: 'power2.inOut',
      },
      0.18
    );
  };

  const handlePointerEnter = (e: any) => {
    e.stopPropagation();
    if (isTransitioningRef.current || isOpeningRef.current) return;
    const distZ = Math.abs(camera.position.z - position[2]);
    if (distZ > 20) return;
    setIsHovered(true);
    document.body.style.cursor = 'pointer';
    soundManager.playDoorCreak();

    // Subtle crack open on hover matching reference
    if (doorLeafRef.current && !isOpeningRef.current) {
      gsap.to(doorLeafRef.current.rotation, {
        y: isLeft ? 0.14 : -0.14,
        duration: 0.3,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    }
    if (handleRef.current && !isOpeningRef.current) {
      gsap.to(handleRef.current.rotation, {
        z: isLeft ? -0.1 : 0.1,
        duration: 0.25,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    }
  };

  const handlePointerLeave = (e: any) => {
    e.stopPropagation();
    setIsHovered(false);
    document.body.style.cursor = 'auto';

    if (doorLeafRef.current && !isOpeningRef.current) {
      gsap.to(doorLeafRef.current.rotation, {
        y: 0,
        duration: 0.35,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    }
    if (handleRef.current && !isOpeningRef.current) {
      gsap.to(handleRef.current.rotation, {
        z: 0,
        duration: 0.25,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    }
  };

  return (
    <group position={position}>
      {/* Dynamic Pivoting Doorway Alcove Group */}
      <group ref={pivotGroupRef} rotation={[0, isLeft ? Math.PI / 2 : -Math.PI / 2, 0]}>
        
        {/* Authentic Sketch Wall Panel behind Door, Signboard & Arrows (Matching Image 2) */}
        <mesh position={[0, 0.15, -0.015]}>
          <planeGeometry args={[3.2, 3.8]} />
          <meshBasicMaterial map={wallTex} color="#f7f5f0" side={THREE.DoubleSide} />
        </mesh>

        {/* Left Skirting Baseboard along Wall */}
        <mesh position={[-1.15, -doorHeight * 0.5 - 0.05, 0.02]}>
          <planeGeometry args={[0.85, 0.16]} />
          <meshBasicMaterial map={thresholdTex} color="#ede8df" side={THREE.DoubleSide} />
        </mesh>

        {/* Right Skirting Baseboard along Wall */}
        <mesh position={[1.15, -doorHeight * 0.5 - 0.05, 0.02]}>
          <planeGeometry args={[0.85, 0.16]} />
          <meshBasicMaterial map={thresholdTex} color="#ede8df" side={THREE.DoubleSide} />
        </mesh>

        {/* Hand-Drawn Wooden Signboard above Door */}
        <group position={[0, doorHeight * 0.5 + 0.46, 0.06]}>
          {/* Wooden Board texture */}
          <mesh>
            <planeGeometry args={[1.35, 0.68]} />
            <meshBasicMaterial map={signTex} transparent alphaTest={0.05} side={THREE.DoubleSide} />
          </mesh>

          {/* Authentic Cabin Sketch Hand-Drawn Font Typography on Sign */}
          {roomId === 'gallery' && (
            <group position={[0, 0, 0.02]}>
              <Text
                font={fontCabinBold}
                fontSize={0.21}
                color="#111111"
                anchorX="center"
                anchorY="bottom"
                position={[0, 0.05, 0]}
                letterSpacing={0.02}
              >
                THE
              </Text>
              <Text
                font={fontCabinBold}
                fontSize={0.21}
                color="#111111"
                anchorX="center"
                anchorY="top"
                position={[0, 0.04, 0]}
                letterSpacing={0.04}
              >
                GALLERY
              </Text>
              <Text
                font={fontCabinBold}
                fontSize={0.095}
                color="#333333"
                anchorX="center"
                anchorY="top"
                position={[0, -0.19, 0]}
                letterSpacing={0.08}
              >
                • PROJECTS •
              </Text>
            </group>
          )}

          {roomId === 'studio' && (
            <group position={[0, 0, 0.02]}>
              <Text
                font={fontCabinBold}
                fontSize={0.21}
                color="#111111"
                anchorX="center"
                anchorY="bottom"
                position={[0, 0.05, 0]}
                letterSpacing={0.02}
              >
                THE
              </Text>
              <Text
                font={fontCabinBold}
                fontSize={0.21}
                color="#111111"
                anchorX="center"
                anchorY="top"
                position={[0, 0.04, 0]}
                letterSpacing={0.04}
              >
                STUDIO
              </Text>
              <Text
                font={fontCabinBold}
                fontSize={0.09}
                color="#333333"
                anchorX="center"
                anchorY="top"
                position={[0, -0.19, 0]}
                letterSpacing={0.08}
              >
                • MEDIA & LABS •
              </Text>
            </group>
          )}

          {roomId === 'about' && (
            <group position={[0, 0, 0.02]}>
              <Text
                font={fontCabinBold}
                fontSize={0.24}
                color="#111111"
                anchorX="center"
                anchorY="middle"
                position={[0, 0.04, 0]}
                letterSpacing={0.04}
              >
                ABOUT ME
              </Text>
              <Text
                font={fontCabinBold}
                fontSize={0.09}
                color="#333333"
                anchorX="center"
                anchorY="top"
                position={[0, -0.15, 0]}
                letterSpacing={0.08}
              >
                • MISSION & SKILLS •
              </Text>
            </group>
          )}

          {roomId === 'contact' && (
            <group position={[0, 0, 0.02]}>
              <Text
                font={fontCabinBold}
                fontSize={0.24}
                color="#111111"
                anchorX="center"
                anchorY="middle"
                position={[0, 0.04, 0]}
                letterSpacing={0.04}
              >
                CONTACT
              </Text>
              <Text
                font={fontCabinBold}
                fontSize={0.09}
                color="#333333"
                anchorX="center"
                anchorY="top"
                position={[0, -0.15, 0]}
                letterSpacing={0.08}
              >
                • GET IN TOUCH •
              </Text>
            </group>
          )}
        </group>

        {/* Hand-Drawn Sketch Arrows Pointing directly to Door (Image 2 match) */}
        {/* Left Arrow */}
        <mesh position={[-1.05, 0.15, 0.02]} scale={[0.55, 0.55, 1]}>
          <planeGeometry args={[1, 0.5]} />
          <meshBasicMaterial map={arrowTex} transparent alphaTest={0.05} side={THREE.DoubleSide} />
        </mesh>

        {/* Right Arrow */}
        <mesh position={[1.05, -0.25, 0.02]} scale={[-0.55, 0.55, 1]}>
          <planeGeometry args={[1, 0.5]} />
          <meshBasicMaterial map={arrowTex} transparent alphaTest={0.05} side={THREE.DoubleSide} />
        </mesh>

        {/* Outer Door Frame */}
        <mesh
          position={[0, 0, 0.03]}
          scale={[isLeft ? 1 : -1, 1, 1]}
          onClick={handleDoorClick}
          onPointerEnter={handlePointerEnter}
          onPointerLeave={handlePointerLeave}
        >
          <planeGeometry args={[doorWidth * 1.15, doorHeight * 1.08]} />
          <meshBasicMaterial map={frameTex} transparent alphaTest={0.05} side={THREE.DoubleSide} />
        </mesh>

        {/* Room Cutout Interior Depth behind Door */}
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[doorWidth * 0.98, doorHeight * 0.98]} />
          <meshBasicMaterial color="#1a1918" side={THREE.DoubleSide} />
        </mesh>

        {/* Wooden Threshold on Floor */}
        <mesh position={[0, -doorHeight * 0.5 - 0.05, 0.04]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[doorWidth * 1.15, 0.22]} />
          <meshBasicMaterial map={thresholdTex} transparent alphaTest={0.05} side={THREE.DoubleSide} />
        </mesh>

        {/* Door Leaf (Pivoting at hinge) */}
        <group ref={doorLeafRef} position={[hingeX, 0, 0.04]}>
          {/* Front Door Face */}
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

          {/* Back Door Face (seen when door swings open) */}
          <mesh
            position={[meshOffsetX, 0, -0.01]}
            rotation={[0, Math.PI, 0]}
            scale={[isLeft ? 1 : -1, 1, 1]}
          >
            <planeGeometry args={[doorWidth, doorHeight]} />
            <meshBasicMaterial
              map={backTex}
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
    </group>
  );
};
