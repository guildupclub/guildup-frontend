const fs = require('fs');
const path = require('path');

// Function to create URL slug from community name
function createCommunitySlug(communityName) {
  return communityName
    .replace(/\s+/g, "-")           // Replace spaces with hyphens
    .replace(/[^a-zA-Z0-9-]/g, "")  // Remove special characters except hyphens
    .replace(/-+/g, "-")            // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, "")        // Remove leading/trailing hyphens
    .toLowerCase();
}

async function updateManifestWithCommunities() {
  try {
    // Read the communities.json file
    const communitiesPath = path.join(process.cwd(), 'public', 'data', 'communities.json');
    const communitiesContent = fs.readFileSync(communitiesPath, 'utf-8');
    const communitiesData = JSON.parse(communitiesContent);
    
    console.log('📊 Processing Communities for Manifest...');
    console.log(`Total communities: ${communitiesData.communities?.length || 0}`);
    
    if (communitiesData.communities && Array.isArray(communitiesData.communities)) {
      // Extract community data and generate URLs
      const communityUrls = [];
      
      communitiesData.communities.forEach((item) => {
        const community = item.community || item;
        if (community._id && community.name) {
          const slug = createCommunitySlug(community.name);
          const url = `https://guildup.club/community/${slug}-${community._id}/profile`;
          
          communityUrls.push({
            name: community.name,
            id: community._id,
            url: url
          });
        }
      });
      
      console.log(`✅ Generated ${communityUrls.length} community URLs`);
      
      // Show sample URLs
      console.log('\n🔗 Sample Community URLs:');
      communityUrls.slice(0, 5).forEach((item, index) => {
        console.log(`${index + 1}. ${item.name}`);
        console.log(`   URL: ${item.url}`);
      });
      
      // Read current manifest.xml
      const manifestPath = path.join(process.cwd(), 'manifest.xml');
      let manifestContent = fs.readFileSync(manifestPath, 'utf-8');
      
      // Find the closing </urlset> tag
      const urlsetEndIndex = manifestContent.lastIndexOf('</urlset>');
      if (urlsetEndIndex !== -1) {
        // Generate XML entries for each community
        const communityEntries = communityUrls.map(item => 
          `    <url>
        <loc>${item.url}</loc>
        <lastmod>2025-10-08</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.9</priority>
    </url>`
        ).join('\n\n');
        
        // Insert new entries before the closing tag
        const beforeClosing = manifestContent.substring(0, urlsetEndIndex);
        const afterClosing = manifestContent.substring(urlsetEndIndex);
        
        const newManifestContent = beforeClosing + '\n\n    <!-- Community Profile Pages -->\n' + communityEntries + '\n\n' + afterClosing;
        
        // Write the updated manifest
        fs.writeFileSync(manifestPath, newManifestContent, 'utf-8');
        
        console.log('\n✅ Successfully updated manifest.xml');
        console.log(`Added ${communityUrls.length} community URLs to manifest`);
        
        // Show final statistics
        const totalUrls = (manifestContent.match(/<url>/g) || []).length + communityUrls.length;
        console.log(`Total URLs in manifest: ${totalUrls}`);
        
        // Show some examples of the generated URLs
        console.log('\n📋 Sample Generated URLs:');
        communityUrls.slice(0, 3).forEach((item, index) => {
          console.log(`${index + 1}. ${item.url}`);
        });
        
      } else {
        console.error('❌ Could not find </urlset> tag in manifest.xml');
      }
      
    } else {
      console.error('❌ No communities found in JSON file');
    }
    
  } catch (error) {
    console.error('❌ Error processing communities:', error);
  }
}

updateManifestWithCommunities();
