import React, { useState, useRef, useEffect } from 'react';
import { RotateCcw, BookOpen, TrendingUp, Lightbulb, ArrowUp } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { chatWithAI } from '../services/geminiService';
import useSEO from '../hooks/useSEO';
import SignUpPromptModal from '../components/SignUpPromptModal';

const FREE_MESSAGE_LIMIT = 1;

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Minimal formatted message component
const FormattedMessage: React.FC<{ content: string }> = ({ content }) => {
  const formatLine = (line: string, key: number) => {
    const boldRegex = /\*\*(.*?)\*\*/g;
    const matches = line.match(boldRegex);
    
    if (matches) {
      const parts: React.ReactNode[] = [];
      let lastIndex = 0;
      
      line.replace(boldRegex, (match, boldText, offset) => {
        if (offset > lastIndex) {
          parts.push(line.substring(lastIndex, offset));
        }
        parts.push(
          <strong key={`bold-${offset}`} className="font-semibold text-gray-900">
            {boldText}
          </strong>
        );
        lastIndex = offset + match.length;
        return match;
      });
      
      if (lastIndex < line.length) {
        parts.push(line.substring(lastIndex));
      }
      
      return <span key={key}>{parts}</span>;
    }
    
    return line;
  };

  const formatContent = (text: string) => {
    const paragraphs = text.split('\n\n');
    
    return paragraphs.map((paragraph, pIdx) => {
      const lines = paragraph.split('\n');
      
      return (
        <div key={pIdx} className="mb-4 last:mb-0">
          {lines.map((line, lIdx) => {
            if (line.startsWith('### ')) {
              return (
                <h4 key={lIdx} className="font-semibold text-base text-gray-900 mt-4 mb-2">
                  {line.replace('### ', '')}
                </h4>
              );
            }
            if (line.startsWith('## ')) {
              return (
                <h3 key={lIdx} className="font-semibold text-lg text-gray-900 mt-5 mb-2">
                  {line.replace('## ', '')}
                </h3>
              );
            }
            if (line.startsWith('# ')) {
              return (
                <h2 key={lIdx} className="font-bold text-xl text-gray-900 mt-5 mb-3">
                  {line.replace('# ', '')}
                </h2>
              );
            }
            
            if (/^\d+\.\s/.test(line)) {
              const content = line.replace(/^\d+\.\s/, '');
              return (
                <div key={lIdx} className="ml-4 mb-2 flex items-start">
                  <span className="text-gray-400 mr-2 font-medium">{line.match(/^\d+\./)?.[0]}</span>
                  <span className="flex-1">{formatLine(content, lIdx)}</span>
                </div>
              );
            }
            
            if (line.startsWith('* ') || line.startsWith('- ') || line.startsWith('• ')) {
              const content = line.replace(/^[\*\-•]\s/, '');
              return (
                <div key={lIdx} className="ml-4 mb-2 flex items-start">
                  <span className="text-gray-400 mr-2">•</span>
                  <span className="flex-1">{formatLine(content, lIdx)}</span>
                </div>
              );
            }
            
            if (line.trim()) {
              return (
                <p key={lIdx} className="mb-2 leading-relaxed">
                  {formatLine(line, lIdx)}
                </p>
              );
            }
            return null;
          })}
        </div>
      );
    });
  };
  
  return <div className="text-gray-700 text-[15px] leading-relaxed">{formatContent(content)}</div>;
};

const LLMChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [freeMessagesUsed, setFreeMessagesUsed] = useState(0);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { t } = useLanguage();
  const { isAuthenticated, user } = useAuth();

  useSEO({
    title: 'AI Book Chat Assistant - Ask Questions About Books & Get Instant Summaries | BookBriefs',
    description: 'Chat with our AI assistant to get instant book recommendations, summaries, and insights. Ask questions about any book and receive intelligent, detailed answers.',
    keywords: 'AI book chat, book assistant, AI book recommendations, book questions, book summaries AI, intelligent book search, book chatbot',
    type: 'website',
  });

  const isArabic = (text: string): boolean => {
    const arabicRegex = /[\u0600-\u06FF]/;
    return arabicRegex.test(text);
  };

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 200) + 'px';
    }
  }, [input]);

  // Suggested prompts
  const quickActions = [
    { icon: BookOpen, label: 'Book Summary', prompt: 'Summarize "The Psychology of Money" by Morgan Housel' },
    { icon: TrendingUp, label: 'Trading Tips', prompt: 'What are the best trading strategies for beginners?' },
    { icon: Lightbulb, label: 'Investment Ideas', prompt: 'How should I start investing with $1000?' },
  ];

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    if (!isAuthenticated && freeMessagesUsed >= FREE_MESSAGE_LIMIT) {
      setShowSignUpModal(true);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    if (!isAuthenticated) {
      setFreeMessagesUsed((prev) => prev + 1);
    }

    try {
      const response = await chatWithAI(input, messages.map(m => ({
        role: m.role,
        content: m.content
      })));

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setInput('');
  };

  // Get user's first name if available
  const userName = (user as any)?.displayName?.split(' ')[0] || 'there';

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-16">
        
        {/* Empty State - Welcome Screen */}
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[70vh]">
            {/* Logo/Icon */}
            <div className="mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg p-2">
                <img src="/favicon/logo-white.png" alt="Ta7leel" className="w-12 h-12 object-contain" />
              </div>
            </div>

            {/* Greeting */}
            <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-3 text-center">
              {getGreeting()}, {userName}
            </h1>
            <p className="text-gray-500 text-lg mb-12 text-center max-w-md">
              How can I help you today?
            </p>

            {/* Input Box */}
            <div className="w-full max-w-2xl mb-8">
              <div className="relative bg-white rounded-2xl shadow-sm border border-gray-200 hover:border-gray-300 transition-colors">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about trading, books, or financial concepts..."
                  className="w-full px-5 py-4 pr-14 rounded-2xl bg-transparent text-gray-800 placeholder-gray-400 focus:outline-none resize-none text-[15px] min-h-[56px] max-h-[200px]"
                  dir={isArabic(input) ? 'rtl' : 'ltr'}
                  disabled={isLoading}
                  rows={1}
                />
                <button
                  onClick={() => handleSubmit()}
                  disabled={isLoading || !input.trim()}
                  className="absolute right-3 bottom-3 w-10 h-10 rounded-xl bg-gray-900 hover:bg-gray-800 disabled:bg-gray-200 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200"
                >
                  <ArrowUp className={`w-5 h-5 ${input.trim() ? 'text-white' : 'text-gray-400'}`} />
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap justify-center gap-3">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => setInput(action.prompt)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 text-sm text-gray-700 font-medium"
                >
                  <action.icon className="w-4 h-4 text-gray-500" />
                  {action.label}
                </button>
              ))}
            </div>

            {/* Arabic Subtitle */}
            <p className="text-gray-400 text-sm mt-12 text-center" dir="rtl">
              اسألني عن التداول، الكتب، أو المفاهيم المالية
            </p>
          </div>
        ) : (
          /* Chat View */
          <div className="flex flex-col min-h-[80vh]">
            {/* Messages Container */}
            <div className="flex-1 space-y-6 pb-32">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] ${
                      message.role === 'user'
                        ? 'bg-gray-900 text-white rounded-2xl rounded-br-md px-5 py-3'
                        : 'bg-transparent'
                    }`}
                    dir={isArabic(message.content) ? 'rtl' : 'ltr'}
                  >
                    {message.role === 'user' ? (
                      <p className="text-[15px] leading-relaxed">{message.content}</p>
                    ) : (
                      <div className="flex gap-4">
                        {/* AI Avatar */}
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center p-1">
                          <img src="/favicon/logo-white.png" alt="Ta7leel" className="w-6 h-6 object-contain" />
                        </div>
                        {/* Response Content */}
                        <div className="flex-1 pt-1">
                          <FormattedMessage content={message.content} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Loading State */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center p-1">
                      <img src="/favicon/logo-white.png" alt="Ta7leel" className="w-6 h-6 object-contain" />
                    </div>
                    <div className="flex items-center gap-1 pt-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Fixed Input at Bottom */}
            <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#FAF9F7] via-[#FAF9F7] to-transparent pt-8 pb-6">
              <div className="max-w-4xl mx-auto px-4">
                {/* New Chat Button */}
                <div className="flex justify-center mb-4">
                  <button
                    onClick={clearChat}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg transition-all duration-200"
                  >
                    <RotateCcw className="w-4 h-4" />
                    New chat
                  </button>
                </div>

                {/* Input */}
                <div className="relative bg-white rounded-2xl shadow-lg border border-gray-200">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask a follow-up question..."
                    className="w-full px-5 py-4 pr-14 rounded-2xl bg-transparent text-gray-800 placeholder-gray-400 focus:outline-none resize-none text-[15px] min-h-[56px] max-h-[200px]"
                    dir={isArabic(input) ? 'rtl' : 'ltr'}
                    disabled={isLoading}
                    rows={1}
                  />
                  <button
                    onClick={() => handleSubmit()}
                    disabled={isLoading || !input.trim()}
                    className="absolute right-3 bottom-3 w-10 h-10 rounded-xl bg-gray-900 hover:bg-gray-800 disabled:bg-gray-200 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <ArrowUp className={`w-5 h-5 ${input.trim() ? 'text-white' : 'text-gray-400'}`} />
                    )}
                  </button>
                </div>

                {/* Footer Text */}
                <p className="text-xs text-gray-400 text-center mt-3">
                  AI-powered insights about trading and books
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sign Up Modal */}
      <SignUpPromptModal 
        isOpen={showSignUpModal} 
        onClose={() => setShowSignUpModal(false)} 
      />
    </div>
  );
};

export default LLMChatPage;
