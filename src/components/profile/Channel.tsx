import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Hash, Plus, Lock, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useRouter } from "next/navigation";
import { StringConstants } from "@/components/common/CommonText";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";

interface ChannelProps {
  communityId: string;
}

export function Channel({ communityId }: ChannelProps) {
  const router = useRouter();
  const [channels, setChannels] = useState([]);
  const [isChannelOpen, setIsChannelOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const user = useSelector((state: RootState) => state.user.user);
  const memberDetails = useSelector((state: RootState) => state.member.memberDetails);
  const isAdmin = memberDetails?.is_owner || memberDetails?.is_moderator;

  const [formData, setFormData] = useState({
    name: "",
    type: "discussion",
    is_locked: false,
  });

  useEffect(() => {
    fetchChannels();
  }, [communityId]);

  const fetchChannels = async () => {
    if (!communityId || !user?._id) return;
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/channel/getChannels`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user?._id,
            communityId: communityId,
          }),
        }
      );

      const data = await response.json();
      if (data.r === "s" && data.data) {
        const formattedChannels = data.data.map((channel: any) => ({
          id: channel._id,
          name: channel.name,
          icon: channel.type === "chat" ? Lock : Hash,
          locked: channel.is_locked,
          type: channel.type,
        }));
        setChannels(formattedChannels);
      }
    } catch (error) {
      console.error("Error fetching channels:", error);
      setError("Failed to load channels");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateChannel = async () => {
    if (!formData.name.trim()) return;
    setIsCreating(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/channel/create`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user?._id,
            communityId: communityId,
            name: formData.name,
            type: formData.type,
            is_locked: formData.is_locked,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to create channel");

      setFormData({ name: "", type: "discussion", is_locked: false });
      setIsChannelOpen(false);
      fetchChannels();
    } catch (error) {
      setError("Error creating channel");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-foreground">Channels</h2>
        {isAdmin && (
          <Dialog open={isChannelOpen} onOpenChange={setIsChannelOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create Channel
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create a New Channel</DialogTitle>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Channel Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter channel name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Channel Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select channel type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="discussion">Discussion</SelectItem>
                      <SelectItem value="chat">Chat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label className="flex items-center gap-2">
                    Lock Channel
                    <div className="relative group">
                      <Info className="w-4 h-4 text-muted cursor-pointer" />
                      <span className="absolute left-6 w-40 top-1/2 -translate-y-1/2 scale-0 group-hover:scale-100 transition-transform origin-left bg-zinc-800 text-white text-xs rounded p-2">
                        Private channels are only visible to selected members
                      </span>
                    </div>
                  </Label>
                  <RadioGroup
                    value={formData.is_locked.toString()}
                    onValueChange={(value) => setFormData({
                      ...formData,
                      is_locked: value === "true"
                    })}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="yes" />
                      <Label htmlFor="yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="no" />
                      <Label htmlFor="no">No</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
              <div className="flex justify-end gap-4">
                <Button variant="outline" onClick={() => setIsChannelOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateChannel} disabled={isCreating}>
                  {isCreating ? "Creating..." : "Create"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {error && (
        <div className="text-red-500 text-center py-4">{error}</div>
      )}

      <div className="grid gap-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          </div>
        ) : channels.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No channels available
          </div>
        ) : (
          channels.map((channel: any) => (
            <div
              key={channel.id}
              className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Hash className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">{channel.name}</span>
                {channel.locked && (
                  <Lock className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/community/${communityId}/channel/${channel.name}`)}
              >
                Join
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}