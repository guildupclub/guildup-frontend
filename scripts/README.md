# Community Data Fetching

This directory contains scripts for fetching and caching community data from the GuildUp backend API.

## Files

- `fetch-communities.js` - Main script to fetch all communities and save to JSON
- `README.md` - This documentation

## Usage

### Manual Fetch
```bash
# Fetch communities and save to public/data/communities.json
npm run fetch-communities

# Or run directly
node scripts/fetch-communities.js
```

### Production Fetch
```bash
# Fetch with production environment
npm run fetch-communities:prod
```

## Output

The script creates/updates the following files:
- `public/data/communities.json` - Main data file with all communities
- `public/data/communities-backup.json` - Backup of previous data

## Data Structure

The generated JSON file contains:

```json
{
  "communities": [
    {
      "community": {
        "_id": "community_id",
        "name": "Community Name",
        "description": "Community description",
        "image": "profile_image_url",
        "tags": ["tag1", "tag2"],
        "num_member": 10,
        "post_count": 5,
        // ... other community fields
      },
      "offerings": [
        // ... community offerings
      ]
    }
  ],
  "metadata": {
    "totalCount": 139,
    "lastUpdated": "2025-10-08T19:03:59.743Z",
    "fetchedAt": 1759950239745,
    "version": "1.0",
    "source": "manual-fetch"
  },
  "categories": [],
  "tags": [
    {
      "name": "Yoga",
      "count": 17
    }
    // ... more tags
  ]
}
```

## Using Cached Data

Use the `useCachedCommunities` hook in your components:

```typescript
import { useCachedCommunities } from '@/hooks/useCachedCommunities';

function MyComponent() {
  const { data, loading, error, totalCount, tags } = useCachedCommunities();
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      <h1>Communities ({totalCount})</h1>
      {/* Render your communities */}
    </div>
  );
}
```

## Benefits

- **Performance**: Instant loading from cached JSON
- **Reliability**: Fallback to API if cache fails
- **Offline Support**: Works even when API is down
- **Reduced API Calls**: Less load on backend
- **Rich Metadata**: Includes tags, categories, and statistics

## Automation

For automated updates, consider:
- GitHub Actions (daily cron)
- Vercel Cron Jobs
- Server cron jobs
- CI/CD pipeline integration
