import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  Sparkles, 
  RefreshCw,
  Clock,
  ArrowRight,
  CheckCircle2
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
      text: "Hello Admin! I'm your Radha Study Hall Assistant. Share any updates throughout your day—new admissions, fee collections, shift attendance, or repair complaints—and I'll organize your database and draft the 8:00 PM WhatsApp report automatically.",
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
  }, [messages]);

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
          text: "Couldn't reach the server. Please verify the backend is active.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const samplePrompts = [
    "Today 5 new students joined.",
    "AC in Room 2 is not working.",
    "Collected fees from 12 students with ₹12,500 total.",
    "Evening shift attendance was 85.",
    "Correction, today's admission count is 6, not 5."
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] sm:h-[calc(100vh-160px)] max-w-4xl mx-auto bg-white rounded-3xl shadow-xs border border-slate-200/80 overflow-hidden animate-fade-in">
      {/* Clean Chat Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 leading-tight">Radha Study Hall AI Assistant</h2>
            <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Auto-updating Excel &amp; 8:00 PM Report
            </p>
          </div>
        </div>
        <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">
          <Clock className="w-3.5 h-3.5 text-emerald-600" />
          <span>8:00 PM Delivery</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50">
        {messages.map((m) => (
          <div 
            key={m.id}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'} max-w-2xl ${m.sender === 'user' ? 'ml-auto' : 'mr-auto'}`}
          >
            <div className={`p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
              m.sender === 'user'
                ? 'bg-slate-900 text-white rounded-br-xs'
                : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
            }`}>
              <div className="whitespace-pre-wrap">{m.text}</div>

              {/* Detected Entity Badges */}
              {m.extracted && (
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap gap-1.5">
                  {m.extracted.newAdmissions !== undefined && m.extracted.newAdmissions !== null && (
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                      Admissions: +{m.extracted.newAdmissions}
                    </span>
                  )}
                  {m.extracted.feeCollected !== undefined && m.extracted.feeCollected !== null && (
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                      Fee: ₹{m.extracted.feeCollected} ({m.extracted.feePayingStudents ?? 0} students)
                    </span>
                  )}
                  {m.extracted.morningAttendance !== undefined && m.extracted.morningAttendance !== null && (
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200/60">
                      Morning: {m.extracted.morningAttendance}
                    </span>
                  )}
                  {m.extracted.eveningAttendance !== undefined && m.extracted.eveningAttendance !== null && (
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200/60">
                      Evening: {m.extracted.eveningAttendance}
                    </span>
                  )}
                  {m.extracted.maintenanceItems && m.extracted.maintenanceItems.length > 0 && (
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/60">
                      Complaint: {m.extracted.maintenanceItems[0].equipment} ({m.extracted.maintenanceItems[0].location})
                    </span>
                  )}
                  {m.isCorrection && (
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200/60">
                      ✓ Correction Applied
                    </span>
                  )}
                </div>
              )}
            </div>

            <span className="text-[10px] text-slate-400 mt-1 px-1">
              {m.timestamp}
            </span>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-white p-3 rounded-2xl w-fit border border-slate-100">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
            <span>AI is logging update to Excel...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Suggestions */}
      <div className="px-4 py-2 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex-shrink-0">
          Quick Suggestions:
        </span>
        {samplePrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            className="flex-shrink-0 px-2.5 py-1 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 text-[11px] font-medium rounded-full border border-slate-200/80 hover:border-emerald-200 transition-colors"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="p-3.5 sm:p-4 bg-white border-t border-slate-100 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="E.g., Today 5 new students joined or Evening shift was 85..."
          className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
        />
        <button
          onClick={() => handleSend()}
          disabled={!inputText.trim() || isLoading}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold rounded-2xl text-xs shadow-xs flex items-center gap-1.5 transition-all"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </div>
    </div>
  );
};
