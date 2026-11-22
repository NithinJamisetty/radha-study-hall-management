import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  RefreshCw, 
  Clock, 
  CheckCircle2, 
  Users, 
  IndianRupee, 
  Wrench, 
  FileCheck,
  MessageCircle,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { api, ChatResponse } from '../services/api.ts';

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
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({ onUpdateEvent }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'bot',
      text: "👋 Welcome to Radha Study Hall Assistant! You can message me updates throughout the day—admissions, fee collections, shift attendance, or maintenance complaints. I'll maintain your Excel database and compile your 8:00 PM WhatsApp report automatically.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

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

    try {
      const response = await api.sendMessage(text, 'admin');
      const botMsg: Message = {
        id: 'bot-' + Date.now(),
        sender: 'bot',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        extracted: response.extracted,
        isCorrection: response.isCorrection
      };
      setMessages(prev => [...prev, botMsg]);
      onUpdateEvent();
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: 'err-' + Date.now(),
          sender: 'bot',
          text: "⚠️ Couldn't reach the backend server. Please make sure the service is active on port 8080.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const sampleActionCards = [
    {
      title: "New Admissions",
      desc: "5 students joined today",
      prompt: "Today 5 new students joined.",
      icon: Users,
      img: "/images/avatar_boy_3d.png",
      color: "from-emerald-500/10 to-teal-500/10 border-emerald-200/80 text-emerald-800"
    },
    {
      title: "Fee Collection",
      desc: "₹12,500 from 12 students",
      prompt: "Collected fees from 12 students with ₹12,500 total.",
      icon: IndianRupee,
      img: "/images/dash_seat_management.png",
      color: "from-teal-500/10 to-sky-500/10 border-teal-200/80 text-teal-800"
    },
    {
      title: "Shift Attendance",
      desc: "Evening shift turnout: 85",
      prompt: "Evening shift attendance was 85.",
      icon: Clock,
      img: "/images/checking_seats.png",
      color: "from-sky-500/10 to-indigo-500/10 border-sky-200/80 text-sky-800"
    },
    {
      title: "AC / Maintenance",
      desc: "Room 2 AC complaint",
      prompt: "AC in Room 2 is not working.",
      icon: Wrench,
      img: "/images/ac_icon.png",
      color: "from-amber-500/10 to-rose-500/10 border-amber-200/80 text-amber-800"
    }
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] sm:h-[calc(100vh-160px)] max-w-4xl mx-auto bg-white rounded-3xl shadow-xs border border-slate-200/80 overflow-hidden animate-fade-in">
      {/* Rich Visual Chat Header */}
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-white flex-shrink-0">
        <div className="flex items-center gap-3">
          {/* Radha Study Hall 3D Mascot Avatar */}
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-50 to-teal-100 border border-emerald-200/70 p-0.5 flex items-center justify-center overflow-hidden shadow-xs">
              <img 
                src="/images/avatar_girl_3d.png" 
                alt="Radha Study Hall AI Mascot"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 leading-tight">Radha Study Hall AI Assistant</h2>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200/60">
                Excel Sync Active
              </span>
            </div>
            <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
              <span>Natural-Language Operations &bull; 8:00 PM WhatsApp Automation</span>
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <div className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/70">
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            <span>8:00 PM Delivery</span>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-gradient-to-b from-slate-50/70 via-white to-slate-50/40">
        
        {/* Welcome Banner with 3D Illustration (shows when starting chat) */}
        {messages.length <= 2 && (
          <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-sky-500/10 border border-emerald-200/70 flex flex-col sm:flex-row items-center gap-5 shadow-xs">
            <img 
              src="/images/3d_characters.png" 
              alt="Radha Study Hall 3D Characters"
              className="w-28 sm:w-36 object-contain flex-shrink-0 drop-shadow-sm"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="space-y-1.5 text-center sm:text-left flex-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white/80 rounded-full text-[11px] font-bold text-emerald-700 border border-emerald-200/60">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                Study Hall Operations Center
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                What's the update for Radha Study Hall today?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Click any suggestion card below or type naturally. Your numbers will instantly update in the Excel Database and reflect in the 8:00 PM report.
              </p>
            </div>
          </div>
        )}

        {/* 4 Interactive Visual Prompt Cards */}
        {messages.length <= 2 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {sampleActionCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <button
                  key={i}
                  onClick={() => handleSend(card.prompt)}
                  className={`p-3 rounded-2xl bg-gradient-to-br ${card.color} border text-left transition-all hover:scale-[1.02] hover:shadow-xs flex flex-col justify-between group cursor-pointer`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-7 h-7 rounded-lg bg-white/90 flex items-center justify-center shadow-xs">
                      <Icon className="w-4 h-4 text-emerald-700" />
                    </div>
                    {card.img && (
                      <img 
                        src={card.img} 
                        alt={card.title} 
                        className="w-7 h-7 object-contain opacity-90 group-hover:scale-110 transition-transform" 
                      />
                    )}
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
            className={`flex items-start gap-3 ${m.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} max-w-2xl ${m.sender === 'user' ? 'ml-auto' : 'mr-auto'}`}
          >
            {/* Avatar */}
            {m.sender === 'bot' ? (
              <div className="w-8 h-8 rounded-xl bg-emerald-100 border border-emerald-200/80 p-0.5 flex-shrink-0 flex items-center justify-center overflow-hidden shadow-xs mt-0.5">
                <img 
                  src="/images/avatar_girl_3d.png" 
                  alt="Radha Study Hall Bot"
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

            {/* Message Bubble & Cards */}
            <div className={`space-y-2.5 max-w-[85%] sm:max-w-[88%] ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`p-4 rounded-3xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                m.sender === 'user'
                  ? 'bg-slate-900 text-white rounded-tr-xs'
                  : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs'
              }`}>
                <div className="whitespace-pre-wrap">{m.text}</div>

                {/* VISUAL RICH CARDS for Detected Entities */}
                {m.extracted && (
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                    {/* Admissions Visual Card */}
                    {m.extracted.newAdmissions !== undefined && m.extracted.newAdmissions !== null && (
                      <div className="p-2.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/70 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <img 
                            src="/images/study1.png" 
                            alt="Student Admissions" 
                            className="w-9 h-9 object-contain"
                          />
                          <div>
                            <div className="font-bold text-xs text-emerald-950">
                              +{m.extracted.newAdmissions} New Admissions Recorded
                            </div>
                            <span className="text-[10px] text-emerald-700">
                              Appended to Excel Sheet: <code>Admissions</code>
                            </span>
                          </div>
                        </div>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      </div>
                    )}

                    {/* Fees Visual Card */}
                    {m.extracted.feeCollected !== undefined && m.extracted.feeCollected !== null && (
                      <div className="p-2.5 rounded-2xl bg-teal-50/80 border border-teal-200/70 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                            ₹
                          </div>
                          <div>
                            <div className="font-bold text-xs text-teal-950">
                              ₹{m.extracted.feeCollected.toLocaleString()} Collected
                            </div>
                            <span className="text-[10px] text-teal-700">
                              {m.extracted.feePayingStudents ?? 0} students paid &bull; Excel Sheet: <code>Fee_Collections</code>
                            </span>
                          </div>
                        </div>
                        <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
                      </div>
                    )}

                    {/* Shift Attendance Visual Card */}
                    {(m.extracted.eveningAttendance !== undefined || m.extracted.morningAttendance !== undefined) && (
                      <div className="p-2.5 rounded-2xl bg-sky-50/80 border border-sky-200/70 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <img 
                            src="/images/checking_seats.png" 
                            alt="Shift Turnout" 
                            className="w-9 h-9 object-contain"
                          />
                          <div>
                            <div className="font-bold text-xs text-sky-950">
                              Shift Attendance: {m.extracted.eveningAttendance ?? m.extracted.morningAttendance} Students
                            </div>
                            <span className="text-[10px] text-sky-700">
                              Logged to Excel Sheet: <code>Shift_Attendance</code>
                            </span>
                          </div>
                        </div>
                        <CheckCircle2 className="w-4 h-4 text-sky-600 flex-shrink-0" />
                      </div>
                    )}

                    {/* Maintenance Complaint Visual Card */}
                    {m.extracted.maintenanceItems && m.extracted.maintenanceItems.length > 0 && (
                      <div className="p-2.5 rounded-2xl bg-rose-50/80 border border-rose-200/70 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <img 
                            src="/images/ac_icon.png" 
                            alt="Appliance Maintenance" 
                            className="w-9 h-9 object-contain"
                          />
                          <div>
                            <div className="font-bold text-xs text-rose-950">
                              Repair Logged: {m.extracted.maintenanceItems[0].equipment}
                            </div>
                            <span className="text-[10px] text-rose-700">
                              Location: {m.extracted.maintenanceItems[0].location} &bull; Excel Sheet: <code>Maintenance</code>
                            </span>
                          </div>
                        </div>
                        <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                      </div>
                    )}

                    {/* Correction Applied Pill */}
                    {m.isCorrection && (
                      <div className="p-2 rounded-xl bg-purple-50 text-purple-900 border border-purple-200/60 text-xs font-semibold flex items-center gap-2">
                        <RotateCcw className="w-3.5 h-3.5 text-purple-600" />
                        <span>Correction confirmed: Updated previous record in database.</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Timestamp */}
              <div className={`text-[10px] text-slate-400 px-1 ${m.sender === 'user' ? 'text-right' : 'text-left'}`}>
                {m.sender === 'user' ? 'Admin' : 'Radha AI Assistant'} &bull; {m.timestamp}
              </div>
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center gap-3 bg-white p-3.5 rounded-2xl w-fit border border-slate-200/70 shadow-xs animate-pulse">
            <img 
              src="/images/avatar_girl_3d.png" 
              alt="Thinking" 
              className="w-6 h-6 object-cover rounded-full"
            />
            <span className="text-xs text-slate-600 font-medium">
              Radha AI is parsing and logging to Excel...
            </span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex-shrink-0">
          Try Saying:
        </span>
        {[
          "Today 5 new students joined.",
          "AC in Room 2 is not working.",
          "Collected fees from 12 students with ₹12,500 total.",
          "Evening shift attendance was 85.",
          "Correction, today's admission count is 6, not 5."
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

      {/* Input Bar */}
      <div className="p-3.5 sm:p-4 bg-white border-t border-slate-100 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="E.g., Today 6 new admissions, or Room 2 fan not working..."
          className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
        />
        <button
          onClick={() => handleSend()}
          disabled={!inputText.trim() || isLoading}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold rounded-2xl text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </div>
    </div>
  );
};
