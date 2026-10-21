import React, { useState } from 'react';
import { Volume2, VolumeX, Trophy, Map as MapIcon, X, ArrowLeft, Palette } from 'lucide-react';
import { soundManager } from '../../utils/sound';

export type ViewMode = 'entrance' | 'corridor' | 'gallery' | 'studio' | 'about' | 'contact';

interface PaperUIProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  unlockedAchievements: string[];
  theme?: 'classic' | 'blueprint';
  onToggleTheme?: () => void;
}

export const PaperUI: React.FC<PaperUIProps> = ({
  currentView,
  onNavigate,
  unlockedAchievements,
  theme = 'classic',
  onToggleTheme,
}) => {
  const [soundOn, setSoundOn] = useState(true);
  const [showMap, setShowMap] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null);

  const isBlueprint = theme === 'blueprint';

  // Only render PaperUI when inside the corridor
  if (currentView !== 'corridor') {
    return null;
  }

  const toggleSound = () => {
    const newState = soundManager.toggle();
    setSoundOn(newState);
    if (newState) soundManager.playAchievement();
  };

  const handleRoomTeleport = (room: 'gallery' | 'studio' | 'about' | 'contact') => {
    soundManager.playDoorOpen();
    setShowMap(false);
    onNavigate(room);
  };

  return (
    <>
      {/* Top Left: Exit Room button when inside a room */}
      {currentView !== 'corridor' && (
        <div className="fixed top-5 left-5 z-50">
          <button
            onClick={() => {
              soundManager.playDoorClose();
              onNavigate('corridor');
            }}
            className={`sketch-btn px-4 py-2 font-sketch text-xs flex items-center gap-2 rounded-lg ${
              isBlueprint ? 'bg-[#132238] text-[#cce8ff] border-[#66aaff]' : 'bg-white text-black border-black'
            }`}
            title="Return to Corridor"
          >
            <ArrowLeft className={`w-4 h-4 ${isBlueprint ? 'text-[#66aaff]' : 'text-black'}`} />
            <span>Back to corridor</span>
          </button>
        </div>
      )}

      {/* Top Left signature when in Corridor */}
      {currentView === 'corridor' && (
        <div className="fixed top-5 left-5 z-40">
          <div
            className={`sketch-btn px-3 py-1.5 rounded-lg flex items-center gap-2 text-left backdrop-blur-sm ${
              isBlueprint
                ? 'bg-[#132238]/85 text-[#e0efff] border-[#66aaff]'
                : 'bg-white/80 text-black border-black'
            }`}
          >
            <span className="font-sketch text-xs tracking-wide">
              MD SAHADAT HOSSAIN
            </span>
            <span className={`hidden sm:inline font-hand text-xs ${isBlueprint ? 'text-[#8bc5ff]' : 'text-slate-500'}`}>
              • AI Agent Architect
            </span>
          </div>
        </div>
      )}

      {/* Top Right: Paper Control Icons (Theme, Map, Audio, Trophy) */}
      <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5">
        {/* Theme Switcher (Classic Paper vs AI Blueprint Mode) */}
        {onToggleTheme && (
          <button
            onClick={() => {
              soundManager.playHoverChime();
              onToggleTheme();
            }}
            className={`sketch-btn w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              isBlueprint
                ? 'bg-[#002b4d] border-[#66aaff] text-[#66aaff] shadow-[2px_2px_0px_#66aaff]'
                : 'bg-white border-black text-black'
            }`}
            title={isBlueprint ? 'Switch to Vintage Paper Mode' : 'Switch to AI Blueprint Mode'}
          >
            <Palette className="w-5 h-5" />
          </button>
        )}

        {/* Map Button */}
        <button
          onClick={() => {
            soundManager.playHoverChime();
            setShowMap(true);
            setShowAchievements(false);
          }}
          className={`sketch-btn w-10 h-10 rounded-full flex items-center justify-center ${
            isBlueprint ? 'bg-[#132238] border-[#66aaff] text-[#cce8ff]' : 'bg-white border-black text-black'
          }`}
          title="Open Sketchbook Map"
        >
          <MapIcon className="w-5 h-5" />
        </button>

        {/* Audio Toggle */}
        <button
          onClick={toggleSound}
          className={`sketch-btn w-10 h-10 rounded-full flex items-center justify-center ${
            isBlueprint ? 'bg-[#132238] border-[#66aaff] text-[#cce8ff]' : 'bg-white border-black text-black'
          }`}
          title={soundOn ? 'Mute Audio' : 'Unmute Audio'}
        >
          {soundOn ? (
            <Volume2 className="w-5 h-5" />
          ) : (
            <VolumeX className="w-5 h-5 text-slate-400" />
          )}
        </button>

        {/* Achievements Trophy */}
        <button
          onClick={() => {
            soundManager.playHoverChime();
            setShowAchievements(!showAchievements);
            setShowMap(false);
          }}
          className={`sketch-btn w-10 h-10 rounded-full flex items-center justify-center relative ${
            isBlueprint ? 'bg-[#132238] border-[#66aaff] text-[#ffdd55]' : 'bg-white border-black text-amber-700'
          }`}
          title="Achievements"
        >
          <Trophy className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 bg-[#ffe873] border border-black text-[10px] font-sketch font-bold w-4 h-4 rounded-full flex items-center justify-center text-black">
            {unlockedAchievements.length}
          </span>
        </button>
      </div>

      {/* Interactive Sketchbook Map Modal */}
      {showMap && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="relative max-w-xl w-full bg-[#f7f5f0] border-2 border-black rounded-xl p-6 shadow-[10px_10px_0px_#000]">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b-2 border-black/10 pb-3 mb-4">
              <h3 className="font-sketch text-lg sm:text-xl text-black flex items-center gap-2">
                <MapIcon className="w-5 h-5 text-amber-800" /> SKETCHBOOK MAP
              </h3>
              <button
                onClick={() => setShowMap(false)}
                className="sketch-btn p-1.5 rounded-full"
                title="Close Map"
              >
                <X className="w-4 h-4 text-black" />
              </button>
            </div>

            {/* Map Sheet Container */}
            <div className="relative w-full aspect-[4/3] rounded-lg border-2 border-black overflow-hidden bg-white shadow-inner">
              <img
                src="/images/map.webp"
                alt="Corridor Map"
                className="w-full h-full object-cover select-none"
              />

              {/* Painted Reveal Layers */}
              {hoveredRoom === 'about' && (
                <img
                  src="/images/map_about_painted.webp"
                  alt="About Painted"
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-300"
                />
              )}
              {hoveredRoom === 'gallery' && (
                <img
                  src="/images/map_gallery_painted.webp"
                  alt="Gallery Painted"
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-300"
                />
              )}
              {hoveredRoom === 'contact' && (
                <img
                  src="/images/map_contact_painted.webp"
                  alt="Contact Painted"
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-300"
                />
              )}
              {hoveredRoom === 'studio' && (
                <img
                  src="/images/map_studio_painted.webp"
                  alt="Studio Painted"
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-300"
                />
              )}

              {/* Interactive Teleport Zones */}
              {/* About: Top Left */}
              <button
                onClick={() => handleRoomTeleport('about')}
                onMouseEnter={() => setHoveredRoom('about')}
                onMouseLeave={() => setHoveredRoom(null)}
                className="absolute top-[18%] left-[12%] w-[32%] h-[32%] flex flex-col items-center justify-center sketch-btn bg-white/70 hover:bg-[#ffe873]/90 rounded-lg p-2 transition-all hover:scale-105"
              >
                <span className="font-sketch text-xs sm:text-sm text-black font-bold">03. ABOUT</span>
                <span className="font-hand text-[11px] text-slate-700">Sky Flight & Bio</span>
              </button>

              {/* Gallery: Bottom Left */}
              <button
                onClick={() => handleRoomTeleport('gallery')}
                onMouseEnter={() => setHoveredRoom('gallery')}
                onMouseLeave={() => setHoveredRoom(null)}
                className="absolute bottom-[16%] left-[12%] w-[32%] h-[32%] flex flex-col items-center justify-center sketch-btn bg-white/70 hover:bg-[#ffe873]/90 rounded-lg p-2 transition-all hover:scale-105"
              >
                <span className="font-sketch text-xs sm:text-sm text-black font-bold">01. GALLERY</span>
                <span className="font-hand text-[11px] text-slate-700">Selected Work</span>
              </button>

              {/* Contact: Top Right */}
              <button
                onClick={() => handleRoomTeleport('contact')}
                onMouseEnter={() => setHoveredRoom('contact')}
                onMouseLeave={() => setHoveredRoom(null)}
                className="absolute top-[18%] right-[12%] w-[32%] h-[32%] flex flex-col items-center justify-center sketch-btn bg-white/70 hover:bg-[#ffe873]/90 rounded-lg p-2 transition-all hover:scale-105"
              >
                <span className="font-sketch text-xs sm:text-sm text-black font-bold">04. CONTACT</span>
                <span className="font-hand text-[11px] text-slate-700">Seashore & Message</span>
              </button>

              {/* Studio: Bottom Right */}
              <button
                onClick={() => handleRoomTeleport('studio')}
                onMouseEnter={() => setHoveredRoom('studio')}
                onMouseLeave={() => setHoveredRoom(null)}
                className="absolute bottom-[16%] right-[12%] w-[32%] h-[32%] flex flex-col items-center justify-center sketch-btn bg-white/70 hover:bg-[#ffe873]/90 rounded-lg p-2 transition-all hover:scale-105"
              >
                <span className="font-sketch text-xs sm:text-sm text-black font-bold">02. STUDIO</span>
                <span className="font-hand text-[11px] text-slate-700">AI Agents & Media</span>
              </button>
            </div>

            <p className="font-hand text-sm text-slate-600 text-center mt-3">
              Click any room card on the map to teleport directly inside
            </p>
          </div>
        </div>
      )}

      {/* Achievements Dropdown Modal */}
      {showAchievements && (
        <div className="fixed top-18 right-5 w-80 bg-white border-2 border-black rounded-lg p-5 shadow-[8px_8px_0px_#000] z-50 animate-in fade-in">
          <div className="flex items-center justify-between border-b-2 border-black/10 pb-2 mb-3">
            <h4 className="font-sketch text-base text-black flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-700" /> Sketchbook Badges
            </h4>
            <button
              onClick={() => setShowAchievements(false)}
              className="font-sketch text-xs text-slate-500 hover:text-black"
            >
              ✕
            </button>
          </div>

          <div className="space-y-2 font-sans text-xs">
            <div className={`p-2 rounded border ${unlockedAchievements.includes('wanderer') ? 'bg-yellow-50 border-yellow-400' : 'bg-slate-50 border-slate-200 opacity-50'}`}>
              <div className="font-sketch text-xs text-black">🚶 Wanderer</div>
              <div className="font-hand text-sm text-slate-600">Scrolled through the infinite corridor</div>
            </div>
            <div className={`p-2 rounded border ${unlockedAchievements.includes('companion_ally') ? 'bg-yellow-50 border-yellow-400' : 'bg-slate-50 border-slate-200 opacity-50'}`}>
              <div className="font-sketch text-xs text-black">🤖 AI Architect Ally</div>
              <div className="font-hand text-sm text-slate-600">Met the autonomous companion drone</div>
            </div>
            <div className={`p-2 rounded border ${unlockedAchievements.includes('art_critic') ? 'bg-yellow-50 border-yellow-400' : 'bg-slate-50 border-slate-200 opacity-50'}`}>
              <div className="font-sketch text-xs text-black">🎨 Art Critic</div>
              <div className="font-hand text-sm text-slate-600">Explored projects in The Gallery</div>
            </div>
            <div className={`p-2 rounded border ${unlockedAchievements.includes('studio_visitor') ? 'bg-yellow-50 border-yellow-400' : 'bg-slate-50 border-slate-200 opacity-50'}`}>
              <div className="font-sketch text-xs text-black">📺 Studio Director</div>
              <div className="font-hand text-sm text-slate-600">Inspected AI Agent Swarms and Content</div>
            </div>
            <div className={`p-2 rounded border ${unlockedAchievements.includes('sky_walker') ? 'bg-yellow-50 border-yellow-400' : 'bg-slate-50 border-slate-200 opacity-50'}`}>
              <div className="font-sketch text-xs text-black">✈️ Sky Walker</div>
              <div className="font-hand text-sm text-slate-600">Flew through Sahadat's mission in The About Sky</div>
            </div>
            <div className={`p-2 rounded border ${unlockedAchievements.includes('sociable') ? 'bg-yellow-50 border-yellow-400' : 'bg-slate-50 border-slate-200 opacity-50'}`}>
              <div className="font-sketch text-xs text-black">🌊 Shore Connector</div>
              <div className="font-hand text-sm text-slate-600">Visited the Contact beach</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
