import React, { useState } from 'react';
import { portfolioData } from '../../data/portfolioData';
import { soundManager } from '../../utils/sound';
import { assetUrl } from '../../utils/assets';
import { sendContactMessage } from '../../services/contactService';
import confetti from 'canvas-confetti';
import {
  Mail,
  Phone,
  Github,
  Linkedin,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  MessageCircle,
  Youtube,
  ExternalLink,
} from 'lucide-react';

interface ContactRoomProps {
  onBack: () => void;
}

export const ContactRoom: React.FC<ContactRoomProps> = ({ onBack }) => {
  const { personal } = portfolioData;
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    message: '',
    honeypot: '',
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [successInfo, setSuccessInfo] = useState<string>('');

  // Keyboard navigation to exit back to corridor
  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const result = await sendContactMessage({
        name: formState.name,
        email: formState.email,
        message: formState.message,
        honeypot: formState.honeypot,
      });

      soundManager.playAchievement();
      setSubmitted(true);
      setSuccessInfo(result.message);

      try {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Ignored
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to send note. Please check your inputs or send via email.');
    } finally {
      setLoading(false);
    }
  };

  const handleDirectGmail = () => {
    const subject = encodeURIComponent('Inquiry: AI Agent Architecture Collaboration');
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${personal.email}&su=${subject}`;
    window.open(gmailUrl, '_blank');
  };

  const socialLinks = [
    { label: "Email", val: personal.email, href: `mailto:${personal.email}`, icon: <Mail className="w-5 h-5 text-amber-800" /> },
    { label: "Phone", val: personal.phone, href: `tel:${personal.phone}`, icon: <Phone className="w-5 h-5 text-amber-800" /> },
    { label: "LinkedIn", val: "mdsahadatconnact", href: personal.linkedin, icon: <Linkedin className="w-5 h-5 text-amber-800" /> },
    { label: "GitHub", val: "stl-sahadat", href: personal.github, icon: <Github className="w-5 h-5 text-amber-800" /> },
    { label: "Telegram", val: "@stl_sahadat", href: personal.telegram, icon: <MessageCircle className="w-5 h-5 text-amber-800" /> },
    { label: "YouTube", val: "@SahadatAutomation0", href: personal.youtube, icon: <Youtube className="w-5 h-5 text-amber-800" /> },
  ];

  return (
    <div className="fixed inset-0 z-40 bg-[#f7f5f0] flex flex-col justify-between overflow-y-auto">
      <div
        className="fixed inset-0 opacity-15 pointer-events-none bg-repeat"
        style={{ backgroundImage: `url('${assetUrl('/textures/paper-texture.webp')}')` }}
      />
      {/* Hand-drawn Seaside Lighthouse & Sailboat Silhouette */}
      <img
        src={assetUrl('/textures/contact/latarnia.webp')}
        alt=""
        className="fixed -bottom-10 right-4 w-40 sm:w-56 opacity-15 pointer-events-none select-none z-0"
      />
      <img
        src={assetUrl('/textures/contact/statek.webp')}
        alt=""
        className="fixed top-24 right-12 w-28 sm:w-40 opacity-10 pointer-events-none select-none z-0"
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
            <h2 className="font-sketch text-xl sm:text-2xl text-black">The Contact Shore</h2>
            <p className="font-hand text-base text-slate-600 -mt-1">
              Floating barrels on the seaside — connect directly with Sahadat
            </p>
          </div>
        </div>
      </div>

      {/* Main Shore Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12 flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Column: Floating Barrels & Direct Endpoints */}
        <div className="lg:col-span-6 space-y-6">
          <div className="p-6 rounded-lg bg-white border-2 border-black shadow-[6px_6px_0px_#000]">
            <h3 className="font-sketch text-xl sm:text-2xl text-black mb-2">Direct Communication Barrels</h3>
            <p className="font-hand text-base text-slate-600 mb-6">
              Click any barrel or channel below to connect directly:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {socialLinks.map((s, idx) => (
                <a
                  key={idx}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => soundManager.playHoverChime()}
                  className="p-3 rounded border-2 border-black bg-slate-50 hover:bg-[#ffe873] hover:-translate-y-1 transition-all flex items-center gap-3 shadow-[2px_2px_0px_#000]"
                >
                  <div className="p-2 rounded bg-white border border-black shrink-0">
                    {s.icon}
                  </div>
                  <div className="overflow-hidden">
                    <span className="font-sketch text-xs text-black block">{s.label}</span>
                    <span className="font-hand text-sm text-slate-700 truncate block">{s.val}</span>
                  </div>
                </a>
              ))}
            </div>

            {/* Direct Gmail One-Click Shortcut */}
            <div className="mt-5 pt-4 border-t-2 border-dashed border-black/20 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="font-hand text-sm text-slate-700">Prefer composing in Gmail?</span>
              <button
                onClick={handleDirectGmail}
                className="sketch-btn px-4 py-2 font-sketch text-xs text-black bg-[#ffe873] flex items-center gap-1.5"
              >
                <Mail className="w-4 h-4" />
                <span>Open in Gmail Web</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="p-6 rounded-lg bg-white border-2 border-black shadow-[6px_6px_0px_#000]">
            <h4 className="font-sketch text-lg text-black mb-1">Architecture Inquiries & Advisory</h4>
            <p className="text-xs font-sans text-slate-700 leading-relaxed">
              Available for full-time executive advisory, autonomous multi-agent engineering, and custom cloud architecture contracts worldwide.
            </p>
          </div>
        </div>

        {/* Right Column: Hand-drawn Paper Contact Form */}
        <div className="lg:col-span-6">
          <div className="p-8 rounded-lg bg-white border-3 border-black shadow-[10px_10px_0px_#000] rotate-[0.5deg]">
            <h3 className="font-sketch text-2xl text-black mb-1">Send a Paper Note</h3>
            <p className="font-hand text-base text-slate-600 mb-6">
              Write a message directly to Sahadat's personal inbox
            </p>

            {/* Error Notification Banner */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded border-2 border-red-500 bg-red-50 text-red-800 text-xs font-sans flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {submitted ? (
              <div className="p-6 rounded border-2 border-green-600 bg-green-50 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto" />
                <h4 className="font-sketch text-xl text-green-900">Note Sent Successfully!</h4>
                <p className="font-hand text-lg text-green-800">
                  {successInfo || 'Thank you! Sahadat will review your message and reply promptly.'}
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormState({ name: '', email: '', message: '', honeypot: '' });
                  }}
                  className="sketch-btn px-4 py-2 font-sketch text-xs text-black bg-white mt-2"
                >
                  Send Another Note
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Anti-spam Honeypot (Invisible to humans, catches bots) */}
                <input
                  type="text"
                  name="website_url_hp"
                  value={formState.honeypot}
                  onChange={(e) => setFormState({ ...formState, honeypot: e.target.value })}
                  style={{ display: 'none' }}
                  tabIndex={-1}
                  autoComplete="off"
                />

                <div>
                  <label className="block font-sketch text-xs text-black mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    placeholder="e.g. John Doe"
                    disabled={loading}
                    className="w-full px-4 py-2.5 rounded border-2 border-black font-sans text-sm bg-slate-50 focus:bg-white focus:outline-none disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block font-sketch text-xs text-black mb-1">Your Email</label>
                  <input
                    type="email"
                    required
                    value={formState.email}
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                    placeholder="john@example.com"
                    disabled={loading}
                    className="w-full px-4 py-2.5 rounded border-2 border-black font-sans text-sm bg-slate-50 focus:bg-white focus:outline-none disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block font-sketch text-xs text-black mb-1">Your Message or Project Idea</label>
                  <textarea
                    rows={4}
                    required
                    value={formState.message}
                    onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                    placeholder="Tell me about your architecture goals or autonomous agent requirements..."
                    disabled={loading}
                    className="w-full px-4 py-2.5 rounded border-2 border-black font-sans text-sm bg-slate-50 focus:bg-white focus:outline-none disabled:opacity-50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 sketch-btn font-sketch text-sm text-black bg-[#ffe873] flex items-center justify-center gap-2 hover:brightness-105 disabled:opacity-75 transition-all"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending Hand-Drawn Note...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Hand-Drawn Note</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="relative z-10 px-6 py-4 border-t-2 border-black/10 text-center font-hand text-lg text-slate-600 bg-white/50">
        Barura, Cumilla, Chattogram, Bangladesh • Available Worldwide
      </div>
    </div>
  );
};
