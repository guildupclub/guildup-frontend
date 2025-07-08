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
  Tag
} from 'lucide-react';

import ShareButton from '@/components/blogs/ShareButton';
import SocialShare from '@/components/blogs/SocialShare';

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

    const shareUrl = `${process.env.NEXTAUTH_URL}/blogs/${post.slug}`;

    return (
      <article className="min-h-screen bg-white">
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
        <header className="bg-white border-b sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link 
                href="/blogs" 
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="font-medium">Back to Articles</span>
              </Link>
              
              <div className="flex items-center gap-4">
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
          <div className="relative h-64 sm:h-80 lg:h-96 bg-gray-900">
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover opacity-75"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent" />
            
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
              <div className="max-w-4xl mx-auto">
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <span className="px-3 py-1 bg-primary text-white text-sm font-medium rounded-full">
                    {post.category}
                  </span>
                  {post.featured && (
                    <span className="px-3 py-1 bg-yellow-500 text-white text-sm font-medium rounded-full">
                      Featured
                    </span>
                  )}
                </div>
                
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                  {post.title}
                </h1>
                
                <p className="text-lg sm:text-xl text-gray-200 mb-6 max-w-3xl">
                  {post.excerpt}
                </p>
                
                <div className="flex flex-wrap items-center gap-6 text-gray-300">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    <span className="font-medium">{post.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    <span>{formatDate(post.date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    <span>{post.readTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    <span>{post.content ? Math.ceil(post.content.split(/\s+/).length / 200) : 5} min read</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            {/* Article Content */}
            <div className="lg:col-span-3">
              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mb-8">
                  <Tag className="w-4 h-4 text-gray-500" />
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Article Body */}
              <div 
                className="prose prose-lg max-w-none prose-headings:font-semibold prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-blockquote:border-l-primary prose-blockquote:border-l-4 prose-blockquote:pl-4 prose-blockquote:italic prose-table:border-collapse prose-th:border prose-th:border-gray-300 prose-th:bg-gray-50 prose-th:px-4 prose-th:py-2 prose-td:border prose-td:border-gray-300 prose-td:px-4 prose-td:py-2"
                dangerouslySetInnerHTML={{ __html: post.content || '' }}
              />

              {/* Social Sharing */}
              <SocialShare 
                title={post.title}
                url={shareUrl}
              />
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="space-y-8">
                {/* Author Info */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">About the Author</h3>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-semibold text-lg">
                      {post.author.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{post.author}</p>
                      <p className="text-sm text-gray-600">Expert Writer</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Passionate about sharing insights and helping communities grow through expert knowledge and practical advice.
                  </p>
                </div>

                {/* Table of Contents could go here */}
                
                {/* Newsletter Signup */}
                {/* <div className="bg-primary text-white p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3">Stay Updated</h3>
                  <p className="text-sm text-blue-100 mb-4">
                    Get the latest insights and stories delivered to your inbox.
                  </p>
                  <button className="w-full bg-white text-primary px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                    Subscribe to Newsletter
                  </button>
                </div> */}
              </div>
            </div>
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="bg-gray-50 py-12">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {relatedPosts.map((relatedPost) => (
                  <Link key={relatedPost.id} href={`/blogs/${relatedPost.slug}`}>
                    <article className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden group">
                      <div className="relative h-48 bg-gray-200">
                        <Image
                          src={relatedPost.image}
                          alt={relatedPost.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        <div className="absolute top-3 left-3">
                          <span className="px-2 py-1 bg-primary text-white text-xs font-medium rounded-full">
                            {relatedPost.category}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors duration-200 line-clamp-2">
                          {relatedPost.title}
                        </h3>
                        
                        <p className="text-gray-600 mb-4 text-sm line-clamp-3">
                          {relatedPost.excerpt}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center gap-2">
                            <User className="w-3 h-3" />
                            <span>{relatedPost.author}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            <span>{relatedPost.readTime}</span>
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