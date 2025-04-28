import React, { useState } from "react";
import { Input } from "./ui/input";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SearchBar() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    router.push(`/api/search?q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div className="w-full flex justify-center mt-6 md:mt-10 px-4">
      <div className="relative w-full max-w-2xl">
        <Input
          type="search"
          placeholder="Search for creators, pages, or offerings..."
          className="w-full h-12 md:h-16 pl-6 md:pl-8 pr-16 md:pr-20 text-base md:text-lg rounded-full border border-gray-200 bg-white/90 backdrop-blur-sm focus:border-primary/30 focus:ring-2 focus:ring-primary/10 focus:outline-none transition-all duration-200"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />

        <button
          className="absolute top-1/2 -translate-y-1/2 right-2 md:right-3 h-10 w-10 md:h-12 md:w-12 bg-primary hover:bg-primary/90 text-white rounded-full flex items-center justify-center cursor-pointer transition-all duration-200"
          onClick={handleSearch}
        >
          <Search className="h-4 w-4 md:h-5 md:w-5" />
        </button>
      </div>
    </div>
  );
}
