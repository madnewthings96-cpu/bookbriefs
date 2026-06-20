import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  // Function to detect RTL languages (like Arabic)
  const isRTL = (text: string) => /[\u0600-\u06FF]/.test(text);

  const createHeadingId = (text: string) =>
    text
      .toLowerCase()
      .replace(/\*\*/g, '')
      .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-')
      .replace(/^-+|-+$/g, '');
  
  const parseMarkdown = (text: string) => {
    const rtl = isRTL(text);
    // Simple block-level parser for headings, lists, and paragraphs
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let articleTitleSeen = false;
    let previousBlockWasTitle = false;
    let i = 0;

    const pushParagraph = (buffer: string[]) => {
      const paragraph = buffer.join(' ').trim();
      if (!paragraph) return;
      previousBlockWasTitle = false;
      elements.push(
        <p
          key={`p-${elements.length}`}
          className={`mb-6 text-base leading-8 text-[#34413e] sm:text-lg ${rtl ? 'text-right' : 'text-left'}`}
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

      if (/^-{3,}$/.test(trimmed)) {
        elements.push(
          <hr key={`hr-${elements.length}`} className="my-9 border-0 border-t border-black/10" />
        );
        previousBlockWasTitle = false;
        i++; continue;
      }

      // ATX Headings
      const h3 = /^###\s+(.+)/.exec(trimmed);
      if (h3) {
        previousBlockWasTitle = false;
        elements.push(
          <h3
            key={`h3-${elements.length}`}
            id={createHeadingId(h3[1])}
            className={`mt-10 mb-4 text-2xl font-black leading-snug text-[#17211f] ${rtl ? 'text-right' : 'text-left'}`}
          >
            {parseInlineMarkdown(h3[1])}
          </h3>
        );
        i++; continue;
      }
      const h2 = /^##\s+(.+)/.exec(trimmed);
      if (h2) {
        previousBlockWasTitle = false;
        elements.push(
          <div key={`h2-wrapper-${elements.length}`} id={createHeadingId(h2[1])} className="mt-12 mb-5 border-t border-black/10 pt-8 first:mt-0 first:border-t-0 first:pt-0">
            <h2
              className={`text-3xl font-black leading-tight text-[#17211f] ${rtl ? 'text-right' : 'text-left'}`}
            >
              {parseInlineMarkdown(h2[1])}
            </h2>
          </div>
        );
        i++; continue;
      }
      const h1 = /^#\s+(.+)/.exec(trimmed);
      if (h1) {
        if (!articleTitleSeen) {
          articleTitleSeen = true;
          previousBlockWasTitle = true;
          elements.push(
            <h1
              key={`h1-${elements.length}`}
              id={createHeadingId(h1[1])}
              className={`mb-7 max-w-4xl text-3xl font-black leading-tight text-[#17211f] sm:text-4xl ${rtl ? 'text-right' : 'text-left'}`}
            >
              {parseInlineMarkdown(h1[1])}
            </h1>
          );
        } else {
          previousBlockWasTitle = false;
          elements.push(
            <div key={`h1-section-wrapper-${elements.length}`} id={createHeadingId(h1[1])} className="mt-12 mb-5 border-t border-black/10 pt-8 first:mt-0 first:border-t-0 first:pt-0">
              <h2
                className={`text-3xl font-black leading-tight text-[#17211f] ${rtl ? 'text-right' : 'text-left'}`}
              >
                {parseInlineMarkdown(h1[1])}
              </h2>
            </div>
          );
        }
        i++; continue;
      }

      // Bold block heading like **Introduction**
      if (trimmed.startsWith('**') && trimmed.endsWith('**') && trimmed.split('**').length === 3) {
        const headingText = trimmed.slice(2, -2);
        const isSubtitle = previousBlockWasTitle || /^(based on|source material|role|subtitle)\b/i.test(headingText);
        if (isSubtitle) {
          elements.push(
            <p
              key={`subtitle-${elements.length}`}
              className={`-mt-3 mb-8 max-w-3xl text-base font-bold leading-7 text-[#596a66] sm:text-lg ${rtl ? 'text-right' : 'text-left'}`}
            >
              {parseInlineMarkdown(headingText)}
            </p>
          );
        } else {
          elements.push(
            <div key={`b2-wrapper-${elements.length}`} id={createHeadingId(headingText)} className="mt-12 mb-5 border-t border-black/10 pt-8 first:mt-0 first:border-t-0 first:pt-0">
              <h2
                className={`text-3xl font-black leading-tight text-[#17211f] ${rtl ? 'text-right' : 'text-left'}`}
              >
                {headingText}
              </h2>
            </div>
          );
        }
        previousBlockWasTitle = false;
        i++; continue;
      }

      // Blockquote block
      if (/^>\s+/.test(trimmed)) {
        previousBlockWasTitle = false;
        const quoteLines: string[] = [];
        while (i < lines.length) {
          const quote = lines[i].trim();
          const m = /^>\s+(.+)/.exec(quote);
          if (!m) break;
          quoteLines.push(m[1]);
          i++;
        }
        elements.push(
          <blockquote
            key={`quote-${elements.length}`}
            className={`mb-8 rounded-lg bg-[#fff7ef] px-5 py-4 text-lg font-semibold leading-8 text-[#244c47] shadow-[inset_4px_0_0_#ff7f50] ${rtl ? 'text-right' : 'text-left'}`}
          >
            {parseInlineMarkdown(quoteLines.join(' '))}
          </blockquote>
        );
        continue;
      }

      // Ordered list block
      if (/^\d+\.\s+/.test(trimmed)) {
        previousBlockWasTitle = false;
        const items: React.ReactNode[] = [];
        while (i < lines.length) {
          const li = lines[i].trim();
          const m = /^(\d+)\.\s+(.+)/.exec(li);
          if (!m) break;
          items.push(
            <li key={`ol-${i}`} className={`${rtl ? 'mr-8' : 'ml-8'} leading-8 text-[#34413e]`}>
              {parseInlineMarkdown(m[2])}
            </li>
          );
          i++;
        }
        elements.push(
          <ol
            key={`ol-${elements.length}`}
            className={`mb-8 list-decimal ${rtl ? 'pr-8' : 'pl-8'} space-y-3 text-base marker:font-black marker:text-[#ff7f50] sm:text-lg`}
          >
            {items}
          </ol>
        );
        continue;
      }

      // Unordered list block
      if (/^[-*]\s+/.test(trimmed)) {
        previousBlockWasTitle = false;
        const items: React.ReactNode[] = [];
        while (i < lines.length) {
          const li = lines[i].trim();
          const m = /^[-*]\s+(.+)/.exec(li);
          if (!m) break;
          items.push(
            <li key={`ul-${i}`} className={`${rtl ? 'mr-8' : 'ml-8'} leading-8 text-[#34413e]`}>
              {parseInlineMarkdown(m[1])}
            </li>
          );
          i++;
        }
        elements.push(
          <ul
            key={`ul-${elements.length}`}
            className={`mb-8 list-disc ${rtl ? 'pr-8' : 'pl-8'} space-y-3 text-base marker:font-black marker:text-[#ff7f50] sm:text-lg`}
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
        if (/^-{3,}$/.test(peek)) break;
        if (/^>\s+/.test(peek)) break;
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
          <strong key={index} className="font-black text-[#17211f]">
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
      className={`max-w-none ${contentIsRTL ? 'rtl' : ''}`}
      dir={contentIsRTL ? 'rtl' : 'ltr'}
      lang={contentIsRTL ? 'ar' : undefined}
    >
      <div className="space-y-1">
        {parseMarkdown(content)}
      </div>
    </div>
  );
};

export default MarkdownRenderer;
