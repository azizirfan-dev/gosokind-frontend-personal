import { WorkerHistoryItem } from '@/types/worker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Calendar, CheckCircle2 } from 'lucide-react';

interface WorkerHistoryCardProps {
  job: WorkerHistoryItem;
}

export default function WorkerHistoryCard({ job }: WorkerHistoryCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow duration-200 border-l-4 border-l-green-500 overflow-hidden bg-white">
      <CardHeader className="pb-2 pt-4 px-4 bg-gray-50/50 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <span className="font-mono text-sm font-medium text-gray-700">{job.orderNumber}</span>
        </div>
        <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
          {job.status}
        </Badge>
      </CardHeader>

      <CardContent className="px-4 py-3 space-y-3">
        <div className="flex items-start gap-2 text-sm text-gray-600">
          <Package className="w-4 h-4 mt-0.5 text-blue-500 shrink-0" />
          <span className="font-medium line-clamp-2">{job.items}</span>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-gray-400 pt-2 border-t border-gray-100">
          <Calendar className="w-3.5 h-3.5" />
          <span>Completed: {job.date}</span>
        </div>
      </CardContent>
    </Card>
  );
}
