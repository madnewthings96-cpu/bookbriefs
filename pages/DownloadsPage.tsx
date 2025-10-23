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
    // Example structure - you can add your PDFs here
    // {
    //   id: '1',
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
    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = title;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
                    Download PDF
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
      </div>
    </div>
  );
};

export default DownloadsPage;
