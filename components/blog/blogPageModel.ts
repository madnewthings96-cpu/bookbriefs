export interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  imageUrl: string;
  tags: string[];
  slug: string;
}

export type BlogPostDirection = 'ltr' | 'rtl';

interface BlogShareTarget {
  share?: (data: ShareData) => Promise<void>;
  clipboard?: Pick<Clipboard, 'writeText'>;
}

interface BlogScrollViewport {
  requestAnimationFrame: (callback: FrameRequestCallback) => number;
  cancelAnimationFrame: (handle: number) => void;
  scrollTo: (options: ScrollToOptions) => void;
}

const ARABIC_SCRIPT = /[\u0600-\u06ff\u0750-\u077f\u08a0-\u08ff]/;

const addClassName = (attributes: string, className: string): string => {
  const classAttribute = /\bclass=(['"])(.*?)\1/i;
  if (classAttribute.test(attributes)) {
    return attributes.replace(classAttribute, (_match, quote: string, classNames: string) => (
      `class=${quote}${classNames} ${className}${quote}`
    ));
  }
  return `${attributes} class="${className}"`;
};

export const getBlogCategories = (posts: BlogPost[]): string[] => (
  ['All', ...Array.from(new Set(posts.map((post) => post.category)))]
);

export const filterBlogPosts = (posts: BlogPost[], category: string): BlogPost[] => (
  category === 'All' ? [...posts] : posts.filter((post) => post.category === category)
);

export const getBlogPostDirection = (post: BlogPost): BlogPostDirection => {
  const languageSample = [post.title, post.excerpt, post.category, ...post.tags].join(' ');
  return ARABIC_SCRIPT.test(languageSample) ? 'rtl' : 'ltr';
};

export const getRelatedBlogPosts = (
  posts: BlogPost[],
  currentPost: BlogPost,
  limit = 4,
): BlogPost[] => {
  const candidates = posts.filter((post) => post.id !== currentPost.id);
  const sameTopic = candidates.filter((post) => post.category === currentPost.category);
  const otherTopics = candidates.filter((post) => post.category !== currentPost.category);
  return [...sameTopic, ...otherTopics].slice(0, limit);
};

export const calculateReadingProgress = (
  scrollY: number,
  articleTop: number,
  articleHeight: number,
  viewportHeight: number,
): number => {
  const readableDistance = Math.max(articleHeight - viewportHeight, 1);
  const travelled = scrollY - articleTop;
  return Math.round(Math.min(1, Math.max(0, travelled / readableDistance)) * 100);
};

export const shareBlogArticle = async (
  shareData: ShareData,
  target: BlogShareTarget,
): Promise<'Shared' | 'Link copied' | 'Copy failed' | 'Share'> => {
  try {
    if (target.share) {
      await target.share(shareData);
      return 'Shared';
    }
    if (!target.clipboard) throw new Error('Clipboard unavailable');
    await target.clipboard.writeText(shareData.url ?? '');
    return 'Link copied';
  } catch (error) {
    return error instanceof DOMException && error.name === 'AbortError' ? 'Share' : 'Copy failed';
  }
};

export const scheduleBlogScrollReset = (viewport: BlogScrollViewport): (() => void) => {
  let settledFrame = 0;
  const layoutFrame = viewport.requestAnimationFrame(() => {
    settledFrame = viewport.requestAnimationFrame(() => {
      viewport.scrollTo({ top: 0, behavior: 'auto' });
    });
  });

  return () => {
    viewport.cancelAnimationFrame(layoutFrame);
    viewport.cancelAnimationFrame(settledFrame);
  };
};

export const normalizeBlogArticleMarkup = (markup: string): string => {
  const normalizedDivs = markup.replace(/<div\b([^>]*)>/gi, (_tag, attributes: string) => {
    const styleMatch = attributes.match(/\bstyle=(['"])(.*?)\1/i);
    const style = styleMatch?.[2].toLowerCase() ?? '';
    let semanticClass = '';

    if (/grid-template-columns\s*:/.test(style)) semanticClass = 'article-comparison-grid';
    else if (/display\s*:\s*grid/.test(style)) semanticClass = 'article-step-list';
    else if (/display\s*:\s*flex/.test(style) && /justify-content\s*:\s*(center|space-around)/.test(style)) {
      semanticClass = 'article-diagram';
    } else if (/display\s*:\s*flex/.test(style)) semanticClass = 'article-inline-cluster';

    const withoutStyle = attributes.replace(/\s*\bstyle=(['"])(.*?)\1/i, '');
    return `<div${semanticClass ? addClassName(withoutStyle, semanticClass) : withoutStyle}>`;
  });

  const withoutInlineStyles = normalizedDivs.replace(
    /<([a-z][\w-]*)\b([^>]*)>/gi,
    (_tag, tagName: string, attributes: string) => (
      `<${tagName}${attributes.replace(/\s*\bstyle=(['"])(.*?)\1/i, '')}>`
    ),
  );

  const titleEcho = /(<div\b[^>]*\bclass=(['"])[^>]*\barticle-body\b[^>]*\2[^>]*>\s*)<h2\b[^>]*>[\s\S]*?<\/h2>/i;
  if (!titleEcho.test(withoutInlineStyles)) return withoutInlineStyles;

  const withoutTitleEcho = withoutInlineStyles.replace(titleEcho, '$1');
  const shiftedHeadings = /<h2\b/i.test(withoutTitleEcho)
    ? withoutTitleEcho
    : withoutTitleEcho.replace(/<(\/?)h([3-6])\b([^>]*)>/gi, (
      _tag,
      closingSlash: string,
      level: string,
      attributes: string,
    ) => `<${closingSlash}h${Number(level) - 1}${attributes}>`);

  return shiftedHeadings.replace(
    /<h([3-6])\b([^>]*)>([\s\S]*?)<\/h\1>/i,
    (_heading, _level: string, attributes: string, content: string) => `<h2${attributes}>${content}</h2>`,
  );
};
