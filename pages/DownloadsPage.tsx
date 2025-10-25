import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface DownloadItem {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileSize: string;
  category: string;
  uploadDate: string;
}

const DownloadsPage: React.FC = () => {
  const { t } = useLanguage();
  
  // Placeholder downloads - you can add more items here later
  const [downloads] = useState<DownloadItem[]>([
    {
      id: '1',
      title: 'Ta7leel Trading Journal - Standard',
      description: 'Professional trading journal template for tracking and analyzing your trades',
      fileUrl: 'https://www.notion.so/Ta7leel-site-Trading-Journal-Standard-2905d80c6175803e9f67c375e834c0a6',
      fileSize: 'Notion Template',
      category: 'Trading',
      uploadDate: '2024-01-15'
    }
    // Example structure - you can add your PDFs here
    // {
    //   id: '2',
    //   title: 'Reading Guide 2024',
    //   description: 'A comprehensive guide to maximize your reading experience',
    //   fileUrl: '/downloads/reading-guide-2024.pdf',
    //   fileSize: '2.5 MB',
    //   category: 'Guides',
    //   uploadDate: '2024-01-15'
    // }
  ]);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(downloads.map(item => item.category)))];

  // Filter downloads by category
  const filteredDownloads = selectedCategory === 'all' 
    ? downloads 
    : downloads.filter(item => item.category === selectedCategory);

  const handleDownload = (fileUrl: string, title: string) => {
    // Check if it's an external link (like Notion)
    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
      window.open(fileUrl, '_blank');
    } else {
      // Create a temporary link and trigger download for local files
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = title;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Downloads
          </h1>
          <p className="text-lg text-gray-600">
            Exclusive resources and materials for our members
          </p>
        </div>

        {/* Category Filter */}
        {downloads.length > 0 && (
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    selectedCategory === category
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Downloads Grid */}
        {filteredDownloads.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDownloads.map((download) => (
              <div
                key={download.id}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden"
              >
                <div className="p-6">
                  {/* Category Badge */}
                  <div className="mb-4">
                    <span className="inline-block px-3 py-1 text-xs font-semibold text-orange-600 bg-orange-100 rounded-full">
                      {download.category}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {download.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {download.description}
                  </p>

                  {/* File Info */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      {download.fileSize}
                    </span>
                    <span>{new Date(download.uploadDate).toLocaleDateString()}</span>
                  </div>

                  {/* Download Button */}
                  <button
                    onClick={() => handleDownload(download.fileUrl, download.title)}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center shadow-md hover:shadow-lg"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    {download.fileUrl.startsWith('http') ? 'Open Link' : 'Download PDF'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="max-w-md mx-auto">
              <svg
                className="w-24 h-24 mx-auto text-gray-300 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                No downloads available yet
              </h3>
              <p className="text-gray-600">
                Check back soon! We'll be adding exclusive resources and materials for our members.
              </p>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <svg
              className="w-6 h-6 text-blue-500 mr-3 flex-shrink-0 mt-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                About Downloads
              </h4>
              <p className="text-gray-700">
                This section contains exclusive PDF resources, guides, and materials available only to registered members. 
                All downloads are free for BookBriefs members. If you have any questions or need assistance, 
                please contact our support team.
              </p>
            </div>
          </div>
        </div>

        {/* Support Section - Buy Me a Coffee */}
        <div className="mt-8 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-8 text-center">
          <div className="max-w-2xl mx-auto">
            <h4 className="text-2xl font-bold text-gray-900 mb-3">
              ☕ Support Our Work
            </h4>
            <p className="text-gray-700 mb-6">
              If you find these resources helpful, consider supporting us with a coffee! 
              Your support helps us create more quality content and tools for the community.
            </p>
            <a
              href="https://ko-fi.com/ta7leel"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <svg 
                className="w-6 h-6 mr-2" 
                viewBox="0 0 24 24" 
                fill="currentColor"
              >
                <path d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 2.424 2.586 2.672 2.586 2.672s8.267-.023 11.966-.049c2.438-.426 2.683-2.566 2.658-3.734 4.352.24 7.422-2.831 6.649-6.916zm-11.062 3.511c-1.246 1.453-4.011 3.976-4.011 3.976s-.121.119-.31.023c-.076-.057-.108-.09-.108-.09-.443-.441-3.368-3.049-4.034-3.954-.709-.965-1.041-2.7-.091-3.71.951-1.01 3.005-1.086 4.363.407 0 0 1.565-1.782 3.468-.963 1.904.82 1.832 3.011.723 4.311zm6.173.478c-.928.116-1.682.028-1.682.028V7.284h1.77s1.971.551 1.971 2.638c0 1.913-.985 2.667-2.059 3.015z"/>
              </svg>
              Buy Me a Coffee on Ko-fi
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadsPage;
