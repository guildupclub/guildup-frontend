const fs = require('fs');
const path = require('path');

function cleanSitemapUrls() {
  try {
    console.log('🧹 Cleaning sitemap.xml URLs...');
    
    // Read the sitemap.xml file
    const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');
    let sitemapContent = fs.readFileSync(sitemapPath, 'utf-8');
    
    // Count original URLs
    const originalUrlCount = (sitemapContent.match(/<url>/g) || []).length;
    console.log(`📊 Found ${originalUrlCount} URL entries to clean`);
    
    // Remove lastmod, changefreq, and priority tags from all URL entries
    // This regex matches and removes the entire lines containing these tags
    let cleanedContent = sitemapContent
      .replace(/\s*<lastmod>.*?<\/lastmod>\s*\n/g, '')
      .replace(/\s*<changefreq>.*?<\/changefreq>\s*\n/g, '')
      .replace(/\s*<priority>.*?<\/priority>\s*\n/g, '');
    
    // Clean up any extra whitespace that might be left
    cleanedContent = cleanedContent
      .replace(/\n\s*\n\s*\n/g, '\n\n')  // Remove multiple empty lines
      .replace(/\s+<\/url>/g, '\n</url>');  // Ensure proper formatting for closing url tags
    
    // Write the cleaned sitemap
    fs.writeFileSync(sitemapPath, cleanedContent, 'utf-8');
    
    // Count URLs after cleaning
    const finalUrlCount = (cleanedContent.match(/<url>/g) || []).length;
    
    console.log('✅ Successfully cleaned sitemap.xml');
    console.log(`📈 Statistics:`);
    console.log(`- Original URLs: ${originalUrlCount}`);
    console.log(`- Final URLs: ${finalUrlCount}`);
    console.log(`- Removed tags: lastmod, changefreq, priority`);
    
    // Show a sample of cleaned URLs
    console.log('\n🔗 Sample Cleaned URLs:');
    const urlMatches = cleanedContent.match(/<url>[\s\S]*?<\/url>/g);
    if (urlMatches) {
      urlMatches.slice(0, 3).forEach((url, index) => {
        const locMatch = url.match(/<loc>(.*?)<\/loc>/);
        if (locMatch) {
          console.log(`${index + 1}. ${locMatch[1]}`);
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Error cleaning sitemap.xml:', error);
  }
}

cleanSitemapUrls();
