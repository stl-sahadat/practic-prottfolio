import React, { useState } from 'react';
import { portfolioData } from '../../data/portfolioData';
import { soundManager } from '../../utils/sound';
import { assetUrl } from '../../utils/assets';
import { ExternalLink, Youtube, Linkedin, Terminal, Sparkles, Bot, Radio, Tv, Code2, Cpu } from 'lucide-react';

interface StudioRoomProps {
  onBack: () => void;
}

export const StudioRoom: React.FC<StudioRoomProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'agents' | 'content'>('agents');

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

  const agentItems = [
    {
      title: "Autonomous AI Web Builder Swarm",
      desc: "Multi-agent swarm that synthesizes full-stack applications in minutes with automated AST verification, reducing development cycles by 70%.",
      platform: "Agent Swarm",
      link: portfolioData.personal.github,
      badge: "LIVE SWARM",
      terminalCmd: "npx @agy/builder --swarm --agents=5 --auto-repair",
      status: "ONLINE • 60 FPS",
    },
    {
      title: "Cloud Expense Analytics Suite on Cloud Run",
      desc: "Containerized financial intelligence platform running sub-second calculations on Google Cloud Run with automated serverless scaling.",
      platform: "Google Cloud",
      link: "https://ais-pre-5outvodj2oly3dlanlrfxg-873905991312.asia-southeast1.run.app",
      badge: "CONTAINERIZED",
      terminalCmd: "gcloud run deploy expense-suite --region=asia-southeast1",
      status: "ACTIVE CLOUD RUN",
    },
    {
      title: "Enterprise RAG Knowledge Architecture",
      desc: "Multi-stage semantic search engine reducing LLM API consumption by 55% with hybrid vector indexing and reciprocal rank fusion.",
      platform: "Vector AI",
      link: portfolioData.personal.github,
      badge: "PRODUCTION RAG",
      terminalCmd: "rag-engine query --hybrid --top-k=10 --semantic-cache",
      status: "INDEX READY",
    },
    {
      title: "CrewAI Workflow Automation Swarm",
      desc: "Enterprise multi-agent swarm executing end-to-end competitive intelligence gathering and autonomous executive synthesis.",
      platform: "Multi-Agent",
      link: portfolioData.personal.github,
      badge: "CREWAI SWARM",
      terminalCmd: "python -m crewai.run --topology=hierarchical --critic",
      status: "RUNNING 24/7",
    },
  ];

  const contentItems = [
    {
      title: "YouTube Channel - Sahadat Automation",
      desc: "Autonomous AI workflows, prompt architecture masterclasses, and real-time multi-agent demonstrations.",
      platform: "YouTube",
      link: portfolioData.personal.youtube,
      badge: "VIDEO LAB",
      terminalCmd: "yt-dlp --channel @SahadatAutomation0",
      status: "STREAMING",
    },
    {
      title: "LinkedIn Engineering Briefs & Systems Architecture",
      desc: "In-depth case studies on agentic orchestration, token optimization strategies, and modern cloud deployment patterns.",
      platform: "LinkedIn",
      link: portfolioData.personal.linkedin,
      badge: "PUBLICATIONS",
      terminalCmd: "curl https://linkedin.com/in/mdsahadatconnact",
      status: "VERIFIED",
    },
    {
      title: "Open Source AI Repositories & Tooling",
      desc: "Community tools, prompt blueprints, and reproducible scaffolding for next-generation autonomous software builders.",
      platform: "GitHub",
      link: portfolioData.personal.github,
      badge: "OPEN SOURCE",
      terminalCmd: "git clone https://github.com/stl-sahadat/ai-tooling",
      status: "PUBLIC REPO",
    },
    {
      title: "Live Cloud Demonstration & Staging Enclave",
      desc: "Interactive live staging environment testing autonomous UI components, real-time telemetry, and microservices.",
      platform: "Production Staging",
      link: "https://ais-pre-5outvodj2oly3dlanlrfxg-873905991312.asia-southeast1.run.app",
      badge: "STAGING LAB",
      terminalCmd: "curl -I https://ais-pre-5outvodj2oly3dlanlrfxg.run.app",
      status: "HTTP 200 OK",
    },
  ];

  const currentItems = activeTab === 'agents' ? agentItems : contentItems;

  return (
    <div className="fixed inset-0 z-40 bg-[#f7f5f0] flex flex-col justify-between overflow-y-auto">
      {/* Background Paper Texture */}
      <div
        className="fixed inset-0 opacity-15 pointer-events-none bg-repeat"
        style={{ backgroundImage: `url('${assetUrl('/textures/paper-texture.webp')}')` }}
      />

      {/* Header */}
      <div className="relative z-10 px-6 py-6 flex items-center justify-between border-b-2 border-black/10 bg-white/60 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              soundManager.playDoorClose();
              onBack();
            }}
            className="sketch-btn px-4 py-2 font-sketch text-xs tracking-wider uppercase flex items-center gap-1.5 hover:scale-105 transition-transform"
          >
            <span>← Exit to Corridor</span>
          </button>
          <div>
            <h2 className="font-sketch text-xl sm:text-2xl text-black">The Studio</h2>
            <p className="font-hand text-base text-slate-600 -mt-1">
              Floating monitors with live AI Agent Swarms and Media Labs
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              soundManager.playHoverChime();
              setActiveTab('agents');
            }}
            className={`sketch-btn px-4 py-1.5 font-sketch text-xs transition-all ${
              activeTab === 'agents' ? 'bg-[#ffe873] scale-105 shadow-[2px_2px_0px_#000]' : 'bg-white'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5" /> AI Swarms
            </span>
          </button>
          <button
            onClick={() => {
              soundManager.playHoverChime();
              setActiveTab('content');
            }}
            className={`sketch-btn px-4 py-1.5 font-sketch text-xs transition-all ${
              activeTab === 'content' ? 'bg-[#ffe873] scale-105 shadow-[2px_2px_0px_#000]' : 'bg-white'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Tv className="w-3.5 h-3.5" /> Media & Labs
            </span>
          </button>
        </div>
      </div>

      {/* Studio Monitor Showcase */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10 flex-1 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {currentItems.map((item, idx) => (
            <div
              key={idx}
              className="p-6 rounded-lg bg-white border-2 border-black shadow-[6px_6px_0px_#000] hover:shadow-[10px_10px_0px_#000] hover:-translate-y-1 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Hand-drawn TV / Retro Monitor Bezel with authentic monitor_front texture overlay */}
                <div className="w-full h-48 rounded border-2 border-black bg-slate-950 p-4 text-green-400 font-mono text-xs flex flex-col justify-between mb-4 relative overflow-hidden shadow-inner">
                  {/* Subtle retro scanlines */}
                  <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px]" />
                  
                  {/* Authentic Retro Bezel overlay */}
                  <img
                    src={assetUrl('/textures/studio/monitor_front.webp')}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-30 mix-blend-screen"
                  />

                  <div className="relative z-10 flex items-center justify-between border-b border-green-800/80 pb-1.5">
                    <span className="flex items-center gap-1.5 text-green-300 font-bold">
                      <Terminal className="w-3.5 h-3.5 text-green-400" />
                      TERMINAL_NODE_0{idx + 1}
                    </span>
                    <span className="text-[10px] text-green-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-ping inline-block" />
                      {item.status}
                    </span>
                  </div>

                  <div className="relative z-10 space-y-1 my-auto">
                    <p className="text-white font-bold text-sm tracking-wide">{item.title}</p>
                    <div className="p-2 rounded bg-black/60 border border-green-900/60 text-green-400 font-mono text-[11px] truncate">
                      $ {item.terminalCmd}
                    </div>
                  </div>

                  <div className="relative z-10 flex justify-between text-[10px] text-slate-400 pt-1.5 border-t border-slate-800">
                    <span>SYS: LINUX_CONTAINER</span>
                    <span>ORCHESTRATOR: ACTIVE</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <span className="font-hand text-lg text-slate-700 uppercase tracking-wider font-semibold">
                    {item.platform}
                  </span>
                  <span className="font-sketch text-xs px-2.5 py-0.5 rounded bg-yellow-100 border border-yellow-400 text-yellow-950 font-bold">
                    {item.badge}
                  </span>
                </div>

                <h3 className="font-sketch text-xl sm:text-2xl text-black mb-2">{item.title}</h3>
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
                  className="sketch-btn px-4 py-1.5 font-sketch text-xs text-black bg-[#ffe873] flex items-center gap-1.5 hover:scale-105 transition-transform"
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
        The Studio is running live multi-agent models, YouTube demonstrations, and telemetry pipelines
      </div>
    </div>
  );
};
