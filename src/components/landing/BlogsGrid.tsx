"use client";
import React, { useMemo } from "react";
import { useTopExperts } from "@/lib/fetching/useTopExperts";
import { useBlogsForExperts } from "@/lib/fetching/useBlogsForExperts";
import { primary } from "@/app/colours";

const BlogsGrid: React.FC = () => {
  const { data: experts } = useTopExperts(18);
  const expertIds = useMemo(() => (experts || []).map((e) => e.id), [experts]);
  const { data: blogs, isLoading } = useBlogsForExperts(expertIds);

  if (isLoading) return null;
  if (!blogs || blogs.length === 0) return null;

  return (
    <section aria-labelledby="blogs-title" className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 id="blogs-title" className="text-3xl sm:text-4xl font-bold" style={{ fontFamily: "'Poppins', sans-serif" }}>From our experts</h2>
          <p className="text-gray-600 mt-2" style={{ fontFamily: "'Poppins', sans-serif" }}>Insights and guidance you can trust</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((b) => (
            <a key={b.id} href={b.url || '#'} className="block rounded-xl overflow-hidden border bg-white shadow-sm hover:shadow-lg transition-shadow" style={{ borderColor: `${primary}20` }}>
              <div className="relative h-48 bg-gray-100">
                {b.coverImage && <img src={b.coverImage} alt={b.title} className="absolute inset-0 w-full h-full object-cover" />}
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold" style={{ fontFamily: "'Poppins', sans-serif" }}>{b.title}</h3>
                {b.excerpt && <p className="text-sm text-gray-600 mt-2" style={{ fontFamily: "'Poppins', sans-serif" }}>{b.excerpt}</p>}
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogsGrid;


