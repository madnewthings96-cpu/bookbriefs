import React from 'react';
import { slugifySummaryHeading } from './summaryReadingModel';

interface MarkdownRendererProps {
  content: string;
}

const isRightToLeft = (text: string) => /[\u0600-\u06FF]/.test(text);

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const rtl = isRightToLeft(content);
  let articleTitleSeen = false;
  let previousBlockWasTitle = false;

  const renderInline = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);

    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={`${part}-${index}`} className="font-extrabold text-[#17382B]">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return (
          <em key={`${part}-${index}`} className="font-serif text-[#385448]">
            {part.slice(1, -1)}
          </em>
        );
      }
      return part;
    });
  };

  const sectionHeading = (text: string, key: string) => (
    <div
      key={key}
      className={`relative mb-5 mt-14 border-t border-[#304529]/10 pt-9 first:mt-0 first:border-t-0 first:pt-0 ${rtl ? 'pr-5' : 'pl-5'}`}
    >
      <span
        aria-hidden="true"
        className={`absolute top-9 h-8 w-1 rounded-full bg-gradient-to-b from-[#C49552] to-[#4A6741] first:top-0 ${rtl ? 'right-0' : 'left-0'}`}
      />
      <h3
        id={slugifySummaryHeading(text)}
        className={`scroll-mt-32 text-[27px] font-black leading-[1.18] tracking-[-0.025em] text-[#10291F] sm:text-[32px] ${rtl ? 'text-right' : 'text-left'}`}
      >
        {renderInline(text)}
      </h3>
    </div>
  );

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let paragraphIndex = 0;
  let index = 0;

  const pushParagraph = (buffer: string[]) => {
    const paragraph = buffer.join(' ').trim();
    if (!paragraph) return;

    const isOpeningParagraph = paragraphIndex === 0;
    paragraphIndex += 1;
    previousBlockWasTitle = false;
    elements.push(
      <p
        key={`paragraph-${elements.length}`}
        className={`mb-7 max-w-[70ch] text-[17px] leading-[1.85] text-[#40544B] sm:text-[18px] ${
          isOpeningParagraph ? 'text-[#30493E]' : ''
        } ${rtl ? 'text-right' : 'text-left'}`}
      >
        {renderInline(paragraph)}
      </p>,
    );
  };

  while (index < lines.length) {
    const trimmed = lines[index].trim();

    if (!trimmed) {
      index += 1;
      continue;
    }

    if (/^-{3,}$/.test(trimmed)) {
      elements.push(<hr key={`rule-${elements.length}`} className="my-10 border-0 border-t border-[#304529]/10" />);
      previousBlockWasTitle = false;
      index += 1;
      continue;
    }

    const levelThreeHeading = /^###\s+(.+)/.exec(trimmed);
    if (levelThreeHeading) {
      previousBlockWasTitle = false;
      elements.push(
        <h4
          key={`heading-four-${elements.length}`}
          id={slugifySummaryHeading(levelThreeHeading[1])}
          className={`mb-4 mt-10 scroll-mt-32 text-[22px] font-black leading-snug tracking-[-0.015em] text-[#17382B] sm:text-2xl ${rtl ? 'text-right' : 'text-left'}`}
        >
          {renderInline(levelThreeHeading[1])}
        </h4>,
      );
      index += 1;
      continue;
    }

    const levelTwoHeading = /^##\s+(.+)/.exec(trimmed);
    if (levelTwoHeading) {
      previousBlockWasTitle = false;
      elements.push(sectionHeading(levelTwoHeading[1], `heading-three-${elements.length}`));
      index += 1;
      continue;
    }

    const levelOneHeading = /^#\s+(.+)/.exec(trimmed);
    if (levelOneHeading) {
      if (!articleTitleSeen) {
        articleTitleSeen = true;
        previousBlockWasTitle = true;
        elements.push(
          <h3
            key={`article-title-${elements.length}`}
            id={slugifySummaryHeading(levelOneHeading[1])}
            className={`mb-7 scroll-mt-32 font-serif text-[30px] font-bold leading-[1.16] tracking-[-0.025em] text-[#10291F] sm:text-[38px] ${rtl ? 'text-right' : 'text-left'}`}
          >
            {renderInline(levelOneHeading[1])}
          </h3>,
        );
      } else {
        previousBlockWasTitle = false;
        elements.push(sectionHeading(levelOneHeading[1], `heading-three-${elements.length}`));
      }
      index += 1;
      continue;
    }

    if (trimmed.startsWith('**') && trimmed.endsWith('**') && trimmed.split('**').length === 3) {
      const headingText = trimmed.slice(2, -2);
      const isSubtitle = previousBlockWasTitle || /^(based on|source material|role|subtitle)\b/i.test(headingText);

      if (isSubtitle) {
        elements.push(
          <p
            key={`subtitle-${elements.length}`}
            className={`-mt-3 mb-9 max-w-[65ch] text-[15px] font-bold leading-7 text-[#708077] sm:text-base ${rtl ? 'text-right' : 'text-left'}`}
          >
            {renderInline(headingText)}
          </p>,
        );
      } else {
        elements.push(sectionHeading(headingText, `bold-heading-${elements.length}`));
      }
      previousBlockWasTitle = false;
      index += 1;
      continue;
    }

    if (/^>\s+/.test(trimmed)) {
      const quoteLines: string[] = [];
      while (index < lines.length) {
        const quoteMatch = /^>\s+(.+)/.exec(lines[index].trim());
        if (!quoteMatch) break;
        quoteLines.push(quoteMatch[1]);
        index += 1;
      }
      previousBlockWasTitle = false;
      elements.push(
        <blockquote
          key={`quote-${elements.length}`}
          className={`relative my-9 max-w-[68ch] rounded-[20px] border border-[#304529]/10 bg-[#E9EFE6] px-6 py-5 font-serif text-xl font-semibold leading-8 text-[#29473A] shadow-[inset_4px_0_0_#C49552] sm:text-[22px] ${rtl ? 'text-right shadow-[inset_-4px_0_0_#C49552]' : 'text-left'}`}
        >
          {renderInline(quoteLines.join(' '))}
        </blockquote>,
      );
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      const items: React.ReactNode[] = [];
      while (index < lines.length) {
        const listMatch = /^(\d+)\.\s+(.+)/.exec(lines[index].trim());
        if (!listMatch) break;
        items.push(
          <li key={`ordered-item-${index}`} className="pl-1 leading-8 text-[#40544B] marker:font-black marker:text-[#9A713B]">
            {renderInline(listMatch[2])}
          </li>,
        );
        index += 1;
      }
      previousBlockWasTitle = false;
      elements.push(
        <ol
          key={`ordered-list-${elements.length}`}
          className={`mb-8 max-w-[68ch] list-decimal space-y-3 text-[17px] sm:text-[18px] ${rtl ? 'pr-7' : 'pl-7'}`}
        >
          {items}
        </ol>,
      );
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      const items: React.ReactNode[] = [];
      while (index < lines.length) {
        const listMatch = /^[-*]\s+(.+)/.exec(lines[index].trim());
        if (!listMatch) break;
        items.push(
          <li key={`unordered-item-${index}`} className="pl-1 leading-8 text-[#40544B] marker:text-[#C49552]">
            {renderInline(listMatch[1])}
          </li>,
        );
        index += 1;
      }
      previousBlockWasTitle = false;
      elements.push(
        <ul
          key={`unordered-list-${elements.length}`}
          className={`mb-8 max-w-[68ch] list-disc space-y-3 text-[17px] sm:text-[18px] ${rtl ? 'pr-7' : 'pl-7'}`}
        >
          {items}
        </ul>,
      );
      continue;
    }

    const paragraphBuffer: string[] = [trimmed];
    index += 1;
    while (index < lines.length) {
      const nextLine = lines[index].trim();
      if (!nextLine) break;
      if (/^(#{1,3})\s+/.test(nextLine)) break;
      if (/^-{3,}$/.test(nextLine)) break;
      if (/^>\s+/.test(nextLine)) break;
      if (/^\d+\.\s+/.test(nextLine)) break;
      if (/^[-*]\s+/.test(nextLine)) break;
      if (/^\*\*[^*]+\*\*$/.test(nextLine)) break;
      paragraphBuffer.push(nextLine);
      index += 1;
    }
    pushParagraph(paragraphBuffer);
  }

  return (
    <div dir={rtl ? 'rtl' : 'ltr'} lang={rtl ? 'ar' : 'en'} className={rtl ? 'rtl' : undefined}>
      {elements}
    </div>
  );
};

export default MarkdownRenderer;
