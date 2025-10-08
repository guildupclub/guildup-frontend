const fs = require('fs');
const path = require('path');

function cleanManifestUrls() {
  try {
    console.log('🧹 Cleaning manifest.xml URLs...');
    
    // Read the manifest.xml file
    const manifestPath = path.join(process.cwd(), 'manifest.xml');
    let manifestContent = fs.readFileSync(manifestPath, 'utf-8');
    
    // Count original URLs
    const originalUrlCount = (manifestContent.match(/<url>/g) || []).length;
    console.log(`📊 Found ${originalUrlCount} URL entries to clean`);
    
    // Remove lastmod, changefreq, and priority tags from all URL entries
    // This regex matches and removes the entire lines containing these tags
    let cleanedContent = manifestContent
      .replace(/\s*<lastmod>.*?<\/lastmod>\s*\n/g, '')
      .replace(/\s*<changefreq>.*?<\/changefreq>\s*\n/g, '')
      .replace(/\s*<priority>.*?<\/priority>\s*\n/g, '');
    
    // Clean up any extra whitespace that might be left
    cleanedContent = cleanedContent
      .replace(/\n\s*\n\s*\n/g, '\n\n')  // Remove multiple empty lines
      .replace(/\s+<\/url>/g, '\n    </url>');  // Ensure proper indentation for closing url tags
    
    // Write the cleaned manifest
    fs.writeFileSync(manifestPath, cleanedContent, 'utf-8');
    
    // Count URLs after cleaning
    const finalUrlCount = (cleanedContent.match(/<url>/g) || []).length;
    
    console.log('✅ Successfully cleaned manifest.xml');
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
    console.error('❌ Error cleaning manifest.xml:', error);
  }
}

cleanManifestUrls();
