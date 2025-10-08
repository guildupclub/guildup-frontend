const fs = require('fs');
const path = require('path');
const axios = require('axios');

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'https://guildup-be-569548341732.asia-south1.run.app';
const OUTPUT_FILE = path.join(process.cwd(), 'public/data/communities.json');
const BACKUP_FILE = path.join(process.cwd(), 'public/data/communities-backup.json');

async function fetchAllCommunities() {
  console.log('🚀 Starting community data fetch...');
  console.log(`📡 Backend URL: ${BACKEND_URL}`);
  
  try {
    // Ensure data directory exists
    const dataDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
      console.log('📁 Created data directory:', dataDir);
    }

    // Backup existing file if it exists
    if (fs.existsSync(OUTPUT_FILE)) {
      fs.copyFileSync(OUTPUT_FILE, BACKUP_FILE);
      console.log('📋 Created backup of existing data');
    }

    const allCommunities = [];
    let page = 0;
    const limit = 100;
    let hasMore = true;
    let totalFetched = 0;

    while (hasMore) {
      console.log(`📥 Fetching page ${page + 1}...`);
      
      try {
        const response = await axios.get(
          `${BACKEND_URL}/v1/community/all?page=${page}&limit=${limit}`,
          {
            timeout: 30000,
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': 'GuildUp-DataFetcher/1.0'
            }
          }
        );

        if (response.data.r === 's' && Array.isArray(response.data.data)) {
          const communities = response.data.data;
          allCommunities.push(...communities);
          totalFetched += communities.length;
          
          console.log(`✅ Fetched ${communities.length} communities (Total: ${totalFetched})`);

          // Check if we have more pages
          const meta = response.data.meta;
          if (meta && meta.total) {
            hasMore = (page + 1) * limit < meta.total;
            console.log(`📊 Progress: ${totalFetched}/${meta.total} communities`);
          } else {
            hasMore = communities.length === limit;
          }
          
          page++;
        } else {
          console.error('❌ Invalid response format:', response.data);
          break;
        }
      } catch (pageError) {
        console.error(`❌ Error fetching page ${page}:`, pageError.message);
        // Try to continue with next page after a delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        page++;
        if (page > 10) break; // Prevent infinite loops
      }
    }

    // Extract categories from communities
    function extractCategories(communities) {
      const categories = new Map();
      
      communities.forEach(item => {
        const community = item.community || item; // Handle both structures
        if (community.category) {
          const cat = typeof community.category === 'string' 
            ? { name: community.category } 
            : community.category;
          
          if (cat.name) {
            categories.set(cat.name, {
              name: cat.name,
              count: (categories.get(cat.name)?.count || 0) + 1,
              ...(cat._id && { id: cat._id })
            });
          }
        }
      });
      
      return Array.from(categories.values()).sort((a, b) => b.count - a.count);
    }

    // Extract tags from communities
    function extractTags(communities) {
      const tagMap = new Map();
      
      communities.forEach(item => {
        const community = item.community || item; // Handle both structures
        if (community.tags && Array.isArray(community.tags)) {
          community.tags.forEach(tag => {
            const tagName = typeof tag === 'string' ? tag : tag.name || tag;
            if (tagName && tagName.trim()) { // Only count non-empty tags
              tagMap.set(tagName, (tagMap.get(tagName) || 0) + 1);
            }
          });
        }
      });
      
      return Array.from(tagMap.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 100); // Top 100 tags
    }

    // Prepare final data structure
    const finalData = {
      communities: allCommunities,
      metadata: {
        totalCount: allCommunities.length,
        lastUpdated: new Date().toISOString(),
        fetchedAt: Date.now(),
        version: '1.0',
        source: 'manual-fetch'
      },
      categories: extractCategories(allCommunities),
      tags: extractTags(allCommunities)
    };

    // Write to file
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(finalData, null, 2));
    
    console.log(`🎉 Successfully fetched and saved ${allCommunities.length} communities`);
    console.log(`📁 Data saved to: ${OUTPUT_FILE}`);
    
    // Generate summary
    console.log('\n📊 FETCH SUMMARY');
    console.log('================');
    console.log(`Total Communities: ${allCommunities.length}`);
    console.log(`Categories Found: ${finalData.categories.length}`);
    console.log(`Tags Found: ${finalData.tags.length}`);
    console.log(`Last Updated: ${finalData.metadata.lastUpdated}`);
    
    console.log('\n🏷️ Top Categories:');
    finalData.categories.slice(0, 10).forEach((cat, i) => {
      console.log(`  ${i + 1}. ${cat.name} (${cat.count} communities)`);
    });
    
    console.log('\n🏷️ Top Tags:');
    finalData.tags.slice(0, 10).forEach((tag, i) => {
      console.log(`  ${i + 1}. ${tag.name} (${tag.count} communities)`);
    });
    
    return finalData;
    
  } catch (error) {
    console.error('💥 Fatal error during fetch:', error);
    
    // Restore backup if available
    if (fs.existsSync(BACKUP_FILE)) {
      fs.copyFileSync(BACKUP_FILE, OUTPUT_FILE);
      console.log('🔄 Restored from backup');
    }
    
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  fetchAllCommunities();
}

module.exports = { fetchAllCommunities };
