import React, { useState, Suspense, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { EntranceScene } from './components/3d/EntranceScene';
import { CorridorScene } from './components/3d/CorridorScene';
import { GalleryRoom } from './components/rooms/GalleryRoom';
import { StudioRoom } from './components/rooms/StudioRoom';
import { AboutRoom } from './components/rooms/AboutRoom';
import { ContactRoom } from './components/rooms/ContactRoom';
import { PaperUI, ViewMode } from './components/ui/PaperUI';
import { InkCursorTrail } from './components/ui/InkCursorTrail';
import { soundManager } from './utils/sound';

export const App: React.FC = () => {
  // Website starts directly at the hand-drawn Entrance Scene (or respects ?view= URL query param)
  const [view, setView] = useState<ViewMode>(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search).get('view') as ViewMode;
      if (p && ['entrance', 'corridor', 'gallery', 'studio', 'about', 'contact'].includes(p)) {
        return p;
      }
    }
    return 'entrance';
  });
  const [corridorZ, setCorridorZ] = useState(4);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [theme, setTheme] = useState<'classic' | 'blueprint'>('classic');

  const isBlueprint = theme === 'blueprint';

  const unlockAchievement = useCallback((id: string) => {
    setAchievements((prev) => {
      if (!prev.includes(id)) {
        soundManager.playAchievement();
        return [...prev, id];
      }
      return prev;
    });
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'classic' ? 'blueprint' : 'classic'));
  };

  // Entrance door opened -> Enter Corridor
  const handleEnterCorridor = () => {
    setView('corridor');
    setCorridorZ(4);
    unlockAchievement('wanderer');
  };

  // Open Room
  const handleOpenRoom = (roomKey: 'gallery' | 'studio' | 'about' | 'contact', doorZ?: number) => {
    if (typeof doorZ === 'number') {
      setCorridorZ(doorZ);
    }
    setView(roomKey);
    if (roomKey === 'gallery') unlockAchievement('art_critic');
    if (roomKey === 'studio') unlockAchievement('studio_visitor');
    if (roomKey === 'about') unlockAchievement('sky_walker');
    if (roomKey === 'contact') unlockAchievement('sociable');
  };

  // Exit Room back to Corridor
  const handleExitRoom = () => {
    setView('corridor');
  };

  // Chrome & Cross-Browser WebGL Context Setup
  const handleCanvasCreated = ({ gl }: { gl: any }) => {
    // Add context loss recovery listeners for Chrome/Linux stability
    const canvas = gl.domElement;
    if (canvas) {
      canvas.addEventListener(
        'webglcontextlost',
        (e: Event) => {
          e.preventDefault();
          console.warn('WebGL Context Lost. Preventing default...');
        },
        false
      );
      canvas.addEventListener(
        'webglcontextrestored',
        () => {
          console.log('WebGL Context Restored successfully.');
        },
        false
      );
    }
  };

  return (
    <main
      className={`w-screen h-screen relative overflow-hidden select-none font-sans transition-colors duration-500 ${
        isBlueprint ? 'bg-[#0d1b2a]' : 'bg-[#f7f5f0]'
      }`}
      style={{ touchAction: 'none' }}
    >
      {/* Paper / Blueprint texture overlay */}
      <div
        className={`absolute inset-0 pointer-events-none z-10 bg-repeat transition-opacity duration-500 ${
          isBlueprint ? 'opacity-25 mix-blend-screen' : 'opacity-15'
        }`}
        style={{ backgroundImage: `url('/textures/paper-texture.webp')` }}
      />

      {/* Blueprint Grid Lines Overlay (Only active in Blueprint Mode) */}
      {isBlueprint && (
        <div
          className="absolute inset-0 pointer-events-none z-10 opacity-20"
          style={{
            backgroundImage: `linear-gradient(#204060 1px, transparent 1px), linear-gradient(90deg, #204060 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
      )}

      {/* Atmospheric Edge Vignette Overlay */}
      <div
        className={`absolute inset-0 pointer-events-none z-20 transition-opacity duration-500 ${
          isBlueprint ? 'opacity-60' : 'opacity-35'
        }`}
        style={{
          background: 'radial-gradient(circle at center, transparent 65%, rgba(0, 0, 0, 0.45) 100%)',
        }}
      />

      {/* Ink Particle / Pencil Dust Cursor Trail */}
      <InkCursorTrail theme={theme} />

      {/* Minimalist Top Paper UI (Theme Toggle, Map, Sound, Achievements, Exit Button) */}
      <PaperUI
        currentView={view}
        onNavigate={(newView) => {
          if (newView === 'gallery' || newView === 'studio' || newView === 'about' || newView === 'contact') {
            handleOpenRoom(newView);
          } else {
            setView(newView);
          }
        }}
        unlockedAchievements={achievements}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* 3D WebGL Canvas Viewport - Optimized for Google Chrome & Firefox */}
      <div className="w-full h-full relative" style={{ touchAction: 'none' }}>
        <Suspense
          fallback={
            <div className={`absolute inset-0 flex flex-col items-center justify-center z-30 ${isBlueprint ? 'bg-[#0d1b2a]' : 'bg-[#f7f5f0]'}`}>
              <div className="w-10 h-10 border-4 border-black border-t-yellow-400 rounded-full animate-spin mb-3" />
              <p className={`font-sketch text-base ${isBlueprint ? 'text-[#cce8ff]' : 'text-black'}`}>
                Opening Hand-Drawn Sketchbook...
              </p>
            </div>
          }
        >
          <Canvas
            camera={{ position: [0, 0.4, 15.8], fov: 50 }}
            gl={{
              antialias: true,
              alpha: true,
              powerPreference: 'default',
              failIfMajorPerformanceCaveat: false,
              stencil: false,
              depth: true,
            }}
            dpr={typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1}
            onCreated={handleCanvasCreated}
          >
            <EntranceScene
              position={[0, 0, 10]}
              onEnter={handleEnterCorridor}
              hasEntered={view !== 'entrance'}
            />
            <CorridorScene
              enabled={view === 'corridor'}
              onOpenRoom={handleOpenRoom}
              initialZ={corridorZ}
              theme={theme}
              onDiscoverCompanion={() => unlockAchievement('companion_ally')}
            />
          </Canvas>
        </Suspense>
      </div>

      {/* Active Room Overlays (Paper aesthetic) */}
      {view === 'gallery' && <GalleryRoom onBack={handleExitRoom} />}
      {view === 'studio' && <StudioRoom onBack={handleExitRoom} />}
      {view === 'about' && <AboutRoom onBack={handleExitRoom} />}
      {view === 'contact' && <ContactRoom onBack={handleExitRoom} />}

    </main>
  );
};

export default App;
