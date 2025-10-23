import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import books data - we'll read from the compiled constants
const DOMAIN = 'https://ta7leel.site';
const HASH_ROUTING = false; // Set to false for clean URLs (better for SEO)
const TODAY = new Date().toISOString().split('T')[0];

// Read the constants file and extract book IDs
function extractBookIds() {
  const constantsPath = path.join(__dirname, 'constants.ts');
  const content = fs.readFileSync(constantsPath, 'utf8');
  
  // Extract all book IDs using regex
  const bookIdMatches = content.matchAll(/id:\s*['"]([^'"]+)['"]/g);
  const bookIds = Array.from(bookIdMatches, match => match[1]);
  
  // Remove duplicates using Set and return unique IDs
  return [...new Set(bookIds)];
}

function generateSitemap() {
  const bookIds = extractBookIds();
  const hashPrefix = HASH_ROUTING ? '/#' : '';
  
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  
  <!-- Main Pages -->
  <url>
    <loc>${DOMAIN}${hashPrefix}/</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <url>
    <loc>${DOMAIN}${hashPrefix}/summaries</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  
  <url>
    <loc>${DOMAIN}${hashPrefix}/blog</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>${DOMAIN}${hashPrefix}/calculators</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>${DOMAIN}${hashPrefix}/calculators/pip-value</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  
  <url>
    <loc>${DOMAIN}${hashPrefix}/calculators/position-size</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  
  <url>
    <loc>${DOMAIN}${hashPrefix}/calculators/fire</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  
  <url>
    <loc>${DOMAIN}${hashPrefix}/calculators/compound-interest</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  
  <url>
    <loc>${DOMAIN}${hashPrefix}/news</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>${DOMAIN}${hashPrefix}/chat</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  
  <url>
    <loc>${DOMAIN}${hashPrefix}/about</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  
  <url>
    <loc>${DOMAIN}${hashPrefix}/privacy-policy</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  
  <url>
    <loc>${DOMAIN}${hashPrefix}/terms-of-use</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  
  <!-- Game Pages -->
  <url>
    <loc>${DOMAIN}${hashPrefix}/games/sudoku</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  
  <url>
    <loc>${DOMAIN}${hashPrefix}/games/spelling-bee</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  
  <!-- Book Summary Pages -->
`;

  // Add all book summaries
  bookIds.forEach(bookId => {
    sitemap += `  <url>
    <loc>${DOMAIN}${hashPrefix}/summary/${bookId}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  
`;
  });

  sitemap += `</urlset>`;
  
  return sitemap;
}

// Generate and save the sitemap
const sitemapContent = generateSitemap();
const sitemapPath = path.join(__dirname, 'public', 'sitemap.xml');

fs.writeFileSync(sitemapPath, sitemapContent, 'utf8');
console.log(`✅ Sitemap generated successfully with ${extractBookIds().length} book summaries!`);
console.log(`📄 Saved to: ${sitemapPath}`);
console.log(`🔗 Your sitemap URL: ${DOMAIN}/sitemap.xml`);
