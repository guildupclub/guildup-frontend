import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function PostCreator() {
  return (
    <div className="bg-zinc-900/50 rounded-xl mb-4">
      <div className="p-4">
        <div className="flex gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src="/placeholder.svg" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-3">
            <div className="rounded-lg bg-zinc-800/50 p-3">
              <input
                type="text"
                placeholder="Create a post..."
                className="w-full bg-transparent text-sm text-zinc-200 placeholder:text-zinc-400 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400">Post to:</span>
              <Select defaultValue="general">
                <SelectTrigger className="h-8 w-44 bg-transparent border-zinc-700 text-xs">
                  <SelectValue>General Channel</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Channel</SelectItem>
                  <SelectItem value="travel">Travel Channel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
