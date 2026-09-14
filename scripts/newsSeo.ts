import type { NewsArticle } from '../components/news/newsModel.ts';
import { BRAND_NAME, DEFAULT_OG_IMAGE, SITE_URL, canonicalRoutePath } from '../utils/seoConfig.ts';
import { absoluteUrl, escapeHtml, truncateText } from './seoCatalog.ts';

export interface NewsSitemapUrl {
  path: string;
  changefreq: 'weekly';
  priority: '0.7';
  lastmod: string;
}

export interface NewsPrerenderPage {
  path: string;
  lang: 'en';
  dir: 'ltr';
  title: string;
  description: string;
  keywords: string;
  image?: string;
  body: string;
  schema: Record<string, unknown>[];
}

type NewsSitemapArticle = Pick<NewsArticle, 'slug' | 'updatedAt'>;

const canonicalNewsUrl = (slug: string): string => (
  absoluteUrl(SITE_URL, canonicalRoutePath(`/news/${slug}`))
);

export function buildNewsSitemapUrls(articles: NewsSitemapArticle[]): NewsSitemapUrl[] {
  return articles.map((article) => ({
    path: `/news/${article.slug}`,
    changefreq: 'weekly',
    priority: '0.7',
    lastmod: article.updatedAt.toISOString().slice(0, 10),
  }));
}

function markdownInlineText(value: string): string {
  return value
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/([*_~])(.*?)\1/g, '$2')
    .trim();
}

function renderSafeNewsMarkdown(markdown: string): string {
  const blocks = markdown.replace(/\r\n?/g, '\n').split(/\n{2,}/);
  return blocks
    .map((block) => {
      const text = block.trim();
      if (!text) return '';
      const heading = text.match(/^(#{1,6})\s+([\s\S]+)$/);
      if (heading) {
        const level = Math.min(heading[1].length, 6);
        return `<h${level}>${escapeHtml(markdownInlineText(heading[2].replace(/\n+/g, ' ')))}</h${level}>`;
      }
      return `<p>${escapeHtml(markdownInlineText(text.replace(/\n+/g, ' ')))}</p>`;
    })
    .filter(Boolean)
    .join('\n');
}

function newsPublisherSchema() {
  return {
    '@type': 'Organization',
    name: BRAND_NAME,
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: absoluteUrl(SITE_URL, '/favicon/ta7leel.png'),
    },
  };
}

export function buildNewsIndexPage(articles: NewsArticle[]): NewsPrerenderPage {
  const sortedArticles = [...articles].sort((left, right) => (
    right.publishedAt.getTime() - left.publishedAt.getTime() || right.id.localeCompare(left.id)
  ));
  const articleList = sortedArticles.length > 0
    ? `<ul>${sortedArticles.map((article) => `<li>
        <article>
          <p>${escapeHtml(article.category)}</p>
          <h2><a href="${escapeHtml(canonicalRoutePath(`/news/${article.slug}`))}">${escapeHtml(article.title)}</a></h2>
          <p>${escapeHtml(article.excerpt)}</p>
          <time datetime="${escapeHtml(article.publishedAt.toISOString())}">${escapeHtml(article.publishedAt.toISOString().slice(0, 10))}</time>
        </article>
      </li>`).join('\n')}</ul>`
    : '<p>The next weekly market briefing is being prepared. Return soon for independent financial context.</p>';

  return {
    path: '/news',
    lang: 'en',
    dir: 'ltr',
    title: 'Market News & Weekly Financial Analysis | Ta7leel',
    description: 'Read Ta7leel weekly market news and financial analysis covering global markets, forex, the economy, and crypto.',
    keywords: 'market news, weekly financial analysis, forex news, economy news, crypto news',
    image: DEFAULT_OG_IMAGE,
    body: `<main class="seo-prerender mx-auto max-w-5xl px-4 py-10"><section>
      <p>Ta7leel editorial</p>
      <h1>Market News</h1>
      <p>Independent weekly context for clearer market decisions.</p>
      ${articleList}
    </section></main>`,
    schema: [{
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Market News',
      description: 'Independent weekly market news and financial analysis from Ta7leel.',
      url: absoluteUrl(SITE_URL, canonicalRoutePath('/news')),
      inLanguage: 'en',
      mainEntity: sortedArticles.map((article) => ({
        '@type': 'NewsArticle',
        headline: article.title,
        url: canonicalNewsUrl(article.slug),
        datePublished: article.publishedAt.toISOString(),
      })),
    }],
  };
}

export function buildNewsArticlePage(article: NewsArticle): NewsPrerenderPage {
  const canonical = canonicalNewsUrl(article.slug);
  const image = absoluteUrl(SITE_URL, article.imageUrl);
  const sources = article.sources.length > 0
    ? `<section aria-labelledby="news-sources-title"><h2 id="news-sources-title">Sources</h2><ul>${article.sources.map((source) => (
      `<li><a href="${escapeHtml(source.url)}" rel="noopener noreferrer">${escapeHtml(source.label)}</a></li>`
    )).join('')}</ul></section>`
    : '';

  return {
    path: `/news/${article.slug}`,
    lang: 'en',
    dir: 'ltr',
    title: `${article.title} | Ta7leel Market News`,
    description: truncateText(article.excerpt, 155),
    keywords: `${article.category} news, market analysis, weekly market news`,
    image,
    body: `<main class="seo-prerender mx-auto max-w-3xl px-4 py-10"><article>
      <p>${escapeHtml(article.category)}</p>
      <h1>${escapeHtml(article.title)}</h1>
      <p>${escapeHtml(article.excerpt)}</p>
      <p>By ${escapeHtml(article.authorName)}</p>
      <time datetime="${escapeHtml(article.publishedAt.toISOString())}">${escapeHtml(article.publishedAt.toISOString().slice(0, 10))}</time>
      <img src="${escapeHtml(image)}" alt="${escapeHtml(article.imageAlt)}" width="1200" height="720" />
      ${renderSafeNewsMarkdown(article.body)}
      ${sources}
      <p>This article is for general information only and is not investment advice.</p>
    </article><nav><a href="/news/">All market news</a></nav></main>`,
    schema: [{
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      headline: article.title,
      description: article.excerpt,
      image,
      author: {
        '@type': 'Person',
        name: article.authorName,
      },
      datePublished: article.publishedAt.toISOString(),
      dateModified: article.updatedAt.toISOString(),
      inLanguage: 'en',
      publisher: newsPublisherSchema(),
      mainEntityOfPage: canonical,
    }],
  };
}
