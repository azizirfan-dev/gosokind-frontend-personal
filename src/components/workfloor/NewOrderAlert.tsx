'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { BellRing } from "lucide-react"

interface NewOrderAlertProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
}

export function NewOrderAlert({ isOpen, onClose, orderNumber }: NewOrderAlertProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="mx-auto bg-blue-100 p-3 rounded-full mb-4">
            <BellRing className="h-6 w-6 text-blue-600 animate-pulse" />
          </div>
          <DialogTitle className="text-center text-xl">New Order Arrived!</DialogTitle>
          <DialogDescription className="text-center pt-2">
            Order <span className="font-bold text-foreground">{orderNumber}</span> is waiting at your station.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center mt-4">
          <Button onClick={onClose} className="w-full sm:w-auto min-w-[120px]">
            View Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
