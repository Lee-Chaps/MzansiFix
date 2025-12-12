
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User as UserIcon, Sparkles, ChevronDown } from 'lucide-react';
import { ChatMessage } from '../types';
import { sendMessageToBot } from '../services/geminiService';

export const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'Hello! I am KasiFixer. Ask me about municipal services or report procedures.',
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100); 
      // Lock body scroll on mobile to prevent background scrolling
      if (window.innerWidth < 768) {
        document.body.style.overflow = 'hidden';
      }
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input.trim(),
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const responseText = await sendMessageToBot(messages, userMsg.text);

    const botMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, botMsg]);
    setIsLoading(false);
  };

  return (
    <>
      {/* Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 md:bottom-6 right-4 md:right-6 z-40 bg-slate-900 text-white p-4 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all border-2 border-slate-800 group"
          aria-label="Open Chat"
        >
          <MessageCircle size={26} strokeWidth={2.5} className="group-hover:rotate-12 transition-transform" />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-green-500 border-2 border-slate-900 rounded-full"></span>
        </button>
      )}

      {/* Chat Window Container */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end md:justify-end md:items-end md:inset-auto md:bottom-24 md:right-6">
          
          {/* Backdrop for Mobile */}
          <div 
            className="md:hidden fixed inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Main Chat Interface */}
          <div className="relative w-full h-[85vh] md:h-[500px] md:w-[380px] bg-white rounded-t-3xl md:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-up">
            
            {/* Header */}
            <div className="bg-slate-900 px-5 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
               <div className="flex items-center gap-3">
                 <div className="bg-gradient-to-br from-amber-400 to-amber-600 p-1.5 rounded-lg text-slate-900 shadow-lg">
                   <Bot size={20} strokeWidth={2.5} />
                 </div>
                 <div>
                   <h3 className="font-bold text-white text-sm">KasiFixer</h3>
                   <div className="flex items-center gap-1.5">
                     <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                     <p className="text-[10px] text-slate-400 font-medium">Online Assistant</p>
                   </div>
                 </div>
               </div>
               <button 
                 onClick={() => setIsOpen(false)}
                 className="p-2 text-slate-400 hover:text-white bg-slate-800/50 rounded-full hover:bg-slate-700 transition-colors"
               >
                 <span className="md:hidden"><ChevronDown size={22} /></span>
                 <span className="hidden md:block"><X size={18} /></span>
               </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 scroll-smooth">
              <div className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest my-4 opacity-50">Today</div>
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-sm ${msg.role === 'user' ? 'bg-white text-slate-600 border border-slate-100' : 'bg-slate-900 text-amber-400'}`}>
                    {msg.role === 'user' ? <UserIcon size={14} /> : <Sparkles size={14} />}
                  </div>
                  <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-slate-900 text-white rounded-tr-none' 
                      : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-2">
                   <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center flex-shrink-0 mt-1">
                      <Sparkles size={14} />
                   </div>
                   <div className="bg-white border border-slate-200 px-4 py-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                   </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100 flex gap-3 shrink-0 pb-safe">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your question..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent text-slate-800 placeholder-slate-400"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${!input.trim() || isLoading ? 'bg-slate-100 text-slate-300' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg'}`}
              >
                <Send size={20} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
