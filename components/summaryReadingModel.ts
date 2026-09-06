export interface SummarySection {
  id: string;
  label: string;
}

interface SummarySectionPosition {
  id: string;
  top: number;
}

export const slugifySummaryHeading = (text: string) =>
  text
    .toLowerCase()
    .replace(/\*\*/g, '')
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const stripSummaryMarkdown = (text: string) =>
  text
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^>\s*/gm, '')
    .replace(/^\s*(?:[-*]|\d+\.)\s+/gm, '')
    .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
    .replace(/[\*_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

export const getSummaryLead = (text: string) => {
  const leadLine =
    text
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .find((line) => !/^(#{1,6}\s+|\*\*.+\*\*$|\d+\.\s+|[-*]\s+|>\s*)/.test(line)) || text;
  const plain = stripSummaryMarkdown(leadLine);
  const sentence = plain.match(/^(.+?[.!؟])(?:\s|$)/)?.[1];

  return sentence || plain.slice(0, 220).trim();
};

export const extractSummarySections = (text: string): SummarySection[] => {
  const sections: SummarySection[] = [];
  const seenIds = new Set<string>();
  let documentTitleSeen = false;

  text.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    const atxHeading = /^(#{1,3})\s+(.+)/.exec(trimmed);
    const boldHeading = /^\*\*([^*]+)\*\*$/.exec(trimmed);

    if (atxHeading?.[1] === '#' && !documentTitleSeen) {
      documentTitleSeen = true;
      return;
    }

    const label = (atxHeading?.[2] || boldHeading?.[1] || '').replace(/\*\*/g, '').trim();
    if (!label) return;

    if (boldHeading && documentTitleSeen && sections.length === 0) {
      const precedingContent = text.slice(0, text.indexOf(line));
      const meaningfulLines = precedingContent.split('\n').map((item) => item.trim()).filter(Boolean);
      if (meaningfulLines.length === 1) return;
    }

    const id = slugifySummaryHeading(label);
    if (!id || seenIds.has(id)) return;

    seenIds.add(id);
    sections.push({ id, label });
  });

  return sections;
};

export const pickActiveSummarySection = (
  positions: SummarySectionPosition[],
  readingAnchor: number,
) => {
  if (positions.length === 0) return '';

  let activeId = positions[0].id;
  positions.forEach((position) => {
    if (position.top <= readingAnchor) activeId = position.id;
  });

  return activeId;
};

export const getSummaryLandmark = (activeSectionId: string) => {
  if (activeSectionId === 'quick-brief' || activeSectionId === 'key-takeaways') {
    return activeSectionId;
  }
  return 'detailed-summary';
};
