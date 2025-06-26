// /** @type {import('next-sitemap').IConfig} */
// module.exports = {
//   siteUrl: 'https://www.guildup.club',
//   generateRobotsTxt: true,
//   sitemapSize: 5000,
//   changefreq: 'weekly',
//   priority: 0.7,
//   generateIndexSitemap: true,
// };



/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://www.guildup.club',
  generateRobotsTxt: true,
  sitemapSize: 5000,
  changefreq: 'weekly',
  priority: 0.7,
  generateIndexSitemap: true,
  dynamicRoutes: async () => {
    // Example: Fetch dynamic route parameters from an API or static data
    const dynamicRoutes = [];

    // Example for /booking/[id]
    const bookingIds = ['123', '456', '789']; // Replace with actual IDs from your data source
    bookingIds.forEach((id) => {
      dynamicRoutes.push(`/booking/${id}`);
    });

    // Example for /community/[community-Id]/feed, /members, etc.
    const communityIds = ['com1', 'com2', 'com3']; // Replace with actual community IDs
    communityIds.forEach((communityId) => {
      dynamicRoutes.push(`/community/${communityId}/feed`);
      dynamicRoutes.push(`/community/${communityId}/members`);
      dynamicRoutes.push(`/community/${communityId}/profile`);
      dynamicRoutes.push(`/community/${communityId}/announcements`);
      dynamicRoutes.push(`/community/${communityId}/event`);
      dynamicRoutes.push(`/community/${communityId}/channel/channel1`); // Replace channelName dynamically if needed
    });

    // Example for /feedback/[bookingId]
    const feedbackIds = ['101', '102']; // Replace with actual booking IDs
    feedbackIds.forEach((bookingId) => {
      dynamicRoutes.push(`/feedback/${bookingId}`);
    });

    // Example for /post/[id]
    const postIds = ['901', '902']; // Replace with actual post IDs
    postIds.forEach((id) => {
      dynamicRoutes.push(`/post/${id}`);
    });

    return dynamicRoutes;
  },
};