import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, MessageSquare, BookOpen, TrendingUp, Sparkles } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { chatWithAI } from '../services/geminiService';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const LLMChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Suggested prompts
  const suggestedPrompts = [
    "What are the best trading strategies for beginners?",
    "Recommend books about technical analysis",
    "Explain the concept of risk management in trading",
    "What are the key takeaways from 'Thinking, Fast and Slow'?",
    "How to develop a trading psychology mindset?",
    "Summarize the main ideas from 'Rich Dad Poor Dad'"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-indigo-600 mr-3" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
              Trading & Books AI Chat
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Ask me anything about trading strategies, book recommendations, financial concepts, and more!
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
                  className={`max-w-[85%] md:max-w-[80%] rounded-2xl p-4 md:p-5 ${
                    message.role === 'user'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-white text-gray-800 border border-gray-200 shadow-md'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {message.role === 'assistant' && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-indigo-600" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                      <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-indigo-200' : 'text-gray-500'}`}>
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

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow duration-300">
            <BookOpen className="w-8 h-8 text-indigo-600 mb-2" />
            <h3 className="text-gray-800 font-semibold mb-1">Book Insights</h3>
            <p className="text-gray-600 text-sm">Get summaries and key takeaways from popular trading and business books</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow duration-300">
            <TrendingUp className="w-8 h-8 text-green-600 mb-2" />
            <h3 className="text-gray-800 font-semibold mb-1">Trading Strategies</h3>
            <p className="text-gray-600 text-sm">Learn about different trading approaches and risk management techniques</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow duration-300">
            <MessageSquare className="w-8 h-8 text-blue-600 mb-2" />
            <h3 className="text-gray-800 font-semibold mb-1">Interactive Learning</h3>
            <p className="text-gray-600 text-sm">Ask questions and get personalized explanations tailored to your needs</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LLMChatPage;
