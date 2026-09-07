import React, { useState, useRef, useEffect } from "react";
import { ChatMessage, Coordinate, ActiveLayer } from "../types";
import { MarkdownMessage } from "./MarkdownMessage";
import {
  Send,
  Bot,
  User,
  Sparkles,
  Loader2,
  ExternalLink,
  CheckCircle2,
  Sliders,
  MapPin,
  Layers,
  Clock,
  LayoutGrid,
  Zap,
  Terminal
} from "lucide-react";

interface SidebarChatProps {
  currentCoords: Coordinate;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isSending: boolean;
}

export const SidebarChat: React.FC<SidebarChatProps> = ({
  currentCoords,
  messages,
  onSendMessage,
  isSending,
}) => {
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sampleQuestions = [
    { text: "گرم‌ترین نقطه زمین در یک سال گذشته کجا بوده؟", icon: "🌐", type: "knowledge" },
    { text: "لایه دمای مدل GFS رو برام فعال کن", icon: "🌡️", type: "agent" },
    { text: "نقشه رو ببر روی شیراز و زوم کن", icon: "📍", type: "agent" },
    { text: "توفان‌های حاره‌ای و بادهای شدید در خلیج فارس رو چک کن", icon: "🌪️", type: "mixed" },
  ];

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;
    onSendMessage(inputText.trim());
    setInputText("");
  };

  const handleSuggestionClick = (question: string) => {
    if (isSending) return;
    onSendMessage(question);
  };

  return (
    <div className="flex flex-col h-full bg-[#08090C] text-slate-200 select-none" id="chat-panel">
      {/* Panel Header */}
      <div className="p-3.5 border-b border-[#1A1C23] flex flex-col space-y-1.5 bg-[#08090C]/90 backdrop-blur-md shrink-0">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-sm">
              <Bot className="w-3 h-3 text-white" />
            </div>
            <div>
              <h2 className="text-xs font-bold tracking-wider text-slate-100 uppercase flex items-center gap-1.5 font-mono">
                <span>AI METEO AGENT</span>
                <span className="text-[9px] text-blue-400 bg-blue-500/10 px-1 py-0.2 rounded border border-blue-500/20 font-sans">
                  Dual-Mode
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[9px] text-emerald-400 font-mono font-semibold">ONLINE</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[9.5px] text-slate-400 font-mono pt-0.5">
          <span className="flex items-center gap-1">
            <MapPin className="w-2.5 h-2.5 text-slate-500" />
            <span>{currentCoords.lat.toFixed(2)}°N, {currentCoords.lon.toFixed(2)}°E</span>
          </span>
          <span className="text-slate-500">Web Research + UI Actions</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3.5 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-3 space-y-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600/20 via-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-blue-500/30 shadow-lg shadow-blue-500/5">
                <Sparkles className="w-6 h-6 text-blue-400 animate-pulse" />
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-bold text-slate-200">هوش مصنوعی و ایجنت هوشمند متئو</p>
              <p className="text-[10.5px] text-slate-400 max-w-[240px] leading-relaxed mx-auto">
                هم پاسخگوی سوالات علمی و اقلیمی از اینترنت است و هم کنترل کامل نقشه، لایه‌ها و مدل‌ها را در دست دارد.
              </p>
            </div>

            {/* Suggested Prompts */}
            <div className="w-full pt-2 space-y-1.5">
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block text-right">
                نمونه دستورات و پرسش‌ها:
              </span>
              <div className="grid grid-cols-1 gap-1.5 text-right">
                {sampleQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestionClick(q.text)}
                    className="w-full text-right p-2 rounded-lg border border-[#1A1C23] bg-[#12141A]/60 hover:bg-[#1A1C23] hover:border-blue-500/40 text-[10.5px] text-slate-300 transition-all flex items-center justify-between group"
                    dir="rtl"
                  >
                    <span className="flex items-center gap-2 truncate">
                      <span className="text-xs">{q.icon}</span>
                      <span className="truncate group-hover:text-blue-300">{q.text}</span>
                    </span>
                    <span className="text-[8.5px] font-mono text-slate-500 bg-black/40 px-1.5 py-0.5 rounded border border-white/5 shrink-0 mr-1">
                      {q.type}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((m) => {
              const isAi = m.role === "assistant";
              return (
                <div key={m.id} className={`flex flex-col ${isAi ? "items-start" : "items-end"}`}>
                  <div className={`flex items-start space-x-2 max-w-[95%] ${isAi ? "" : "flex-row-reverse space-x-reverse"}`}>
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border mt-0.5 ${
                        isAi
                          ? "bg-gradient-to-br from-blue-600/20 to-indigo-600/20 text-blue-400 border-blue-500/30 shadow-sm"
                          : "bg-slate-800 text-slate-300 border-slate-700"
                      }`}
                    >
                      {isAi ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                    </div>

                    <div className="flex flex-col space-y-1.5 w-full">
                      {/* Executed Agent Actions Pills */}
                      {isAi && m.actions && m.actions.length > 0 && (
                        <div className="flex flex-col space-y-1 my-1">
                          {m.actions.map((act, actIdx) => (
                            <div
                              key={actIdx}
                              className="flex items-center justify-between p-1.5 rounded bg-blue-950/40 border border-blue-500/30 text-[10px] text-blue-200 font-mono shadow-sm animate-in fade-in duration-300"
                            >
                              <div className="flex items-center space-x-1.5 truncate">
                                {act.name === "navigateToLocation" && <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />}
                                {act.name === "setWeatherLayer" && <Layers className="w-3 h-3 text-amber-400 shrink-0" />}
                                {act.name === "configureCatalogLayer" && <Sliders className="w-3 h-3 text-blue-400 shrink-0" />}
                                {act.name === "setTimelineForecastHour" && <Clock className="w-3 h-3 text-indigo-400 shrink-0" />}
                                {act.name === "setSplitScreenMode" && <LayoutGrid className="w-3 h-3 text-purple-400 shrink-0" />}
                                <span className="truncate font-semibold text-slate-200">{act.summary}</span>
                              </div>
                              <span className="flex items-center space-x-1 text-[8.5px] bg-emerald-500/20 text-emerald-300 px-1 py-0.5 rounded border border-emerald-500/30 shrink-0 ml-1">
                                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                                <span>اعمال شد</span>
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Main Message Bubble */}
                      <div
                        className={`rounded-xl px-3.5 py-3 text-[11px] leading-relaxed select-text ${
                          isAi
                            ? "bg-[#101218] border border-[#1E222D] text-slate-200 shadow-md font-sans"
                            : "bg-blue-600 text-white font-medium shadow"
                        }`}
                        dir="auto"
                      >
                        {isAi ? (
                          <MarkdownMessage content={m.text} />
                        ) : (
                          <div className="whitespace-pre-wrap">{m.text}</div>
                        )}

                        {/* Grounding Web Sources if available */}
                        {isAi && m.groundingSources && m.groundingSources.length > 0 && (
                          <div className="mt-2.5 pt-2 border-t border-[#1F2430] flex flex-col space-y-1">
                            <span className="text-[8.5px] uppercase font-mono text-slate-500 font-bold tracking-wider">
                              منابع و استنادهای معتبر:
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {m.groundingSources.slice(0, 3).map((src, srcIdx) => (
                                <a
                                  key={srcIdx}
                                  href={src.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center space-x-1 text-[9px] text-blue-400 hover:text-blue-300 bg-blue-950/50 hover:bg-blue-900/50 border border-blue-500/20 rounded px-1.5 py-0.5 transition truncate max-w-[200px]"
                                >
                                  <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                                  <span className="truncate">{src.title || "منبع علمی"}</span>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Thinking / Agent Processing State */}
            {isSending && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-2 max-w-[90%]">
                  <div className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  </div>
                  <div className="bg-[#101218] border border-[#1E222D] rounded-xl px-3 py-2.5 text-[11px] text-slate-300 flex flex-col space-y-1.5 shadow-md">
                    <div className="flex items-center space-x-2 text-blue-400 font-mono">
                      <Terminal className="w-3 h-3 text-blue-400 animate-pulse" />
                      <span className="text-[10px]">در حال بررسی درخواست و اجرای فرامین...</span>
                    </div>
                    <span className="text-[9.5px] text-slate-500 font-sans">
                      ایجنت در حال تحلیل ژئوفیزیکی و همگام‌سازی ابزارهای نقشه است.
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Message Form */}
      <form onSubmit={handleSubmit} className="p-2.5 border-t border-[#1A1C23] bg-[#08090C] shrink-0">
        <div className="relative flex items-center">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="سوال بپرسید یا دستوری به ایجنت بدهید (مثلا: لایه باد رو فعال کن)..."
            disabled={isSending}
            dir="auto"
            className="w-full bg-[#040507] text-xs text-slate-200 placeholder:text-slate-500 border border-[#1A1C23] rounded-lg pl-3 pr-9 py-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent outline-none disabled:opacity-50 transition"
          />
          <button
            type="submit"
            disabled={isSending || !inputText.trim()}
            className="absolute right-1.5 text-slate-400 hover:text-white bg-blue-600/80 hover:bg-blue-600 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 p-1.5 rounded-md transition shadow-sm"
            id="btn-send-message"
            title="ارسال پیام"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex items-center justify-between text-[8.5px] text-slate-600 px-1 pt-1 font-mono">
          <span>AI Agent Powered by Gemini 3.7</span>
          <span>Shift+Enter برای خط جدید</span>
        </div>
      </form>
    </div>
  );
};
