import React, { useState, useEffect } from 'react';
import { portfolioData } from '../../data/portfolioData';
import { soundManager } from '../../utils/sound';
import { ChevronLeft, ChevronRight, ExternalLink, Github, RotateCw } from 'lucide-react';
import { assetUrl } from '../../utils/assets';

interface GalleryRoomProps {
  onBack: () => void;
}

// Map tech names to authentic logo textures
const getTechLogo = (tech: string) => {
  const lower = tech.toLowerCase();
  if (lower.includes('react')) return assetUrl('/textures/gallery/reactlogo_painted.webp');
  if (lower.includes('tailwind')) return assetUrl('/textures/gallery/tailwindlogo_painted.webp');
  if (lower.includes('js') || lower.includes('javascript') || lower.includes('vite')) return assetUrl('/textures/gallery/jslogo_painted.webp');
  if (lower.includes('html')) return assetUrl('/textures/gallery/htmllogo_painted.webp');
  if (lower.includes('css')) return assetUrl('/textures/gallery/csslogo_painted.webp');
  if (lower.includes('cloud') || lower.includes('firebase')) return assetUrl('/textures/gallery/firebaselogo_painted.webp');
  return null;
};

export const GalleryRoom: React.FC<GalleryRoomProps> = ({ onBack }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [btnHovered, setBtnHovered] = useState(false);

  const projects = portfolioData.projects;

  const nextProject = () => {
    soundManager.playHoverChime();
    setCurrentIndex((prev) => (prev + 1) % projects.length);
  };

  const prevProject = () => {
    soundManager.playHoverChime();
    setCurrentIndex((prev) => (prev - 1 + projects.length) % projects.length);
  };

  const toggleFlip = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    soundManager.playAchievement();
    setFlippedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Backward mouse pull, drag, and keyboard navigation to exit back to corridor
  useEffect(() => {
    let lastWheelTime = 0;
    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > 20 && Date.now() - lastWheelTime > 220) {
        lastWheelTime = Date.now();
        if (e.deltaY > 0) {
          nextProject();
        } else {
          prevProject();
        }
      }
    };

    let startX = 0;
    const handlePointerDown = (e: PointerEvent) => {
      startX = e.clientX;
    };
    const handlePointerUp = (e: PointerEvent) => {
      const deltaX = e.clientX - startX;
      if (deltaX > 50) {
        prevProject();
      } else if (deltaX < -50) {
        nextProject();
      }
    };

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        nextProject();
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        prevProject();
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        const activeProj = projects[currentIndex];
        if (activeProj) toggleFlip(activeProj.id);
      } else if (e.key === 'Escape') {
        soundManager.playDoorClose();
        onBack();
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('keydown', handleKey);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('keydown', handleKey);
    };
  }, [currentIndex, onBack]);

  return (
    <div className="fixed inset-0 z-40 bg-[#f7f5f0] flex flex-col justify-between overflow-hidden select-none">
      {/* Background paper texture & hand-drawn city skyline */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none bg-repeat"
        style={{ backgroundImage: `url('${assetUrl('/textures/paper-texture.webp')}')` }}
      />
      {/* Authentic Wooden Herringbone Parquet Floor */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 bg-repeat-x opacity-35 pointer-events-none z-10"
        style={{ backgroundImage: `url('${assetUrl('/textures/gallery/floor.webp')}')`, backgroundSize: '280px auto' }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-64 bg-repeat-x opacity-20 pointer-events-none"
        style={{ backgroundImage: `url('${assetUrl('/textures/gallery/miastotlo.webp')}')`, backgroundSize: 'contain' }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-16 bg-repeat-x opacity-25 pointer-events-none z-10"
        style={{ backgroundImage: `url('${assetUrl('/textures/gallery/railing.webp')}')`, backgroundSize: 'contain' }}
      />

      {/* Top Header */}
      <div className="relative z-20 px-6 sm:px-10 py-5 flex items-center justify-between border-b border-black/10 bg-white/40 backdrop-blur-sm">
        <button
          onClick={() => {
            soundManager.playDoorClose();
            onBack();
          }}
          className="sketch-btn px-4 py-2 font-sketch text-sm tracking-wider uppercase flex items-center gap-2 hover:scale-105 transition-transform"
        >
          <span>← Back to Corridor</span>
        </button>

        <div className="text-right">
          <h2 className="font-sketch text-xl sm:text-2xl text-black">THE GALLERY</h2>
          <p className="font-hand text-xs sm:text-sm text-slate-600 -mt-0.5">
            18 Featured Projects • Scroll wheel or use arrows to explore
          </p>
        </div>
      </div>

      {/* Center Stage: Clothesline with Hanging Project Cards */}
      <div className="relative z-20 flex-1 flex items-center justify-center px-4 sm:px-12">
        {/* Horizontal Clothesline Rope SVG */}
        <div className="absolute top-1/2 left-0 right-0 -translate-y-[220px] pointer-events-none z-10">
          <svg className="w-full h-24 overflow-visible" preserveAspectRatio="none" viewBox="0 0 1000 100">
            <path
              d="M 0,20 Q 250,80 500,85 Q 750,80 1000,20"
              fill="none"
              stroke="#5a524a"
              strokeWidth="2.5"
              strokeDasharray="6,2"
              opacity="0.75"
            />
          </svg>
        </div>

        {/* Navigation Arrow Left */}
        <button
          onClick={prevProject}
          className="sketch-btn p-3.5 rounded-full mr-2 sm:mr-8 hover:scale-110 z-30 transition-transform"
          title="Previous Project (Arrow Left)"
        >
          <ChevronLeft className="w-6 h-6 text-black" />
        </button>

        {/* Carousel of Cards */}
        <div className="flex items-center justify-center gap-4 sm:gap-10 max-w-6xl w-full py-6">
          {[-1, 0, 1].map((offset) => {
            const index = (currentIndex + offset + projects.length) % projects.length;
            const project = projects[index];
            const isCenter = offset === 0;
            const isFlipped = !!flippedCards[project.id];

            return (
              <div
                key={project.id}
                onClick={() => {
                  if (!isCenter) {
                    if (offset === 1) nextProject();
                    else prevProject();
                  } else {
                    toggleFlip(project.id);
                  }
                }}
                className={`relative transition-all duration-500 select-none cursor-pointer ${
                  isCenter
                    ? 'scale-100 opacity-100 z-30'
                    : 'scale-85 opacity-35 hover:opacity-65 z-10 hidden md:block'
                }`}
                style={{
                  transform: `translateY(${Math.abs(offset) * 20}px) rotate(${offset * 3.5}deg)`,
                }}
              >
                {/* Authentic Wooden Peg Clip at Top of Card */}
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 w-9 h-14 z-40 pointer-events-none drop-shadow-md">
                  <img
                    src={assetUrl('/textures/gallery/klamerka.webp')}
                    alt="Wooden Peg"
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* 3D Flip Card Container */}
                <div
                  className="w-[320px] sm:w-[410px] h-[520px] relative transition-transform duration-700"
                  style={{
                    perspective: '1200px',
                    transformStyle: 'preserve-3d',
                  }}
                >
                  <div
                    className="w-full h-full relative transition-transform duration-700"
                    style={{
                      transformStyle: 'preserve-3d',
                      transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    }}
                  >
                    {/* === FRONT SIDE OF CARD === */}
                    <div
                      className="absolute inset-0 rounded-xl border-2 border-black bg-white p-6 shadow-[8px_8px_0px_#1a1a1a] flex flex-col justify-between"
                      style={{
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                      }}
                    >
                      <div>
                        {/* Top Metadata */}
                        <div className="flex items-center justify-between border-b-2 border-dashed border-black/15 pb-2.5 mb-3">
                          <span className="font-sketch text-lg text-black font-bold">
                            #{project.id}
                          </span>
                          <span className="font-hand text-sm font-semibold tracking-wider text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-300">
                            {project.badge}
                          </span>
                        </div>

                        {/* Project Artwork */}
                        <div className="w-full h-52 rounded-lg border border-black overflow-hidden mb-4 bg-slate-100 relative group">
                          <img
                            src={project.image}
                            alt={project.title}
                            className="w-full h-full object-cover grayscale contrast-125 group-hover:grayscale-0 transition-all duration-500"
                          />
                          <div className="absolute inset-0 bg-yellow-400/5 group-hover:opacity-0 transition-opacity" />
                        </div>

                        {/* Project Title & Subtitle */}
                        <h3 className="font-sketch text-xl sm:text-2xl text-black line-clamp-1 mb-1 tracking-wide">
                          {project.title}
                        </h3>
                        <p className="font-hand text-xs text-slate-600 uppercase tracking-wider mb-2 font-semibold">
                          {project.category}
                        </p>
                        <p className="text-xs text-slate-700 font-sans line-clamp-2 leading-relaxed">
                          {project.description}
                        </p>
                      </div>

                      {/* Card Bottom CTA */}
                      <div className="pt-3 border-t border-black/10 flex items-center justify-between text-xs font-sketch text-black">
                        <span className="flex items-center gap-1 text-slate-500 font-hand text-sm">
                          <RotateCw className="w-3.5 h-3.5 animate-spin-slow" /> Click card to flip details
                        </span>
                        <span className="underline decoration-wavy decoration-yellow-500">
                          Inspect ↗
                        </span>
                      </div>
                    </div>

                    {/* === BACK SIDE OF CARD (Authentic tylkartki.webp background) === */}
                    <div
                      className="absolute inset-0 rounded-xl border-2 border-black p-6 shadow-[8px_8px_0px_#1a1a1a] flex flex-col justify-between"
                      style={{
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                        backgroundImage: `url('${assetUrl('/textures/gallery/tylkartki_painted.webp')}')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundColor: '#fbf9f4',
                      }}
                    >
                      <div>
                        {/* Back Header */}
                        <div className="flex items-center justify-between border-b-2 border-dashed border-black/20 pb-2 mb-3">
                          <span className="font-sketch text-base sm:text-lg text-black font-bold">
                            {project.title}
                          </span>
                          <button
                            onClick={(e) => toggleFlip(project.id, e)}
                            className="text-xs font-sketch px-2 py-0.5 border border-black rounded hover:bg-black hover:text-white transition-colors"
                          >
                            Flip Back ↺
                          </button>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-slate-800 font-sans leading-relaxed mb-4">
                          {project.description}
                        </p>

                        {/* Key Contributions */}
                        <div className="mb-4">
                          <h4 className="font-sketch text-xs text-black uppercase tracking-wider mb-1.5 font-bold">
                            Architecture & Highlights:
                          </h4>
                          <ul className="space-y-1">
                            {project.contributions.map((c: string, idx: number) => (
                              <li key={idx} className="text-[11px] font-sans text-slate-700 flex items-start gap-1.5">
                                <span className="text-yellow-600 font-bold">•</span>
                                <span className="line-clamp-2">{c}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Tech Stack Icons */}
                        <div>
                          <h4 className="font-sketch text-xs text-black uppercase tracking-wider mb-1.5 font-bold">
                            Tech Stack:
                          </h4>
                          <div className="flex flex-wrap items-center gap-2">
                            {project.tags.map((tag: string, idx: number) => {
                              const logo = getTechLogo(tag);
                              return (
                                <span
                                  key={idx}
                                  className="inline-flex items-center gap-1.5 px-2 py-1 bg-white/80 border border-black/30 rounded text-[11px] font-mono text-black shadow-sm"
                                >
                                  {logo && <img src={logo} alt={tag} className="w-3.5 h-3.5 object-contain" />}
                                  <span>{tag}</span>
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Back Bottom: Authentic Visit Button */}
                      <div className="pt-3 border-t border-black/15 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {project.githubUrl && (
                            <a
                              href={project.githubUrl}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="sketch-btn p-2 rounded-md hover:scale-110 transition-transform"
                              title="GitHub Repository"
                            >
                              <Github className="w-4 h-4 text-black" />
                            </a>
                          )}
                        </div>

                        {/* Authentic itomdev style sketch button */}
                        {project.demoUrl ? (
                          <a
                            href={project.demoUrl}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            onMouseEnter={() => setBtnHovered(true)}
                            onMouseLeave={() => setBtnHovered(false)}
                            className="relative inline-block w-40 h-10 hover:scale-105 transition-transform"
                          >
                            <img
                              src={assetUrl(
                                btnHovered
                                  ? '/textures/gallery/przyciskdotylukartki_painted.webp'
                                  : '/textures/gallery/przyciskdotylukartki.webp'
                              )}
                              alt="Visit Project"
                              className="w-full h-full object-contain"
                            />
                            <span className="absolute inset-0 flex items-center justify-center font-sketch text-xs text-black font-bold uppercase tracking-wider">
                              Launch Live ↗
                            </span>
                          </a>
                        ) : (
                          <span className="font-sketch text-xs text-slate-500">Internal Suite</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation Arrow Right */}
        <button
          onClick={nextProject}
          className="sketch-btn p-3.5 rounded-full ml-2 sm:mr-8 hover:scale-110 z-30 transition-transform"
          title="Next Project (Arrow Right)"
        >
          <ChevronRight className="w-6 h-6 text-black" />
        </button>
      </div>

    </div>
  );
};
