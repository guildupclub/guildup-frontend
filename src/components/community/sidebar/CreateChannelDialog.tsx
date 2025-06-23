import React from 'react';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Info } from 'lucide-react';
import { StringConstants } from '@/components/common/CommonText';
import type { SidebarFormData } from '@/hooks/useSidebar';

interface CreateChannelDialogProps {
  formData: SidebarFormData;
  setFormData: (data: SidebarFormData) => void;
  isCreatingChannel: boolean;
  handleCreateChannel: () => void;
  onClose: () => void;
}

export const CreateChannelDialog: React.FC<CreateChannelDialogProps> = ({
  formData,
  setFormData,
  isCreatingChannel,
  handleCreateChannel,
  onClose,
}) => {
  return (
    <DialogContent className="sm:max-w-[425px] bg-background border-none">
      <DialogHeader>
        <DialogTitle>Create a New Channel</DialogTitle>
      </DialogHeader>
      <div className="grid gap-6 py-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Channel Name</Label>
          <Input
            id="name"
            placeholder="Enter name"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            className="bg-card border-background"
          />
        </div>
        <div className="grid gap-2">
          <Label>{StringConstants.CHANNEL_TYPE}</Label>
          <Select
            value={formData.type}
            onValueChange={(value: 'chat' | 'post') =>
              setFormData({ ...formData, type: value })
            }
          >
            <SelectTrigger className="bg-card border-background text-muted">
              <SelectValue placeholder="Select channel type" />
            </SelectTrigger>
            <SelectContent className="bg-card border-background text-muted">
              <SelectItem value="chat">
                {StringConstants.CHAT}
              </SelectItem>
              <SelectItem value="post">
                Post Discussion
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label className="flex items-center gap-2">
            {StringConstants.LOCK_CHANNEL_MESSAGE}
            <div className="relative group">
              <Info className="w-4 h-4 text-muted cursor-pointer" />
              <span className="absolute left-6 w-40 top-1/2 -translate-y-1/2 scale-0 group-hover:scale-100 transition-transform origin-left bg-zinc-800 text-zinc-200 text-xs rounded-md px-2 py-1 shadow-lg">
                {StringConstants.PVT_CHANNEL_MESSAGE}
              </span>
            </div>
          </Label>
          <RadioGroup
            value={formData.is_locked.toString()}
            onValueChange={(value) =>
              setFormData({
                ...formData,
                is_locked: value === "true",
              })
            }
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="true" id="yes" />
              <Label htmlFor="yes">{StringConstants.YES}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="false" id="no" />
              <Label htmlFor="no">{StringConstants.NO}</Label>
            </div>
          </RadioGroup>
        </div>
      </div>
      <div className="flex justify-end gap-4">
        <Button
          variant="outline"
          onClick={onClose}
          className="bg-transparent border-background hover:bg-background text-muted-foreground"
        >
          {StringConstants.CANCEL}
        </Button>
        <Button
          onClick={handleCreateChannel}
          disabled={isCreatingChannel || !formData.name.trim()}
          className="bg-primary-gradient text-white"
        >
          {isCreatingChannel ? "Creating..." : "Create"}
        </Button>
      </div>
    </DialogContent>
  );
}; 