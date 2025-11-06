// Mobile Performance Analyzer
const fs = require('fs');
const path = require('path');

console.log('\n🔍 MOBILE PERFORMANCE ANALYSIS\n');
console.log('='.repeat(60));

// Check image sizes
function checkImages() {
  console.log('\n📱 IMAGE OPTIMIZATION:');
  const publicDir = path.join(__dirname, 'public');
  
  let totalSize = 0;
  let imageCount = 0;
  let largeImages = [];
  
  function scanDir(dir, prefix = '') {
    try {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory() && !file.startsWith('.')) {
          scanDir(filePath, prefix + file + '/');
        } else if (/\.(jpg|jpeg|png|gif|webp)$/i.test(file)) {
          const sizeKB = Math.round(stat.size / 1024);
          totalSize += stat.size;
          imageCount++;
          
          if (stat.size > 100 * 1024) {
            largeImages.push({ name: prefix + file, size: sizeKB });
          }
        }
      });
    } catch (err) {}
  }
  
  scanDir(publicDir);
  
  console.log(`   Total Images: ${imageCount}`);
  console.log(`   Total Size: ${(totalSize / 1024 / 1024).toFixed(2)}MB`);
  
  if (largeImages.length > 0) {
    console.log(`\n   ⚠️  Large Images (>100KB):`);
    largeImages.slice(0, 10).forEach(img => {
      console.log(`      ${img.name}: ${img.size}KB`);
    });
    if (largeImages.length > 10) {
      console.log(`      ... and ${largeImages.length - 10} more`);
    }
  }
  
  if (totalSize > 5 * 1024 * 1024) {
    console.log('\n   ❌ CRITICAL: Total > 5MB - MAJOR mobile slowdown!');
  }
}

// Check CSS
function checkCSS() {
  console.log('\n\n🎨 CSS OPTIMIZATION:');
  try {
    const cssPath = path.join(__dirname, 'styles', 'globals.css');
    const stat = fs.statSync(cssPath);
    const sizeKB = (stat.size / 1024).toFixed(2);
    console.log(`   globals.css: ${sizeKB}KB`);
    
    if (sizeKB > 50) {
      console.log('   ⚠️  Consider purging unused Tailwind classes');
    } else {
      console.log('   ✅ CSS size is good');
    }
  } catch (err) {
    console.log('   ℹ️  No globals.css found');
  }
}

// Mobile recommendations
function mobileRecommendations() {
  console.log('\n\n📱 MOBILE-SPECIFIC RECOMMENDATIONS:\n');
  console.log('🔴 CRITICAL (Do First):');
  console.log('   1. Enable Brotli compression in netlify.toml');
  console.log('   2. Convert images to WebP (60-80% smaller)');
  console.log('   3. Add lazy loading to all images');
  console.log('   4. Implement responsive images (srcset)');
  
  console.log('\n🟠 HIGH (Do Soon):');
  console.log('   5. Defer Firebase Analytics (user interaction)');
  console.log('   6. Extract & inline critical CSS');
  console.log('   7. Add service worker for caching');
  console.log('   8. Use React.memo() for heavy components');
  
  console.log('\n🟡 MEDIUM (Nice to Have):');
  console.log('   9. Implement adaptive loading (slow 3G detection)');
  console.log('   10. Add blur image placeholders');
  console.log('   11. Preload critical assets');
  console.log('   12. Enable PWA features');
}

// Quick wins
function quickWins() {
  console.log('\n\n💡 QUICK WINS (Implement in 30 minutes):\n');
  console.log('   ✅ Already Done:');
  console.log('      - Firebase deferred initialization');
  console.log('      - jsPDF lazy loading');
  console.log('      - Font display swap');
  console.log('      - MailerLite deferred loading\n');
  
  console.log('   🚀 Do Next (Easy + High Impact):');
  console.log('      1. Add to netlify.toml:');
  console.log('         [[headers]]');
  console.log('           for = "/*"');
  console.log('           [headers.values]');
  console.log('             Content-Encoding = "br"');
  console.log('');
  console.log('      2. Add loading="lazy" to HomePage images');
  console.log('      3. Defer Firebase Analytics until scroll/click');
  console.log('      4. Add Intersection Observer for image lazy load');
}

// Performance targets
function targets() {
  console.log('\n\n🎯 MOBILE TARGETS:\n');
  console.log('   Current (estimated):');
  console.log('      3G: FCP ~3-4s, TTI ~5-6s');
  console.log('      4G: FCP ~1.5-2s, TTI ~3-4s\n');
  
  console.log('   Target (after mobile optimizations):');
  console.log('      3G: FCP <2s, TTI <4s ⭐');
  console.log('      4G: FCP <1s, TTI <2s ⭐');
}

// Run checks
checkImages();
checkCSS();
mobileRecommendations();
quickWins();
targets();

console.log('\n' + '='.repeat(60) + '\n');
