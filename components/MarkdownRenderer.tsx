import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const parseMarkdown = (text: string) => {
    // Split content into sections and parse each part
    const sections = text.split(/\n\s*\n/);
    
    return sections.map((section, index) => {
      const trimmedSection = section.trim();
      if (!trimmedSection) return null;

      // Handle different markdown elements
      if (trimmedSection.startsWith('**') && trimmedSection.endsWith('**') && trimmedSection.split('**').length === 3) {
        // Main headings (like **Introduction**, **Key Takeaways**, etc.)
        const headingText = trimmedSection.slice(2, -2);
        return (
          <h2 key={index} className="text-3xl font-bold mb-6 mt-8 first:mt-0" style={{ color: '#2F4F4F' }}>
            {headingText}
          </h2>
        );
      }

      // Handle subheadings that start with ** but don't end with **
      if (trimmedSection.startsWith('**') && trimmedSection.includes(':**')) {
        const parts = trimmedSection.split(':**');
        const headingText = parts[0].slice(2); // Remove **
        const content = parts[1]?.trim();
        
        return (
          <div key={index} className="mb-6">
            <h3 className="text-xl font-semibold mb-3" style={{ color: '#2F4F4F' }}>
              {headingText}:
            </h3>
            {content && (
              <p className="text-gray-700 leading-relaxed">
                {parseInlineMarkdown(content)}
              </p>
            )}
          </div>
        );
      }

      // Handle bold subheadings that are standalone
      if (trimmedSection.startsWith('**') && trimmedSection.endsWith('**')) {
        const headingText = trimmedSection.slice(2, -2);
        return (
          <h3 key={index} className="text-xl font-semibold mb-4 mt-6" style={{ color: '#2F4F4F' }}>
            {headingText}
          </h3>
        );
      }

      // Regular paragraphs
      return (
        <p key={index} className="text-gray-700 leading-relaxed mb-4">
          {parseInlineMarkdown(trimmedSection)}
        </p>
      );
    }).filter(Boolean);
  };

  const parseInlineMarkdown = (text: string) => {
    // Handle bold text within paragraphs
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="font-semibold text-gray-800">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className="prose prose-lg max-w-none">
      <div className="space-y-1">
        {parseMarkdown(content)}
      </div>
    </div>
  );
};

export default MarkdownRenderer;
