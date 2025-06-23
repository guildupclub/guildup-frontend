import React from 'react';
import { Button } from '@/components/ui/button';
import { Hash, Plus, Lock, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CreateChannelDialog } from '@/components/community/sidebar/CreateChannelDialog';
import { DeleteChannelDialog } from '@/components/community/sidebar/DeleteChannelDialog';
import type { SidebarFormData } from '@/hooks/useSidebar';

interface Channel {
  id: string;
  name: string;
  locked: boolean;
  type: string;
}

interface ChannelsSectionProps {
  channels: Channel[];
  activeChannelId: string;
  isAdmin: boolean;
  isChannelOpen: boolean;
  setIsChannelOpen: (open: boolean) => void;
  showDeleteDialog: boolean;
  setShowDeleteDialog: (show: boolean) => void;
  selectedChannelId: string | null;
  setSelectedChannelId: (id: string | null) => void;
  formData: SidebarFormData;
  setFormData: (data: SidebarFormData) => void;
  isCreatingChannel: boolean;
  handleChannelNavigation: (channel: Channel) => void;
  handleCreateChannel: () => void;
  handleDeleteChannel: () => void;
}

export const ChannelsSection: React.FC<ChannelsSectionProps> = ({
  channels,
  activeChannelId,
  isAdmin,
  isChannelOpen,
  setIsChannelOpen,
  showDeleteDialog,
  setShowDeleteDialog,
  selectedChannelId,
  setSelectedChannelId,
  formData,
  setFormData,
  isCreatingChannel,
  handleChannelNavigation,
  handleCreateChannel,
  handleDeleteChannel,
}) => {
  return (
    <div className="px-2 py-2 border-t border-background p-2">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-muted">Channels</h2>
        <Dialog open={isChannelOpen} onOpenChange={setIsChannelOpen}>
          <DialogTrigger asChild>
            {isAdmin && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-background"
                disabled={!isAdmin}
              >
                <Plus className="h-4 w-4 text-muted-foreground" />
              </Button>
            )}
          </DialogTrigger>
          <CreateChannelDialog
            formData={formData}
            setFormData={setFormData}
            isCreatingChannel={isCreatingChannel}
            handleCreateChannel={handleCreateChannel}
            onClose={() => setIsChannelOpen(false)}
          />
        </Dialog>
      </div>

      <div className="space-y-1">
        {channels.map((channel) => (
          <Button
            key={channel.id}
            variant="ghost"
            className={`w-full justify-start gap-2 border-b-2 border-background pb-4 ${
              activeChannelId === channel.id
                ? "bg-[#334BFF]/20 text-primary hover:bg-[#334BFF]/30"
                : "hover:bg-background text-muted-foreground"
            }`}
            onClick={() => handleChannelNavigation(channel)}
          >
            <Hash />
            {channel.name}
            <div className="h-3 w-3 ml-auto opacity-50 flex flex-row items-center justify-center">
              {channel.locked && <Lock className="mx-2" />}

              {isAdmin && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-40 bg-gray-100"
                  >
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedChannelId(channel.id);
                        setShowDeleteDialog(true);
                      }}
                      className="text-muted-foreground cursor-pointer"
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </Button>
        ))}
      </div>

      <DeleteChannelDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteChannel}
      />
    </div>
  );
}; 