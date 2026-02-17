'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from'@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle } from 'lucide-react';

interface MismatchDetail {
  itemId: string;
  expected: number;
  actual: number;
}

interface BypassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  details: MismatchDetail[];
  orderNumber: string;
}

export default function BypassModal({ isOpen, onClose, onSubmit, details, orderNumber }: BypassModalProps) {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await onSubmit(reason);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="h-6 w-6" />
            <DialogTitle>Quantity Mismatch Detected</DialogTitle>
          </div>
          <DialogDescription>
            The quantities you entered do not match the expected values for Order <strong>{orderNumber}</strong>.
            You must request approval to proceed.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-red-50 p-4 rounded-md space-y-2 text-sm text-red-800">
          <p className="font-semibold">Differences found:</p>
          <ul className="list-disc pl-5">
            {details.map((d) => (
              <li key={d.itemId}>
                Expected: <strong>{d.expected}</strong>, Found: <strong>{d.actual}</strong>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Reason for discrepancy <span className="text-red-500">*</span></label>
          <Textarea 
            placeholder="e.g. Item missing from basket, damaged item..." 
            value={reason}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReason(e.target.value)}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!reason || reason.length < 5 || isSubmitting} className="bg-red-600 hover:bg-red-700">
            {isSubmitting ? 'Sending Request...' : 'Request Bypass'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
