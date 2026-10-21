import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { SketchRevealMesh } from './SketchRevealMesh';
import { CompanionDrone } from './CompanionDrone';
import { CorridorDoor } from './CorridorDoor';
import { CorridorPortalDoor } from './CorridorPortalDoor';
import { soundManager } from '../../utils/sound';

interface CorridorSceneProps {
  onOpenRoom: (roomKey: 'gallery' | 'studio' | 'about' | 'contact', doorZ?: number) => void;
  initialZ?: number;
  onZChange?: (z: number) => void;
  targetZ?: number;
  theme?: 'classic' | 'blueprint';
  onDiscoverCompanion?: () => void;
  enabled?: boolean;
}

const SEGMENT_LENGTH = 80;

interface DoorConfig {
  roomId: 'gallery' | 'studio' | 'about' | 'contact';
  relativeZ: number;
  side: 'left' | 'right';
  sketchUrl: string;
  paintedUrl: string;
}

const DOORS_IN_SEGMENT: DoorConfig[] = [
  {
    roomId: 'gallery',
    relativeZ: -18,
    side: 'left',
    sketchUrl: '/textures/corridor/doors/drzwiprojekty.webp',
    paintedUrl: '/textures/corridor/doors/drzwiprojekty_painted.webp',
  },
  {
    roomId: 'studio',
    relativeZ: -32,
    side: 'right',
    sketchUrl: '/textures/corridor/doors/drzwisocial.webp',
    paintedUrl: '/textures/corridor/doors/drzwisocial_painted.webp',
  },
  {
    roomId: 'about',
    relativeZ: -48,
    side: 'left',
    sketchUrl: '/textures/corridor/doors/drzwiabout.webp',
    paintedUrl: '/textures/corridor/doors/drzwiabout_painted.webp',
  },
  {
    roomId: 'contact',
    relativeZ: -62,
    side: 'right',
    sketchUrl: '/textures/corridor/doors/drzwikontakt.webp',
    paintedUrl: '/textures/corridor/doors/drzwikontakt_painted.webp',
  },
];

export const CorridorScene: React.FC<CorridorSceneProps> = ({
  onOpenRoom,
  initialZ = 4,
  onZChange,
  targetZ,
  theme = 'classic',
  onDiscoverCompanion,
  enabled = true,
}) => {
  const { camera } = useThree();
  const currentTargetZ = useRef(targetZ ?? initialZ);
  const mouseParallax = useRef({ x: 0, y: 0 });
  const isTransitioningRef = useRef(false);
  const isDraggingRef = useRef(false);
  const lastPointerYRef = useRef(0);
  const [activeSegments, setActiveSegments] = useState<number[]>([0, 1]);
  const activeSegmentsRef = useRef<number[]>([0, 1]);
  const hasInitializedRef = useRef(false);

  // Keep target in sync if passed from outside
  useEffect(() => {
    if (typeof targetZ === 'number') {
      currentTargetZ.current = targetZ;
    }
  }, [targetZ]);

  // Initialize camera position cleanly on entry without resetting during continuous scroll
  useEffect(() => {
    if (enabled) {
      isTransitioningRef.current = false;
      if (!hasInitializedRef.current) {
        if (camera.position.z > 9.5) {
          camera.position.set(0, 1.6, initialZ);
        }
        currentTargetZ.current = camera.position.z;
        hasInitializedRef.current = true;
      }
    } else {
      hasInitializedRef.current = false;
    }
  }, [enabled, camera, initialZ]);

  // Load corridor architectural textures
  const [wallTex, floorTex, ceilingTex, baseboardTex] = useTexture([
    '/textures/corridor/wall_texture.webp',
    '/textures/corridor/kawalekpodlogi.webp',
    '/textures/corridor/ceiling_texture.webp',
    '/textures/corridor/texturadoprogow.webp',
  ]);

  // Load decorative item textures
  const [plantTex, deskTex, airplaneTex, treeTex] = useTexture([
    '/textures/corridor/kwiatekwdoniczce.webp',
    '/textures/corridor/szafkaprzod.webp',
    '/textures/corridor/decorations/paper_airplane.webp',
    '/textures/corridor/drzewkowdoniczce.webp',
  ]);

  // Configure textures for authentic wooden planks & seamless repeating
  useEffect(() => {
    [wallTex, floorTex, ceilingTex, baseboardTex, plantTex, deskTex, airplaneTex, treeTex].forEach((t) => {
      if (t) {
        t.colorSpace = THREE.SRGBColorSpace;
      }
    });

    if (wallTex) {
      wallTex.wrapS = THREE.RepeatWrapping;
      wallTex.wrapT = THREE.RepeatWrapping;
      wallTex.repeat.set(8, 1);
    }
    if (floorTex) {
      floorTex.wrapS = THREE.RepeatWrapping;
      floorTex.wrapT = THREE.RepeatWrapping;
      // Real-world wooden plank proportions: planks run down the hallway with 2.5m tile scale
      floorTex.repeat.set(SEGMENT_LENGTH / 2.5, 7.6 / 2.5);
    }
    if (baseboardTex) {
      baseboardTex.wrapS = THREE.RepeatWrapping;
      baseboardTex.wrapT = THREE.RepeatWrapping;
      baseboardTex.repeat.set(SEGMENT_LENGTH / 2.5, 1);
    }
    if (ceilingTex) {
      ceilingTex.wrapS = THREE.RepeatWrapping;
      ceilingTex.wrapT = THREE.RepeatWrapping;
      ceilingTex.repeat.set(1, 16);
    }
  }, [wallTex, floorTex, ceilingTex, baseboardTex, plantTex, deskTex, airplaneTex, treeTex]);

  // Floor textures: center full planks and edge strips with anisotropy matching reference
  const { floorCenterTex, floorLeftTex, floorRightTex } = useMemo(() => {
    if (!floorTex) return { floorCenterTex: floorTex, floorLeftTex: floorTex, floorRightTex: floorTex };

    const center = floorTex.clone();
    center.needsUpdate = true;
    center.wrapS = THREE.RepeatWrapping;
    center.wrapT = THREE.RepeatWrapping;
    center.repeat.set(1, 1);
    center.anisotropy = 16;

    const left = floorTex.clone();
    left.needsUpdate = true;
    left.wrapS = THREE.RepeatWrapping;
    left.wrapT = THREE.RepeatWrapping;
    left.repeat.set(1, 0.2);
    left.offset.set(0, 0);
    left.anisotropy = 16;

    const right = floorTex.clone();
    right.needsUpdate = true;
    right.wrapS = THREE.RepeatWrapping;
    right.wrapT = THREE.RepeatWrapping;
    right.repeat.set(1, 0.2);
    right.offset.set(0, 0.8);
    right.anisotropy = 16;

    return { floorCenterTex: center, floorLeftTex: left, floorRightTex: right };
  }, [floorTex]);

  // Continuous Mouse, Wheel, Touch, and Keyboard listeners for Unbounded Infinite Corridor
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!enabled || isTransitioningRef.current) return;
      mouseParallax.current.x = (e.clientX / window.innerWidth - 0.5) * 0.35;
      mouseParallax.current.y = -(e.clientY / window.innerHeight - 0.5) * 0.25;
    };

    const handleWheel = (e: WheelEvent) => {
      if (!enabled || isTransitioningRef.current) return;
      e.preventDefault();
      const rawDelta = e.deltaMode === 1 ? e.deltaY * 30 : e.deltaMode === 2 ? e.deltaY * 300 : e.deltaY;
      const normalizedDelta = Math.sign(rawDelta) * Math.min(Math.abs(rawDelta) * 0.08, 12);

      // Unbounded forward scrolling! Infinite corridor!
      currentTargetZ.current = Math.min(6, currentTargetZ.current - normalizedDelta);
      onZChange?.(currentTargetZ.current);
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (!enabled || isTransitioningRef.current) return;
      if ((e.target as HTMLElement).closest('button, a, input')) return;
      isDraggingRef.current = true;
      lastPointerYRef.current = e.clientY;
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!enabled || isTransitioningRef.current) return;

      // Keep steering responsive and smooth at all times
      mouseParallax.current.x = (e.clientX / window.innerWidth - 0.5) * 0.35;
      mouseParallax.current.y = -(e.clientY / window.innerHeight - 0.5) * 0.25;

      if (!isDraggingRef.current) return;
      const deltaY = e.clientY - lastPointerYRef.current;
      lastPointerYRef.current = e.clientY;

      currentTargetZ.current = Math.min(6, currentTargetZ.current + deltaY * 0.12);
      onZChange?.(currentTargetZ.current);
    };

    const handlePointerUp = () => {
      isDraggingRef.current = false;
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (!enabled || isTransitioningRef.current) return;
      if (e.touches.length > 0) {
        lastPointerYRef.current = e.touches[0].clientY;
        isDraggingRef.current = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!enabled || !isDraggingRef.current || e.touches.length === 0 || isTransitioningRef.current) return;
      const currentY = e.touches[0].clientY;
      const currentX = e.touches[0].clientX;
      const deltaY = currentY - lastPointerYRef.current;
      lastPointerYRef.current = currentY;

      mouseParallax.current.x = (currentX / window.innerWidth - 0.5) * 0.35;
      mouseParallax.current.y = -(currentY / window.innerHeight - 0.5) * 0.25;

      currentTargetZ.current = Math.min(6, currentTargetZ.current + deltaY * 0.12);
      onZChange?.(currentTargetZ.current);
    };

    const handleTouchEnd = () => {
      isDraggingRef.current = false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!enabled || isTransitioningRef.current) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        currentTargetZ.current -= 6;
        onZChange?.(currentTargetZ.current);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        currentTargetZ.current = Math.min(6, currentTargetZ.current + 6);
        onZChange?.(currentTargetZ.current);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onZChange, enabled]);

  // Authentic auto-glance formula: smoothly turns toward doors as user passes them
  const calculateDoorGlance = (camZ: number) => {
    const currentSeg = Math.floor((10 - camZ) / SEGMENT_LENGTH);
    let maxIntensity = 0;
    let glanceDir = 0;
    const O = 11;
    const z = 4.5;
    const X = -1.5;

    // Check doors in current and next segment to ensure seamless boundary crossing
    for (const seg of [Math.max(0, currentSeg), Math.max(0, currentSeg + 1)]) {
      const segZ = 10 - seg * SEGMENT_LENGTH;
      for (const d of DOORS_IN_SEGMENT) {
        const doorZ = segZ + d.relativeZ;
        const dist = camZ - doorZ;
        let intensity = 0;
        if (dist > z && dist < O) {
          const t = (O - dist) / (O - z);
          intensity = t * t * (3 - 2 * t);
        } else if (dist <= z && dist > X) {
          const t = (dist - X) / (z - X);
          intensity = t * t * (3 - 2 * t);
        }
        if (intensity > maxIntensity) {
          maxIntensity = intensity;
          // In Three.js, left door (-X) requires positive rotation.y to face it.
          // Right door (+X) requires negative rotation.y to face it.
          glanceDir = d.side === 'left' ? 1 : -1;
        }
      }
    }
    return glanceDir * maxIntensity * 0.19;
  };

  // Frame update: Camera lerping, glance effect, and dynamic segment updating
  useFrame((_, delta) => {
    if (!enabled || isTransitioningRef.current) return;

    const safeDelta = Math.min(delta, 0.05);

    // Smooth continuous Z translation (snappy, responsive, zero lag)
    camera.position.z = THREE.MathUtils.damp(camera.position.z, currentTargetZ.current, 8.5, safeDelta);

    // Dynamic infinite segment calculation (only update state when needed array genuinely changes)
    const currentSeg = Math.floor((10 - camera.position.z) / SEGMENT_LENGTH);
    const needed = [currentSeg - 1, currentSeg, currentSeg + 1].filter((s) => s >= 0);

    const prevNeeded = activeSegmentsRef.current;
    if (
      needed.length !== prevNeeded.length ||
      needed.some((s, idx) => s !== prevNeeded[idx])
    ) {
      activeSegmentsRef.current = needed;
      setActiveSegments(needed);
    }

    // Parallax X and Y (immediate tracking without sluggish spongy delay)
    const targetX = mouseParallax.current.x;
    const targetY = 1.6 + mouseParallax.current.y;
    camera.position.x = THREE.MathUtils.damp(camera.position.x, targetX, 9.5, safeDelta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, targetY, 9.5, safeDelta);

    // Natural glance toward doors and subtle mouse steering
    const glanceY = calculateDoorGlance(camera.position.z);
    const targetRotationY = -mouseParallax.current.x * 0.35 + glanceY;

    camera.rotation.y = THREE.MathUtils.damp(camera.rotation.y, targetRotationY, 9.5, safeDelta);
    camera.rotation.x = THREE.MathUtils.damp(camera.rotation.x, mouseParallax.current.y * 0.15, 9.5, safeDelta);
  });


  return (
    <group>
      {/* Autonomous AI Companion Drone */}
      {enabled && <CompanionDrone onDiscover={onDiscoverCompanion} theme={theme} />}

      {/* Infinite Repeating Corridor Segments */}
      {activeSegments.map((segIndex) => {
        const segZ = 10 - segIndex * SEGMENT_LENGTH;

        return (
          <group key={`segment-${segIndex}`}>
            {/* Left Wall */}
            <mesh position={[-3.8, 1.75, segZ - 40]} rotation={[0, Math.PI / 2, 0]}>
              <planeGeometry args={[SEGMENT_LENGTH, 5.5]} />
              <meshBasicMaterial map={wallTex} transparent alphaTest={0.01} side={THREE.DoubleSide} />
            </mesh>

            {/* Right Wall */}
            <mesh position={[3.8, 1.75, segZ - 40]} rotation={[0, -Math.PI / 2, 0]}>
              <planeGeometry args={[SEGMENT_LENGTH, 5.5]} />
              <meshBasicMaterial map={wallTex} transparent alphaTest={0.01} side={THREE.DoubleSide} />
            </mesh>

            {/* Authentic 10m Hand-Drawn Wooden Plank Floor Tiles with Alternating Flips */}
            {Array.from({ length: Math.ceil(SEGMENT_LENGTH / 10) }).map((_, tileIdx) => {
              const tileZ = segZ - tileIdx * 10 - 5;
              const isFlipped = Math.abs(tileIdx) % 2 === 1;

              return (
                <group key={`floor-tile-${tileIdx}`}>
                  {/* Center Wooden Floor Planks (5.4m wide) */}
                  <mesh
                    position={[0, -1, tileZ]}
                    rotation={[-Math.PI / 2, 0, Math.PI / 2 + (isFlipped ? Math.PI : 0)]}
                    scale={[isFlipped ? -1 : 1, 1, 1]}
                  >
                    <planeGeometry args={[10, 5.4]} />
                    <meshBasicMaterial map={floorCenterTex} color="#ede8df" side={THREE.DoubleSide} />
                  </mesh>

                  {/* Left Edge Wooden Strips (1.1m wide) */}
                  <mesh
                    position={[-3.25, -1, tileZ]}
                    rotation={[-Math.PI / 2, 0, Math.PI / 2 + (isFlipped ? Math.PI : 0)]}
                    scale={[isFlipped ? -1 : 1, 1, 1]}
                  >
                    <planeGeometry args={[10, 1.1]} />
                    <meshBasicMaterial map={floorLeftTex} color="#ede8df" side={THREE.DoubleSide} />
                  </mesh>

                  {/* Right Edge Wooden Strips (1.1m wide) */}
                  <mesh
                    position={[3.25, -1, tileZ]}
                    rotation={[-Math.PI / 2, 0, Math.PI / 2 + (isFlipped ? Math.PI : 0)]}
                    scale={[isFlipped ? -1 : 1, 1, 1]}
                  >
                    <planeGeometry args={[10, 1.1]} />
                    <meshBasicMaterial map={floorRightTex} color="#ede8df" side={THREE.DoubleSide} />
                  </mesh>
                </group>
              );
            })}

            {/* Left Skirting Baseboard */}
            <mesh position={[-3.78, -0.92, segZ - 40]} rotation={[0, Math.PI / 2, 0]}>
              <planeGeometry args={[SEGMENT_LENGTH, 0.16]} />
              <meshBasicMaterial map={baseboardTex} color="#ede8df" transparent alphaTest={0.05} />
            </mesh>

            {/* Right Skirting Baseboard */}
            <mesh position={[3.78, -0.92, segZ - 40]} rotation={[0, -Math.PI / 2, 0]}>
              <planeGeometry args={[SEGMENT_LENGTH, 0.16]} />
              <meshBasicMaterial map={baseboardTex} color="#ede8df" transparent alphaTest={0.05} />
            </mesh>

            {/* Ceiling */}
            <mesh position={[0, 4.5, segZ - 40]} rotation={[Math.PI / 2, 0, 0]}>
              <planeGeometry args={[7.6, SEGMENT_LENGTH]} />
              <meshBasicMaterial map={ceilingTex} transparent alphaTest={0.01} side={THREE.DoubleSide} />
            </mesh>

            {/* Segment Number Marker */}
            <group position={[3.6, 2.8, segZ - 2]} rotation={[0, -Math.PI / 2, 0]}>
              <mesh>
                <planeGeometry args={[1.2, 0.45]} />
                <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
              </mesh>
            </group>

            {/* 4 Interactive Doors inside this segment */}
            {DOORS_IN_SEGMENT.map((door) => {
              const doorWorldZ = segZ + door.relativeZ;
              const isLeft = door.side === 'left';

              return (
                <CorridorDoor
                  key={`${door.roomId}-${segIndex}`}
                  roomId={door.roomId}
                  position={[isLeft ? -3.75 : 3.75, 0.6, doorWorldZ]}
                  side={door.side}
                  sketchUrl={door.sketchUrl}
                  paintedUrl={door.paintedUrl}
                  onEnter={(roomKey, worldZ) => onOpenRoom(roomKey, worldZ)}
                  isTransitioningRef={isTransitioningRef}
                />
              );
            })}

            {/* Connecting Double Portal Doorway at the end of this segment */}
            <CorridorPortalDoor position={[0, 0, segZ - 75]} />

            {/* Decorative hand-drawn items in this segment */}
            {/* Potted desk near Door 1 */}
            <mesh position={[-3.1, 0.1, segZ - 12]} rotation={[0, 0.3, 0]}>
              <planeGeometry args={[1.4, 1.8]} />
              <meshBasicMaterial map={deskTex} transparent alphaTest={0.05} />
            </mesh>
            <mesh position={[-3.1, 1.1, segZ - 12]}>
              <planeGeometry args={[0.7, 0.8]} />
              <meshBasicMaterial map={plantTex} transparent alphaTest={0.05} />
            </mesh>

            {/* Tree near Door 2 */}
            <mesh position={[3.1, 0.4, segZ - 26]}>
              <planeGeometry args={[1.3, 2.5]} />
              <meshBasicMaterial map={treeTex} transparent alphaTest={0.05} />
            </mesh>

            {/* Paper Airplane near Door 3 */}
            <mesh position={[0.4, 2.6, segZ - 42]} rotation={[0.2, 0.4, -0.1]}>
              <planeGeometry args={[0.8, 0.5]} />
              <meshBasicMaterial map={airplaneTex} transparent alphaTest={0.05} />
            </mesh>

            {/* Tree near Door 4 */}
            <mesh position={[-3.1, 0.4, segZ - 56]}>
              <planeGeometry args={[1.3, 2.5]} />
              <meshBasicMaterial map={treeTex} transparent alphaTest={0.05} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};
