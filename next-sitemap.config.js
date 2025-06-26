/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://www.guildup.club',
  generateRobotsTxt: true,
  sitemapSize: 5000,
  changefreq: 'weekly',
  priority: 0.7,
  generateIndexSitemap: true,
  dynamicRoutes: async () => {
    // Simulate fetching community IDs from an API or database
    const communityIds = [
      'Nlp-CoachPallavikambo-67fcceae8924663fe50bb7bf',
      'AnotherCreator-xyz123',
      'YetAnotherCreator-abc456', // Add more IDs as needed
    ]; // Replace with actual data source (e.g., API call)
    const dynamicRoutes = [];
    communityIds.forEach((communityId) => {
      dynamicRoutes.push(`/community/${communityId}/profile`);
      dynamicRoutes.push(`/community/${communityId}/announcements`);
      dynamicRoutes.push(`/community/${communityId}/channel/channel1`); // Dynamic channel names if applicable
      dynamicRoutes.push(`/community/${communityId}/event`);
      dynamicRoutes.push(`/community/${communityId}/feed`);
      dynamicRoutes.push(`/community/${communityId}/members`);
    });
    return dynamicRoutes.concat([
      '/booking/123',
      '/feedback/456',
      '/post/789',
    ]);
  },
};