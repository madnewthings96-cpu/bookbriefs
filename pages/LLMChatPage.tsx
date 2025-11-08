import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, MessageSquare, BookOpen, TrendingUp, Sparkles, Trash2, Bot, User } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { chatWithAI } from '../services/geminiService';
import useSEO from '../hooks/useSEO';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Helper component to format AI responses
const FormattedMessage: React.FC<{ content: string }> = ({ content }) => {
  const formatLine = (line: string, key: number) => {
    // Check if line has both bold (**text**) and other formatting
    const boldRegex = /\*\*(.*?)\*\*/g;
    const matches = line.match(boldRegex);
    
    if (matches) {
      const parts: React.ReactNode[] = [];
      let lastIndex = 0;
      
      line.replace(boldRegex, (match, boldText, offset) => {
        // Add text before bold
        if (offset > lastIndex) {
          parts.push(line.substring(lastIndex, offset));
        }
        // Add bold text
        parts.push(
          <strong key={`bold-${offset}`} className="font-bold text-gray-900 bg-indigo-50 px-1 rounded">
            {boldText}
          </strong>
        );
        lastIndex = offset + match.length;
        return match;
      });
      
      // Add remaining text
      if (lastIndex < line.length) {
        parts.push(line.substring(lastIndex));
      }
      
      return <span key={key}>{parts}</span>;
    }
    
    return line;
  };

  const formatContent = (text: string) => {
    // Split by double newlines for paragraphs
    const paragraphs = text.split('\n\n');
    
    return paragraphs.map((paragraph, pIdx) => {
      const lines = paragraph.split('\n');
      
      return (
        <div key={pIdx} className="mb-5 last:mb-0">
          {lines.map((line, lIdx) => {
            // Check if line is a header (starts with ###, ##, or #)
            if (line.startsWith('### ')) {
              return (
                <h4 key={lIdx} className="font-bold text-lg text-indigo-700 mt-5 mb-3 border-b-2 border-indigo-200 pb-1">
                  {line.replace('### ', '')}
                </h4>
              );
            }
            if (line.startsWith('## ')) {
              return (
                <h3 key={lIdx} className="font-bold text-xl text-indigo-800 mt-6 mb-3 border-b-2 border-indigo-300 pb-2">
                  {line.replace('## ', '')}
                </h3>
              );
            }
            if (line.startsWith('# ')) {
              return (
                <h2 key={lIdx} className="font-bold text-2xl text-indigo-900 mt-6 mb-4 border-b-2 border-indigo-400 pb-2">
                  {line.replace('# ', '')}
                </h2>
              );
            }
            
            // Check if line is a numbered list item
            if (/^\d+\.\s/.test(line)) {
              const number = line.match(/^\d+\./)?.[0];
              const content = line.replace(/^\d+\.\s/, '');
              return (
                <div key={lIdx} className="ml-2 mb-3 flex items-start group">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center mr-3 group-hover:bg-indigo-200 transition-colors">
                    {number?.replace('.', '')}
                  </span>
                  <span className="flex-1 pt-1 leading-relaxed">{formatLine(content, lIdx)}</span>
                </div>
              );
            }
            
            // Check if line starts with * (for sub-points like * Asset: or * Liability:)
            if (line.startsWith('* ')) {
              const content = line.replace(/^\*\s/, '');
              return (
                <div key={lIdx} className="ml-12 mb-2 flex items-start bg-gray-50 p-3 rounded-lg border-l-4 border-indigo-300">
                  <span className="flex-1 leading-relaxed">{formatLine(content, lIdx)}</span>
                </div>
              );
            }
            
            // Check if line is a bullet point
            if (line.startsWith('- ') || line.startsWith('• ')) {
              const content = line.replace(/^[-•]\s/, '');
              return (
                <div key={lIdx} className="ml-6 mb-2 flex items-start">
                  <span className="text-indigo-600 mr-3 text-lg flex-shrink-0">•</span>
                  <span className="flex-1 leading-relaxed">{formatLine(content, lIdx)}</span>
                </div>
              );
            }
            
            // Regular paragraph with possible bold text
            if (line.trim()) {
              return (
                <p key={lIdx} className="mb-3 leading-relaxed text-gray-700">
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
  
  return <div className="text-gray-700 text-base">{formatContent(content)}</div>;
};

const LLMChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();

  useSEO({
    title: 'AI Book Chat Assistant - Ask Questions About Books & Get Instant Summaries | BookBriefs',
    description: 'Chat with our AI assistant to get instant book recommendations, summaries, and insights. Ask questions about any book and receive intelligent, detailed answers.',
    keywords: 'AI book chat, book assistant, AI book recommendations, book questions, book summaries AI, intelligent book search, book chatbot',
    type: 'website',
  });

  // Helper function to detect if text is Arabic
  const isArabic = (text: string): boolean => {
    const arabicRegex = /[\u0600-\u06FF]/;
    return arabicRegex.test(text);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Removed auto-scroll - user can manually scroll if needed

  // Suggested prompts
  const suggestedPrompts = [
    "What are the best trading strategies for beginners?",
    "اشرح مفهوم إدارة المخاطر في التداول"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const handleSuggestedPrompt = (prompt: string) => {
    setInput(prompt);
  };

  const clearChat = () => {
    setMessages([]);
    setInput('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-4 md:py-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-1 md:px-3 max-w-6xl relative z-10">
        {/* Header with animation */}
        <div className="text-center mb-6 md:mb-10 px-1 md:px-2 animate-fade-in">
          <div className="flex items-center justify-center mb-4 md:mb-5 group">
            <div className="relative">
              <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-indigo-600 mr-3 md:mr-4 animate-pulse" />
              <div className="absolute inset-0 blur-lg bg-indigo-400 opacity-30 animate-pulse"></div>
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              AI Trading & Books
            </h1>
          </div>
          <p className="text-gray-700 text-base md:text-xl max-w-3xl mx-auto px-2 leading-relaxed font-medium">
            اسألني عن أي شيء يتعلق باستراتيجيات التداول، وتوصيات الكتب، والمفاهيم المالية، والمزيد!
          </p>
        </div>

        {/* Main Chat Container */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden transform hover:shadow-3xl transition-all duration-500">
          {/* Chat Messages Area */}
          <div className="h-[500px] md:h-[650px] overflow-y-auto p-4 md:p-8 space-y-6 bg-gradient-to-b from-gray-50/50 to-white/50 custom-scrollbar">
            {messages.length === 0 && (
              <div className="text-center text-gray-700 mt-10 md:mt-20 animate-fade-in-up">
                <div className="flex justify-center gap-8 md:gap-12 mb-10">
                  <div className="text-center group cursor-pointer transform hover:scale-110 transition-transform duration-300">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:shadow-xl transition-shadow">
                      <BookOpen className="w-8 h-8 md:w-10 md:h-10 text-white" />
                    </div>
                    <p className="text-sm md:text-base font-semibold text-gray-800">Books</p>
                  </div>
                  <div className="text-center group cursor-pointer transform hover:scale-110 transition-transform duration-300">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:shadow-xl transition-shadow">
                      <TrendingUp className="w-8 h-8 md:w-10 md:h-10 text-white" />
                    </div>
                    <p className="text-sm md:text-base font-semibold text-gray-800">Trading</p>
                  </div>
                  <div className="text-center group cursor-pointer transform hover:scale-110 transition-transform duration-300">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:shadow-xl transition-shadow">
                      <MessageSquare className="w-8 h-8 md:w-10 md:h-10 text-white" />
                    </div>
                    <p className="text-sm md:text-base font-semibold text-gray-800">Insights</p>
                  </div>
                </div>
                
                <h2 className="text-2xl md:text-4xl font-bold mb-8 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-clip-text text-transparent">
                  How can I help you today?
                </h2>
                
                {/* Suggested Prompts */}
                <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 mt-10">
                  {suggestedPrompts.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestedPrompt(prompt)}
                      className="text-left p-5 md:p-6 bg-gradient-to-br from-white to-gray-50 hover:from-indigo-50 hover:to-purple-50 border-2 border-gray-200 hover:border-indigo-300 rounded-2xl transition-all duration-300 group shadow-md hover:shadow-xl transform hover:-translate-y-1"
                    >
                      <div className="flex items-start gap-3">
                        <Sparkles className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-1 group-hover:animate-pulse" />
                        <p className="text-sm md:text-base text-gray-700 group-hover:text-indigo-700 font-medium leading-relaxed">
                          {prompt}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-in`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div
                  className={`max-w-[95%] md:max-w-[85%] lg:max-w-[75%] rounded-2xl md:rounded-3xl p-4 md:p-6 transform hover:scale-[1.02] transition-all duration-300 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg hover:shadow-xl'
                      : 'bg-white text-gray-800 border-2 border-gray-100 shadow-lg hover:shadow-xl'
                  }`}
                  dir={isArabic(message.content) ? 'rtl' : 'ltr'}
                >
                  <div className="flex items-start gap-3 md:gap-4">
                    {message.role === 'assistant' && (
                      <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                        <Bot className="w-4 h-4 md:w-5 md:h-5 text-white" />
                      </div>
                    )}
                    {message.role === 'user' && (
                      <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <User className="w-4 h-4 md:w-5 md:h-5 text-white" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      {message.role === 'user' ? (
                        <p className="whitespace-pre-wrap leading-relaxed font-medium text-white text-sm md:text-base">{message.content}</p>
                      ) : (
                        <div className="max-w-none text-sm md:text-base">
                          <FormattedMessage content={message.content} />
                        </div>
                      )}
                      <p className={`text-xs mt-3 ${message.role === 'user' ? 'text-white/70' : 'text-gray-400'}`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start animate-slide-in">
                <div className="bg-white text-gray-700 rounded-3xl p-6 border-2 border-gray-100 shadow-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce"></div>
                      <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-3 h-3 bg-pink-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 md:p-8 border-t-2 border-gray-100 bg-gradient-to-br from-white to-gray-50">
            {messages.length > 0 && (
              <div className="flex justify-between items-center mb-4">
                <div className="text-sm text-gray-600 font-medium">
                  {messages.length} {messages.length === 1 ? 'message' : 'messages'}
                </div>
                <button
                  onClick={clearChat}
                  className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl transition-all duration-300 font-medium transform hover:scale-105"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear chat
                </button>
              </div>
            )}
            <form onSubmit={handleSubmit} className="flex gap-3 md:gap-4">
              <div className="flex-1 relative group">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about trading, books, or financial concepts..."
                  className="w-full px-5 md:px-7 py-4 md:py-5 rounded-2xl md:rounded-3xl bg-white text-gray-800 placeholder-gray-400 border-2 border-gray-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 shadow-md focus:shadow-xl text-sm md:text-base"
                  dir={isArabic(input) ? 'rtl' : 'ltr'}
                  disabled={isLoading}
                />
                <div className="absolute inset-0 rounded-2xl md:rounded-3xl bg-gradient-to-r from-indigo-500 to-purple-600 opacity-0 group-focus-within:opacity-10 blur-xl transition-opacity duration-300 pointer-events-none"></div>
              </div>
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="px-6 md:px-10 py-4 md:py-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl md:rounded-3xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-2xl disabled:hover:scale-100 font-medium"
              >
                <Send className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </form>
            <p className="text-xs md:text-sm text-gray-500 mt-4 text-center font-medium">
              ✨ AI-powered insights about trading and books
            </p>
          </div>
        </div>

        {/* Instruction Block */}
        <div className="bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 border-2 border-indigo-300 rounded-3xl p-6 md:p-10 mb-6 md:mb-10 shadow-xl mx-1 md:mx-0 transform hover:scale-[1.02] transition-all duration-300">
          <div className="text-center">
            <div className="inline-block bg-white/50 backdrop-blur-sm rounded-2xl px-6 py-3 mb-4">
              <h2 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                مساعدك المالي بين يديك
              </h2>
            </div>
            <p className="text-base md:text-xl text-gray-800 mb-4 leading-relaxed font-medium max-w-3xl mx-auto">
              اسألني عن التداول، الاستثمار، أو اطلب ملخصاً لأي كتاب في مجال المال والأعمال.
            </p>
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 max-w-2xl mx-auto">
              <p className="text-sm md:text-base text-gray-700 italic">
                <span className="font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">مثال:</span> 
                <span className="text-gray-800"> "كيف أبدأ في التداول؟" أو "لخص لي كتاب سيكولوجية المال".</span>
              </p>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-6 md:mt-10 mx-1 md:mx-0">
          <div className="group bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-2xl p-5 md:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:border-indigo-400">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-md">
              <BookOpen className="w-6 h-6 md:w-7 md:h-7 text-white" />
            </div>
            <h3 className="text-gray-900 font-bold mb-2 text-base md:text-lg">Book Insights</h3>
            <p className="text-gray-600 text-sm md:text-base leading-relaxed">Get summaries and key takeaways from popular trading and business books</p>
          </div>
          <div className="group bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-2xl p-5 md:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:border-green-400">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-md">
              <TrendingUp className="w-6 h-6 md:w-7 md:h-7 text-white" />
            </div>
            <h3 className="text-gray-900 font-bold mb-2 text-base md:text-lg">Trading Strategies</h3>
            <p className="text-gray-600 text-sm md:text-base leading-relaxed">Learn about different trading approaches and risk management techniques</p>
          </div>
          <div className="group bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-2xl p-5 md:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:border-purple-400">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-md">
              <MessageSquare className="w-6 h-6 md:w-7 md:h-7 text-white" />
            </div>
            <h3 className="text-gray-900 font-bold mb-2 text-base md:text-lg">Interactive Learning</h3>
            <p className="text-gray-600 text-sm md:text-base leading-relaxed">Ask questions and get personalized explanations tailored to your needs</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LLMChatPage;
