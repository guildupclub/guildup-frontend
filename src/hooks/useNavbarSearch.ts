import { useState } from "react";
import { useRouter } from "next/navigation";

export const useNavbarSearch = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    router.push(`/api/search?q=${encodeURIComponent(searchQuery)}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return {
    searchQuery,
    setSearchQuery,
    handleSearch,
    handleKeyPress,
  };
}; 