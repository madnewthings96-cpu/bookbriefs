import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  imageUrl: string;
  tags: string[];
}

const BlogPage: React.FC = () => {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Mock blog posts data
  const blogPosts: BlogPost[] = [
    {
      id: 1,
      title: "The Science Behind Effective Reading Habits",
      excerpt: "Discover how neuroscience research reveals the most effective ways to absorb and retain information from books.",
      category: "Reading Tips",
      date: "2024-01-15",
      readTime: "5 min read",
      imageUrl: "/images/atomic-habits.jpg",
      tags: ["neuroscience", "productivity", "learning"]
    },
    {
      id: 2,
      title: "Building Your Personal Knowledge Management System",
      excerpt: "Learn how to create a system that helps you organize, connect, and apply insights from the books you read.",
      category: "Productivity",
      date: "2024-01-12",
      readTime: "8 min read",
      imageUrl: "/images/atomic-habits.jpg",
      tags: ["knowledge", "organization", "system"]
    },
    {
      id: 3,
      title: "Top 10 Business Books That Changed Everything",
      excerpt: "Explore the business books that have shaped modern entrepreneurship and continue to influence leaders today.",
      category: "Book Reviews",
      date: "2024-01-10",
      readTime: "12 min read",
      imageUrl: "/images/atomic-habits.jpg",
      tags: ["business", "entrepreneurship", "leadership"]
    },
    {
      id: 4,
      title: "Speed Reading vs Deep Reading: Finding Balance",
      excerpt: "Understanding when to read fast for information and when to read slowly for comprehension and retention.",
      category: "Reading Tips",
      date: "2024-01-08",
      readTime: "6 min read",
      imageUrl: "/images/atomic-habits.jpg",
      tags: ["speed reading", "comprehension", "techniques"]
    },
    {
      id: 5,
      title: "How AI is Transforming Book Summarization",
      excerpt: "Explore the technology behind AI-powered book summaries and how it's changing the way we consume knowledge.",
      category: "Technology",
      date: "2024-01-05",
      readTime: "7 min read",
      imageUrl: "/images/atomic-habits.jpg",
      tags: ["AI", "technology", "innovation"]
    },
    {
      id: 6,
      title: "The Psychology of Learning from Summaries",
      excerpt: "Research-backed insights into how our brains process condensed information and retain key concepts.",
      category: "Psychology",
      date: "2024-01-03",
      readTime: "9 min read",
      imageUrl: "/images/atomic-habits.jpg",
      tags: ["psychology", "learning", "memory"]
    },
    {
      id: 7,
      title: "Creating a Reading Routine That Sticks",
      excerpt: "Practical strategies for building sustainable reading habits that fit into your busy lifestyle.",
      category: "Reading Tips",
      date: "2024-01-01",
      readTime: "4 min read",
      imageUrl: "/images/atomic-habits.jpg",
      tags: ["habits", "routine", "lifestyle"]
    },
    {
      id: 8,
      title: "The Future of Digital Reading",
      excerpt: "Examining trends in digital reading platforms and how they're reshaping our relationship with books.",
      category: "Technology",
      date: "2023-12-28",
      readTime: "10 min read",
      imageUrl: "/images/atomic-habits.jpg",
      tags: ["digital", "future", "reading"]
    }
  ];

  const categories = ['All', 'Reading Tips', 'Productivity', 'Book Reviews', 'Technology', 'Psychology'];

  const filteredPosts = selectedCategory === 'All' 
    ? blogPosts 
    : blogPosts.filter(post => post.category === selectedCategory);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <section className="text-white py-20 px-4" style={{ backgroundColor: '#2F4F4F' }}>
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
            BookBriefs Newsroom
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto opacity-90">
            The latest news, announcements, lessons and learnings from BookBriefs
          </p>
          
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mt-8">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category
                    ? 'text-white border-2 border-white'
                    : 'text-gray-200 border-2 border-transparent hover:border-gray-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPosts.map((post) => (
              <article 
                key={post.id} 
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer group"
              >
                <div className="relative overflow-hidden">
                  <img 
                    src={post.imageUrl} 
                    alt={post.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMjUgNzVIMTc1VjEyNUgxMjVWNzVaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0xMDAgMTM1SDE4MFYxNDVIMTAwVjEzNVoiIGZpbGw9IiM5Q0EzQUYiLz4KPHA+PC9wYXRoPgo8L3N2Zz4K';
                    }}
                  />
                  <div className="absolute top-3 left-3">
                    <span 
                      className="px-2 py-1 text-xs font-medium text-white rounded-full"
                      style={{ backgroundColor: '#FF7F50' }}
                    >
                      {post.category}
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <span>{formatDate(post.date)}</span>
                    <span className="mx-2">•</span>
                    <span>{post.readTime}</span>
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-3 line-clamp-2 group-hover:text-orange-500 transition-colors" style={{ color: '#2F4F4F' }}>
                    {post.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex flex-wrap gap-1">
                    {post.tags.slice(0, 3).map((tag) => (
                      <span 
                        key={tag}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
          
          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No posts found in this category.</p>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 px-4" style={{ backgroundColor: '#F8F9FA' }}>
        <div className="container mx-auto text-center max-w-4xl">
          <h2 className="text-3xl font-bold mb-4" style={{ color: '#2F4F4F' }}>
            Your knowledge is your business
          </h2>
          <p className="text-gray-600 mb-8 text-lg">
            Unlock books and become successful with BookBriefs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              className="px-8 py-3 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#2F4F4F' }}
            >
              Explore Summaries
            </button>
            <button 
              className="px-8 py-3 border-2 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              style={{ borderColor: '#2F4F4F', color: '#2F4F4F' }}
            >
              Start a free trial
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BlogPage;
