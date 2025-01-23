import axios from "axios";
import React, { useEffect, useState } from "react";

// Mock data for events (as shown in the image)
const TRENDING_EVENTS = [
  {
    id: 1,
    title: "Technology Workshop Series",
    date: "Fri, Jan 31 • 5:00 PM",
    type: "Online",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRd-M_r7bEyuBQzUODeKwobumjZ2bnoB_uelw&s",
  },
  {
    id: 2,
    title: "Monthly Tech Meetup",
    date: "Sat, Jan 25 • 12:00 PM",
    type: "Offline",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSUg3x8Vt2KKU7EGJ-9avOH6HFMx58MyHa2b-_Kt7nAiX9qetolQl309uqHga0uuwXWNiw&usqp=CAU",
  },
  {
    id: 3,
    title: "AI Workshop: Practical Applications",
    date: "Sun, Jan 28 • 2:00 PM",
    type: "Offline",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRd-M_r7bEyuBQzUODeKwobumjZ2bnoB_uelw&s",
  },
  {
    id: 4,
    title: "Cyber Tech Workshop",
    date: "Mon, Jan 29 • 3:00 PM",
    type: "Online",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSUg3x8Vt2KKU7EGJ-9avOH6HFMx58MyHa2b-_Kt7nAiX9qetolQl309uqHga0uuwXWNiw&usqp=CAU",
  },
];

function TrendingSection() {
  const [trendingPost, setTrendingPost] = useState([]);

  useEffect(() => {
    const fetchTrendingPost = async () => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/post/trending`
      );
      setTrendingPost(response.data.data);
    };
    fetchTrendingPost();
  }, []);

  return (
    <div className="flex flex-col gap-4">
      {/* Trending Tags Section */}
      <div className="bg-zinc-900 p-4 text-white rounded-lg h-[30ch] overflow-auto scrollbar-none">
        <h2 className="text-lg font-semibold mb-3">Trending Tags</h2>
        {trendingPost.length > 0 && (
          <div className="space-y-3">
            {trendingPost.map((post: any, index: number) => (
              <div
                key={post.id || index}
                className="p-2 border-b border-zinc-800 hover:bg-zinc-800 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">#{post.title}</span>
                  <span className="text-xs text-gray-400">
                    {post.up_votes} posts
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Trending Events Section */}
      <div className="bg-zinc-900 p-4 text-white rounded-lg h-[30ch] overflow-auto scrollbar-none cursor-pointer">
        <h2 className="text-lg font-semibold mb-3">Trending Events</h2>
        <div className="space-y-3">
          {TRENDING_EVENTS.map((event) => (
            <div
              key={event.id}
              className="flex gap-3 p-2 border-b border-zinc-800 hover:bg-zinc-800 transition-colors"
            >
              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-800">
                <img
                  src={event.image || "/placeholder.svg"}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <h3 className="text-sm font-medium">{event.title}</h3>
                <p className="text-xs text-gray-400 mt-1">{event.date}</p>
                <span className="text-xs text-gradient mt-1">
                  {event.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TrendingSection;
