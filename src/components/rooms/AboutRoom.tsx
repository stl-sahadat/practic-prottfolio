import React from 'react';
import { portfolioData } from '../../data/portfolioData';
import { soundManager } from '../../utils/sound';
import { assetUrl } from '../../utils/assets';
import { Award, Compass, Plane, CheckCircle2, UserCheck } from 'lucide-react';

interface AboutRoomProps {
  onBack: () => void;
}

export const AboutRoom: React.FC<AboutRoomProps> = ({ onBack }) => {
  const { personal, process, education } = portfolioData;

  // Keyboard navigation to exit back to corridor
  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        soundManager.playDoorClose();
        onBack();
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('keydown', handleKey);
    };
  }, [onBack]);

  return (
    <div className="fixed inset-0 z-40 bg-[#f7f5f0] flex flex-col justify-between overflow-y-auto">
      <div
        className="fixed inset-0 opacity-15 pointer-events-none bg-repeat"
        style={{ backgroundImage: `url('${assetUrl('/textures/paper-texture.webp')}')` }}
      />

      {/* Header */}
      <div className="relative z-10 px-6 py-6 flex items-center justify-between border-b-2 border-black/10 bg-white/50 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              soundManager.playDoorClose();
              onBack();
            }}
            className="sketch-btn px-4 py-2 font-sketch text-xs tracking-wider uppercase flex items-center gap-1.5"
          >
            <span>← Exit to Corridor</span>
          </button>
          <div>
            <h2 className="font-sketch text-xl sm:text-2xl text-black">The About Sky</h2>
            <p className="font-hand text-base text-slate-600 -mt-1">
              Flight path through Md Sahadat Hossain's mission & milestones
            </p>
          </div>
        </div>

        <div />
      </div>

      {/* Main Story Container */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12 flex-1 w-full space-y-12">
        
        {/* Profile Intro Card */}
        <div className="p-8 rounded-lg bg-white border-2 border-black shadow-[8px_8px_0px_#000] grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-4 flex justify-center">
            <div className="w-48 h-48 rounded-lg border-2 border-black overflow-hidden shadow-[4px_4px_0px_#000] bg-slate-100 rotate-[-2deg]">
              <img
                src={assetUrl('/images/avatar-hero.png')}
                alt="Md Sahadat Hossain"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          </div>

          <div className="md:col-span-8 space-y-3">
            <div className="inline-flex items-center gap-1.5 font-hand text-lg text-amber-800 bg-amber-50 px-3 py-0.5 rounded border border-amber-300">
              <UserCheck className="w-4 h-4" /> Available Worldwide for Architecture
            </div>
            <h3 className="font-sketch text-2xl sm:text-4xl text-black">{personal.name}</h3>
            <p className="font-hand text-xl text-slate-700 font-bold -mt-1">{personal.role}</p>
            <p className="font-sans text-sm text-slate-700 leading-relaxed font-light">
              {personal.bio}
            </p>
            <div className="pt-2 font-hand text-base text-slate-500">
              📍 {personal.location}
            </div>
          </div>
        </div>

        {/* 5-Step Methodology */}
        <div className="space-y-6">
          <div className="text-center">
            <h4 className="font-sketch text-2xl text-black">The 5-Step Engineering Flight</h4>
            <p className="font-hand text-lg text-slate-600">From initial discovery to self-healing swarms</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {process.map((step) => (
              <div
                key={step.step}
                className="p-5 rounded-lg bg-white border-2 border-black shadow-[4px_4px_0px_#000] flex flex-col justify-between hover:-translate-y-1 transition-all"
              >
                <div>
                  <span className="font-sketch text-2xl text-amber-700 block mb-1">
                    #{step.step}
                  </span>
                  <h5 className="font-sketch text-sm text-black mb-2">{step.title}</h5>
                  <p className="text-xs font-sans text-slate-600 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Academic Foundation & Continuous Research */}
        <div className="p-6 rounded-lg bg-white border-2 border-black shadow-[6px_6px_0px_#000]">
          <h4 className="font-sketch text-xl text-black mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-700" /> Academic & Systems Rigor
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {education.map((edu, idx) => (
              <div key={idx} className="p-4 rounded border border-slate-300 bg-slate-50">
                <span className="font-hand text-base text-slate-500">{edu.year}</span>
                <h5 className="font-sketch text-base text-black mt-0.5">{edu.title}</h5>
                <p className="text-xs font-sans text-slate-600 mt-1">{edu.institution}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="relative z-10 px-6 py-4 border-t-2 border-black/10 text-center font-hand text-lg text-slate-600 bg-white/50">
        "Autonomous AI is about engineering intelligent leverage that slashes operational costs and scales output."
      </div>
    </div>
  );
};
