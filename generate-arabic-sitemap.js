// Generate Arabic-optimized sitemap for better SEO in MENA region
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseUrl = 'https://ta7leel.site';
const currentDate = new Date().toISOString().split('T')[0];

// Arabic slugs for books
const arabicBooks = [
  { id: 'atomic-habits', arSlug: 'العادات-الذرية', priority: '1.0' },
  { id: 'rich-dad-poor-dad', arSlug: 'الأب-الغني-والأب-الفقير', priority: '1.0' },
  { id: 'the-psychology-of-money', arSlug: 'سيكولوجية-المال', priority: '1.0' },
  { id: 'thinking-fast-and-slow', arSlug: 'التفكير-السريع-والبطيء', priority: '0.9' },
  { id: 'the-alchemist', arSlug: 'الخيميائي', priority: '0.9' },
  { id: 'sapiens', arSlug: 'العاقل', priority: '0.9' },
  { id: 'the-subtle-art', arSlug: 'الفن-اللامبالاة', priority: '0.8' },
  { id: 'trading-in-the-zone', arSlug: 'التداول-في-المنطقة', priority: '0.8' },
  { id: 'the-intelligent-investor', arSlug: 'المستثمر-الذكي', priority: '0.8' },
];

// Generate Arabic sitemap
function generateArabicSitemap() {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<?xml-stylesheet type="text/xsl" href="sitemap.xsl"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" ';
  xml += 'xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';

  // Homepage - Arabic
  xml += '  <url>\n';
  xml += `    <loc>${baseUrl}/</loc>\n`;
  xml += `    <lastmod>${currentDate}</lastmod>\n`;
  xml += '    <changefreq>daily</changefreq>\n';
  xml += '    <priority>1.0</priority>\n';
  xml += `    <xhtml:link rel="alternate" hreflang="ar" href="${baseUrl}/" />\n`;
  xml += `    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/?lang=en" />\n`;
  xml += `    <xhtml:link rel="alternate" hreflang="ar-AE" href="${baseUrl}/" />\n`;
  xml += `    <xhtml:link rel="alternate" hreflang="ar-SA" href="${baseUrl}/" />\n`;
  xml += `    <xhtml:link rel="alternate" hreflang="ar-EG" href="${baseUrl}/" />\n`;
  xml += '  </url>\n';

  // Main pages - Arabic
  const pages = [
    { url: '/summaries', title: 'الملخصات', priority: '1.0', changefreq: 'daily' },
    { url: '/about', title: 'عن تحليل', priority: '0.8', changefreq: 'weekly' },
    { url: '/blog', title: 'المدونة', priority: '0.9', changefreq: 'daily' },
    { url: '/calculators', title: 'الحاسبات', priority: '0.7', changefreq: 'monthly' },
    { url: '/news', title: 'الأخبار', priority: '0.8', changefreq: 'daily' },
    { url: '/chat', title: 'الدردشة', priority: '0.6', changefreq: 'weekly' },
  ];

  pages.forEach(page => {
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}${page.url}</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="ar" href="${baseUrl}${page.url}" />\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}${page.url}?lang=en" />\n`;
    xml += '  </url>\n';
  });

  // Book summaries - Both Arabic and English slugs
  arabicBooks.forEach(book => {
    // Arabic slug
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}/summary/${book.arSlug}</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += '    <changefreq>weekly</changefreq>\n';
    xml += `    <priority>${book.priority}</priority>\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="ar" href="${baseUrl}/summary/${book.arSlug}" />\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/summary/${book.id}" />\n`;
    xml += '  </url>\n';

    // English slug
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}/summary/${book.id}</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += '    <changefreq>weekly</changefreq>\n';
    xml += `    <priority>${book.priority}</priority>\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/summary/${book.id}" />\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="ar" href="${baseUrl}/summary/${book.arSlug}" />\n`;
    xml += '  </url>\n';
  });

  xml += '</urlset>';

  return xml;
}

// Generate sitemap index
function generateSitemapIndex() {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  xml += '  <sitemap>\n';
  xml += `    <loc>${baseUrl}/sitemap-ar.xml</loc>\n`;
  xml += `    <lastmod>${currentDate}</lastmod>\n`;
  xml += '  </sitemap>\n';
  
  xml += '  <sitemap>\n';
  xml += `    <loc>${baseUrl}/sitemap-en.xml</loc>\n`;
  xml += `    <lastmod>${currentDate}</lastmod>\n`;
  xml += '  </sitemap>\n';
  
  xml += '</sitemapindex>';
  
  return xml;
}

// Main execution
try {
  const publicDir = path.join(__dirname, 'public');
  
  // Generate Arabic sitemap
  const arabicSitemap = generateArabicSitemap();
  fs.writeFileSync(path.join(publicDir, 'sitemap-ar.xml'), arabicSitemap, 'utf8');
  console.log('✅ Arabic sitemap generated successfully!');
  console.log(`📄 Saved to: ${path.join(publicDir, 'sitemap-ar.xml')}`);
  console.log(`🔗 URL: ${baseUrl}/sitemap-ar.xml`);
  console.log(`📊 Total Arabic URLs: ${arabicBooks.length * 2 + 7}`);
  
  // Generate sitemap index
  const sitemapIndex = generateSitemapIndex();
  fs.writeFileSync(path.join(publicDir, 'sitemap-index.xml'), sitemapIndex, 'utf8');
  console.log('\n✅ Sitemap index generated successfully!');
  console.log(`📄 Saved to: ${path.join(publicDir, 'sitemap-index.xml')}`);
  
  console.log('\n🌍 SEO Optimization for Arabic Countries Complete!');
  console.log('📍 Target Regions: UAE, Saudi Arabia, Egypt, Qatar, Kuwait, and more');
  console.log('🔍 Submit to Google Search Console for faster indexing');
  
} catch (error) {
  console.error('❌ Error generating Arabic sitemap:', error);
  process.exit(1);
}
