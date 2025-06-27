import * as React from "react";
import { FaPlus, FaTimes } from "react-icons/fa";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface LanguagesManagerProps {
  languages: string[] | undefined;
  newLanguage: string;
  isEditable: boolean;
  onNewLanguageChange: (value: string) => void;
  onAddLanguage: () => void;
  onRemoveLanguage: (language: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export const LanguagesManager: React.FC<LanguagesManagerProps> = ({
  languages,
  newLanguage,
  isEditable,
  onNewLanguageChange,
  onAddLanguage,
  onRemoveLanguage,
  onKeyDown,
}) => {
  return (
    <div className="col-span-1 md:col-span-2">
      <label className="block text-sm font-medium mb-1 text-muted-foreground">
        Languages
      </label>
      <div className="flex flex-wrap gap-2 mb-2">
        {(languages || []).map((language, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="flex items-center gap-1 px-3 py-1.5 text-primary-foreground"
          >
            {language}
            {isEditable && (
              <button
                onClick={() => onRemoveLanguage(language)}
                className="ml-1 text-xs hover:text-red-500"
              >
                <FaTimes />
              </button>
            )}
          </Badge>
        ))}
      </div>
      {isEditable && (
        <div className="flex gap-2">
          <input
            type="text"
            value={newLanguage}
            onChange={(e) => onNewLanguageChange(e.target.value)}
            placeholder="Add a language"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-muted ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            onKeyDown={onKeyDown}
          />
          <Button
            onClick={onAddLanguage}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-gradient-to-r from-indigo-600 to-indigo-400 text-white hover:bg-indigo-500 h-10 px-4 py-2"
          >
            <FaPlus className="mr-1" /> Add
          </Button>
        </div>
      )}
    </div>
  );
}; 