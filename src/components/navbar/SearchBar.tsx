import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useNavbarSearch } from "@/hooks/useNavbarSearch";

interface SearchBarProps {
  isSmallScreen: boolean;
}

export const SearchBar = ({ isSmallScreen }: SearchBarProps) => {
  const { searchQuery, setSearchQuery, handleSearch, handleKeyPress } = useNavbarSearch();

  return (
    <div className="relative w-full max-w-xl md:max-w-[400px]">
      <div className="flex">
        <Input
          type="search"
          placeholder={
            isSmallScreen
              ? "Search..."
              : "Search creators, pages, or offerings..."
          }
          className="w-full bg-white outline-1 rounded-full pl-3 md:pl-5 pr-6 md:pr-12 py-1.5 md:py-2.5 text-xs md:text-sm text-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-primary/10 focus:outline-none"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button
          className="absolute right-1 top-1/2 -translate-y-1/2 flex h-6 w-6 md:h-8 md:w-8 items-center justify-center bg-primary hover:bg-primary/90 text-white rounded-full cursor-pointer"
          onClick={handleSearch}
        >
          <Search className="h-3 w-3 md:h-4 md:w-4" />
        </button>
      </div>
    </div>
  );
}; 