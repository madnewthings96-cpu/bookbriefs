import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { BRAND_NAME, CALCULATOR_ROUTES, CATEGORY_HUBS, DEFAULT_OG_IMAGE, SITE_URL } from '../utils/seoConfig.ts';
import {
  absoluteUrl,
  escapeHtml,
  getArabicTitle,
  getCanonicalBookSlug,
  loadBookCatalog,
  stripMarkdown,
  truncateText,
} from './seoCatalog.ts';
import type { BookDefinition } from './types.js';

interface PrerenderPage {
  path: string;
  lang: 'en' | 'ar';
  dir: 'ltr' | 'rtl';
  title: string;
  description: string;
  keywords: string;
  image?: string;
  body: string;
  schema: Record<string, unknown>[];
}

function setHtmlAttrs(html: string, lang: 'en' | 'ar', dir: 'ltr' | 'rtl'): string {
  return html.replace(/<html[^>]*>/, `<html lang="${lang}" dir="${dir}">`);
}

function upsertTitle(html: string, title: string): string {
  if (/<title>[\s\S]*?<\/title>/.test(html)) {
    return html.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)}</title>`);
  }

  return html.replace('</head>', `  <title>${escapeHtml(title)}</title>\n</head>`);
}

function upsertMeta(html: string, attribute: 'name' | 'property', key: string, content: string): string {
  const escaped = escapeHtml(content);
  const pattern = new RegExp(`<meta\\s+${attribute}=["']${key}["'][^>]*>`);
  const tag = `<meta ${attribute}="${key}" content="${escaped}" />`;

  if (pattern.test(html)) {
    return html.replace(pattern, tag);
  }

  return html.replace('</head>', `  ${tag}\n</head>`);
}

function upsertCanonical(html: string, href: string): string {
  const tag = `<link rel="canonical" href="${escapeHtml(href)}" />`;

  if (/<link\s+rel=["']canonical["'][^>]*>/.test(html)) {
    return html.replace(/<link\s+rel=["']canonical["'][^>]*>/, tag);
  }

  return html.replace('</head>', `  ${tag}\n</head>`);
}

function removeExistingJsonLd(html: string): string {
  return html.replace(/\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '');
}

function injectJsonLd(html: string, schemas: Record<string, unknown>[]): string {
  const tags = schemas
    .map((schema) => `  <script type="application/ld+json">${JSON.stringify(schema)}</script>`)
    .join('\n');

  return html.replace('</head>', `${tags}\n</head>`);
}

function replaceRoot(html: string, body: string): string {
  return html.replace(
    /<div id="root"><\/div>/,
    `<div id="root">\n${body}\n</div>`
  );
}

function renderPage(template: string, page: PrerenderPage): string {
  const canonical = absoluteUrl(SITE_URL, page.path);
  const image = page.image || DEFAULT_OG_IMAGE;
  const absoluteImage = image.startsWith('http') ? image : absoluteUrl(SITE_URL, image);

  let html = template;
  html = setHtmlAttrs(html, page.lang, page.dir);
  html = removeExistingJsonLd(html);
  html = upsertTitle(html, page.title);
  html = upsertMeta(html, 'name', 'title', page.title);
  html = upsertMeta(html, 'name', 'description', page.description);
  html = upsertMeta(html, 'name', 'keywords', page.keywords);
  html = upsertMeta(html, 'name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
  html = upsertCanonical(html, canonical);
  html = upsertMeta(html, 'property', 'og:type', 'website');
  html = upsertMeta(html, 'property', 'og:url', canonical);
  html = upsertMeta(html, 'property', 'og:title', page.title);
  html = upsertMeta(html, 'property', 'og:description', page.description);
  html = upsertMeta(html, 'property', 'og:image', absoluteImage);
  html = upsertMeta(html, 'property', 'og:site_name', BRAND_NAME);
  html = upsertMeta(html, 'property', 'og:locale', page.lang === 'ar' ? 'ar_AE' : 'en_US');
  html = upsertMeta(html, 'name', 'twitter:card', 'summary_large_image');
  html = upsertMeta(html, 'name', 'twitter:url', canonical);
  html = upsertMeta(html, 'name', 'twitter:title', page.title);
  html = upsertMeta(html, 'name', 'twitter:description', page.description);
  html = upsertMeta(html, 'name', 'twitter:image', absoluteImage);
  html = injectJsonLd(html, page.schema);
  html = replaceRoot(html, page.body);

  return html;
}

function breadcrumbSchema(items: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(SITE_URL, item.path),
    })),
  };
}

function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: BRAND_NAME,
    alternateName: 'BookBriefs',
    url: SITE_URL,
    inLanguage: ['ar', 'en'],
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/summaries?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

function bookPage(book: BookDefinition): PrerenderPage {
  const slug = getCanonicalBookSlug(book);
  const pathName = `/summary/${slug}`;
  const isArabicSlug = /[\u0600-\u06FF]/.test(slug);
  const displayTitle = isArabicSlug ? getArabicTitle(book) : book.title;
  const cleanSummary = stripMarkdown(book.summary);
  const description = isArabicSlug
    ? `اقرأ ملخص كتاب ${displayTitle} مع أهم الأفكار والدروس العملية والنقاط الرئيسية في دقائق.`
    : `Read a practical summary of ${book.title} by ${book.author}, including key takeaways, lessons, and useful ideas.`;
  const title = isArabicSlug
    ? `ملخص كتاب ${displayTitle}: أهم الأفكار والدروس | تحليل`
    : `${book.title} Summary: Key Ideas and Takeaways | Ta7leel`;
  const takeaways = (book.keyTakeaways || []).slice(0, 6);

  const body = `    <main class="seo-prerender mx-auto max-w-5xl px-4 py-10" dir="${isArabicSlug ? 'rtl' : 'ltr'}">
      <article>
        <p class="text-sm font-semibold uppercase tracking-wide text-orange-600">${escapeHtml(book.category)} summary</p>
        <h1 class="mt-3 text-4xl font-bold text-gray-950">${escapeHtml(title.replace(` | ${isArabicSlug ? 'تحليل' : 'Ta7leel'}`, ''))}</h1>
        <p class="mt-4 max-w-3xl text-lg leading-8 text-gray-700">${escapeHtml(description)}</p>
        <div class="mt-8 flex flex-col gap-6 sm:flex-row">
          <img src="${escapeHtml(book.coverImageUrl)}" alt="${escapeHtml(book.title)} book cover" class="w-40 rounded-lg shadow-lg" />
          <div>
            <p><strong>Author:</strong> ${escapeHtml(book.author)}</p>
            <p><strong>Category:</strong> ${escapeHtml(book.category)}</p>
            <p><strong>Published:</strong> ${book.publicationYear}</p>
            <p><strong>Pages:</strong> ${book.pageCount}</p>
          </div>
        </div>
        <section class="mt-10">
          <h2 class="text-2xl font-bold text-gray-950">${isArabicSlug ? 'أهم الأفكار' : 'Key Takeaways'}</h2>
          <ul class="mt-4 list-disc space-y-2 ${isArabicSlug ? 'pr-6' : 'pl-6'}">
            ${takeaways.map((item) => `<li>${escapeHtml(item)}</li>`).join('\n            ')}
          </ul>
        </section>
        <section class="mt-10">
          <h2 class="text-2xl font-bold text-gray-950">${isArabicSlug ? 'عن هذا الملخص' : 'About This Summary'}</h2>
          <p class="mt-4 leading-8 text-gray-700">${escapeHtml(truncateText(cleanSummary, 700))}</p>
        </section>
        <nav class="mt-10 flex flex-wrap gap-3">
          <a href="/summaries" class="text-orange-700 underline">${isArabicSlug ? 'كل الملخصات' : 'All summaries'}</a>
          <a href="/categories/${categorySlugForBook(book)}" class="text-orange-700 underline">${escapeHtml(book.category)} books</a>
        </nav>
      </article>
    </main>`;

  return {
    path: pathName,
    lang: isArabicSlug ? 'ar' : 'en',
    dir: isArabicSlug ? 'rtl' : 'ltr',
    title,
    description: truncateText(description, 155),
    keywords: `${book.title}, ${book.author}, ${book.title} summary, ${book.category} book summary, ملخص كتاب ${displayTitle}`,
    image: book.coverImageUrl,
    body,
    schema: [
      websiteSchema(),
      {
        '@context': 'https://schema.org',
        '@type': 'Book',
        name: book.title,
        author: {
          '@type': 'Person',
          name: book.author,
        },
        image: absoluteUrl(SITE_URL, book.coverImageUrl),
        description: truncateText(cleanSummary, 400),
        genre: book.category,
        url: absoluteUrl(SITE_URL, pathName),
      },
      breadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Summaries', path: '/summaries' },
        { name: book.title, path: pathName },
      ]),
    ],
  };
}

function categorySlugForBook(book: BookDefinition): string {
  const match = CATEGORY_HUBS.find((category) => category.category === book.category);
  return match?.slug || `${book.category.toLowerCase()}-books`;
}

function categoryPage(category: (typeof CATEGORY_HUBS)[number], books: BookDefinition[], arabic: boolean): PrerenderPage {
  const categoryBooks = books.filter((book) => book.category === category.category).slice(0, 24);
  const pathName = arabic ? `/ar/categories/${category.slug}` : `/categories/${category.slug}`;
  const title = arabic ? `${category.arabicTitle} | تحليل` : `${category.englishTitle} | Ta7leel`;
  const description = arabic ? category.arabicDescription : category.englishDescription;
  const keywords = arabic ? category.arabicKeywords : category.englishKeywords;

  const body = `    <main class="seo-prerender mx-auto max-w-6xl px-4 py-10" dir="${arabic ? 'rtl' : 'ltr'}">
      <section>
        <p class="text-sm font-semibold uppercase tracking-wide text-orange-600">${escapeHtml(category.category)}</p>
        <h1 class="mt-3 text-4xl font-bold text-gray-950">${escapeHtml(arabic ? category.arabicTitle : category.englishTitle)}</h1>
        <p class="mt-4 max-w-3xl text-lg leading-8 text-gray-700">${escapeHtml(description)}</p>
      </section>
      <section class="mt-10">
        <h2 class="text-2xl font-bold text-gray-950">${arabic ? 'أفضل الملخصات في هذا التصنيف' : 'Top Summaries in This Category'}</h2>
        <ul class="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          ${categoryBooks
            .map(
              (book) => `<li><a class="text-orange-700 underline" href="/summary/${escapeHtml(getCanonicalBookSlug(book))}">${escapeHtml(book.title)} by ${escapeHtml(book.author)}</a></li>`
            )
            .join('\n          ')}
        </ul>
      </section>
      <section class="mt-10">
        <h2 class="text-2xl font-bold text-gray-950">${arabic ? 'ابدأ من هنا' : 'Start Here'}</h2>
        <p class="mt-4 leading-8 text-gray-700">${escapeHtml(
          arabic
            ? 'اختر كتاباً من القائمة، اقرأ الأفكار الرئيسية، ثم انتقل إلى الكتب المرتبطة لبناء فهم أعمق للتصنيف.'
            : 'Pick a book, read the key ideas, then follow related summaries to build deeper understanding of the category.'
        )}</p>
      </section>
    </main>`;

  return {
    path: pathName,
    lang: arabic ? 'ar' : 'en',
    dir: arabic ? 'rtl' : 'ltr',
    title,
    description: truncateText(description, 155),
    keywords,
    body,
    schema: [
      websiteSchema(),
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: arabic ? category.arabicTitle : category.englishTitle,
        description,
        url: absoluteUrl(SITE_URL, pathName),
        mainEntity: categoryBooks.map((book) => ({
          '@type': 'Book',
          name: book.title,
          author: book.author,
          url: absoluteUrl(SITE_URL, `/summary/${getCanonicalBookSlug(book)}`),
        })),
      },
      breadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: arabic ? 'ملخصات الكتب' : 'Book Summaries', path: arabic ? '/ar/book-summaries' : '/book-summaries' },
        { name: arabic ? category.arabicTitle : category.englishTitle, path: pathName },
      ]),
    ],
  };
}

function summariesLandingPage(books: BookDefinition[], arabic: boolean, pathName: string): PrerenderPage {
  const featuredBooks = books.slice(0, 36);
  const title = arabic ? 'ملخصات كتب عربية وعالمية | تحليل' : 'Book Summaries: Business, Trading, Finance and Self-Development | Ta7leel';
  const description = arabic
    ? 'تصفح مكتبة تحليل لملخصات الكتب العربية والعالمية في الأعمال والتداول والاستثمار وتطوير الذات.'
    : 'Browse practical book summaries across business, trading, investing, finance, psychology, and self-development.';

  const body = `    <main class="seo-prerender mx-auto max-w-6xl px-4 py-10" dir="${arabic ? 'rtl' : 'ltr'}">
      <section>
        <h1 class="text-4xl font-bold text-gray-950">${escapeHtml(arabic ? 'ملخصات كتب' : 'Book Summaries')}</h1>
        <p class="mt-4 max-w-3xl text-lg leading-8 text-gray-700">${escapeHtml(description)}</p>
      </section>
      <section class="mt-10">
        <h2 class="text-2xl font-bold text-gray-950">${arabic ? 'التصنيفات الرئيسية' : 'Main Categories'}</h2>
        <ul class="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          ${CATEGORY_HUBS.map(
            (category) =>
              `<li><a class="text-orange-700 underline" href="${arabic ? '/ar' : ''}/categories/${category.slug}">${escapeHtml(arabic ? category.arabicTitle : category.englishTitle)}</a></li>`
          ).join('\n          ')}
        </ul>
      </section>
      <section class="mt-10">
        <h2 class="text-2xl font-bold text-gray-950">${arabic ? 'أحدث الملخصات' : 'Featured Summaries'}</h2>
        <ul class="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          ${featuredBooks
            .map(
              (book) => `<li><a class="text-orange-700 underline" href="/summary/${escapeHtml(getCanonicalBookSlug(book))}">${escapeHtml(book.title)}</a></li>`
            )
            .join('\n          ')}
        </ul>
      </section>
    </main>`;

  return {
    path: pathName,
    lang: arabic ? 'ar' : 'en',
    dir: arabic ? 'rtl' : 'ltr',
    title,
    description: truncateText(description, 155),
    keywords: arabic
      ? 'ملخصات كتب, ملخصات كتب عربية, كتب تطوير الذات, كتب الاستثمار, كتب التداول'
      : 'book summaries, business book summaries, trading book summaries, investing book summaries, self help summaries',
    body,
    schema: [
      websiteSchema(),
      breadcrumbSchema([{ name: 'Home', path: '/' }, { name: arabic ? 'ملخصات الكتب' : 'Book Summaries', path: pathName }]),
    ],
  };
}

function calculatorPage(route: (typeof CALCULATOR_ROUTES)[number]): PrerenderPage {
  const body = `    <main class="seo-prerender mx-auto max-w-5xl px-4 py-10" dir="${route.language === 'ar' ? 'rtl' : 'ltr'}">
      <section>
        <p class="text-sm font-bold uppercase tracking-wide text-orange-700">${escapeHtml(route.eyebrow)}</p>
        <h1 class="mt-3 text-4xl font-bold text-gray-950">${escapeHtml(route.h1)}</h1>
        <p class="mt-4 max-w-3xl text-lg leading-8 text-gray-700">${escapeHtml(route.intro)}</p>
        <p class="mt-4 max-w-3xl text-gray-700">${escapeHtml(route.description)}</p>
        <p class="mt-6 rounded-xl bg-orange-50 p-4 font-semibold text-gray-900">${escapeHtml(route.formula)}</p>
      </section>

      <section class="mt-10 grid gap-6 md:grid-cols-2">
        <article class="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
          <h2 class="text-2xl font-bold text-gray-950">${escapeHtml(route.exampleTitle)}</h2>
          <p class="mt-3 leading-7 text-gray-700">${escapeHtml(route.example)}</p>
        </article>
        <article class="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
          <h2 class="text-2xl font-bold text-gray-950">${escapeHtml(route.mistakesTitle)}</h2>
          <ul class="mt-3 list-disc space-y-2 ps-5 leading-7 text-gray-700">
            ${route.mistakes.map((mistake) => `<li>${escapeHtml(mistake)}</li>`).join('\n            ')}
          </ul>
        </article>
      </section>

      <section class="mt-10">
        <h2 class="text-2xl font-bold text-gray-950">${escapeHtml(route.stepsTitle)}</h2>
        <ol class="mt-4 grid gap-3 md:grid-cols-2">
          ${route.steps
            .map(
              (step, index) => `<li class="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200"><strong>${index + 1}.</strong> ${escapeHtml(step)}</li>`
            )
            .join('\n          ')}
        </ol>
      </section>

      <section class="mt-10">
        <h2 class="text-2xl font-bold text-gray-950">${escapeHtml(route.faqTitle)}</h2>
        <div class="mt-4 space-y-4">
          ${route.faqs
            .map(
              (faq) => `<article class="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
            <h3 class="text-lg font-bold text-gray-950">${escapeHtml(faq.question)}</h3>
            <p class="mt-2 leading-7 text-gray-700">${escapeHtml(faq.answer)}</p>
          </article>`
            )
            .join('\n          ')}
        </div>
      </section>

      <section class="mt-10 grid gap-6 md:grid-cols-2">
        <article>
          <h2 class="text-2xl font-bold text-gray-950">${escapeHtml(route.relatedToolsTitle)}</h2>
          <ul class="mt-4 space-y-2">
            ${route.relatedTools
              .map((tool) => `<li><a class="text-orange-700 underline" href="${escapeHtml(tool.path)}">${escapeHtml(tool.label)}</a></li>`)
              .join('\n            ')}
          </ul>
        </article>
        <article>
          <h2 class="text-2xl font-bold text-gray-950">${escapeHtml(route.relatedSummariesTitle)}</h2>
          <ul class="mt-4 space-y-2">
            ${route.relatedSummaries
              .map((summary) => `<li><a class="text-orange-700 underline" href="${escapeHtml(summary.path)}">${escapeHtml(summary.label)}</a></li>`)
              .join('\n            ')}
          </ul>
        </article>
      </section>
    </main>`;

  return {
    path: route.path,
    lang: route.language,
    dir: route.language === 'ar' ? 'rtl' : 'ltr',
    title: route.title,
    description: truncateText(route.description, 155),
    keywords: route.keywords,
    body,
    schema: [
      websiteSchema(),
      {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: route.h1,
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Any',
        url: absoluteUrl(SITE_URL, route.path),
        description: route.description,
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: route.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      },
      breadcrumbSchema([
        { name: route.language === 'ar' ? 'الرئيسية' : 'Home', path: '/' },
        { name: route.h1, path: route.path },
      ]),
    ],
  };
}

async function writeRouteFile(template: string, page: PrerenderPage) {
  const routePath = page.path === '/' ? 'index.html' : path.join(page.path.slice(1), 'index.html');
  const filePath = path.join(process.cwd(), 'dist', routePath);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, renderPage(template, page), 'utf8');
}

async function main() {
  const distIndex = path.join(process.cwd(), 'dist', 'index.html');
  const template = await readFile(distIndex, 'utf8');
  const books = await loadBookCatalog();

  const pages: PrerenderPage[] = [
    summariesLandingPage(books, false, '/summaries'),
    summariesLandingPage(books, false, '/book-summaries'),
    summariesLandingPage(books, true, '/ar/book-summaries'),
    ...CALCULATOR_ROUTES.map(calculatorPage),
    ...CATEGORY_HUBS.flatMap((category) => [
      categoryPage(category, books, false),
      categoryPage(category, books, true),
    ]),
    ...books.map(bookPage),
  ];

  for (const page of pages) {
    await writeRouteFile(template, page);
  }

  console.log(`Prerendered ${pages.length} SEO routes into dist.`);
}

main().catch((error) => {
  console.error('Failed to prerender SEO routes:', error);
  process.exit(1);
});
