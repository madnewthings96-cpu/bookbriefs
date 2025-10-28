import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import books data - we'll read from the compiled constants
const DOMAIN = 'https://ta7leel.site';
const HASH_ROUTING = false; // Set to false for clean URLs (better for SEO)
const TODAY = new Date().toISOString().split('T')[0];

// Read the constants file and extract book data (IDs and Arabic slugs)
function extractBooks() {
  const constantsPath = path.join(__dirname, 'constants.ts');
  const content = fs.readFileSync(constantsPath, 'utf8');
  
  // Extract book objects - find all book definitions with their id and arabicSlug
  const bookObjects = [];
  
  // Split by opening braces that start a book object
  const bookMatches = content.matchAll(/{\s*id:\s*['"]([^'"]+)['"]/g);
  
  for (const match of bookMatches) {
    const bookId = match[1];
    // Find the section starting from this match and extract arabicSlug if it exists
    const startIndex = match.index;
    const nextBraceIndex = content.indexOf('},', startIndex);
    const bookSection = content.substring(startIndex, nextBraceIndex);
    
    // Try to find arabicSlug in this section
    const slugMatch = bookSection.match(/arabicSlug:\s*['"]([^'"]+)['"]/);
    const arabicSlug = slugMatch ? slugMatch[1] : null;
    
    bookObjects.push({
      id: bookId,
      arabicSlug: arabicSlug
    });
  }
  
  // Remove duplicates based on id
  const uniqueBooks = [];
  const seenIds = new Set();
  for (const book of bookObjects) {
    if (!seenIds.has(book.id)) {
      seenIds.add(book.id);
      uniqueBooks.push(book);
    }
  }
  
  return uniqueBooks;
}

function generateSitemap() {
  const books = extractBooks();
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

  // Add all book summaries - use Arabic slug if available, otherwise use English ID
  books.forEach(book => {
    const bookSlug = book.arabicSlug || book.id;
    sitemap += `  <url>
    <loc>${DOMAIN}${hashPrefix}/summary/${bookSlug}</loc>
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
console.log(`✅ Sitemap generated successfully with ${extractBooks().length} book summaries!`);
console.log(`📄 Saved to: ${sitemapPath}`);
console.log(`🔗 Your sitemap URL: ${DOMAIN}/sitemap.xml`);
