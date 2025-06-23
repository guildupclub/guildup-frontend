import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface DeleteChannelDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteChannelDialog: React.FC<DeleteChannelDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Channel</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this channel? You won&apos;t be
            able to undo this action.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-between sm:justify-between mt-6">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={onConfirm}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 