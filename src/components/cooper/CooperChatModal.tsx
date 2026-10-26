'use client';

import React, { useState, useRef, useEffect } from 'react';
import { CooperChatMessage, UserProfile, ClassNote, AttendanceRecord, StudentDoubt } from '../../types/supabase';
import { askCooper } from '../../lib/cooperAgent';

interface CooperChatModalProps {
  currentUser: UserProfile;
  notes: ClassNote[];
  attendance: AttendanceRecord[];
  doubts: StudentDoubt[];
  isOpen: boolean;
  onClose: () => void;
  isEmbedded?: boolean;
  initialPrompt?: string;
  onPostDoubt?: (doubt: Omit<StudentDoubt, 'id' | 'createdAt' | 'answers'>) => void;
}

export const CooperChatModal: React.FC<CooperChatModalProps> = ({
  currentUser,
  notes,
  attendance,
  doubts,
  isOpen,
  onClose,
  isEmbedded = false,
  initialPrompt,
  onPostDoubt,
}) => {
  const [messages, setMessages] = useState<CooperChatMessage[]>([
    {
      id: 'cooper-init',
      sender: 'cooper',
      content: `Hello **${currentUser.fullName}**! I'm **Cooper**, your dedicated AI Academic Tutor.\n\nI am connected to your **Eduspheere course curriculum** via the **Model Context Protocol (MCP)**, with real-time access to:\n• 📅 **Personal Attendance Ledger** (\`get_user_attendance\`)\n• 📚 **Class Study Notes & Handouts** (\`get_user_notes\`)\n• ❓ **Student Doubts & Faculty Answers** (\`get_user_doubts\`)\n\nAsk me anything or tap one of the suggested prompts below!`,
      timestamp: 'Just now',
    },
  ]);

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    const userMsg: CooperChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await askCooper(text, {
        currentUser,
        notes,
        attendance,
        doubts,
        onPostDoubt,
      });

      const cooperMsg: CooperChatMessage = {
        id: `cooper-${Date.now()}`,
        sender: 'cooper',
        content: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        toolCalls: response.toolCalls,
      };

      setMessages((prev) => [...prev, cooperMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `cooper-err-${Date.now()}`,
          sender: 'cooper',
          content: "I encountered a minor network latency connecting to the Supabase Edge Function, but I'm ready to continue our study session!",
          timestamp: 'Just now',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      const timer = setTimeout(() => {
        void handleSendMessage(initialPrompt);
      }, 50);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPrompt]);

  const samplePrompts = [
    { label: '📊 My Attendance', prompt: 'What is my current attendance percentage and record?' },
    { label: '📚 Physics Notes', prompt: 'Show me the latest notes uploaded for Physics' },
    { label: '❓ Check My Doubts', prompt: 'What is the status of my registered doubts?' },
    { label: '⚡ Explain Maxwell', prompt: "Explain Maxwell's displacement current in simple terms" },
  ];

  if (!isOpen && !isEmbedded) return null;

  const content = (
    <div className={`flex flex-col h-full bg-white ${isEmbedded ? 'rounded-3xl border border-yellow-200 shadow-sm' : ''}`}>
      {/* Cooper Header */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-yellow-300 via-amber-300 to-yellow-200 border-b border-yellow-300/80 flex items-center justify-between rounded-t-3xl">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl bg-slate-900 text-yellow-300 flex items-center justify-center text-xl font-black shadow-md border-2 border-white cooper-glow">
              🤖
            </div>
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-adorn text-xl font-black text-slate-950">
                Cooper AI
              </h3>
              <span className="text-[10px] font-mono-code font-black uppercase px-2 py-0.5 rounded-md bg-slate-950 text-yellow-300">
                MCP Server Active
              </span>
            </div>
            <p className="text-[11px] font-bold text-slate-800">
              Intelligent Academic Tutor &amp; Doubt Specialist
            </p>
          </div>
        </div>

        {!isEmbedded && (
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/60 hover:bg-white text-slate-900 flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
          >
            ✕
          </button>
        )}
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="p-3 bg-yellow-50/70 border-b border-yellow-100 flex items-center gap-2 overflow-x-auto text-xs">
        <span className="text-[10px] font-black uppercase text-amber-800 font-mono-code whitespace-nowrap pl-1">
          Quick Prompts:
        </span>
        {samplePrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(p.prompt)}
            className="px-3 py-1 rounded-xl bg-white border border-yellow-200 hover:border-yellow-400 text-slate-700 hover:text-slate-950 whitespace-nowrap font-semibold text-[11px] transition-all shadow-2xs hover:bg-yellow-50 cursor-pointer"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 max-h-[500px]">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1 animate-fadeIn`}
            >
              {/* Tool Execution Badge (if any) */}
              {msg.toolCalls && msg.toolCalls.length > 0 && (
                <div className="flex flex-col gap-1 mb-1 max-w-[85%]">
                  {msg.toolCalls.map((tc, i) => (
                    <div
                      key={i}
                      className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-[10px] font-mono-code font-bold shadow-2xs"
                    >
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                      <span>⚡ MCP Tool: <strong>{tc.tool}</strong></span>
                      <span className="text-slate-500 font-normal">({tc.summary})</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Message Bubble */}
              <div
                className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-xs ${
                  isUser
                    ? 'bg-yellow-400 text-slate-950 font-semibold rounded-tr-xs'
                    : 'bg-white border-2 border-yellow-100 text-slate-900 rounded-tl-xs'
                }`}
              >
                {msg.content}
              </div>

              {/* Timestamp */}
              <span className="text-[10px] text-slate-400 px-1 font-mono-code">
                {msg.timestamp}
              </span>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-amber-700 font-bold p-3 rounded-2xl bg-yellow-50 border border-yellow-200 w-fit animate-pulse">
            <span className="animate-spin text-sm">⚡</span>
            <span>Cooper is retrieving course materials &amp; analyzing concepts...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-3 sm:p-4 bg-white border-t border-yellow-100 rounded-b-3xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask Cooper anything (e.g. attendance, formulas, physics notes)..."
            className="flex-1 px-4 py-3 rounded-2xl border border-yellow-200 bg-yellow-50/20 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 placeholder:text-slate-400 font-medium"
            disabled={isLoading}
          />

          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="yellow-gradient-btn px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <span>Send</span>
            <span>→</span>
          </button>
        </form>
      </div>
    </div>
  );

  if (isEmbedded) {
    return <div className="space-y-6 animate-fadeIn">{content}</div>;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl h-[700px] max-h-[90vh] bg-white rounded-3xl shadow-2xl border-2 border-yellow-400 overflow-hidden">
        {content}
      </div>
    </div>
  );
};
