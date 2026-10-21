import React, { useRef, useState, useEffect } from 'react';
import { useTexture, Html } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { soundManager } from '../../utils/sound';

interface EntranceSceneProps {
  onEnter: () => void;
  position?: [number, number, number];
  hasEntered?: boolean;
}

const DEVELOPER_QUOTES = [
  "Hi! Welcome! 👋\nClick the doors to enter!",
  "Autonomous AI Agents & Full-Stack Systems ⚡",
  "Prompt engineering is all you need! 🤖",
  "Have you tried console.log()? 💻",
  "It works on my machine! 🤷",
  "Did you clear the cache? 🔄",
  "Turning complex workflows into magic ✨",
  "Works in production! 🚀",
  "Click duck for dev secrets! 🦆",
];

export const EntranceScene: React.FC<EntranceSceneProps> = ({
  onEnter,
  position = [0, 0, 10],
  hasEntered = false,
}) => {
  const { camera } = useThree();

  // References
  const leftDoorRef = useRef<THREE.Group>(null);
  const rightDoorRef = useRef<THREE.Group>(null);
  const leftHandleRef = useRef<THREE.Group>(null);
  const rightHandleRef = useRef<THREE.Group>(null);
  const avatarRef = useRef<THREE.Mesh>(null);
  const hangingMouseRef = useRef<THREE.Group>(null);
  const catLeftEyeRef = useRef<THREE.Mesh>(null);
  const catRightEyeRef = useRef<THREE.Mesh>(null);
  const bugRef = useRef<THREE.Mesh>(null);
  const inkSplashRef = useRef<THREE.Mesh>(null);
  const speechBubbleRef = useRef<THREE.Group>(null);

  // States & Persistent Door Flags
  const [isOpen, setIsOpen] = useState(false);
  const [speechText, setSpeechText] = useState(DEVELOPER_QUOTES[0]);
  const [speechVisible, setSpeechVisible] = useState(true);
  const [bugFixed, setBugFixed] = useState(false);
  const hasPlayedSoundRef = useRef(false);
  const hasOpenedRef = useRef(false);

  // Load all authentic hand-drawn entrance textures
  const [
    brickTex,
    floorTex,
    stonePathTex,
    beamTex,
    signTex,
    catTex,
    potTex,
    windowTex,
    avatarTex,
    treeTex,
    mouseTex,
    bugTex,
    bubbleTex,
    splashTex,
  ] = useTexture([
    '/textures/entrance/wall_bricks_2.webp',
    '/textures/entrance/floor_paper.webp',
    '/textures/entrance/stone-path.webp',
    '/textures/entrance/belka.webp',
    '/textures/entrance/sign.webp',
    '/textures/entrance/cat_front_body.webp',
    '/textures/entrance/pot_with_duck.webp',
    '/textures/entrance/window_sketch.webp',
    '/textures/entrance/avatar_window.webp',
    '/textures/entrance/tree_sketch.webp',
    '/textures/entrance/mouse_hanging.webp',
    '/textures/entrance/bug_sketch.webp',
    '/textures/entrance/speech_bubble.webp',
    '/images/ink-splash.webp',
  ]);

  // Load entrance door textures
  const [
    doorLeftTex,
    doorRightTex,
    frameTex,
    handleLeftTex,
    handleRightTex,
    pienTex,
  ] = useTexture([
    '/textures/doors/door_left_sketch.webp',
    '/textures/doors/door_right_sketch.webp',
    '/textures/doors/frame_sketch.webp',
    '/textures/doors/handle_left_sketch.webp',
    '/textures/doors/handle_right_sketch.webp',
    '/textures/doors/pien.webp',
  ]);

  // Color space setup
  useEffect(() => {
    [
      brickTex, floorTex, stonePathTex, beamTex, signTex, catTex, potTex,
      windowTex, avatarTex, treeTex, mouseTex, bugTex, bubbleTex, splashTex,
      doorLeftTex, doorRightTex, frameTex, handleLeftTex, handleRightTex, pienTex,
    ].forEach((t) => {
      if (t) t.colorSpace = THREE.SRGBColorSpace;
    });
  }, [
    brickTex, floorTex, stonePathTex, beamTex, signTex, catTex, potTex,
    windowTex, avatarTex, treeTex, mouseTex, bugTex, bubbleTex, splashTex,
    doorLeftTex, doorRightTex, frameTex, handleLeftTex, handleRightTex, pienTex,
  ]);

  // Persistent door open effect: doors stay open permanently once opened
  useEffect(() => {
    if (hasEntered || isOpen || hasOpenedRef.current) {
      setIsOpen(true);
      hasOpenedRef.current = true;
      if (leftDoorRef.current) {
        leftDoorRef.current.rotation.y = -Math.PI * 0.55;
      }
      if (rightDoorRef.current) {
        rightDoorRef.current.rotation.y = Math.PI * 0.55;
      }
      if (leftHandleRef.current) {
        leftHandleRef.current.rotation.z = 0.4;
      }
      if (rightHandleRef.current) {
        rightHandleRef.current.rotation.z = -0.4;
      }
    }
  }, [hasEntered, isOpen]);

  // Initial camera placement, Avatar waving animation, and speech cycling
  useEffect(() => {
    // Camera initial position facing the doorway (only if not entered and not open)
    if (!hasEntered && !isOpen && !hasOpenedRef.current) {
      camera.position.set(position[0], 0.4, position[2] + 5.8);
      camera.lookAt(position[0], 0.4, position[2]);
    }

    // Avatar standing prominently in the window & waving cheerfully
    if (avatarRef.current) {
      avatarRef.current.position.set(2.45, 0.5, 0.08);
      gsap.fromTo(
        avatarRef.current.rotation,
        { z: -0.12 },
        {
          z: 0.15,
          duration: 0.22,
          yoyo: true,
          repeat: 7,
          ease: 'sine.inOut',
          onComplete: () => {
            if (avatarRef.current) {
              gsap.to(avatarRef.current.rotation, { z: 0, duration: 0.3 });
            }
          },
        }
      );
    }

    // Speech bubble pop-in
    if (speechBubbleRef.current) {
      speechBubbleRef.current.scale.set(0, 0, 0);
      gsap.to(speechBubbleRef.current.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 0.45,
        delay: 0.25,
        ease: 'back.out(1.8)',
      });
    }

    // Continuous developer / AI quote cycling every 4.5 seconds
    let quoteIndex = 0;
    const interval = setInterval(() => {
      if (isOpen || hasEntered || hasOpenedRef.current) return;
      quoteIndex = (quoteIndex + 1) % DEVELOPER_QUOTES.length;
      const nextQuote = DEVELOPER_QUOTES[quoteIndex];
      setSpeechText(nextQuote);

      if (speechBubbleRef.current) {
        gsap.fromTo(
          speechBubbleRef.current.scale,
          { x: 0.85, y: 0.85 },
          { x: 1, y: 1, duration: 0.35, ease: 'back.out(2)' }
        );
      }
      if (avatarRef.current) {
        gsap.to(avatarRef.current.rotation, {
          z: 0.12,
          duration: 0.2,
          yoyo: true,
          repeat: 3,
          ease: 'sine.inOut',
        });
      }
    }, 4500);

    return () => clearInterval(interval);
  }, [camera, hasEntered, position, isOpen]);

  // Mouse Wheel, Mouse Drag, and Keyboard shortcuts: scrolling or dragging opens the doors!
  useEffect(() => {
    let startY = 0;
    let isDragging = false;

    const handleKey = (e: KeyboardEvent) => {
      if (isOpen || hasEntered || hasOpenedRef.current) return;
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        handleDoorClick();
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (isOpen || hasEntered || hasOpenedRef.current) return;
      // Scrolling down/forward with mouse wheel opens the entrance doors
      if (e.deltaY > 10 || Math.abs(e.deltaX) > 15) {
        handleDoorClick();
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (isOpen || hasEntered || hasOpenedRef.current) return;
      if ((e.target as HTMLElement).closest('button, a, input')) return;
      startY = e.clientY;
      isDragging = true;
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging || isOpen || hasEntered || hasOpenedRef.current) return;
      const deltaY = e.clientY - startY;
      // Dragging mouse forward/upward or downward by > 25px triggers entrance
      if (Math.abs(deltaY) > 25) {
        isDragging = false;
        handleDoorClick();
      }
    };

    const handlePointerUp = () => {
      isDragging = false;
    };

    window.addEventListener('keydown', handleKey);
    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isOpen, hasEntered]);

  // Avatar hover interaction
  const handleAvatarHover = (hovering: boolean) => {
    if (isOpen || hasEntered || !avatarRef.current) return;
    document.body.style.cursor = hovering ? 'pointer' : 'auto';

    if (hovering) {
      soundManager.playHoverChime();
      gsap.to(avatarRef.current.rotation, {
        z: 0.18,
        duration: 0.2,
        yoyo: true,
        repeat: 3,
        ease: 'sine.inOut',
        overwrite: true,
      });
      showBubble("Hi! Welcome! 👋\nClick the doors to enter!");
    } else {
      gsap.to(avatarRef.current.rotation, {
        z: 0,
        duration: 0.3,
        ease: 'power2.inOut',
        overwrite: true,
      });
    }
  };

  // Avatar click interaction
  const handleAvatarClick = (e?: any) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (isOpen || hasEntered) return;
    soundManager.playAchievement();
    const randomIndex = Math.floor(Math.random() * DEVELOPER_QUOTES.length);
    showBubble(DEVELOPER_QUOTES[randomIndex]);
    if (avatarRef.current) {
      gsap.to(avatarRef.current.rotation, {
        z: 0.22,
        duration: 0.18,
        yoyo: true,
        repeat: 5,
        ease: 'sine.inOut',
      });
    }
  };

  // Show speech bubble with text
  const showBubble = (text: string) => {
    setSpeechText(text);
    setSpeechVisible(true);
    if (speechBubbleRef.current) {
      speechBubbleRef.current.scale.set(0, 0, 0);
      gsap.to(speechBubbleRef.current.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 0.4,
        ease: 'back.out(1.8)',
      });
    }
  };

  // Duck pot click interaction (developer wisdom)
  const handleDuckClick = (e: any) => {
    e.stopPropagation();
    soundManager.playAchievement();
    const randomIndex = Math.floor(Math.random() * (DEVELOPER_QUOTES.length - 1)) + 1;
    showBubble(DEVELOPER_QUOTES[randomIndex]);
  };

  // Bug click interaction ("BUG FIXED!")
  const handleBugClick = (e: any) => {
    e.stopPropagation();
    if (bugFixed) return;
    setBugFixed(true);
    soundManager.playAchievement();

    if (inkSplashRef.current) {
      inkSplashRef.current.scale.set(0, 0, 0);
      gsap.to(inkSplashRef.current.scale, {
        x: 1.2,
        y: 1.2,
        z: 1,
        duration: 0.3,
        ease: 'back.out(2)',
      });
    }
  };

  // Door hover animation (only before opened)
  const handleDoorHover = (hovering: boolean) => {
    if (isOpen || hasEntered || hasOpenedRef.current) return;
    document.body.style.cursor = hovering ? 'pointer' : 'auto';

    if (hovering) {
      soundManager.playDoorCreak();
      if (leftDoorRef.current) {
        gsap.to(leftDoorRef.current.rotation, { y: -0.1, duration: 0.3, ease: 'power2.out', overwrite: true });
      }
      if (rightDoorRef.current) {
        gsap.to(rightDoorRef.current.rotation, { y: 0.1, duration: 0.3, ease: 'power2.out', overwrite: true });
      }
      if (leftHandleRef.current) {
        gsap.to(leftHandleRef.current.rotation, { z: 0.15, duration: 0.2, ease: 'power2.out', overwrite: true });
      }
      if (rightHandleRef.current) {
        gsap.to(rightHandleRef.current.rotation, { z: -0.15, duration: 0.2, ease: 'power2.out', overwrite: true });
      }
    } else {
      if (leftDoorRef.current) {
        gsap.to(leftDoorRef.current.rotation, { y: 0, duration: 0.3, ease: 'power2.out', overwrite: true });
      }
      if (rightDoorRef.current) {
        gsap.to(rightDoorRef.current.rotation, { y: 0, duration: 0.3, ease: 'power2.out', overwrite: true });
      }
      if (leftHandleRef.current) {
        gsap.to(leftHandleRef.current.rotation, { z: 0, duration: 0.2, ease: 'power2.out', overwrite: true });
      }
      if (rightHandleRef.current) {
        gsap.to(rightHandleRef.current.rotation, { z: 0, duration: 0.2, ease: 'power2.out', overwrite: true });
      }
    }
  };

  // Door click: open and fly inside! Plays sound ONLY once; stays open permanently!
  const handleDoorClick = (e?: any) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (isOpen || hasEntered || hasOpenedRef.current) return;
    setIsOpen(true);
    hasOpenedRef.current = true;
    document.body.style.cursor = 'auto';

    // Play door sound ONLY ONCE on the very first opening
    if (!hasPlayedSoundRef.current) {
      soundManager.playDoorOpen();
      hasPlayedSoundRef.current = true;
    }

    showBubble("Enjoy the journey! ✨\nScroll to explore!");

    const tl = gsap.timeline({
      onComplete: () => {
        onEnter();
      },
    });

    // Handles turn
    if (leftHandleRef.current) {
      tl.to(leftHandleRef.current.rotation, { z: 0.4, duration: 0.15, ease: 'power2.out' }, 0);
    }
    if (rightHandleRef.current) {
      tl.to(rightHandleRef.current.rotation, { z: -0.4, duration: 0.15, ease: 'power2.out' }, 0);
    }

    // Doors swing wide open
    if (leftDoorRef.current) {
      tl.to(leftDoorRef.current.rotation, { y: -Math.PI * 0.55, duration: 1.1, ease: 'power2.inOut' }, 0.1);
    }
    if (rightDoorRef.current) {
      tl.to(rightDoorRef.current.rotation, { y: Math.PI * 0.55, duration: 1.1, ease: 'power2.inOut' }, 0.1);
    }

    // Camera zooms smoothly inside through the entrance into corridor at z = 4, y = 1.6
    tl.to(camera.position, {
      x: 0,
      y: 1.6,
      z: 4,
      duration: 1.8,
      ease: 'power2.inOut',
    }, 0.25);
  };

  // Frame animations (Parallax, cat eyes, hanging mouse swing, flying bug)
  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // Subtle camera parallax when not opening and not entered
    if (!isOpen && !hasEntered && !hasOpenedRef.current) {
      const targetX = position[0] + state.pointer.x * 0.25;
      const targetY = 0.4 + state.pointer.y * 0.15;
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.05);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.05);
    }

    // Cat pupils tracking mouse cursor
    if (catLeftEyeRef.current && catRightEyeRef.current) {
      const eyeFactor = 0.015;
      const eyeX = state.pointer.x * eyeFactor * 2;
      const eyeY = state.pointer.y * eyeFactor * 2;
      catLeftEyeRef.current.position.x = THREE.MathUtils.lerp(catLeftEyeRef.current.position.x, -0.063 + eyeX, 0.1);
      catLeftEyeRef.current.position.y = THREE.MathUtils.lerp(catLeftEyeRef.current.position.y, 0.27 + eyeY, 0.1);
      catRightEyeRef.current.position.x = THREE.MathUtils.lerp(catRightEyeRef.current.position.x, 0.0615 + eyeX, 0.1);
      catRightEyeRef.current.position.y = THREE.MathUtils.lerp(catRightEyeRef.current.position.y, 0.27 + eyeY, 0.1);
    }

    // Hanging mouse natural swinging pendulum in breeze
    if (hangingMouseRef.current) {
      hangingMouseRef.current.rotation.z = Math.sin(t * 2.2) * 0.14;
    }

    // Flying bug sketch floating around
    if (bugRef.current && !bugFixed) {
      bugRef.current.position.x = 2.4 + Math.sin(t * 0.9) * 0.35 + Math.sin(t * 1.6) * 0.1;
      bugRef.current.position.y = 1.6 + Math.cos(t * 0.7) * 0.25 + Math.cos(t * 1.2) * 0.1;
      bugRef.current.rotation.z = Math.sin(t * 5) * 0.15;
    }
  });

  return (
    <group position={position}>
      {/* Brick Wall with Open Doorway Cutout */}
      {/* Left Wall Section & Solid Paper Backing */}
      <mesh position={[-4.7, 1.6, -0.01]}>
        <planeGeometry args={[7.2, 8]} />
        <meshBasicMaterial color="#f7f5f0" side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[-4.7, 1.6, 0]}>
        <planeGeometry args={[7.2, 8]} />
        <meshBasicMaterial map={brickTex} transparent alphaTest={0.01} side={THREE.DoubleSide} />
      </mesh>

      {/* Right Wall Section & Solid Paper Backing */}
      <mesh position={[4.7, 1.6, -0.01]}>
        <planeGeometry args={[7.2, 8]} />
        <meshBasicMaterial color="#f7f5f0" side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[4.7, 1.6, 0]}>
        <planeGeometry args={[7.2, 8]} />
        <meshBasicMaterial map={brickTex} transparent alphaTest={0.01} side={THREE.DoubleSide} />
      </mesh>

      {/* Top Wall Section above Doorway & Solid Paper Backing */}
      <mesh position={[0, 3.4, -0.01]}>
        <planeGeometry args={[2.2, 4.4]} />
        <meshBasicMaterial color="#f7f5f0" side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 3.4, 0]}>
        <planeGeometry args={[2.2, 4.4]} />
        <meshBasicMaterial map={brickTex} transparent alphaTest={0.01} side={THREE.DoubleSide} />
      </mesh>

      {/* Ground Paper Floor */}
      <mesh position={[0, -1.75, 3]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 8]} />
        <meshBasicMaterial map={floorTex} transparent alphaTest={0.01} />
      </mesh>

      {/* Stone Path Leading to Doorway */}
      <mesh
        position={[0, -1.73, 2.6]}
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={handleDoorClick}
        onPointerEnter={() => {
          if (!isOpen && !hasEntered && !hasOpenedRef.current) {
            document.body.style.cursor = 'pointer';
          }
        }}
        onPointerLeave={() => (document.body.style.cursor = 'auto')}
      >
        <planeGeometry args={[2.5, 5.5]} />
        <meshBasicMaterial map={stonePathTex} transparent alphaTest={0.01} />
      </mesh>

      {/* Wooden Beam above Entrance */}
      <mesh position={[0, 3.8, 0.1]}>
        <planeGeometry args={[7, 1]} />
        <meshBasicMaterial map={beamTex} transparent alphaTest={0.01} />
      </mesh>

      {/* Authentic Wooden Hanging Sign: Original Sketched "PORTFOLIO" */}
      <mesh position={[0, 2.65, 0.12]}>
        <planeGeometry args={[4.2, 1.15]} />
        <meshBasicMaterial map={signTex} transparent alphaTest={0.01} depthWrite={false} />
      </mesh>

      {/* Empty space below sign and above entrance doors: "MD SAHADAT HOSSAIN" */}
      <group position={[0, 1.60, 0.12]}>
        <Html center position={[0, 0, 0]} className="pointer-events-none select-none">
          <div className="text-center select-none pointer-events-none whitespace-nowrap">
            <h2 className="font-sketch text-lg sm:text-2xl font-bold text-black tracking-[0.22em] drop-shadow-sm uppercase">
              MD SAHADAT HOSSAIN
            </h2>
          </div>
        </Html>
      </group>

      {/* Window on the Right */}
      <group
        position={[2.5, 0.5, 0.15]}
        onPointerEnter={() => handleAvatarHover(true)}
        onPointerLeave={() => handleAvatarHover(false)}
        onClick={() => handleAvatarHover(true)}
      >
        <mesh position={[0, 0, 0.05]}>
          <planeGeometry args={[1.5, 1.5]} />
          <meshBasicMaterial map={windowTex} transparent alphaTest={0.01} depthWrite={false} />
        </mesh>
      </group>

      {/* Animated Avatar inside/behind the Window */}
      <mesh
        ref={avatarRef}
        position={[2.45, 0.5, 0.08]}
        onPointerEnter={() => handleAvatarHover(true)}
        onPointerLeave={() => handleAvatarHover(false)}
        onClick={handleAvatarClick}
      >
        <planeGeometry args={[1.5, 1.5]} />
        <meshBasicMaterial map={avatarTex} transparent alphaTest={0.01} depthWrite={false} />
      </mesh>

      {/* Speech Bubble popping over Window / Pot */}
      <group
        ref={speechBubbleRef}
        position={[2.45, 1.7, 0.35]}
        visible={speechVisible}
        onClick={handleDuckClick}
      >
        <mesh>
          <planeGeometry args={[2.5, 1.5]} />
          <meshBasicMaterial map={bubbleTex} transparent alphaTest={0.01} depthWrite={false} />
        </mesh>
        <Html
          center
          position={[0, 0.1, 0.02]}
          className="pointer-events-none select-none"
        >
          <div className="w-[190px] text-center font-sketch text-black flex flex-col items-center justify-center p-2 leading-snug drop-shadow-sm select-none pointer-events-none">
            <span className="text-xs sm:text-sm font-bold block whitespace-pre-line text-black">
              {speechText}
            </span>
          </div>
        </Html>
      </group>

      {/* Pot with Duck Doodle on the Ground */}
      <group position={[2.5, -1.1, 0.3]}>
        <mesh>
          <planeGeometry args={[2.2, 1.4]} />
          <meshBasicMaterial map={potTex} transparent alphaTest={0.01} depthWrite={false} />
        </mesh>
        {/* Invisible Click Target on Duck */}
        <mesh
          position={[0.3, 0.1, 0.02]}
          onClick={handleDuckClick}
          onPointerEnter={() => (document.body.style.cursor = 'pointer')}
          onPointerLeave={() => (document.body.style.cursor = 'auto')}
        >
          <planeGeometry args={[0.7, 0.7]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      </group>

      {/* Tree Doodle on the Left */}
      <mesh position={[-2.9, 1.1, 0.2]}>
        <planeGeometry args={[5, 6]} />
        <meshBasicMaterial map={treeTex} transparent alphaTest={0.01} depthWrite={false} />
      </mesh>

      {/* Hanging Mouse Doodle on Tree */}
      <group
        ref={hangingMouseRef}
        position={[-2.5, 0.5, 0.25]}
        onClick={(e) => {
          e.stopPropagation();
          soundManager.playHoverChime();
          if (hangingMouseRef.current) {
            gsap.to(hangingMouseRef.current.rotation, {
              z: 0.38,
              duration: 0.25,
              yoyo: true,
              repeat: 5,
              ease: 'power1.inOut',
            });
          }
        }}
        onPointerEnter={() => (document.body.style.cursor = 'pointer')}
        onPointerLeave={() => (document.body.style.cursor = 'auto')}
      >
        <mesh>
          <planeGeometry args={[1.2, 1.5]} />
          <meshBasicMaterial map={mouseTex} transparent alphaTest={0.01} depthWrite={false} />
        </mesh>
      </group>

      {/* Cute Cat on Floor with Dynamic Eye Tracking */}
      <group position={[-1.4, -1.15, 0.5]}>
        <mesh>
          <planeGeometry args={[1.3, 1.3]} />
          <meshBasicMaterial map={catTex} transparent alphaTest={0.01} depthWrite={false} />
        </mesh>
        {/* Left Pupil */}
        <mesh ref={catLeftEyeRef} position={[-0.063, 0.27, 0.02]}>
          <circleGeometry args={[0.02, 32]} />
          <meshBasicMaterial color="#111111" />
        </mesh>
        {/* Right Pupil */}
        <mesh ref={catRightEyeRef} position={[0.0615, 0.27, 0.02]}>
          <circleGeometry args={[0.02, 32]} />
          <meshBasicMaterial color="#111111" />
        </mesh>
      </group>

      {/* Flying Bug Sketch */}
      {!bugFixed && (
        <mesh
          ref={bugRef}
          position={[2.4, 1.6, 0.25]}
          onClick={handleBugClick}
          onPointerEnter={() => (document.body.style.cursor = 'pointer')}
          onPointerLeave={() => (document.body.style.cursor = 'auto')}
        >
          <planeGeometry args={[0.4, 0.4]} />
          <meshBasicMaterial map={bugTex} transparent alphaTest={0.01} depthWrite={false} />
        </mesh>
      )}

      {/* Ink Splash when Bug is Fixed */}
      {bugFixed && (
        <group position={[2.4, 1.6, 0.26]}>
          <mesh ref={inkSplashRef}>
            <planeGeometry args={[1.3, 1.3]} />
            <meshBasicMaterial map={splashTex} transparent alphaTest={0.01} depthWrite={false} />
          </mesh>
          <Html center position={[0, 0, 0.05]} className="pointer-events-none select-none">
            <div className="font-sketch font-bold text-xs sm:text-sm text-red-600 bg-white/95 px-2 py-0.5 rounded border border-black shadow-[2px_2px_0px_#000] rotate-[-6deg] select-none pointer-events-none whitespace-nowrap">
              BUG FIXED! 🐛✨
            </div>
          </Html>
        </group>
      )}

      {/* --- DOUBLE ENTRANCE DOORS --- */}
      <group
        position={[0, 0.1, 0.05]}
        onClick={handleDoorClick}
        onPointerOver={() => handleDoorHover(true)}
        onPointerOut={() => handleDoorHover(false)}
      >
        {/* Wooden Door Frame */}
        <mesh position={[0, 0, 0.01]}>
          <planeGeometry args={[2.1, 2.7]} />
          <meshBasicMaterial map={frameTex} transparent alphaTest={0.01} />
        </mesh>

        {/* Tree Trunk Base */}
        <mesh position={[0, -1.35, 0.02]}>
          <planeGeometry args={[2.3, 0.3]} />
          <meshBasicMaterial map={pienTex} transparent alphaTest={0.01} />
        </mesh>

        {/* Left Door (pivots from left edge x = -0.95) */}
        <group ref={leftDoorRef} position={[-0.94, 0, 0.03]}>
          <mesh position={[0.47, 0, 0]}>
            <planeGeometry args={[0.94, 2.4]} />
            <meshBasicMaterial map={doorLeftTex} transparent alphaTest={0.01} />
          </mesh>
          {/* Left Handle */}
          <group ref={leftHandleRef} position={[0.82, -0.1, 0.03]}>
            <mesh>
              <planeGeometry args={[0.25, 0.45]} />
              <meshBasicMaterial map={handleLeftTex} transparent alphaTest={0.01} />
            </mesh>
          </group>
        </group>

        {/* Right Door (pivots from right edge x = 0.94) */}
        <group ref={rightDoorRef} position={[0.94, 0, 0.03]}>
          <mesh position={[-0.47, 0, 0]}>
            <planeGeometry args={[0.94, 2.4]} />
            <meshBasicMaterial map={doorRightTex} transparent alphaTest={0.01} />
          </mesh>
          {/* Right Handle */}
          <group ref={rightHandleRef} position={[-0.82, -0.1, 0.03]}>
            <mesh>
              <planeGeometry args={[0.25, 0.45]} />
              <meshBasicMaterial map={handleRightTex} transparent alphaTest={0.01} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
};
