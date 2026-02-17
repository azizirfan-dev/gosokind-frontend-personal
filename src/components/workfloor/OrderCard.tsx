'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Check, AlertTriangle } from 'lucide-react';
import { StationOrder, StationType } from '@/types/worker';
import QuantityInput from './QuantityInput';

interface OrderCardProps {
  order: StationOrder;
  station: StationType;
  onProcess: (orderId: string, items: { laundryItemId: string; quantity: number }[]) => void;
}

export default function OrderCard({ order, station, onProcess }: OrderCardProps) {
  // Initialize local state for inputs based on order items
  const [inputs, setInputs] = useState<{ [itemId: string]: number }>(
    order.items.reduce((acc, item) => ({ ...acc, [item.id]: item.qty }), {})
  );

  const isLocked = order.isLocked;

  const handleProcess = () => {
    const payloadItems = order.items.map(item => ({
      laundryItemId: item.id, // Assuming ID is laundryItemId
      quantity: inputs[item.id] || 0
    }));
    onProcess(order.id, payloadItems);
  };

  return (
    <Card className={`relative transition-all ${isLocked ? 'bg-gray-100 opacity-75' : 'bg-white shadow-sm hover:shadow-md'}`}>
      
      {/* Lock Overlay */}
      {isLocked && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-50/50 backdrop-blur-[1px] rounded-lg">
          <Lock className="w-12 h-12 text-gray-400 mb-2" />
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Bypass Requested
          </Badge>
        </div>
      )}

      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-bold">#{order.orderNumber}</CardTitle>
            <p className="text-xs text-gray-500">Order ID: {order.id.slice(-6)}</p>
          </div>
          <Badge variant={isLocked ? 'destructive' : 'default'} className="uppercase text-xs">
            {isLocked ? 'On Hold' : station}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-2">
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700">{item.name}</span>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <span className="text-xs text-gray-400 block">Expected</span>
                  <span className="font-mono font-bold text-gray-600">{item.qty}</span>
                </div>

                {/* Input only needed for verification stations (Washing/Ironing usually) */}
                {station !== 'PACKING' && (
                  <div className="text-right">
                    <span className="text-xs text-blue-600 block">Actual</span>
                    <QuantityInput 
                      value={inputs[item.id]} 
                      onChange={(val) => setInputs(prev => ({ ...prev, [item.id]: val }))}
                      disabled={isLocked}
                      min={0}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      <CardFooter className="pt-2 border-t bg-gray-50/50">
        <Button 
          className="w-full" 
          onClick={handleProcess} 
          disabled={isLocked}
        >
          {station === 'PACKING' ? (
            <>
              <Check className="mr-2 h-4 w-4" /> Finish Packing
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" /> Verify & Process
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
