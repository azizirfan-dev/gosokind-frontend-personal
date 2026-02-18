import { DriverJob } from '@/types/driver';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Package, Truck, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DriverJobCardProps {
  job: DriverJob;
  onAccept: (jobId: string) => void;
  isLoading?: boolean;
}

export default function DriverJobCard({ job, onAccept, onComplete, isLoading }: DriverJobCardProps & { onComplete?: (jobId: string, type: string) => void }) {
  const isPickup = job.type === 'PICKUP';
  const isInProgress = job.status === 'IN_PROGRESS' || 
                       job.status === 'PICKUP_ON_THE_WAY' || 
                       job.status === 'DELIVERY_ON_THE_WAY'; 
  // Backend statuses might vary, mapping:
  // WAITING_FOR_PICKUP -> WAITING
  // delivery_on_the_way -> IN_PROGRESS

  return (
    <Card className="hover:shadow-md transition-shadow duration-200 border-l-4 border-l-primary/20 overflow-hidden">
      <CardHeader className="pb-3 pt-4 px-4 bg-muted/10">
        <div className="flex justify-between items-start">
          <Badge 
            variant={isPickup ? "default" : "secondary"}
            className={cn(
              "uppercase text-[10px] sm:text-xs px-2 py-0.5",
              isPickup ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700 text-white"
            )}
          >
            {job.type}
          </Badge>
          <span className="font-mono text-xs text-muted-foreground">#{job.orderId}</span>
        </div>
        <h3 className="font-semibold text-lg leading-tight mt-2 truncate">{job.customerName}</h3>
      </CardHeader>

      <CardContent className="px-4 py-3 space-y-3">
        <div className="flex items-start gap-3">
          <MapPin className="w-4 h-4 mt-1 text-red-500 shrink-0" />
          <span className="text-sm text-gray-700 font-medium leading-relaxed line-clamp-2">{job.address}</span>
        </div>
        
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-dashed">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Package className="w-3.5 h-3.5 text-blue-500" />
                <span className="font-medium">{job.itemCount} Items</span>
            </div>
            {job.distance && (
                 <div className="flex items-center gap-1.5 text-xs text-gray-500 justify-end">
                    <Truck className="w-3.5 h-3.5 text-orange-500" />
                    <span className="font-medium">{job.distance}</span>
                </div>
            )}
            <div className="col-span-2 flex items-center gap-1.5 text-xs text-gray-400">
                <Clock className="w-3.5 h-3.5" />
                <span>{job.date}</span>
            </div>
        </div>
      </CardContent>

      <CardFooter className="px-4 pb-4 pt-1">
        <Button 
            className={cn(
                "w-full font-semibold shadow-sm",
                isInProgress ? "bg-green-600 hover:bg-green-700" : ""
            )} 
            size="lg"
            onClick={() => {
                if (isInProgress && onComplete) {
                    onComplete(job.id, job.type); // Use UUID (id), not orderNumber (orderId)
                } else {
                    onAccept(job.id);
                }
            }}
            disabled={isLoading}
        >
            {isInProgress ? "Complete Job" : "Accept Job"}
        </Button>
      </CardFooter>
    </Card>
  );
}
