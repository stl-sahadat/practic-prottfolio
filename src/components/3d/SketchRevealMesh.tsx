import React, { useRef, useEffect } from 'react';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { soundManager } from '../../utils/sound';

interface SketchRevealMeshProps {
  sketchUrl: string;
  paintedUrl: string;
  width?: number;
  height?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  onClick?: () => void;
  onHover?: (hovered: boolean) => void;
  enableHoverSound?: boolean;
}

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform sampler2D uMapSketch;
uniform sampler2D uMapPainted;
uniform float uProgress;
varying vec2 vUv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float paintNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

void main() {
  vec4 sketch = texture2D(uMapSketch, vUv);
  vec4 painted = texture2D(uMapPainted, vUv);

  // Transparent cutout
  if (sketch.a < 0.02 && painted.a < 0.02) {
    discard;
  }

  // Paint reveal brush-stroke on hover
  if (uProgress > 0.001) {
    float rn = paintNoise(vUv * 15.0) * 0.18;
    float maskValue = (1.0 - vUv.y) + rn;
    float threshold = uProgress * 1.45;
    if (maskValue < threshold) {
      gl_FragColor = painted;
      return;
    }
  }

  gl_FragColor = sketch;
}
`;

export const SketchRevealMesh: React.FC<SketchRevealMeshProps> = ({
  sketchUrl,
  paintedUrl,
  width = 2,
  height = 3,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  onClick,
  onHover,
  enableHoverSound = true,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const uniformsRef = useRef({
    uMapSketch: { value: null as THREE.Texture | null },
    uMapPainted: { value: null as THREE.Texture | null },
    uProgress: { value: 0 },
  });

  const [sketchTex, paintedTex] = useTexture([sketchUrl, paintedUrl]);

  useEffect(() => {
    if (sketchTex) {
      sketchTex.colorSpace = THREE.SRGBColorSpace;
      uniformsRef.current.uMapSketch.value = sketchTex;
    }
    if (paintedTex) {
      paintedTex.colorSpace = THREE.SRGBColorSpace;
      uniformsRef.current.uMapPainted.value = paintedTex;
    }
  }, [sketchTex, paintedTex]);

  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    if (enableHoverSound) soundManager.playHoverChime();
    if (onHover) onHover(true);

    gsap.to(uniformsRef.current.uProgress, {
      value: 1,
      duration: 0.5,
      ease: 'power2.out',
    });
  };

  const handlePointerOut = (e: any) => {
    e.stopPropagation();
    if (onHover) onHover(false);

    gsap.to(uniformsRef.current.uProgress, {
      value: 0,
      duration: 0.4,
      ease: 'power2.inOut',
    });
  };

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (onClick) onClick();
  };

  return (
    <mesh
      ref={meshRef}
      position={position}
      rotation={rotation}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      <planeGeometry args={[width, height]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniformsRef.current}
        transparent={true}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};
