import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { CALCULATOR_ROUTES, CATEGORY_HUBS, SITE_URL, canonicalRoutePath } from '../utils/seoConfig.ts';
import { absoluteUrl, escapeXml, getCanonicalBookSlug, loadBookCatalog } from './seoCatalog.ts';

import { blogPosts } from '../components/blog/blogContent.ts';
import { getBlogPostDirection } from '../components/blog/blogPageModel.ts';

interface SitemapUrl {
  path: string;
  changefreq: 'daily' | 'weekly' | 'monthly' | 'yearly';
  priority: string;
  lastmod?: string;
}

function renderUrl({ path: pathname, changefreq, priority, lastmod }: SitemapUrl): string {
  return `  <url>
    <loc>${escapeXml(absoluteUrl(SITE_URL, canonicalRoutePath(pathname)))}</loc>
${lastmod ? `    <lastmod>${escapeXml(lastmod)}</lastmod>\n` : ''}    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

function renderUrlset(urls: SitemapUrl[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(renderUrl).join('\n')}
</urlset>
`;
}

function renderSitemapIndex(): string {
  const sitemaps = ['sitemap-en.xml', 'sitemap-ar.xml'];

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps
  .map(
    (sitemap) => `  <sitemap>
    <loc>${escapeXml(`${SITE_URL}/${sitemap}`)}</loc>
  </sitemap>`
  )
  .join('\n')}
</sitemapindex>
`;
}

async function main() {
  const books = await loadBookCatalog();
  const publicDir = path.join(process.cwd(), 'public');
  await mkdir(publicDir, { recursive: true });

  const baseRoutes: SitemapUrl[] = [
    { path: '/', changefreq: 'daily', priority: '1.0' },
    { path: '/summaries', changefreq: 'daily', priority: '0.9' },
    { path: '/blog', changefreq: 'weekly', priority: '0.8' },
    { path: '/connections', changefreq: 'weekly', priority: '0.8' },
    { path: '/news', changefreq: 'daily', priority: '0.7' },
    { path: '/about', changefreq: 'monthly', priority: '0.6' },
    { path: '/privacy-policy', changefreq: 'yearly', priority: '0.3' },
    { path: '/terms-of-use', changefreq: 'yearly', priority: '0.3' },
  ];

  const englishCalculatorRoutes: SitemapUrl[] = CALCULATOR_ROUTES
    .filter((route) => route.language === 'en')
    .map((route) => ({
      path: route.path,
      changefreq: 'monthly',
      priority: route.path === '/calculators' ? '0.8' : '0.75',
    }));

  const arabicCalculatorRoutes: SitemapUrl[] = CALCULATOR_ROUTES
    .filter((route) => route.language === 'ar')
    .map((route) => ({
      path: route.path,
      changefreq: 'monthly',
      priority: '0.75',
    }));

  const englishCategoryRoutes: SitemapUrl[] = CATEGORY_HUBS.map((category) => ({
    path: `/categories/${category.slug}`,
    changefreq: 'weekly',
    priority: '0.8',
  }));

  const arabicCategoryRoutes: SitemapUrl[] = [
    ...arabicCalculatorRoutes,
    ...CATEGORY_HUBS.map((category) => ({
      path: `/ar/categories/${category.slug}`,
      changefreq: 'weekly' as const,
      priority: '0.8',
    })),
  ];

  const bookRoutes: SitemapUrl[] = books.map((book) => ({
    path: `/summary/${getCanonicalBookSlug(book)}`,
    changefreq: 'monthly',
    priority: book.category === 'Trading' || book.category === 'Finance' ? '0.85' : '0.8',
  }));

  const articleRoutes = blogPosts.map(post => ({
    path: `/blog/${post.slug}`,
    changefreq: 'monthly' as const,
    priority: '0.7',
    lastmod: post.date,
  }));
  const englishRoutes = [...baseRoutes, ...englishCalculatorRoutes, ...englishCategoryRoutes, ...bookRoutes,
    ...articleRoutes.filter((_, index) => getBlogPostDirection(blogPosts[index]) === 'ltr')];
  const arabicRoutes = [...arabicCategoryRoutes,
    ...articleRoutes.filter((_, index) => getBlogPostDirection(blogPosts[index]) === 'rtl')];
  const allRoutes = [...englishRoutes, ...arabicRoutes];

  await writeFile(path.join(publicDir, 'sitemap.xml'), renderUrlset(allRoutes), 'utf8');
  await writeFile(path.join(publicDir, 'sitemap-en.xml'), renderUrlset(englishRoutes), 'utf8');
  await writeFile(path.join(publicDir, 'sitemap-ar.xml'), renderUrlset(arabicRoutes), 'utf8');
  await writeFile(path.join(publicDir, 'sitemap-index.xml'), renderSitemapIndex(), 'utf8');

  console.log(`Generated SEO sitemaps for ${books.length} books and ${CATEGORY_HUBS.length} category hubs.`);
}

main().catch((error) => {
  console.error('Failed to generate SEO sitemaps:', error);
  process.exit(1);
});
