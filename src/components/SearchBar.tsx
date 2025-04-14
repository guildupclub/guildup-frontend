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
    <div className="w-full flex justify-center mt-10 px-4">
      <div className="relative w-full max-w-2xl">
        <Input
          type="search"
          placeholder="Search for creators, pages, or offerings..."
          className="w-full h-14 pl-5 pr-16 text-base rounded-full border border-gray-300 shadow-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-200"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />

        <div
          className="absolute top-1/2 -translate-y-1/2 right-2 h-10 w-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center cursor-pointer transition duration-200"
          onClick={handleSearch}
        >
          <Search className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
