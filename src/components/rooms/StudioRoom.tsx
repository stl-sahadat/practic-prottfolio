import React, { useState } from 'react';
import { portfolioData } from '../../data/portfolioData';
import { soundManager } from '../../utils/sound';
import { ExternalLink, Youtube, Linkedin, Terminal, Sparkles, Bot } from 'lucide-react';

interface StudioRoomProps {
  onBack: () => void;
}

export const StudioRoom: React.FC<StudioRoomProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'agents' | 'content'>('agents');

  // Mouse backward pull, drag, and keyboard navigation to exit back to corridor
  React.useEffect(() => {
    let lastWheelTime = 0;
    const handleWheel = (e: WheelEvent) => {
      // Pulling mouse wheel backward/down (positive deltaY)
      if (e.deltaY > 40 && Date.now() - lastWheelTime > 500) {
        lastWheelTime = Date.now();
        soundManager.playDoorClose();
        onBack();
      }
    };

    let startY = 0;
    const handlePointerDown = (e: PointerEvent) => {
      startY = e.clientY;
    };
    const handlePointerUp = (e: PointerEvent) => {
      const deltaY = e.clientY - startY;
      if (deltaY > 60) {
        soundManager.playDoorClose();
        onBack();
      }
    };

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
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
  }, [onBack]);

  const studioItems = [
    {
      title: "Autonomous AI Web Builder Swarm",
      desc: "Multi-agent swarm that synthesizes full-stack applications in minutes with automated AST verification.",
      platform: "Agent Swarm",
      link: portfolioData.personal.github,
      badge: "LIVE SWARM",
    },
    {
      title: "YouTube Channel - Sahadat Automation",
      desc: "Autonomous AI workflows, prompt architecture masterclasses, and real-time agent demonstrations.",
      platform: "YouTube",
      link: portfolioData.personal.youtube,
      badge: "VIDEO LAB",
    },
    {
      title: "Cloud Expense Analytics Suite on Cloud Run",
      desc: "Containerized financial intelligence platform running sub-second calculations with zero operational overhead.",
      platform: "Google Cloud",
      link: "https://ais-pre-5outvodj2oly3dlanlrfxg-873905991312.asia-southeast1.run.app",
      badge: "CONTAINERIZED",
    },
    {
      title: "Enterprise RAG Knowledge Architecture",
      desc: "Multi-stage semantic search engine reducing LLM API consumption by 55% with hybrid vector indexing.",
      platform: "Vector AI",
      link: portfolioData.personal.github,
      badge: "PRODUCTION RAG",
    },
  ];

  return (
    <div className="fixed inset-0 z-40 bg-[#f7f5f0] flex flex-col justify-between overflow-y-auto">
      <div
        className="fixed inset-0 opacity-15 pointer-events-none bg-repeat"
        style={{ backgroundImage: `url('/textures/paper-texture.webp')` }}
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
            <h2 className="font-sketch text-xl sm:text-2xl text-black">The Studio</h2>
            <p className="font-hand text-base text-slate-600 -mt-1">
              Floating monitors with live AI Agent Swarms and Content
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              soundManager.playHoverChime();
              setActiveTab('agents');
            }}
            className={`sketch-btn px-4 py-1.5 font-sketch text-xs ${
              activeTab === 'agents' ? 'bg-[#ffe873]' : 'bg-white'
            }`}
          >
            AI Swarms
          </button>
          <button
            onClick={() => {
              soundManager.playHoverChime();
              setActiveTab('content');
            }}
            className={`sketch-btn px-4 py-1.5 font-sketch text-xs ${
              activeTab === 'content' ? 'bg-[#ffe873]' : 'bg-white'
            }`}
          >
            Publications
          </button>
        </div>
      </div>

      {/* Studio Monitor Showcase */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12 flex-1 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {studioItems.map((item, idx) => (
            <div
              key={idx}
              className="p-6 rounded-lg bg-white border-2 border-black shadow-[6px_6px_0px_#000] hover:shadow-[10px_10px_0px_#000] hover:-translate-y-1 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Hand-drawn TV / Monitor outline */}
                <div className="w-full h-44 rounded border-2 border-black bg-slate-900 p-4 text-green-400 font-mono text-xs flex flex-col justify-between mb-4 relative overflow-hidden">
                  <div className="flex items-center justify-between border-b border-green-800 pb-1">
                    <span className="flex items-center gap-1">
                      <Bot className="w-3.5 h-3.5" /> AGENT_MONITOR_0{idx + 1}
                    </span>
                    <span className="text-[10px] text-green-500 animate-pulse">● ONLINE</span>
                  </div>

                  <div className="space-y-1 my-auto">
                    <p className="text-white font-bold">{item.title}</p>
                    <p className="text-slate-400 text-[11px] line-clamp-2">{item.desc}</p>
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800">
                    <span>SYS: GCP_CLOUD_RUN</span>
                    <span>ORCHESTRATOR: ACTIVE</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <span className="font-hand text-lg text-slate-600 uppercase tracking-wider">
                    {item.platform}
                  </span>
                  <span className="font-sketch text-xs px-2.5 py-0.5 rounded bg-yellow-100 border border-yellow-300 text-yellow-900">
                    {item.badge}
                  </span>
                </div>

                <h3 className="font-sketch text-xl text-black mb-2">{item.title}</h3>
                <p className="text-xs font-sans text-slate-700 leading-relaxed mb-4">
                  {item.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-black/10 flex items-center justify-between">
                <span className="font-hand text-base text-slate-600">Open Production Node</span>
                <a
                  href={item.link}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => soundManager.playAchievement()}
                  className="sketch-btn px-4 py-1.5 font-sketch text-xs text-black bg-[#ffe873] flex items-center gap-1.5"
                >
                  <span>Launch</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 px-6 py-4 border-t-2 border-black/10 text-center font-hand text-lg text-slate-600 bg-white/50">
        The Studio is running live multi-agent models and telemetry pipelines
      </div>
    </div>
  );
};
