import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  RotateCcw,
  X,
  Sparkles,
  Bot,
  Send,
  Droplets,
  Sprout,
  Sun,
  ShieldAlert,
  CalendarCheck,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../lib/api';
import { Farm, UserProfile, CropCycle, WeatherData } from '../types';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFarm: Farm;
  profile: UserProfile | null;
  cropCycle?: CropCycle;
  weather?: WeatherData | null;
  onTaskCreated?: () => void;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  currentFarm,
  profile,
  cropCycle,
  weather,
  onTaskCreated,
}) => {
  const [state, setState] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');
  const [transcript, setTranscript] = useState('');
  const [spokenResponse, setSpokenResponse] = useState('');
  const [actionableGuidance, setActionableGuidance] = useState('');
  const [actionTaken, setActionTaken] = useState<string | null>(null);
  const [quickStats, setQuickStats] = useState<Record<string, string>>({});
  const [isMuted, setIsMuted] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [speechSupported, setSpeechSupported] = useState(true);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize Speech Recognition & Synthesis
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = false;
          recognition.interimResults = true;
          recognition.lang = 'en-IN';

          recognition.onresult = (event: any) => {
            let currentText = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
              currentText += event.results[i][0].transcript;
            }
            setTranscript(currentText);
          };

          recognition.onerror = (event: any) => {
            console.warn('Speech recognition notice:', event.error);
            if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
              setSpeechSupported(false);
            }
            setState('idle');
          };

          recognition.onend = () => {
            if (state === 'listening') {
              setState('idle');
            }
          };

          recognitionRef.current = recognition;
        } catch (e) {
          setSpeechSupported(false);
        }
      } else {
        setSpeechSupported(false);
      }

      if ('speechSynthesis' in window) {
        synthRef.current = window.speechSynthesis;
      }
    }

    return () => {
      stopVoice();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, []);

  // When modal opens, start listening or welcome farmer
  useEffect(() => {
    if (isOpen) {
      setTranscript('');
      setSpokenResponse('');
      setActionableGuidance('');
      setActionTaken(null);
      // Greet and prompt
      const welcome = `Hello ${profile?.display_name || 'Farmer'}! I am AgriGenius Alexa. I am monitoring ${currentFarm?.farm_name || 'your farm'} with ${currentFarm?.soil_moisture ?? 42}% soil moisture. What can I do for you today?`;
      setSpokenResponse(welcome);
      speakText(welcome);
    } else {
      stopVoice();
    }
  }, [isOpen, currentFarm?.id]);

  const speakText = (text: string) => {
    if (!synthRef.current || isMuted) return;
    try {
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.05;
      utterance.lang = 'en-US';

      // Pick natural voice if available
      const voices = synthRef.current.getVoices();
      const friendlyVoice = voices.find(
        (v) => v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Google') || v.lang.startsWith('en')
      );
      if (friendlyVoice) utterance.voice = friendlyVoice;

      utterance.onstart = () => setState('speaking');
      utterance.onend = () => setState('idle');
      utterance.onerror = () => setState('idle');

      utteranceRef.current = utterance;
      synthRef.current.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
      setState('idle');
    }
  };

  const stopVoice = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setState('idle');
  };

  const startListening = () => {
    stopVoice();
    setTranscript('');
    setActionTaken(null);
    if (!recognitionRef.current) {
      setState('idle');
      return;
    }
    try {
      setState('listening');
      recognitionRef.current.start();
    } catch (err) {
      console.warn('Recognition start retry:', err);
      try {
        recognitionRef.current.abort();
        setTimeout(() => {
          recognitionRef.current.start();
          setState('listening');
        }, 150);
      } catch {
        setState('idle');
      }
    }
  };

  const handleSendQuery = async (queryText: string) => {
    if (!queryText.trim()) return;
    stopVoice();
    setState('processing');
    setTranscript(queryText);

    try {
      const res = await api.voiceAssistantQuery({
        query: queryText,
        farmId: currentFarm?.id,
        language: profile?.preferred_language || 'en',
      });

      setSpokenResponse(res.spokenResponse);
      setActionableGuidance(res.actionableGuidance);
      setQuickStats(res.quickStats || {});
      if (res.actionTaken) {
        setActionTaken(res.actionTaken);
        if (onTaskCreated) onTaskCreated();
      }

      speakText(res.spokenResponse);
    } catch (err: any) {
      const errMsg = `I could not complete your request: ${err.message || 'Network issue'}. Please try asking again.`;
      setSpokenResponse(errMsg);
      speakText(errMsg);
    } finally {
      setManualInput('');
    }
  };

  if (!isOpen) return null;

  const quickPrompts = [
    { label: '📈 Give farm analytics', query: 'Give me the farm analytics, net profit and revenue report' },
    { label: '💧 Water need today?', query: 'How much irrigation water does my farm need today?' },
    { label: '🐛 Check pest risks', query: 'What should I scout for pests or diseases on my tomato crop this week?' },
    { label: '💰 Mandi price check', query: 'What is today market price in Nashik APMC mandi?' },
    { label: '📋 Schedule drip irrigation', query: 'Schedule drip irrigation for 2.5 hours tomorrow morning' },
    { label: '📊 Status briefing', query: 'Give me a complete status briefing of my active land and soil' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-stone-900 via-stone-900 to-stone-950 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl text-white overflow-hidden">
        {/* Alexa Ambient Glow Ring Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-72 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="relative flex items-center justify-between pb-4 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-inner">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-white">AgriGenius Alexa</h3>
                <span className="text-[10px] uppercase font-bold tracking-widest bg-cyan-950 text-cyan-300 border border-cyan-700/50 px-2 py-0.5 rounded-full">
                  Voice Assistant
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Personalized for {profile?.display_name || 'Farmer'} • {currentFarm?.farm_name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsMuted(!isMuted);
                if (!isMuted && synthRef.current) synthRef.current.cancel();
              }}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                isMuted
                  ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                  : 'bg-stone-800 text-stone-300 hover:text-white'
              }`}
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              onClick={() => {
                stopVoice();
                onClose();
              }}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition-all cursor-pointer"
              aria-label="Close Voice Assistant"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Central Alexa Pulsing Orb */}
        <div className="relative flex flex-col items-center justify-center py-6">
          <div className="relative flex items-center justify-center">
            {/* Outer pulsating Alexa ring */}
            <div
              className={`absolute rounded-full transition-all duration-700 ${
                state === 'listening'
                  ? 'w-36 h-36 border-4 border-cyan-400/60 animate-ping'
                  : state === 'speaking'
                  ? 'w-36 h-36 border-4 border-emerald-400/60 animate-pulse'
                  : state === 'processing'
                  ? 'w-32 h-32 border-4 border-amber-400/50 animate-spin'
                  : 'w-28 h-28 border-2 border-stone-700/50'
              }`}
            />

            {/* Inner glowing core button */}
            <button
              onClick={() => {
                if (state === 'listening') {
                  if (transcript) handleSendQuery(transcript);
                  else stopVoice();
                } else if (state === 'speaking') {
                  stopVoice();
                } else {
                  startListening();
                }
              }}
              className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 cursor-pointer ${
                state === 'listening'
                  ? 'bg-gradient-to-tr from-cyan-600 to-blue-500 shadow-cyan-500/50 scale-105'
                  : state === 'speaking'
                  ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-emerald-500/50 scale-105'
                  : state === 'processing'
                  ? 'bg-gradient-to-tr from-amber-600 to-yellow-500 shadow-amber-500/50 animate-pulse'
                  : 'bg-gradient-to-tr from-stone-800 to-stone-700 hover:scale-105 hover:from-emerald-700 hover:to-cyan-700'
              }`}
              title="Click to speak with AgriGenius Alexa"
            >
              {state === 'listening' ? (
                <Mic className="w-10 h-10 text-white animate-bounce" />
              ) : state === 'speaking' ? (
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-6 bg-white rounded-full animate-pulse" />
                  <span className="w-1.5 h-9 bg-white rounded-full animate-pulse delay-75" />
                  <span className="w-1.5 h-5 bg-white rounded-full animate-pulse delay-150" />
                </div>
              ) : state === 'processing' ? (
                <Sparkles className="w-9 h-9 text-white animate-spin" />
              ) : (
                <Mic className="w-9 h-9 text-stone-300 hover:text-white" />
              )}
            </button>
          </div>

          {/* Status Label */}
          <div className="mt-4 text-center">
            <span
              className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${
                state === 'listening'
                  ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50'
                  : state === 'speaking'
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                  : state === 'processing'
                  ? 'bg-amber-950/80 text-amber-300 border-amber-500/50'
                  : 'bg-stone-800 text-stone-400 border-stone-700'
              }`}
            >
              {state === 'listening'
                ? 'Listening... Speak your question'
                : state === 'speaking'
                ? 'AgriGenius Speaking Aloud'
                : state === 'processing'
                ? 'Processing Farm Intelligence...'
                : 'Tap Orb to Speak Hands-Free'}
            </span>
          </div>

          {/* Current Live Transcribed User Speech */}
          {transcript && (
            <div className="mt-3 text-center max-w-lg px-4 py-2 bg-stone-800/80 rounded-xl border border-stone-700 text-sm text-cyan-200 italic">
              "{transcript}"
            </div>
          )}
        </div>

        {/* Spoken Response & Agronomic Advice Display */}
        {spokenResponse && (
          <div className="relative mt-2 p-4 sm:p-5 rounded-2xl bg-emerald-950/40 border border-emerald-600/30 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                  AgriGenius Spoken Answer
                </span>
              </div>
              <button
                onClick={() => speakText(spokenResponse)}
                className="flex items-center gap-1 text-[11px] text-emerald-300 hover:text-white transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Replay Voice</span>
              </button>
            </div>

            <p className="text-sm font-medium text-white leading-relaxed">{spokenResponse}</p>

            {actionableGuidance && (
              <div className="pt-2 border-t border-emerald-800/40 text-xs text-stone-300">
                <p className="font-semibold text-emerald-400 mb-1">Agronomic Guidelines:</p>
                <p className="leading-relaxed">{actionableGuidance}</p>
              </div>
            )}

            {actionTaken && (
              <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-900/50 border border-emerald-500/40 text-xs text-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{actionTaken} (Synced to your Field Tasks)</span>
              </div>
            )}
          </div>
        )}

        {/* Quick Voice Suggestions */}
        <div className="relative mt-4">
          <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block mb-2">
            Ask Alexa in 1-Tap:
          </span>
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSendQuery(qp.query)}
                className="text-xs px-3 py-1.5 rounded-xl bg-stone-800/80 hover:bg-emerald-800/60 hover:text-white border border-stone-700/60 text-stone-300 transition-all cursor-pointer"
              >
                {qp.label}
              </button>
            ))}
          </div>
        </div>

        {/* Keyboard Text Fallback Input */}
        <div className="relative mt-4 pt-4 border-t border-stone-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (manualInput.trim()) handleSendQuery(manualInput);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder={`Ask Alexa anything regarding ${currentFarm?.farm_name || 'your farm'}...`}
              className="flex-1 px-4 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              disabled={!manualInput.trim() || state === 'processing'}
              className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              <span>Ask</span>
            </button>
          </form>
          {!speechSupported && (
            <p className="text-[11px] text-amber-400 mt-1">
              Microphone not enabled in this browser view. You can type above and Alexa will speak the answer aloud!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
