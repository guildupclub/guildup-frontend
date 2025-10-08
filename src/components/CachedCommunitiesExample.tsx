import React from 'react';
import { useCachedCommunities } from '@/hooks/useCachedCommunities';

export function CachedCommunitiesExample() {
  const { 
    data, 
    loading, 
    error, 
    source, 
    isStale, 
    refresh,
    totalCount,
    tags,
    categories 
  } = useCachedCommunities({
    fallbackToAPI: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    autoRefresh: true
  });

  if (loading) return <div className="p-4">Loading communities...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header with stats */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">Cached Communities</h1>
          <div className="flex gap-2 items-center">
            {isStale && (
              <span className="text-orange-500 text-sm bg-orange-100 px-2 py-1 rounded">
                Data may be outdated
              </span>
            )}
            <span className="text-gray-500 text-sm bg-gray-100 px-2 py-1 rounded">
              Source: {source}
            </span>
            <button 
              onClick={refresh}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            >
              Refresh
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800">Total Communities</h3>
            <p className="text-2xl font-bold text-blue-600">{totalCount}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800">Categories</h3>
            <p className="text-2xl font-bold text-green-600">{categories.length}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-800">Tags</h3>
            <p className="text-2xl font-bold text-purple-600">{tags.length}</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-orange-800">Last Updated</h3>
            <p className="text-sm text-orange-600">
              {data?.metadata.lastUpdated ? 
                new Date(data.metadata.lastUpdated).toLocaleString() : 
                'Unknown'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Top Tags */}
      {tags.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Popular Tags</h2>
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 20).map((tag, index) => (
              <span 
                key={tag.name}
                className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm hover:bg-gray-200 transition-colors"
                title={`${tag.count} communities`}
              >
                {tag.name} ({tag.count})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Sample Communities */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Sample Communities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.communities.slice(0, 6).map((item, index) => {
            const community = item.community || item;
            return (
              <div key={community._id || index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-3">
                  {community.image && (
                    <img 
                      src={community.image} 
                      alt={community.name}
                      className="w-12 h-12 rounded-full object-cover mr-3"
                    />
                  )}
                  <div>
                    <h3 className="font-semibold text-lg">{community.name}</h3>
                    <p className="text-gray-600 text-sm">{community.owner_name}</p>
                  </div>
                </div>
                
                <p className="text-gray-700 text-sm mb-3 line-clamp-3">
                  {community.description?.substring(0, 150)}...
                </p>
                
                {community.tags && community.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {community.tags.slice(0, 3).map((tag, tagIndex) => (
                      <span 
                        key={tagIndex}
                        className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                    {community.tags.length > 3 && (
                      <span className="text-gray-500 text-xs">
                        +{community.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}
                
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{community.num_member || 0} members</span>
                  <span>{community.post_count || 0} posts</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Data Source Info */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Data Information</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>Source:</strong> {source}</p>
          <p><strong>Version:</strong> {data?.metadata.version}</p>
          <p><strong>Fetched At:</strong> {data?.metadata.fetchedAt ? new Date(data.metadata.fetchedAt).toLocaleString() : 'Unknown'}</p>
          <p><strong>Data Age:</strong> {data ? Math.round((Date.now() - data.metadata.fetchedAt) / (1000 * 60 * 60)) : 0} hours</p>
        </div>
      </div>
    </div>
  );
}
