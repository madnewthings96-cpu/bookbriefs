import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  Send, 
  Users, 
  Hash, 
  TrendingUp, 
  BookOpen, 
  Lightbulb,
  Heart,
  MessageSquare,
  Clock,
  User,
  Filter,
  Search,
  Plus,
  X
} from 'lucide-react';
import { useFirebase } from '../App';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  Timestamp,
  where,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  getDocs
} from 'firebase/firestore';
import { db } from '../firebase';
import useSEO from '../hooks/useSEO';

interface Message {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  content: string;
  channel: string;
  timestamp: Timestamp;
  likes: string[];
  replies: number;
}

interface Channel {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  color: string;
}

const CommunityPage: React.FC = () => {
  const { currentUser } = useFirebase();
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('general');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showChannels, setShowChannels] = useState(false);
  const [userCount, setUserCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useSEO({
    title: 'Community Chat - Connect with Book Lovers & Traders | BookBriefs',
    description: 'Join our vibrant community! Discuss books, trading strategies, share insights, and connect with fellow readers and traders in real-time.',
    keywords: 'book community, trading community, book discussion, trading chat, reader community, book lovers chat, trading forum',
    type: 'website',
  });

  const channels: Channel[] = [
    {
      id: 'general',
      name: 'General',
      icon: <MessageCircle className="w-5 h-5" />,
      description: 'General discussions',
      color: 'from-blue-500 to-indigo-600'
    },
    {
      id: 'books',
      name: 'Books & Reading',
      icon: <BookOpen className="w-5 h-5" />,
      description: 'Book recommendations and reviews',
      color: 'from-purple-500 to-pink-600'
    },
    {
      id: 'trading',
      name: 'Trading',
      icon: <TrendingUp className="w-5 h-5" />,
      description: 'Trading strategies and market analysis',
      color: 'from-green-500 to-emerald-600'
    },
    {
      id: 'insights',
      name: 'Insights',
      icon: <Lightbulb className="w-5 h-5" />,
      description: 'Share your insights and learnings',
      color: 'from-yellow-500 to-orange-600'
    }
  ];

  // Scroll to bottom only when sending a new message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load messages from Firestore with real-time updates
  useEffect(() => {
    const messagesRef = collection(db, 'communityMessages');
    const q = query(
      messagesRef,
      where('channel', '==', selectedChannel),
      orderBy('timestamp', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedMessages: Message[] = [];
      snapshot.forEach((doc) => {
        loadedMessages.push({
          id: doc.id,
          ...doc.data()
        } as Message);
      });
      setMessages(loadedMessages.reverse());
    });

    return () => unsubscribe();
  }, [selectedChannel]);

  // Get unique user count
  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        const messagesRef = collection(db, 'communityMessages');
        const q = query(messagesRef);
        const snapshot = await getDocs(q);
        
        const uniqueUsers = new Set<string>();
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.userId) {
            uniqueUsers.add(data.userId);
          }
        });
        
        setUserCount(uniqueUsers.size);
      } catch (error) {
        console.error('Error fetching user count:', error);
      }
    };

    fetchUserCount();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !currentUser || isLoading) return;

    setIsLoading(true);

    try {
      const messagesRef = collection(db, 'communityMessages');
      await addDoc(messagesRef, {
        userId: currentUser.uid,
        userName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Anonymous',
        userEmail: currentUser.email,
        content: newMessage.trim(),
        channel: selectedChannel,
        timestamp: serverTimestamp(),
        likes: [],
        replies: 0
      });

      setNewMessage('');
      scrollToBottom(); // Scroll to see the new message
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async (messageId: string, currentLikes: string[]) => {
    if (!currentUser) return;

    try {
      const messageRef = doc(db, 'communityMessages', messageId);
      
      if (currentLikes.includes(currentUser.uid)) {
        // Unlike
        await updateDoc(messageRef, {
          likes: arrayRemove(currentUser.uid)
        });
      } else {
        // Like
        await updateDoc(messageRef, {
          likes: arrayUnion(currentUser.uid)
        });
      }
    } catch (error) {
      console.error('Error liking message:', error);
    }
  };

  const formatTimestamp = (timestamp: Timestamp | null) => {
    if (!timestamp) return 'Just now';
    
    const date = timestamp.toDate();
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  const filteredMessages = messages.filter(msg => 
    searchQuery === '' || 
    msg.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentChannel = channels.find(c => c.id === selectedChannel);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-4 md:py-8">
      <div className="container mx-auto px-2 md:px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <div className="flex items-center justify-center mb-4">
            <Users className="w-10 h-10 text-indigo-600 mr-3 animate-pulse" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Community Chat
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Connect with fellow readers and traders. Share insights, ask questions, and grow together!
          </p>
          <div className="flex items-center justify-center gap-6 mt-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{userCount} members</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              <span>{messages.length} messages</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Channels Sidebar - Desktop */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-6 sticky top-4">
              <div className="flex items-center gap-2 mb-6">
                <Hash className="w-5 h-5 text-indigo-600" />
                <h2 className="text-xl font-bold text-gray-800">Channels</h2>
              </div>
              <div className="space-y-2">
                {channels.map((channel) => (
                  <button
                    key={channel.id}
                    onClick={() => setSelectedChannel(channel.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                      selectedChannel === channel.id
                        ? `bg-gradient-to-r ${channel.color} text-white shadow-lg scale-105`
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {channel.icon}
                    <div className="text-left flex-1">
                      <div className="font-semibold text-sm">{channel.name}</div>
                      <div className={`text-xs ${selectedChannel === channel.id ? 'text-white/80' : 'text-gray-500'}`}>
                        {channel.description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile Channel Selector */}
          <div className="lg:hidden col-span-1 mb-4">
            <button
              onClick={() => setShowChannels(!showChannels)}
              className={`w-full flex items-center justify-between p-4 rounded-xl bg-gradient-to-r ${currentChannel?.color} text-white shadow-lg`}
            >
              <div className="flex items-center gap-3">
                {currentChannel?.icon}
                <span className="font-semibold">{currentChannel?.name}</span>
              </div>
              <Filter className="w-5 h-5" />
            </button>
            
            {showChannels && (
              <div className="mt-2 bg-white rounded-xl shadow-xl border border-gray-200 p-4 space-y-2">
                {channels.map((channel) => (
                  <button
                    key={channel.id}
                    onClick={() => {
                      setSelectedChannel(channel.id);
                      setShowChannels(false);
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                      selectedChannel === channel.id
                        ? `bg-gradient-to-r ${channel.color} text-white`
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {channel.icon}
                    <span className="font-semibold text-sm">{channel.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Main Chat Area */}
          <div className="lg:col-span-3">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 overflow-hidden">
              {/* Chat Header */}
              <div className={`bg-gradient-to-r ${currentChannel?.color} text-white p-6`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {currentChannel?.icon}
                    <div>
                      <h2 className="text-2xl font-bold">{currentChannel?.name}</h2>
                      <p className="text-white/80 text-sm">{currentChannel?.description}</p>
                    </div>
                  </div>
                  {/* Search Bar */}
                  <div className="hidden md:block">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
                      <input
                        type="text"
                        placeholder="Search messages..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="h-[500px] md:h-[600px] overflow-y-auto p-4 md:p-6 space-y-4 bg-gradient-to-b from-gray-50/50 to-white/50">
                {filteredMessages.length === 0 ? (
                  <div className="text-center text-gray-500 mt-20">
                    <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-semibold">No messages yet</p>
                    <p className="text-sm">Be the first to start the conversation!</p>
                  </div>
                ) : (
                  filteredMessages.map((message) => (
                    <div
                      key={message.id}
                      className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                            {message.userName.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-gray-800">{message.userName}</span>
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTimestamp(message.timestamp)}
                            </span>
                          </div>
                          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
                            {message.content}
                          </p>
                          <div className="flex items-center gap-4 mt-3">
                            <button
                              onClick={() => handleLike(message.id, message.likes || [])}
                              className={`flex items-center gap-1 text-sm transition-colors ${
                                currentUser && message.likes?.includes(currentUser.uid)
                                  ? 'text-red-500'
                                  : 'text-gray-400 hover:text-red-500'
                              }`}
                            >
                              <Heart 
                                className={`w-4 h-4 ${
                                  currentUser && message.likes?.includes(currentUser.uid) ? 'fill-current' : ''
                                }`} 
                              />
                              <span>{message.likes?.length || 0}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 md:p-6 border-t-2 border-gray-100 bg-gradient-to-br from-white to-gray-50">
                {currentUser ? (
                  <form onSubmit={handleSendMessage} className="flex gap-3">
                    <div className="flex-1 relative">
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage(e);
                          }
                        }}
                        placeholder="Type your message... (Shift+Enter for new line)"
                        className="w-full px-4 py-3 rounded-xl bg-white border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-none"
                        rows={2}
                        disabled={isLoading}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading || !newMessage.trim()}
                      className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl font-medium"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </form>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-600 mb-4">Please sign in to join the conversation</p>
                    <a
                      href="/login"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg font-medium"
                    >
                      <User className="w-5 h-5" />
                      Sign In
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Community Guidelines */}
        <div className="mt-8 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-indigo-600" />
            Community Guidelines
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 font-bold">✓</span>
              </div>
              <div>
                <p className="font-semibold text-gray-800 mb-1">Be Respectful</p>
                <p>Treat everyone with kindness and respect</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold">✓</span>
              </div>
              <div>
                <p className="font-semibold text-gray-800 mb-1">Share Knowledge</p>
                <p>Help others learn and grow</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <span className="text-purple-600 font-bold">✓</span>
              </div>
              <div>
                <p className="font-semibold text-gray-800 mb-1">Stay On Topic</p>
                <p>Use the appropriate channel</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;
