import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  // Function to detect RTL languages (like Arabic)
  const isRTL = (text: string) => /[\u0600-\u06FF]/.test(text);
  
  const parseMarkdown = (text: string) => {
    const rtl = isRTL(text);
    // Simple block-level parser for headings, lists, and paragraphs
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let i = 0;

    const pushParagraph = (buffer: string[]) => {
      const paragraph = buffer.join(' ').trim();
      if (!paragraph) return;
      elements.push(
        <p
          key={`p-${elements.length}`}
          className={`text-gray-800 leading-relaxed md:leading-loose mb-5 text-sm sm:text-base ${rtl ? 'text-right' : 'text-left'}`}
          style={rtl ? { textAlign: 'justify', textJustify: 'inter-word' } : undefined}
        >
          {parseInlineMarkdown(paragraph)}
        </p>
      );
    };

    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      if (!trimmed) { i++; continue; }

      // ATX Headings
      const h3 = /^###\s+(.+)/.exec(trimmed);
      if (h3) {
        elements.push(
          <h3
            key={`h3-${elements.length}`}
            className={`text-2xl md:text-3xl font-semibold mt-8 mb-4 leading-snug tracking-tight text-gray-900 ${rtl ? 'text-right' : 'text-left'}`}
          >
            {parseInlineMarkdown(h3[1])}
          </h3>
        );
        i++; continue;
      }
      const h2 = /^##\s+(.+)/.exec(trimmed);
      if (h2) {
        elements.push(
          <h2
            key={`h2-${elements.length}`}
            className={`text-3xl md:text-4xl font-bold mt-10 mb-6 leading-snug tracking-tight text-gray-900 ${rtl ? 'text-right pr-3 border-r-4' : 'text-left pl-3 border-l-4'} border-indigo-500`}
          >
            {parseInlineMarkdown(h2[1])}
          </h2>
        );
        i++; continue;
      }
      const h1 = /^#\s+(.+)/.exec(trimmed);
      if (h1) {
        elements.push(
          <h1
            key={`h1-${elements.length}`}
            className={`text-4xl md:text-5xl font-extrabold mt-8 mb-5 leading-tight tracking-tight text-gray-900 ${rtl ? 'text-right' : 'text-left'}`}
          >
            {parseInlineMarkdown(h1[1])}
          </h1>
        );
        i++; continue;
      }

      // Bold block heading like **Introduction**
      if (trimmed.startsWith('**') && trimmed.endsWith('**') && trimmed.split('**').length === 3) {
        const headingText = trimmed.slice(2, -2);
        elements.push(
          <h2
            key={`b2-${elements.length}`}
            className={`text-3xl font-bold mb-6 mt-8 first:mt-0 leading-snug tracking-tight text-gray-900 ${rtl ? 'text-right pr-3 border-r-4' : 'text-left pl-3 border-l-4'} border-indigo-500`}
          >
            {headingText}
          </h2>
        );
        i++; continue;
      }

      // Ordered list block
      if (/^\d+\.\s+/.test(trimmed)) {
        const items: React.ReactNode[] = [];
        while (i < lines.length) {
          const li = lines[i].trim();
          const m = /^(\d+)\.\s+(.+)/.exec(li);
          if (!m) break;
          items.push(
            <li key={`ol-${i}`} className={rtl ? 'mr-6' : 'ml-6'}>{parseInlineMarkdown(m[2])}</li>
          );
          i++;
        }
        elements.push(
          <ol
            key={`ol-${elements.length}`}
            className={`list-decimal list-inside ${rtl ? 'pr-6' : 'pl-6'} space-y-2 mb-6 text-gray-800 text-sm sm:text-base`}
          >
            {items}
          </ol>
        );
        continue;
      }

      // Unordered list block
      if (/^[-*]\s+/.test(trimmed)) {
        const items: React.ReactNode[] = [];
        while (i < lines.length) {
          const li = lines[i].trim();
          const m = /^[-*]\s+(.+)/.exec(li);
          if (!m) break;
          items.push(
            <li key={`ul-${i}`} className={rtl ? 'mr-6' : 'ml-6'}>{parseInlineMarkdown(m[1])}</li>
          );
          i++;
        }
        elements.push(
          <ul
            key={`ul-${elements.length}`}
            className={`list-disc list-inside ${rtl ? 'pr-6' : 'pl-6'} space-y-2 mb-6 text-gray-800 text-sm sm:text-base`}
          >
            {items}
          </ul>
        );
        continue;
      }

      // Paragraph: accumulate until a blank line or next block element
      const buffer: string[] = [trimmed];
      i++;
      while (i < lines.length) {
        const peek = lines[i].trim();
        if (!peek) break;
        if (/^(###|##|#)\s+/.test(peek)) break;
        if (/^\d+\.\s+/.test(peek)) break;
        if (/^[-*]\s+/.test(peek)) break;
        buffer.push(peek);
        i++;
      }
      pushParagraph(buffer);
    }

    return elements;
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

  const contentIsRTL = isRTL(content);
  
  return (
    <div
      className={`prose prose-lg max-w-none ${contentIsRTL ? 'rtl' : ''}`}
      dir={contentIsRTL ? 'rtl' : 'ltr'}
      lang={contentIsRTL ? 'ar' : undefined}
    >
      <div className="space-y-2">
        {parseMarkdown(content)}
      </div>
    </div>
  );
};

export default MarkdownRenderer;
