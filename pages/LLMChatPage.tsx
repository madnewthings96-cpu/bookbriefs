import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, MessageSquare, BookOpen, TrendingUp, Sparkles } from 'lucide-react';
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

  // Only scroll to bottom when a new message is added (not on initial load)
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages.length]);

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

  const handleSuggestedPrompt = (prompt: string) => {
    setInput(prompt);
  };

  const clearChat = () => {
    setMessages([]);
    setInput('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-4 md:py-8">
      <div className="container mx-auto px-1 md:px-3 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-4 md:mb-8 px-1 md:px-2">
          <div className="flex items-center justify-center mb-3 md:mb-4">
            <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-indigo-600 mr-2 md:mr-3" />
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-gray-800">
              AI Trading & Books
            </h1>
          </div>
          <p className="text-gray-600 text-sm md:text-lg max-w-2xl mx-auto px-2">
            اسألني عن أي شيء يتعلق باستراتيجيات التداول، وتوصيات الكتب، والمفاهيم المالية، والمزيد!
          </p>
        </div>

        {/* Main Chat Container */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Chat Messages Area */}
          <div className="h-[500px] md:h-[600px] overflow-y-auto p-4 md:p-6 space-y-4 bg-gray-50">
            {messages.length === 0 && (
              <div className="text-center text-gray-700 mt-10 md:mt-20">
                <div className="flex justify-center gap-6 mb-8">
                  <div className="text-center">
                    <BookOpen className="w-12 h-12 text-indigo-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-700">Books</p>
                  </div>
                  <div className="text-center">
                    <TrendingUp className="w-12 h-12 text-green-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-700">Trading</p>
                  </div>
                  <div className="text-center">
                    <MessageSquare className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-700">Insights</p>
                  </div>
                </div>
                
                <p className="text-xl md:text-2xl font-semibold mb-6 text-gray-800">
                  How can I help you today?
                </p>
                
                {/* Suggested Prompts */}
                <div className="max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-3 mt-8">
                  {suggestedPrompts.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestedPrompt(prompt)}
                      className="text-left p-4 bg-white hover:bg-indigo-50 border border-gray-200 hover:border-indigo-300 rounded-xl transition-all duration-300 group shadow-sm hover:shadow-md"
                    >
                      <p className="text-sm text-gray-700 group-hover:text-indigo-700">
                        {prompt}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[95%] md:max-w-[85%] lg:max-w-[80%] rounded-xl md:rounded-2xl p-3 md:p-4 lg:p-5 ${
                    message.role === 'user'
                      ? 'bg-indigo-50 text-gray-800 border-2 border-indigo-200 shadow-sm'
                      : 'bg-white text-gray-800 border border-gray-200 shadow-md'
                  }`}
                  dir={isArabic(message.content) ? 'rtl' : 'ltr'}
                >
                  <div className="flex items-start gap-2 md:gap-3">
                    {message.role === 'assistant' && (
                      <div className="flex-shrink-0 w-6 h-6 md:w-8 md:h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                        <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-indigo-600" />
                      </div>
                    )}
                    {message.role === 'user' && (
                      <div className="flex-shrink-0 w-6 h-6 md:w-8 md:h-8 rounded-full bg-indigo-200 flex items-center justify-center">
                        <MessageSquare className="w-3 h-3 md:w-4 md:h-4 text-indigo-700" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      {message.role === 'user' ? (
                        <p className="whitespace-pre-wrap leading-relaxed font-medium text-gray-900 text-sm md:text-base">{message.content}</p>
                      ) : (
                        <div className="max-w-none text-sm md:text-base">
                          <FormattedMessage content={message.content} />
                        </div>
                      )}
                      <p className="text-xs mt-2 md:mt-3 text-gray-500">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-700 rounded-2xl p-5 border border-gray-200 shadow-md">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 md:p-6 border-t border-gray-200 bg-white">
            {messages.length > 0 && (
              <div className="flex justify-end mb-3">
                <button
                  onClick={clearChat}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
                >
                  Clear chat
                </button>
              </div>
            )}
            <form onSubmit={handleSubmit} className="flex gap-2 md:gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about trading, books, or financial concepts..."
                className="flex-1 px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl bg-gray-50 text-gray-800 placeholder-gray-400 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                dir={isArabic(input) ? 'rtl' : 'ltr'}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="px-5 md:px-8 py-3 md:py-4 bg-indigo-600 text-white rounded-xl md:rounded-2xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
              >
                <Send className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </form>
            <p className="text-xs text-gray-500 mt-3 text-center">
              AI-powered insights about trading and books
            </p>
          </div>
        </div>

        {/* Instruction Block */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border-2 border-indigo-200 rounded-xl md:rounded-2xl p-4 md:p-6 lg:p-8 mb-4 md:mb-8 shadow-md mx-1 md:mx-0">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 mb-3 md:mb-4 text-center">
            مساعدك المالي بين يديك.
          </h2>
          <p className="text-sm md:text-base lg:text-lg text-gray-700 mb-3 md:mb-4 text-center leading-relaxed">
            اسألني عن التداول، الاستثمار، أو اطلب ملخصاً لأي كتاب في مجال المال والأعمال.
          </p>
          <p className="text-xs md:text-sm lg:text-base text-gray-600 text-center italic">
            <span className="font-semibold text-indigo-700">مثال:</span> "كيف أبدأ في التداول؟" أو "لخص لي كتاب سيكولوجية المال".
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mt-4 md:mt-8 mx-1 md:mx-0">
          <div className="bg-white border border-gray-200 rounded-xl p-3 md:p-4 shadow-md hover:shadow-lg transition-shadow duration-300">
            <BookOpen className="w-6 h-6 md:w-8 md:h-8 text-indigo-600 mb-2" />
            <h3 className="text-gray-800 font-semibold mb-1 text-sm md:text-base">Book Insights</h3>
            <p className="text-gray-600 text-xs md:text-sm">Get summaries and key takeaways from popular trading and business books</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-3 md:p-4 shadow-md hover:shadow-lg transition-shadow duration-300">
            <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-green-600 mb-2" />
            <h3 className="text-gray-800 font-semibold mb-1 text-sm md:text-base">Trading Strategies</h3>
            <p className="text-gray-600 text-xs md:text-sm">Learn about different trading approaches and risk management techniques</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-3 md:p-4 shadow-md hover:shadow-lg transition-shadow duration-300">
            <MessageSquare className="w-6 h-6 md:w-8 md:h-8 text-blue-600 mb-2" />
            <h3 className="text-gray-800 font-semibold mb-1 text-sm md:text-base">Interactive Learning</h3>
            <p className="text-gray-600 text-xs md:text-sm">Ask questions and get personalized explanations tailored to your needs</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LLMChatPage;
