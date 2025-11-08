import { Client } from '@notionhq/client';
import { NotionToMarkdown } from 'notion-to-md';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkHtml from 'remark-html';

// Get Notion client instance
function getNotionClient(): Client {
  const apiKey = process.env.NOTION_API_KEY;
  
  if (!apiKey) {
    throw new Error('NOTION_API_KEY is not set in environment variables');
  }
  
  return new Client({
    auth: apiKey,
  });
}

// Get Notion to Markdown converter instance
function getNotionToMarkdownConverter(notionClient: Client): NotionToMarkdown {
  return new NotionToMarkdown({ notionClient });
}

// Notion property types
interface NotionPageProperties {
  Title?: { title: Array<{ plain_text: string }> };
  Slug?: { rich_text: Array<{ plain_text: string }> };
  Excerpt?: { rich_text: Array<{ plain_text: string }> };
  Author?: { rich_text: Array<{ plain_text: string }> };
  Date?: { date: { start: string } | null };
  Category?: { select: { name: string } | null };
  Tags?: { multi_select: Array<{ name: string }> };
  Featured?: { checkbox: boolean };
  Image?: { files: Array<{ file: { url: string } }> };
  'SEO Meta Title'?: { rich_text: Array<{ plain_text: string }> };
  'SEO Meta Description'?: { rich_text: Array<{ plain_text: string }> };
  'SEO Keywords'?: { multi_select: Array<{ name: string }> };
  'Read Time'?: { rich_text: Array<{ plain_text: string }> };
  Published?: { checkbox: boolean };
}

// Extract text from Notion rich_text or title
function extractText(property: { rich_text?: Array<{ plain_text: string }>; title?: Array<{ plain_text: string }> } | undefined): string {
  if (!property) return '';
  if ('title' in property && property.title) {
    return property.title.map(t => t.plain_text).join('');
  }
  if ('rich_text' in property && property.rich_text) {
    return property.rich_text.map(t => t.plain_text).join('');
  }
  return '';
}

// Extract date from Notion date property
function extractDate(property: { date?: { start: string } | null } | undefined): string {
  if (!property?.date?.start) return new Date().toISOString().split('T')[0];
  return property.date.start;
}

// Convert Notion blocks to HTML
async function convertNotionBlocksToHtml(pageId: string): Promise<string> {
  try {
    const notionClient = getNotionClient();
    const n2m = getNotionToMarkdownConverter(notionClient);
    
    // Get markdown from Notion
    const mdBlocks = await n2m.pageToMarkdown(pageId);
    const mdString = n2m.toMarkdownString(mdBlocks);
    
    // Extract markdown string (handle both string and object formats)
    const markdownContent = typeof mdString === 'string' 
      ? mdString 
      : mdString?.parent || mdString?.markdown || '';
    
    // Convert markdown to HTML
    const processedContent = await remark()
      .use(remarkGfm)
      .use(remarkHtml, { sanitize: false })
      .process(markdownContent);
    
    let contentHtml = processedContent.toString();
    
    // Add IDs to headings for table of contents
    contentHtml = contentHtml.replace(
      /<h([2-3])[^>]*>(.*?)<\/h[2-3]>/g,
      (match, level, text) => {
        const cleanText = text.replace(/<[^>]*>/g, '');
        const id = cleanText.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        return `<h${level} id="${id}">${text}</h${level}>`;
      }
    );
    
    return contentHtml;
  } catch (error) {
    console.error('Error converting Notion blocks to HTML:', error);
    return '';
  }
}

// Map Notion page to BlogPost interface
export async function mapNotionPageToBlogPost(page: any): Promise<any | null> {
  try {
    const properties = page.properties as NotionPageProperties;
    
    // Extract properties
    const title = extractText(properties.Title);
    const slug = extractText(properties.Slug) || 
                 title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const excerpt = extractText(properties.Excerpt);
    const author = extractText(properties.Author);
    const date = extractDate(properties.Date);
    const category = properties.Category?.select?.name || 'Uncategorized';
    const tags = properties.Tags?.multi_select?.map(t => t.name) || [];
    const featured = properties.Featured?.checkbox || false;
    const image = properties.Image?.files?.[0]?.file?.url || 
                  `https://picsum.photos/800/400?random=${Math.floor(Math.random() * 1000)}`;
    const seoMetaTitle = extractText(properties['SEO Meta Title']) || title;
    const seoMetaDescription = extractText(properties['SEO Meta Description']) || excerpt;
    const seoKeywords = properties['SEO Keywords']?.multi_select?.map(k => k.name) || tags;
    const readTime = extractText(properties['Read Time']) || '5 min';
    const published = properties.Published?.checkbox ?? true;
    
    // Only return published posts
    if (!published) {
      return null;
    }
    
    // Convert Notion content to HTML
    const content = await convertNotionBlocksToHtml(page.id);
    
    // Calculate reading time if not provided
    const calculatedReadTime = readTime === '5 min' && content 
      ? `${Math.ceil(content.split(/\s+/).length / 200)} min`
      : readTime;
    
    return {
      id: page.id,
      title,
      excerpt,
      author,
      date,
      readTime: calculatedReadTime,
      category,
      image,
      slug,
      tags,
      featured,
      content,
      seo: {
        metaTitle: seoMetaTitle,
        metaDescription: seoMetaDescription,
        keywords: seoKeywords
      }
    };
  } catch (error) {
    console.error('Error mapping Notion page to blog post:', error);
    return null;
  }
}

// Fetch all blog posts from Notion
export async function fetchAllBlogPostsFromNotion(): Promise<any[]> {
  try {
    const databaseId = process.env.NOTION_DATABASE_ID;
    
    if (!databaseId) {
      console.error('NOTION_DATABASE_ID is not set');
      return [];
    }
    
    const apiKey = process.env.NOTION_API_KEY;
    if (!apiKey) {
      console.error('NOTION_API_KEY is not set');
      return [];
    }
    
    const notionClient = getNotionClient();
    
    if (!notionClient) {
      console.error('Failed to create Notion client');
      return [];
    }
    
    // In Notion API v5.3.0, query is on dataSources, not databases
    if (!notionClient.dataSources) {
      console.error('Notion client dataSources is not available', {
        clientType: typeof notionClient,
        clientKeys: Object.keys(notionClient)
      });
      return [];
    }
    
    const dataSources = notionClient.dataSources as any;
    
    if (!dataSources.query || typeof dataSources.query !== 'function') {
      console.error('Notion client dataSources.query is not available', {
        hasDataSources: !!notionClient.dataSources,
        availableMethods: Object.keys(dataSources)
      });
      return [];
    }
    
    console.log('Querying Notion database via dataSources:', databaseId);
    
    // Use dataSources.query with data_source_id (database ID can be used as data source ID)
    const response = await dataSources.query({
      data_source_id: databaseId,
      filter: {
        property: 'Published',
        checkbox: {
          equals: true
        }
      },
      sorts: [
        {
          property: 'Date',
          direction: 'descending'
        }
      ]
    });
    
    console.log(`Found ${response.results.length} published pages in Notion`);
    
    const blogPosts: any[] = [];
    
    for (const page of response.results) {
      const blogPost = await mapNotionPageToBlogPost(page);
      if (blogPost) {
        blogPosts.push(blogPost);
      }
    }
    
    console.log(`Successfully mapped ${blogPosts.length} blog posts`);
    
    return blogPosts;
  } catch (error) {
    console.error('Error fetching blog posts from Notion:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    return [];
  }
}

// Fetch a single blog post by slug
export async function fetchBlogPostBySlugFromNotion(slug: string): Promise<any | null> {
  try {
    const databaseId = process.env.NOTION_DATABASE_ID;
    
    if (!databaseId) {
      console.error('NOTION_DATABASE_ID is not set');
      return null;
    }
    
    const apiKey = process.env.NOTION_API_KEY;
    if (!apiKey) {
      console.error('NOTION_API_KEY is not set');
      return null;
    }
    
    const notionClient = getNotionClient();
    
    if (!notionClient) {
      console.error('Failed to create Notion client');
      return null;
    }
    
    // In Notion API v5.3.0, query is on dataSources, not databases
    if (!notionClient.dataSources) {
      console.error('Notion client dataSources is not available', {
        clientType: typeof notionClient
      });
      return null;
    }
    
    const dataSources = notionClient.dataSources as any;
    
    if (!dataSources.query || typeof dataSources.query !== 'function') {
      console.error('Notion client dataSources.query is not available', {
        hasDataSources: !!notionClient.dataSources,
        availableMethods: Object.keys(dataSources)
      });
      return null;
    }
    
    console.log('Querying Notion database for slug:', slug);
    
    // Use dataSources.query with data_source_id (database ID can be used as data source ID)
    const response = await dataSources.query({
      data_source_id: databaseId,
      filter: {
        and: [
          {
            property: 'Published',
            checkbox: {
              equals: true
            }
          },
          {
            property: 'Slug',
            rich_text: {
              equals: slug
            }
          }
        ]
      }
    });
    
    if (response.results.length === 0) {
      console.log(`No blog post found with slug: ${slug}`);
      return null;
    }
    
    console.log(`Found blog post with slug: ${slug}`);
    return await mapNotionPageToBlogPost(response.results[0]);
  } catch (error) {
    console.error('Error fetching blog post by slug from Notion:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    return null;
  }
}

// Get all categories from Notion posts
export async function getAllCategoriesFromNotion(): Promise<string[]> {
  try {
    const posts = await fetchAllBlogPostsFromNotion();
    const categories = [...new Set(posts.map(post => post.category))];
    return ['All', ...categories.sort()];
  } catch (error) {
    console.error('Error fetching categories from Notion:', error);
    return ['All'];
  }
}

// Verify Notion webhook (if needed)
export function verifyNotionWebhook(body: any, signature: string | null): boolean {
  // Notion doesn't provide webhook signatures by default
  // You may need to implement custom verification
  // For now, we'll accept all requests (you should add proper verification in production)
  return true;
}

