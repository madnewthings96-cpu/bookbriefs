import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';
import { loadBookCatalog, getCanonicalBookSlug } from '../scripts/seoCatalog';
import { blogPosts } from '../components/blog/blogContent';

const read = (path: string) => readFile(path, 'utf8');
test('built articles contain real content, one canonical and no invented language alternates', async () => {
  for (const post of blogPosts) {
    const html = await read(`dist/blog/${post.slug}/index.html`);
    assert.equal((html.match(/rel="canonical"/g) || []).length, 1);
    assert.ok(html.includes(post.title.replace(/&/g, '&amp;')));
    assert.doesNotMatch(html, /hreflang|\?lang=en/);
    assert.ok(html.length > 10000);
    for (const match of html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) JSON.parse(match[1]);
  }
});
test('every catalog book is discoverable without JavaScript and metadata reflects English reader', async () => {
  const library = await read('dist/summaries/index.html');
  for (const book of await loadBookCatalog()) {
    const slug = getCanonicalBookSlug(book);
    assert.ok(library.includes(`/summary/${slug}`), book.id);
    const html = await read(`dist/summary/${slug}/index.html`);
    assert.match(html, /<html lang="en" dir="ltr">/);
    assert.doesNotMatch(html, /https:\/\/www.ta7leel.prohttps/);
    assert.doesNotMatch(html, /href="\/categories\/(biography|economics|leadership|sociology|science fiction)-books/);
  }
});
test('sitemaps exclude duplicate library aliases and include every article', async () => {
  const xml = await read('dist/sitemap.xml');
  assert.doesNotMatch(xml, /<loc>https:\/\/www\.ta7leel\.pro\/book-summaries\//);
  for (const post of blogPosts) assert.ok(xml.includes(new URL(`/blog/${post.slug}/`, 'https://www.ta7leel.pro').href), post.slug);
});
test('Arabic summaries remain indexable through language links without a separate library', async () => {
  const xml = await read('dist/sitemap-ar.xml');
  const pairs = [
    ['العادات-الذرية', 'atomic-habits'],
    ['العمل-العميق', 'deep-work'],
    ['سيكولوجية-المال', 'سيكولوجية-المال'],
    ['الأب-الغني-والأب-الفقير', 'rich-dad-poor-dad'],
    ['التفكير-السريع-والبطيء', 'thinking-fast-and-slow'],
    ['التداول-في-المنطقة', 'trading-in-the-zone'],
    ['لم-أنته-بعد', 'never-finished'],
    ['الخيميائي', 'الخيميائي'],
    ['الاتفاقيات-الأربع', 'الاتفاقيات-الأربع'],
    ['المستثمر-الذكي', 'المستثمر-الذكي'],
    ['قوانين-الطبيعة-البشرية', 'قوانين-الطبيعة-البشرية'],
    ['الطريق-البسيط-للثروة', 'الطريق-البسيط-للثروة'],
    ['نماذج-المال-100-مليون-دولار', 'نماذج-المال-100-مليون-دولار'],
    ['المال-المكسور', 'المال-المكسور'],
    ['البحث-عن-الألترا', 'finding-ultra'],
    ['العيش-مع-جندي-سيل', 'living-with-a-seal'],
    ['كيمياء-التمويل', 'كيمياء-التمويل'],
    ['البجعة-السوداء', 'البجعة-السوداء'],
    ['أول-90-يوم', 'أول-90-يوم'],
    ['عروض-100-مليون-دولار', 'عروض-100-مليون-دولار'],
    ['كتاب-إدارة-العقارات-المؤجرة', 'كتاب-إدارة-العقارات-المؤجرة'],
    ['أفضل-خاسر-يفوز', 'أفضل-خاسر-يفوز'],
    ['مشروع-هيل-ماري', 'مشروع-هيل-ماري'],
    ['مليونير-تشات-جي-بي-تي', 'مليونير-تشات-جي-بي-تي'],
    ['متعلمة', 'ملخص-كتاب-متعلمة'],
    ['وأصبحت', 'ملخص-كتاب-صيرورة-ميشيل-أوباما'],
    ['صباح-المعجزات', 'صباح-المعجزات'],
    ['العاقل', 'ملخص-كتاب-العاقل-تاريخ-مختصر-للنوع-البشري'],
    ['الاقتصاد-الأساسي', 'الاقتصاد-الأساسي'],
    ['السود-الريفيون-والليبراليون-البيض', 'السود-الريفيون-والليبراليون-البيض'],
    ['اللعبة-الذهنية-للتداول', 'اللعبة-الذهنية-للتداول'],
    ['لا-تصدق-كل-ما-تفكر-فيه', 'لا-تصدق-كل-ما-تفكر-فيه'],
    ['اطلب-وسوف-يُعطى', 'اطلب-وسوف-يُعطى'],
    ['التحليل-الفني-للأسواق-المالية', 'التحليل-الفني-للاسواق-المالية'],
    ['المنافسة-منزوعة-الغموض', 'المنافسة-منزوعة-الغموض'],
    ['كتاب-الاستثمار-في-العقارات-المؤجرة', 'كتاب-الاستثمار-في-العقارات-المؤجرة'],
    ['استراتيجية-بافيت-ذات-الخطوتين-لسوق-الأسهم', 'استراتيجية-بافيت-ذات-الخطوتين-لسوق-الأسهم'],
    ['لا-يمكنك-إيذائي', 'لا-يمكنك-إيذائي'],
    ['إتقان-سيكولوجية-التداول', 'إتقان-سيكولوجية-التداول'],
    ['هيئ-محيطك', 'situated'],
    ['التحليل-الفني-للتداول', 'التحليل-الفني-للتداول'],
    ['كن-أقل-زومبي', 'كن-أقل-زومبي'],
    ['تفوق-على-وول-ستريت', 'تفوق-على-وول-ستريت'],
    ['التحول-المالي-الكامل', 'التحول-المالي-الكامل'],
    ['تداول-كساحر-سوق-الأسهم', 'تداول-كساحر-سوق-الأسهم'],
    ['أن-تصبح-خارقا-للطبيعة', 'الصعود-إلى-الخارق'],
    ['سحرة-السوق', 'سحرة-السوق'],
    ['دليل-التداول', 'دليل-التداول'],
    ['أفضل-سنة-في-حياتك', 'أفضل-سنة-في-حياتك'],
    ['المتداول-المنضبط', 'المتداول-المنضبط'],
    ['الكثيب', 'ملخص-كتاب-الكثيب'],
    ['كيف-ربحت-مليوني-دولار-في-سوق-الأسهم', 'ملخص-كتاب-كيف-ربحت-2-مليون-في-سوق-الأسهم'],
    ['استراتيجيات-الحرب-33', 'استراتيجيات-الحرب-33'],
    ['كيف-تكسب-الأصدقاء-وتؤثر-في-الناس', 'كيف-تكسب-الأصدقاء-وتؤثر-في-الناس'],
    ['أسرار-عقل-المليونير', 'أسرار-عقل-المليونير'],
    ['كيف-تتداول-في-الأسهم', 'كيف-تتداول-في-الأسهم'],
    ['التأثير-علم-نفس-الإقناع', 'التأثير-علم-نفس-الإقناع'],
    ['سأعلمك-كيف-تكون-غنياً', 'سأعلمك-كيف-تكون-غنياً'],
    ['الربح-أولا', 'الربح-أولا'],
    ['قوة-المحاولة-الإضافية', 'the-power-of-one-more'],
    ['الاستثمار-العقاري-بدون-دفعة-مقدمة', 'كتاب-الاستثمار-العقاري-بدون-مال'],
    ['أغنى-رجل-في-بابل', 'أغنى-رجل-في-بابل'],
    ['مذكرات-مضارب-في-الأسهم', 'مذكرات-مضارب'],
    ['معادلة-المعجزة', 'معادلة-المعجزة'],
    ['علم-الانضباط-الذاتي', 'علم-الانضباط-الذاتي'],
    ['متداول-الزن', 'المتداول-الزاهد'],
    ['فكر-تصبح-غنيا', 'فكر-تصبح-غنيا'],
    ['علامات', 'علامات'],
    ['العادات-السبع-للناس-الأكثر-فعالية', 'العادات-السبع-للناس-الأكثر-فعالية'],
    ['الكتاب-الصغير-للاستثمار-بالمنطق-السليم', 'الكتاب-الصغير-للاستثمار-بالمنطق-السليم'],
    ['حقق-أحلامك', 'حقق-أحلامك'],
    ['قاعدة-الخمس-ثواني', 'قاعدة-الخمس-ثواني'],
    ['نزهة-عشوائية-في-وول-ستريت', 'نزهة-عشوائية-في-وول-ستريت'],
    ['التداول-من-أجل-العيش', 'التداول-من-أجل-العيش'],
    ['حرر-نفسك', 'حرر-نفسك'],
    ['عادات-الأداء-العالي', 'high-performance-habits'],
    ['نظرية-دعهم', 'the-let-them-theory'],
    ['دليل-المبتدئين-إلى-سوق-الأسهم', 'دليل-المبتدئين-إلى-سوق-الأسهم'],
    ['كيف-تتداول-يوميا-من-أجل-العيش', 'كيف-تتداول-يومياً-من-أجل-لقمة-العيش'],
    ['قوانين-القوة-48', 'قوانين-القوة-48'],
    ['الكتاب-الصغير-الذي-لا-يزال-يتفوق-على-السوق', 'الكتاب-الصغير-الذي-لا-يزال-يتفوق-على-السوق'],
    ['قوة-الدفع', 'الجر-قوة-الدفع'],
    ['الجبل-هو-أنت', 'الجبل-هو-أنت'],
    ['قيادة-التغيير', 'قيادة-التغيير'],
    ['تحمل', 'تحمل'],
    ['صفقة-واحدة-جيدة', 'صفقة-واحدة-جيدة'],
    ['المال-إتقان-اللعبة', 'المال-إتقان-اللعبة'],
    ['بيان-التحفيز', 'the-motivation-manifesto'],
    ['بلا-هوادة', 'بلا-هوادة'],
    ['الشجاعة-لتكون-مكروها', 'الشجاعة-لتكون-مكروها'],
    ['أسبوع-العمل-من-أربع-ساعات', 'أعمل-أربع-ساعات-فقط-في-الأسبوع'],
    ['فن-اللامبالاة', 'الفن-اللامبالاة'],
    ['بنك-أمريكا', 'بنك-أمريكا'],
    ['غسيل-دماغ-من-أمعائك', 'غسيل-دماغ-من-أمعائك'],
    ['طريق-الرجال', 'طريق-الرجال'],
    ['101-مقالة-ستغير-طريقة-تفكيرك', '101-مقالة-ستغير-طريقة-تفكيرك'],
    ['شيفرة-الثقة', 'شيفرة-الثقة'],
    ['لا-يتشتت', 'indistractable'],
    ['مت-بصفر', 'die-with-zero'],
    ['لا-تساوم-أبدا', 'never-split-the-difference'],
    ['السيبرنيطيقا-النفسية', 'psycho-cybernetics'],
    ['أسرار-ستان-واينستين-في-الأسواق-الصاعدة-والهابطة', 'secrets-for-profiting-in-bull-and-bear-markets'],
    ['مدرب-التداول-اليومي', 'the-daily-trading-coach'],
    ['علم-التوسع', 'the-science-of-scaling'],
    ['فكر-وتداول-كبطل', 'think-and-trade-like-a-champion'],
    ['ضيافة-تتجاوز-التوقعات', 'unreasonable-hospitality'],
  ];
  await assert.rejects(access('dist/ar/book-summaries/index.html'));
  assert.doesNotMatch(xml, /\/ar\/book-summaries\//);
  const config = await read('netlify.toml');
  assert.match(config, /from = "\/ar\/book-summaries"\s+to = "\/summaries\/"\s+status = 301\s+force = true/);
  for (const [arabic, english] of pairs) {
    const html = await read(`dist/ar/summary/${arabic}/index.html`);
    assert.match(html, /<html lang="ar" dir="rtl">/);
    assert.doesNotMatch(html, /noindex|undefined/);
    assert.equal((html.match(/rel="canonical"/g) || []).length, 1);
    assert.equal((html.match(/hreflang=/g) || []).length, 2);
    assert.match(html, /عن هذا الملخص ومصادره/);
    assert.ok(html.includes(`/summary/${english}/`));
    assert.ok(xml.includes(new URL(`/ar/summary/${arabic}/`, 'https://www.ta7leel.pro').href));
  }
  const businessCategory = await read('dist/ar/categories/business-books/index.html');
  assert.doesNotMatch(businessCategory, /noindex/);
  assert.match(businessCategory, /نماذج المال/);
  assert.match(xml, /\/ar\/categories\/business-books\//);
});

test('public trade analyzer has a crawlable landing page and sitemap entry', async () => {
  const xml = await read('dist/sitemap.xml');
  assert.match(xml, /https:\/\/www\.ta7leel\.pro\/trade-analyzer\//);
  const html = await read('dist/trade-analyzer/index.html');
  assert.match(html, /Trade Analyzer/);
  assert.match(html, /MT5/);
  assert.doesNotMatch(html, /noindex/);
});
test('unknown pages and private pages have crawlable noindex responses configured', async () => {
  const config = await read('netlify.toml');
  assert.match(config, /to = "\/404.html"\s+status = 404/);
  const html = await read('dist/404.html');
  assert.match(html, /noindex, follow/);
  const login = await read('dist/login/index.html');
  assert.match(login, /noindex, follow/);
  const robots = await read('dist/robots.txt');
  assert.doesNotMatch(robots, /User-agent: Googlebot|Disallow: \/login|Disallow: \/pdfs/);
});

test('newly published news routes reach the runtime before their next static deployment', async () => {
  const config = await read('netlify.toml');
  const redirects = config.split('[[redirects]]').slice(1);
  const newsFallbackIndex = redirects.findIndex((block) => /from\s*=\s*"\/news\/\*"/.test(block));
  const notFoundIndex = redirects.findIndex((block) => /to\s*=\s*"\/404\.html"\s+status\s*=\s*404/.test(block));
  const newsFallback = redirects[newsFallbackIndex] || '';

  assert.ok(newsFallbackIndex >= 0, 'Missing the dynamic news route fallback.');
  assert.ok(notFoundIndex > newsFallbackIndex, 'The news fallback must run before the 404 catch-all.');
  assert.match(newsFallback, /to\s*=\s*"\/index\.html"\s+status\s*=\s*200/);
  assert.doesNotMatch(newsFallback, /force\s*=\s*true/);
});

test('every sitemap URL has static HTML or an explicit server route', async () => {
  const xml = await read('dist/sitemap.xml');
  const config = await read('netlify.toml');
  const explicitRoutes = config.split('[[redirects]]').slice(1)
    .filter(block => /status\s*=\s*200\b/.test(block))
    .map(block => block.match(/from\s*=\s*"([^"]+)"/)?.[1]);
  for (const [, location] of xml.matchAll(/<loc>(.*?)<\/loc>/g)) {
    const pathname = decodeURIComponent(new URL(location).pathname).replace(/\/$/, '');
    try {
      await read(`dist${pathname}/index.html`);
    } catch {
      assert.ok(explicitRoutes.includes(pathname), `Sitemap URL has no deployable route: ${pathname}`);
    }
  }
});

test('Ideas in the Wild serves its real content, metadata and styles before JavaScript', async () => {
  const html = await read('dist/connections/index.html');
  assert.match(html, /<title>Ideas in the Wild - See the World Through Books \| Ta7leel<\/title>/);
  assert.match(html, /<link rel="canonical" href="https:\/\/www.ta7leel.pro\/connections\/"/);
  assert.match(html, /id="connection-library"/);
  assert.match(html, /href="\/summary\/atomic-habits"/);
  assert.match(html, /Why market fear travels faster than fundamentals/);
  assert.match(html, /<link rel="stylesheet" href="\/assets\/IdeasInTheWildPage-[^"]+\.css"/);
  assert.doesNotMatch(html, /noindex/);
});

test('Market News has a crawlable weekly editorial fallback without JavaScript', async () => {
  const html = await read('dist/news/index.html');
  const sitemap = await read('dist/sitemap-en.xml');

  assert.match(html, /<html lang="en" dir="ltr">/);
  assert.match(html, /<title>Market News &amp; Weekly Financial Analysis \| Ta7leel<\/title>/);
  assert.match(html, /<link rel="canonical" href="https:\/\/www\.ta7leel\.pro\/news\/"/);
  assert.match(html, /<h1>Market News<\/h1>/);
  assert.doesNotMatch(html, /noindex/);
  assert.match(sitemap, /<loc>https:\/\/www\.ta7leel\.pro\/news\/<\/loc>[\s\S]*?<changefreq>weekly<\/changefreq>/);
});
