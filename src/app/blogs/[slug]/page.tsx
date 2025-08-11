import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Clock, 
  User, 
  Calendar, 
  ArrowLeft, 
  BookOpen,
  Tag,
  Share2,
  Heart,
  MessageCircle,
  Bookmark
} from 'lucide-react';

import ShareButton from '@/components/blogs/ShareButton';
import CopyLinkButton from '@/components/blogs/CopyLinkButton';
import SocialShare from '@/components/blogs/SocialShare';
import ReadingProgress from '@/components/blogs/ReadingProgress';

import { 
  getBlogPostBySlug, 
  getRelatedBlogPosts, 
  getBlogFileNames,
  getAllBlogPostsMetadata
} from '@/lib/blog';

// Generate static params for all blog posts
export async function generateStaticParams() {
  try {
    const posts = await getAllBlogPostsMetadata();
    return posts.map((post) => ({
      slug: post.slug,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const post = await getBlogPostBySlug(params.slug);
    
    if (!post) {
      return {
        title: 'Blog Post Not Found',
        description: 'The requested blog post could not be found.'
      };
    }

    return {
      title: post.seo.metaTitle,
      description: post.seo.metaDescription,
      keywords: post.seo.keywords,
      authors: [{ name: post.author }],
      openGraph: {
        title: post.title,
        description: post.excerpt,
        type: 'article',
        publishedTime: post.date,
        authors: [post.author],
        images: [
          {
            url: post.image,
            width: 800,
            height: 400,
            alt: post.title,
          }
        ],
        url: `/blogs/${post.slug}`
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description: post.excerpt,
        images: [post.image],
      },
      alternates: {
        canonical: `/blogs/${post.slug}`
      }
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Blog Post',
      description: 'Read our latest blog post.'
    };
  }
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  try {
    const post = await getBlogPostBySlug(params.slug);
    
    if (!post) {
      notFound();
    }

    const relatedPosts = await getRelatedBlogPosts(post.slug, post.category, 3);

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
    };

    // Generate share URL with proper environment
    const shareUrl = `${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL || 'http://localhost:3000'}/blogs/${post.slug}`;

    // Generate table of contents from headings
    const generateTableOfContents = (content: string) => {
      const headingRegex = /<h[2-3][^>]*>(.*?)<\/h[2-3]>/g;
      const headings: { level: number; text: string; id: string }[] = [];
      let match;
      
      while ((match = headingRegex.exec(content)) !== null) {
        const level = parseInt(match[0].charAt(2));
        const text = match[1].replace(/<[^>]*>/g, '');
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        headings.push({ level, text, id });
      }
      
      return headings;
    };

    const tableOfContents = generateTableOfContents(post.content || '');

    return (
      <article className="min-h-screen bg-white">
        {/* Reading Progress Bar */}
        <ReadingProgress />

        {/* SEO Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BlogPosting",
              "headline": post.title,
              "description": post.excerpt,
              "image": post.image,
              "author": {
                "@type": "Person",
                "name": post.author
              },
              "publisher": {
                "@type": "Organization",
                "name": "GuildUp",
                "url": "https://guildup.com"
              },
              "datePublished": post.date,
              "dateModified": post.date,
              "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": shareUrl
              },
              "keywords": post.tags.join(", "),
              "articleSection": post.category,
              "wordCount": post.content ? post.content.split(/\s+/).length : 0
            })
          }}
        />

        {/* Header Navigation */}
        <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link 
                href="/blogs" 
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Articles</span>
              </Link>
              
              <div className="flex items-center gap-4">
                <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
                  <Bookmark className="w-5 h-5" />
                </button>
                <ShareButton 
                  title={post.title}
                  excerpt={post.excerpt}
                  url={shareUrl}
                />
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <div className="relative">
          <div className="relative h-80 sm:h-96 lg:h-[500px] bg-gray-900">
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover opacity-40"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/70 to-gray-900/50" />
            
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 lg:p-12">
              <div className="max-w-6xl mx-auto">
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <span className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-full shadow-lg">
                    {post.category}
                  </span>
                  {post.featured && (
                    <span className="px-4 py-2 bg-yellow-500 text-yellow-900 text-sm font-semibold rounded-full shadow-lg">
                      Featured
                    </span>
                  )}
                </div>
                
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight max-w-4xl drop-shadow-lg">
                  {post.title}
                </h1>
                
                <p className="text-xl sm:text-2xl text-gray-200 mb-8 max-w-4xl leading-relaxed drop-shadow-lg">
                  {post.excerpt}
                </p>
                
                <div className="flex flex-wrap items-center gap-8 text-gray-300 text-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">{post.author}</p>
                      <p className="text-sm text-gray-300">Expert Writer</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    <span className="font-medium">{formatDate(post.date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    <span className="font-medium">{post.content ? Math.ceil(post.content.split(/\s+/).length / 200) : 5} min read</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-16">
            {/* Article Content */}
            <div className="lg:col-span-4">
              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-3 mb-12">
                  <Tag className="w-5 h-5 text-gray-500" />
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Article Body */}
              <div 
                className="blog-content prose prose-xl max-w-none 
                  prose-headings:font-bold prose-headings:text-gray-900 prose-headings:leading-tight
                  prose-h2:text-3xl prose-h2:mt-16 prose-h2:mb-8 prose-h2:border-b prose-h2:border-gray-200 prose-h2:pb-4
                  prose-h3:text-2xl prose-h3:mt-12 prose-h3:mb-6 prose-h3:text-gray-800
                  prose-p:text-lg prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6
                  prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-a:font-medium
                  prose-strong:text-gray-900 prose-strong:font-semibold
                  prose-code:bg-gray-100 prose-code:px-3 prose-code:py-1 prose-code:rounded-md prose-code:text-sm prose-code:font-mono
                  prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-6 prose-pre:rounded-lg prose-pre:overflow-x-auto
                  prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-gray-700 prose-blockquote:bg-gray-50 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-lg
                  prose-ul:my-6 prose-ol:my-6 prose-li:my-2
                  prose-li:text-lg prose-li:text-gray-700
                  prose-table:w-full prose-table:border-collapse prose-table:my-8
                  prose-th:border prose-th:border-gray-300 prose-th:bg-gray-50 prose-th:px-6 prose-th:py-4 prose-th:text-left prose-th:font-semibold prose-th:text-gray-900
                  prose-td:border prose-td:border-gray-300 prose-td:px-6 prose-td:py-4 prose-td:text-gray-700
                  prose-img:rounded-lg prose-img:shadow-lg prose-img:my-8"
                dangerouslySetInnerHTML={{ __html: post.content || '' }}
              />

              {/* Call to Action */}
              <div className="cta-section">
                <h3 className="text-2xl font-bold mb-4">Join Our Wellness Community</h3>
                <p className="text-lg text-blue-100 mb-6 max-w-2xl mx-auto">
                  Connect with others on their wellness journey. Share your experiences, ask questions, and discover new ways to improve your health.
                </p>
                <a 
                  href="https://chat.whatsapp.com/LGTHl5BEb7i8B858ZjCJWi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cta-button"
                >
                  Join Community
                  <ArrowLeft className="w-5 h-5 rotate-180" />
                </a>
              </div>

              {/* Social Sharing */}
              <div className="mt-16">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Share this article</h3>
                <div className="flex flex-wrap gap-3">
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    LinkedIn
                  </a>
                  <a
                    href={`https://www.instagram.com/guildup.club/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297zm7.718-1.297c-.875.807-2.026 1.297-3.323 1.297s-2.448-.49-3.323-1.297c-.807-.875-1.297-2.026-1.297-3.323s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297z"/>
                    </svg>
                    Instagram
                  </a>
                  <a
                    href={`https://wa.me/919220521385?text=${encodeURIComponent(`Check out this article: ${post.title} - ${shareUrl}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.892A11.821 11.821 0 0020.885 3.488"/>
                    </svg>
                    WhatsApp
                  </a>
                  <CopyLinkButton url={shareUrl} />
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-2 lg:ml-12">
              <div className="sticky-sidebar blog-sidebar space-y-8">
                {/* Table of Contents */}
                {tableOfContents.length > 0 && (
                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      Table of Contents
                    </h3>
                    <nav className="space-y-2">
                      {tableOfContents.map((heading, index) => (
                        <a
                          key={index}
                          href={`#${heading.id}`}
                          className={`toc-link ${
                            heading.level === 2 
                              ? 'level-2' 
                              : 'level-3'
                          }`}
                        >
                          {heading.text}
                        </a>
                      ))}
                    </nav>
                  </div>
                )}

                {/* Author Info */}
                <div className="author-card">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">About the Author</h3>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="author-avatar">
                      {post.author.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-lg">{post.author}</p>
                      <p className="text-sm text-gray-600 font-medium">Expert Writer</p>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Passionate about sharing insights and helping communities grow through expert knowledge and practical advice.
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Heart className="w-4 h-4 text-red-500" />
                      <span>Health & Wellness</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4 text-blue-500" />
                      <span>Expert Advice</span>
                    </span>
                  </div>
                </div>

                {/* Newsletter Signup */}
                <div className="newsletter-card">
                  <h3 className="text-lg font-bold mb-3">Stay Updated</h3>
                  <p className="text-blue-100 mb-4 text-sm leading-relaxed">
                    Get the latest wellness insights and expert advice delivered to your inbox.
                  </p>
                  <div className="space-y-3">
                    <input 
                      type="email" 
                      placeholder="Enter your email"
                      className="newsletter-input"
                    />
                    <button className="newsletter-button">
                      Subscribe
                    </button>
                  </div>
                  <p className="text-xs text-blue-200 mt-3">
                    Your privacy is important to us. Unsubscribe at any time.
                  </p>
                </div>

                {/* Quick Stats */}
                <div className="stats-card">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Article Stats</h3>
                  <div className="space-y-3">
                    <div className="stats-row">
                      <span className="stats-label">Reading Time</span>
                      <span className="stats-value">{post.readTime}</span>
                    </div>
                    <div className="stats-row">
                      <span className="stats-label">Word Count</span>
                      <span className="stats-value">{post.content ? post.content.split(/\s+/).length.toLocaleString() : '0'}</span>
                    </div>
                    <div className="stats-row">
                      <span className="stats-label">Category</span>
                      <span className="stats-value">{post.category}</span>
                    </div>
                    <div className="stats-row">
                      <span className="stats-label">Tags</span>
                      <span className="stats-value">{post.tags.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="bg-gray-50 py-20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Related Articles</h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Continue your wellness journey with these related articles and insights.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {relatedPosts.map((relatedPost) => (
                  <Link key={relatedPost.id} href={`/blogs/${relatedPost.slug}`}>
                    <article className="related-article group">
                      <div className="related-article-image">
                        <Image
                          src={relatedPost.image}
                          alt={relatedPost.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 bg-primary text-white text-xs font-semibold rounded-full shadow-lg">
                            {relatedPost.category}
                          </span>
                        </div>
                        <div className="related-article-overlay group-hover:opacity-100" />
                      </div>
                      
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors duration-200 line-clamp-2 leading-tight">
                          {relatedPost.title}
                        </h3>
                        
                        <p className="text-gray-600 mb-4 text-sm line-clamp-3 leading-relaxed">
                          {relatedPost.excerpt}
                        </p>
                        
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span className="font-medium">{relatedPost.author}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span className="font-medium">{relatedPost.readTime}</span>
                          </div>
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </article>
    );
  } catch (error) {
    console.error('Error rendering blog post:', error);
    notFound();
  }
} 