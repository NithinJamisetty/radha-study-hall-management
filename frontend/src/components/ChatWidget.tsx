import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  Users, 
  IndianRupee, 
  Wrench, 
  RotateCcw,
  Brain,
  Trash2,
  Plus,
  X,
  Copy,
  Check,
  Lightbulb,
  FileText
} from 'lucide-react';
import { api, ChatResponse } from '../services/api.ts';
import { 
  getJarvisMemories, 
  addJarvisMemory, 
  deleteJarvisMemory, 
  clearJarvisMemories, 
  JarvisMemory,
  processJarvisMessage 
} from '../services/jarvisEngine.ts';

interface ChatWidgetProps {
  onUpdateEvent: () => void;
}

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  extracted?: ChatResponse['extracted'];
  isCorrection?: boolean;
  intent?: string;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({ onUpdateEvent }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'bot',
      text: "👋 Welcome to Radha Study Hall Assistant! Powered by Open AI Models, I work just like ChatGPT to help you manage operations, answer questions, draft WhatsApp notices, give revenue advice, and log attendance throughout the day.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showMemoryModal, setShowMemoryModal] = useState(false);
  const [memories, setMemories] = useState<JarvisMemory[]>([]);
  const [newMemoryText, setNewMemoryText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMemories(getJarvisMemories());
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const refreshMemories = () => {
    setMemories(getJarvisMemories());
  };

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsLoading(true);

    // Provide previous chat history to Open Models for continuous ChatGPT conversation
    const history = messages.map(m => ({
      role: m.sender === 'user' ? ('user' as const) : ('assistant' as const),
      text: m.text
    }));

    try {
      const response = await api.sendMessage(text, 'admin', history);
      const botMsg: Message = {
        id: 'bot-' + Date.now(),
        sender: 'bot',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        extracted: response.extracted,
        isCorrection: response.isCorrection,
        intent: response.intent
      };
      setMessages(prev => [...prev, botMsg]);
      refreshMemories();
      onUpdateEvent();
    } catch (err) {
      const fallback = processJarvisMessage(text);
      setMessages(prev => [
        ...prev,
        {
          id: 'bot-' + Date.now(),
          sender: 'bot',
          text: fallback.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          extracted: fallback.extracted,
          isCorrection: fallback.isCorrection,
          intent: fallback.intent
        }
      ]);
      refreshMemories();
      onUpdateEvent();
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddManualMemory = () => {
    if (!newMemoryText.trim()) return;
    addJarvisMemory('Custom Operational Rule', newMemoryText.trim(), 'custom', newMemoryText.trim());
    setNewMemoryText('');
    refreshMemories();
  };

  const handleDeleteMemory = (id: string) => {
    const updated = deleteJarvisMemory(id);
    setMemories(updated);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const sampleActionCards = [
    {
      title: "Self-Learning Memory",
      desc: "Teach: 'Remember wifi is radha123'",
      prompt: "Remember that Wi-Fi password is radha@2026 and morning cleaner name is Suresh.",
      icon: Brain,
      color: "from-purple-50 to-indigo-50 border-purple-200/80 text-purple-800",
      iconColor: "bg-purple-100 text-purple-700"
    },
    {
      title: "Revenue Suggestions",
      desc: "Strategic occupancy blueprint",
      prompt: "Give me suggestions to increase occupancy and revenue.",
      icon: Lightbulb,
      color: "from-amber-50 to-orange-50 border-amber-200/80 text-amber-800",
      iconColor: "bg-amber-100 text-amber-700"
    },
    {
      title: "Draft Notice",
      desc: "WhatsApp announcement creator",
      prompt: "Draft a notice for quiet hours after 9 PM and no phone calls in study cabins.",
      icon: FileText,
      color: "from-sky-50 to-blue-50 border-sky-200/80 text-sky-800",
      iconColor: "bg-sky-100 text-sky-700"
    },
    {
      title: "Log Daily Report",
      desc: "Admissions, fees & evening shift",
      prompt: "Today 5 new students joined, collected fees from 12 students with ₹12,500, and evening shift was 85.",
      icon: Users,
      color: "from-emerald-50 to-teal-50 border-emerald-200/80 text-emerald-800",
      iconColor: "bg-emerald-100 text-emerald-700"
    }
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] sm:h-[calc(100vh-160px)] max-w-4xl mx-auto bg-white rounded-3xl shadow-xs border border-slate-200/80 overflow-hidden animate-fade-in relative">
      
      {/* 1. Header with Open AI Model Badge */}
      <div className="px-4 sm:px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-white flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-indigo-700 p-0.5 flex items-center justify-center overflow-hidden shadow-xs">
              <img 
                src="/images/avatar_girl_3d.png" 
                alt="Radha Jarvis AI"
                className="w-full h-full object-cover rounded-xl"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                Radha Jarvis AI
              </h2>
              <span className="text-[10px] bg-emerald-50 text-emerald-800 font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Open AI Model Active
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
              <span>Natural Operations &bull; ChatGPT Intelligence</span>
            </p>
          </div>
        </div>

        {/* Action Controls in Header */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Memory Bank Trigger */}
          <button
            onClick={() => {
              refreshMemories();
              setShowMemoryModal(true);
            }}
            className="px-2.5 sm:px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200/80 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
            title="Inspect Jarvis Memory Bank"
          >
            <Brain className="w-3.5 h-3.5 text-purple-600" />
            <span className="hidden sm:inline">Memory Bank</span>
            <span className="px-1.5 py-0.2 bg-purple-200 text-purple-800 rounded-full text-[10px]">
              {memories.length}
            </span>
          </button>
        </div>
      </div>

      {/* 2. Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5 bg-gradient-to-b from-slate-50/70 via-white to-slate-50/40">
        
        {/* Welcome / Capabilities Card (shows when chat has few messages) */}
        {messages.length <= 2 && (
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-indigo-500/10 border border-emerald-200/70 flex flex-col sm:flex-row items-center gap-4 shadow-xs">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden border-2 border-emerald-300 shadow-sm flex-shrink-0 bg-white p-0.5">
              <img 
                src="/images/avatar_girl_3d.png" 
                alt="Radha Jarvis AI"
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <div className="space-y-1 text-center sm:text-left flex-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white/90 rounded-full text-[11px] font-bold text-emerald-800 border border-emerald-200/60">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                Open AI Models Connected • ChatGPT Intelligence
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                What would you like me to handle for Radha Study Hall?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Chat naturally like ChatGPT, teach custom rules, ask for revenue growth strategies, draft WhatsApp notices, or log today's admissions and shift attendance.
              </p>
            </div>
          </div>
        )}

        {/* 4 Interactive Action Cards */}
        {messages.length <= 2 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {sampleActionCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <button
                  key={i}
                  onClick={() => handleSend(card.prompt)}
                  className={`p-3.5 rounded-2xl bg-gradient-to-br ${card.color} border text-left transition-all hover:scale-[1.02] hover:shadow-xs flex flex-col justify-between group cursor-pointer`}
                >
                  <div className={`w-8 h-8 rounded-xl ${card.iconColor} flex items-center justify-center shadow-xs mb-2.5`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900">{card.title}</div>
                    <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{card.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Message Thread */}
        {messages.map((m) => (
          <div 
            key={m.id}
            className={`flex items-start gap-2.5 sm:gap-3 ${m.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} max-w-2xl ${m.sender === 'user' ? 'ml-auto' : 'mr-auto'}`}
          >
            {/* Avatar */}
            {m.sender === 'bot' ? (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-100 to-teal-100 border border-emerald-200/80 p-0.5 flex-shrink-0 flex items-center justify-center overflow-hidden shadow-xs mt-0.5">
                <img 
                  src="/images/avatar_girl_3d.png" 
                  alt="Jarvis"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 p-0.5 flex-shrink-0 flex items-center justify-center overflow-hidden shadow-xs mt-0.5">
                <img 
                  src="/images/avatar_boy_3d.png" 
                  alt="Admin User"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* Message Bubble */}
            <div className={`space-y-2 max-w-[88%] sm:max-w-[85%] ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`p-4 rounded-3xl text-xs sm:text-sm leading-relaxed shadow-xs relative ${
                m.sender === 'user'
                  ? 'bg-slate-900 text-white rounded-tr-xs'
                  : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs'
              }`}>
                {/* Formatted Text */}
                <div className="whitespace-pre-wrap font-normal space-y-1">
                  {m.text.split('\n').map((line, idx) => {
                    if (line.startsWith('*') && line.endsWith('*')) {
                      return <p key={idx} className="font-bold text-slate-900">{line.replace(/\*/g, '')}</p>;
                    }
                    if (line.startsWith('• ') || line.startsWith('- ')) {
                      return <p key={idx} className="pl-2 text-slate-700">{line}</p>;
                    }
                    if (line.startsWith('```')) {
                      return null;
                    }
                    return <p key={idx}>{line}</p>;
                  })}
                </div>

                {/* Notice Copy Action Button */}
                {m.intent === 'NOTICE_DRAFT' && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-medium">Ready for WhatsApp Broadcast</span>
                    <button
                      onClick={() => copyToClipboard(m.text, m.id)}
                      className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedId === m.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-emerald-600" />}
                      <span>{copiedId === m.id ? 'Copied!' : 'Copy Notice'}</span>
                    </button>
                  </div>
                )}

                {/* Stored Memory Banner */}
                {m.intent === 'LEARNED_MEMORY' && (
                  <div className="mt-3 p-2.5 rounded-2xl bg-purple-50/90 border border-purple-200/80 flex items-center justify-between gap-3 text-purple-950">
                    <div className="flex items-center gap-2">
                      <Brain className="w-4 h-4 text-purple-600 flex-shrink-0" />
                      <span className="text-[11px] font-semibold">
                        Added to permanent Jarvis Memory Bank
                      </span>
                    </div>
                    <button
                      onClick={() => setShowMemoryModal(true)}
                      className="text-[10px] underline font-bold text-purple-700"
                    >
                      View All ({memories.length})
                    </button>
                  </div>
                )}

                {/* VISUAL REPORT EXTRACTION CARDS */}
                {m.extracted && (
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                    {/* Admissions Card */}
                    {m.extracted.newAdmissions !== undefined && m.extracted.newAdmissions !== null && (
                      <div className="p-2.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/70 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                            +{m.extracted.newAdmissions}
                          </div>
                          <div>
                            <div className="font-bold text-xs text-emerald-950">
                              {m.extracted.newAdmissions} New Admissions Added
                            </div>
                            <span className="text-[10px] text-emerald-700">
                              Logged in Excel & Today's Report
                            </span>
                          </div>
                        </div>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      </div>
                    )}

                    {/* Fees Card */}
                    {m.extracted.feeCollected !== undefined && m.extracted.feeCollected !== null && (
                      <div className="p-2.5 rounded-2xl bg-teal-50/80 border border-teal-200/70 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-sm">
                            ₹
                          </div>
                          <div>
                            <div className="font-bold text-xs text-teal-950">
                              ₹{m.extracted.feeCollected.toLocaleString()} Fee Collection
                            </div>
                            <span className="text-[10px] text-teal-700">
                              {m.extracted.feePayingStudents || 1} students logged
                            </span>
                          </div>
                        </div>
                        <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
                      </div>
                    )}

                    {/* Shift Attendance Card */}
                    {m.extracted.eveningAttendance !== undefined && m.extracted.eveningAttendance !== null && (
                      <div className="p-2.5 rounded-2xl bg-sky-50/80 border border-sky-200/70 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold text-xs">
                            {m.extracted.eveningAttendance}
                          </div>
                          <div>
                            <div className="font-bold text-xs text-sky-950">
                              Evening Shift Attendance: {m.extracted.eveningAttendance}
                            </div>
                            <span className="text-[10px] text-sky-700">
                              Ready for 8:00 PM WhatsApp Report
                            </span>
                          </div>
                        </div>
                        <CheckCircle2 className="w-4 h-4 text-sky-600 flex-shrink-0" />
                      </div>
                    )}

                    {/* Correction Applied Pill */}
                    {m.isCorrection && (
                      <div className="p-2 rounded-xl bg-purple-50 text-purple-900 border border-purple-200/60 text-xs font-semibold flex items-center gap-2">
                        <RotateCcw className="w-3.5 h-3.5 text-purple-600" />
                        <span>Correction confirmed: Updated database record.</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Timestamp */}
              <div className={`text-[10px] text-slate-400 px-1 ${m.sender === 'user' ? 'text-right' : 'text-left'}`}>
                {m.sender === 'user' ? 'Admin' : 'Radha Jarvis (Open AI Model)'} &bull; {m.timestamp}
              </div>
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center gap-3 bg-white p-3.5 rounded-2xl w-fit border border-slate-200/70 shadow-xs animate-pulse">
            <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
            </div>
            <span className="text-xs text-slate-600 font-medium">
              Generating response with Open AI Models...
            </span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 3. Quick Prompts Bar */}
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex-shrink-0">
          Try Saying:
        </span>
        {[
          "Today 5 new students joined",
          "Collected fees from 12 students with ₹12,500 total",
          "Evening shift attendance was 85",
          "Draft a notice for quiet hours after 9 PM",
          "Give suggestions to increase occupancy",
          "AC in Room 2 is not working"
        ].map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            className="flex-shrink-0 px-2.5 py-1 bg-white hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 text-[11px] font-medium rounded-full border border-slate-200/80 hover:border-emerald-200 transition-colors cursor-pointer shadow-2xs"
          >
            {p}
          </button>
        ))}
      </div>

      {/* 4. Input Bar */}
      <div className="p-3 sm:p-4 bg-white border-t border-slate-100 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask anything like ChatGPT, teach rules, or log shift numbers..."
          className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
        />
        <button
          onClick={() => handleSend()}
          disabled={!inputText.trim() || isLoading}
          className="px-4 sm:px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold rounded-2xl text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </div>

      {/* 5. SLIDE-OVER JARVIS MEMORY BANK MODAL */}
      {showMemoryModal && (
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90%] flex flex-col shadow-2xl border border-slate-200/80 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-purple-50/50 to-indigo-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Radha Jarvis Memory Bank
                  </h3>
                  <p className="text-[11px] text-purple-700">
                    {memories.length} Learned Rules, Contacts &amp; Operations
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowMemoryModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 border-b border-slate-100">
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Teach Jarvis a New Rule or Operational Fact:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newMemoryText}
                  onChange={(e) => setNewMemoryText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddManualMemory()}
                  placeholder="E.g., Clean the water filter every Wednesday, or Plumber phone is..."
                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
                <button
                  onClick={handleAddManualMemory}
                  disabled={!newMemoryText.trim()}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Save
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {memories.map((m) => (
                <div 
                  key={m.id}
                  className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:border-purple-200 transition-all flex items-start justify-between gap-3 group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200/60">
                        {m.category}
                      </span>
                      <h4 className="font-bold text-xs text-slate-900">{m.title}</h4>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      "{m.content}"
                    </p>
                    <span className="text-[10px] text-slate-400 block">
                      Learned: {new Date(m.learnedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDeleteMemory(m.id)}
                    className="p-1.5 text-slate-300 hover:text-rose-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    title="Delete Memory"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
              <button
                onClick={() => {
                  if (confirm("Reset Jarvis memory bank to initial study hall defaults?")) {
                    setMemories(clearJarvisMemories());
                  }
                }}
                className="text-[11px] text-rose-600 hover:underline cursor-pointer"
              >
                Reset to Defaults
              </button>
              <button
                onClick={() => setShowMemoryModal(false)}
                className="px-4 py-1.5 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
