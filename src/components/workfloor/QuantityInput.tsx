import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';

interface QuantityInputProps {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}

export default function QuantityInput({ value, onChange, min = 0, max, disabled }: QuantityInputProps) {
  const handleDecrement = () => {
    if (value > min) onChange(value - 1);
  };

  const handleIncrement = () => {
    if (max === undefined || value < max) onChange(value + 1);
  };

  return (
    <div className="flex items-center space-x-2">
      <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleDecrement} disabled={disabled || value <= min}>
        <Minus className="h-4 w-4" />
      </Button>
      <Input 
        type="number" 
        value={value} 
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        className="h-8 w-16 text-center appearance-none"
        disabled={disabled}
      />
      <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleIncrement} disabled={disabled || (max !== undefined && value >= max)}>
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
