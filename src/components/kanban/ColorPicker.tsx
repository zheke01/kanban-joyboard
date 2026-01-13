import { useState, useRef, useEffect } from 'react';
import { Palette } from 'lucide-react';
import { ColumnColor, COLUMN_COLORS } from '@/types/kanban';
import { cn } from '@/lib/utils';

interface ColorPickerProps {
  value: ColumnColor;
  onChange: (color: ColumnColor) => void;
  className?: string;
}

export function ColorPicker({ value, onChange, className }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentColor = COLUMN_COLORS.find((c) => c.value === value) || COLUMN_COLORS[0];

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 text-muted-foreground hover:text-foreground transition-colors"
        title="Change color"
      >
        <Palette className="h-3.5 w-3.5" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 p-2 bg-popover border border-border rounded-lg shadow-lg z-50 animate-scale-in">
          <div className="grid grid-cols-4 gap-1.5">
            {COLUMN_COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => {
                  onChange(color.value);
                  setIsOpen(false);
                }}
                className={cn(
                  'w-6 h-6 rounded-full transition-transform hover:scale-110 ring-offset-2 ring-offset-popover',
                  value === color.value && 'ring-2 ring-primary'
                )}
                style={{ backgroundColor: `hsl(${color.hsl})` }}
                title={color.label}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
