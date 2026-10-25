import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  User,
  Sparkles,
  BookOpen,
  CheckCircle,
  HelpCircle,
  ShieldAlert,
  Copy,
  RotateCcw,
  Trash2,
  Trees,
} from 'lucide-react';
import { Farm, CropCycle, ChatMessage } from '../types';
import { api } from '../lib/api';

interface AssistantViewProps {
  currentFarm: Farm;
  cropCycles: CropCycle[];
}

export const AssistantView: React.FC<AssistantViewProps> = ({ currentFarm, cropCycles }) => {
  const activeCycle = cropCycles.find((c) => c.farm_id === currentFarm?.id) || cropCycles[0];

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_welcome',
      sender: 'assistant',
      content: `Namaste Rajesh! I am AgriGenius AI, your context-aware agricultural decision support agent. I have observed your active farm "${currentFarm?.farm_name || 'Shivaji Hills'}" with ${activeCycle?.crop_name || 'Tomato'} at ${activeCycle?.growth_stage || 'flowering'} stage.\n\nHow can I help you today? You can ask about drip irrigation calculations, soil nutrient balance, pest prevention, or government subsidies.`,
      direct_answer: `AgriGenius AI is calibrated with your active farm profile "${currentFarm?.farm_name || 'Shivaji Hills'}" (${currentFarm?.soil_type || 'black'} soil, pH ${currentFarm?.soil_ph ?? '6.8'}).`,
      key_reasons: [
        `Integrated farm facts: Soil moisture at ${currentFarm?.soil_moisture ?? 38}%, drip irrigation connected to ${currentFarm?.water_source || 'borewell'}.`,
        `RAG Agronomic knowledge indexed from ICAR, State Agricultural Universities, and Central Extension protocols.`,
      ],
      assumptions_missing_data: ['Using current farm sensor readings and local weather conditions.'],
      suggested_next_steps: [
        'Ask: "What should I check this week for my tomato crop?"',
        'Ask: "Explain my soil report in simple terms."',
        'Ask: "Calculate today\'s drip irrigation volume."',
      ],
      confidence_limitations: 'High precision for agronomic best practices; for severe viral or fungal emergencies, consult local KVK.',
      timestamp: new Date().toISOString(),
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const samplePrompts = [
    'What should I check this week for my tomato crop?',
    'Explain my soil report in simple terms.',
    'Calculate my drip irrigation requirement today.',
    'What are the safe non-chemical controls for thrips & whiteflies?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: 'msg_user_' + Date.now(),
      sender: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await api.sendChatMessage({
        message: text,
        farmId: currentFarm?.id,
        cropCycleId: activeCycle?.id,
      });

      setMessages((prev) => [...prev, response]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: 'msg_err_' + Date.now(),
        sender: 'assistant',
        content: `I encountered an issue processing your request: ${err.message || 'Server error'}. Please try asking again.`,
        direct_answer: 'Unable to reach the agronomic engine. Please check system health.',
        key_reasons: ['Network timeout or provider service interruption.'],
        assumptions_missing_data: [],
        suggested_next_steps: ['Try asking again in a few seconds.'],
        confidence_limitations: 'Offline fallback active.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    if (confirm('Clear chat consultation history?')) {
      setMessages([messages[0]]);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] bg-stone-900 border border-stone-800 rounded-2xl shadow-lg overflow-hidden">
      {/* Top Context Header */}
      <div className="bg-stone-950 px-5 py-3 border-b border-stone-800 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">AgriGenius Decision Support Agent</h2>
              <span className="text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                Context-Injected
              </span>
            </div>
            <p className="text-[11px] text-stone-400">
              Active Context: <strong className="text-stone-200">{currentFarm?.farm_name}</strong> •{' '}
              <span className="text-emerald-400">{activeCycle?.crop_name || 'General Farm'} ({activeCycle?.growth_stage || 'Vegetative'})</span>
            </p>
          </div>
        </div>

        <button
          onClick={handleClearHistory}
          className="p-1.5 text-stone-400 hover:text-rose-400 rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
          title="Clear Conversation"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
        {messages.map((msg, idx) => {
          const isUser = msg.sender === 'user';
          return (
            <div key={msg.id || `msg_${idx}`} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
              {!isUser && (
                <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs shrink-0 mt-1 shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-2xl rounded-2xl p-4 text-sm ${
                isUser
                  ? 'bg-emerald-600 text-white shadow-md rounded-tr-none'
                  : 'bg-stone-950 border border-stone-800/90 text-stone-200 rounded-tl-none shadow-sm space-y-3'
              }`}>
                {isUser ? (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <>
                    {/* Direct Advice */}
                    {msg.direct_answer ? (
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                          Actionable Guidance
                        </span>
                        <p className="text-white font-medium text-sm leading-relaxed">
                          {msg.direct_answer}
                        </p>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    )}

                    {/* Key Agronomic Reasons */}
                    {msg.key_reasons && msg.key_reasons.length > 0 && (
                      <div className="bg-stone-900/80 p-3 rounded-xl border border-stone-800/80">
                        <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                          Agronomic Rationale
                        </span>
                        <ul className="space-y-1 text-xs text-stone-300">
                          {msg.key_reasons.map((reason, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-emerald-400 font-bold">•</span>
                              <span>{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Assumptions & Missing Data */}
                    {msg.assumptions_missing_data && msg.assumptions_missing_data.length > 0 && (
                      <div className="text-xs text-stone-400 italic flex items-start gap-1.5 bg-stone-900/40 p-2.5 rounded-lg border border-stone-800/50">
                        <HelpCircle className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                        <div>
                          <strong>Assumptions & Data Boundaries: </strong>
                          {msg.assumptions_missing_data.join('; ')}
                        </div>
                      </div>
                    )}

                    {/* Suggested Next Steps */}
                    {msg.suggested_next_steps && msg.suggested_next_steps.length > 0 && (
                      <div className="pt-1">
                        <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider block mb-1">
                          Suggested Action Items
                        </span>
                        <div className="space-y-1">
                          {msg.suggested_next_steps.map((step, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-xs text-emerald-100">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              <span>{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Citations & Verified Sources */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="pt-2 border-t border-stone-800/80 flex flex-wrap items-center gap-2">
                        <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-[11px] font-semibold text-stone-400">RAG Citations:</span>
                        {msg.citations.map((cite, i) => (
                          <span
                            key={i}
                            className="text-[10px] bg-stone-900 text-stone-300 border border-stone-800 px-2 py-0.5 rounded"
                            title={cite.relevance_snippet}
                          >
                            {cite.title}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Confidence & Limitation Warning */}
                    {msg.confidence_limitations && (
                      <div className="text-[11px] text-amber-300/90 flex items-center gap-1.5 pt-1">
                        <ShieldAlert className="w-3 h-3 text-amber-400 shrink-0" />
                        <span>{msg.confidence_limitations}</span>
                      </div>
                    )}

                    {/* Bottom Action: Copy text */}
                    <div className="flex items-center justify-end pt-1">
                      <button
                        onClick={() => handleCopy(msg.id, msg.direct_answer ? `${msg.direct_answer}\n\n${(msg.suggested_next_steps || []).join('\n')}` : msg.content)}
                        className="text-stone-500 hover:text-stone-300 text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </>
                )}
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-full bg-stone-800 text-stone-300 flex items-center justify-center text-xs shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs shrink-0 mt-1">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-stone-950 border border-stone-800 rounded-2xl rounded-tl-none p-4 text-xs text-stone-300 flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
              </div>
              <span>Retrieving farm facts, executing agronomic tools, and generating response...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Sample Quick Questions Chips */}
      <div className="px-4 py-2 bg-stone-950/80 border-t border-stone-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span className="text-[11px] text-stone-400 font-semibold whitespace-nowrap">Suggested:</span>
        {samplePrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            className="text-xs bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 hover:text-white px-3 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Message Input Box */}
      <div className="p-4 bg-stone-950 border-t border-stone-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={`Ask AgriGenius regarding ${currentFarm?.farm_name || 'your farm'}...`}
            className="flex-1 bg-stone-900 border border-stone-800 rounded-xl px-4 py-3 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-all cursor-pointer disabled:opacity-40 flex items-center gap-2"
          >
            <span>Ask</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
