import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface CancellationRequestModalProps {
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export const CancellationRequestModal = ({ onClose, onConfirm }: CancellationRequestModalProps) => {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    if (!reason.trim()) return;
    onConfirm(reason.trim());
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-[hsl(var(--panel))]">
        <DialogHeader>
          <DialogTitle>Request Cancellation</DialogTitle>
          <DialogDescription>
            Please provide a brief reason to request cancellation of this approved absence.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="cancel-reason">Reason</Label>
            <Textarea
              id="cancel-reason"
              placeholder="Explain why you need to cancel this absence..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">This will be visible to your lead.</p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleConfirm} disabled={!reason.trim()}>Submit Request</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
