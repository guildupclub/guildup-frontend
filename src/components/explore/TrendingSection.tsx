import axios from "axios";
import React, { useEffect, useState } from "react";

function TrendingSection() {
  const [trendingPost, setTrensingPost] = useState([]);

  useEffect(() => {
    const fetchTrendingPost = async () => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/post/trending`
      );
      setTrensingPost(response.data.data);
    };
    fetchTrendingPost();
  }, []);
  return (
    <div className="bg-[#2B2B2A] p-2 text-white border-none rounded-lg h-[60ch] overflow-scroll [&::-webkit-scrollbar]:hidden">
      {trendingPost.length > 0 && (
        <div>
          {trendingPost.map((post: any, index: number) => (
            <div className="p-2 border-b-[1px] border-gray-500">
              <div key={post.id || index}>{post.title}</div>
              <p className="text-sm ">{post.up_votes}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TrendingSection;
