import { useState, useRef, useEffect, useCallback } from 'react';
import { Palette } from 'lucide-react';
import { ColumnColor, PRESET_COLORS } from '@/types/kanban';
import { cn } from '@/lib/utils';

interface AdvancedColorPickerProps {
  value: ColumnColor;
  onChange: (color: ColumnColor) => void;
  className?: string;
}

// Convert hex to HSV
function hexToHsv(hex: string): { h: number; s: number; v: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { h: 0, s: 100, v: 100 };

  const r = parseInt(result[1], 16) / 255;
  const g = parseInt(result[2], 16) / 255;
  const b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;

  let h = 0;
  const s = max === 0 ? 0 : (d / max) * 100;
  const v = max * 100;

  if (d !== 0) {
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
        break;
      case g:
        h = ((b - r) / d + 2) * 60;
        break;
      case b:
        h = ((r - g) / d + 4) * 60;
        break;
    }
  }

  return { h, s, v };
}

// Convert HSV to hex
function hsvToHex(h: number, s: number, v: number): string {
  s = s / 100;
  v = v / 100;

  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;

  let r = 0, g = 0, b = 0;

  if (h >= 0 && h < 60) { r = c; g = x; b = 0; }
  else if (h >= 60 && h < 120) { r = x; g = c; b = 0; }
  else if (h >= 120 && h < 180) { r = 0; g = c; b = x; }
  else if (h >= 180 && h < 240) { r = 0; g = x; b = c; }
  else if (h >= 240 && h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }

  const toHex = (n: number) => {
    const hex = Math.round((n + m) * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

// Convert hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { r: 255, g: 255, b: 255 };
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

// Convert RGB to hex
function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const clamped = Math.max(0, Math.min(255, Math.round(n)));
    const hex = clamped.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function isValidHex(hex: string): boolean {
  return /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
}

export function AdvancedColorPicker({ value, onChange, className }: AdvancedColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const gradientRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);

  // Parse initial value
  const initialHex = value.startsWith('#') ? value : '#3B82F6';
  const initialHsv = hexToHsv(initialHex);

  const [hue, setHue] = useState(initialHsv.h);
  const [saturation, setSaturation] = useState(initialHsv.s);
  const [brightness, setBrightness] = useState(initialHsv.v);
  const [hexInput, setHexInput] = useState(initialHex);
  const [rgbInput, setRgbInput] = useState(hexToRgb(initialHex));

  const currentHex = hsvToHex(hue, saturation, brightness);

  // Sync inputs when color changes from gradient/hue
  useEffect(() => {
    setHexInput(currentHex);
    setRgbInput(hexToRgb(currentHex));
  }, [currentHex]);

  // Update from external value changes
  useEffect(() => {
    if (isValidHex(value)) {
      const hsv = hexToHsv(value);
      setHue(hsv.h);
      setSaturation(hsv.s);
      setBrightness(hsv.v);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleGradientInteraction = useCallback((e: React.MouseEvent | MouseEvent) => {
    if (!gradientRef.current) return;
    const rect = gradientRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    setSaturation(x * 100);
    setBrightness((1 - y) * 100);
  }, []);

  const handleHueInteraction = useCallback((e: React.MouseEvent | MouseEvent) => {
    if (!hueRef.current) return;
    const rect = hueRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHue(x * 360);
  }, []);

  const handleGradientMouseDown = (e: React.MouseEvent) => {
    handleGradientInteraction(e);
    const handleMove = (e: MouseEvent) => handleGradientInteraction(e);
    const handleUp = () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
    };
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
  };

  const handleHueMouseDown = (e: React.MouseEvent) => {
    handleHueInteraction(e);
    const handleMove = (e: MouseEvent) => handleHueInteraction(e);
    const handleUp = () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
    };
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
  };

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (!val.startsWith('#')) val = '#' + val;
    setHexInput(val);
    if (isValidHex(val)) {
      const hsv = hexToHsv(val);
      setHue(hsv.h);
      setSaturation(hsv.s);
      setBrightness(hsv.v);
    }
  };

  const handleRgbChange = (channel: 'r' | 'g' | 'b', value: string) => {
    const num = parseInt(value) || 0;
    const newRgb = { ...rgbInput, [channel]: Math.max(0, Math.min(255, num)) };
    setRgbInput(newRgb);
    const hex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    const hsv = hexToHsv(hex);
    setHue(hsv.h);
    setSaturation(hsv.s);
    setBrightness(hsv.v);
  };

  const applyColor = () => {
    onChange(currentHex);
    setIsOpen(false);
  };

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
        <div className="absolute top-full left-0 mt-1 p-3 bg-popover border border-border rounded-lg shadow-lg z-50 animate-scale-in w-64">
          {/* Saturation/Brightness Gradient */}
          <div
            ref={gradientRef}
            className="w-full h-36 rounded-md cursor-crosshair relative mb-3"
            style={{
              background: `linear-gradient(to bottom, transparent, black), linear-gradient(to right, white, hsl(${hue}, 100%, 50%))`,
            }}
            onMouseDown={handleGradientMouseDown}
          >
            <div
              className="absolute w-4 h-4 border-2 border-white rounded-full shadow-md -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{
                left: `${saturation}%`,
                top: `${100 - brightness}%`,
                backgroundColor: currentHex,
              }}
            />
          </div>

          {/* Hue Slider */}
          <div
            ref={hueRef}
            className="w-full h-4 rounded-md cursor-pointer relative mb-3"
            style={{
              background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
            }}
            onMouseDown={handleHueMouseDown}
          >
            <div
              className="absolute w-4 h-4 border-2 border-white rounded-full shadow-md -translate-x-1/2 top-0 pointer-events-none"
              style={{
                left: `${(hue / 360) * 100}%`,
                backgroundColor: `hsl(${hue}, 100%, 50%)`,
              }}
            />
          </div>

          {/* Preview */}
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-10 h-10 rounded-md border border-border"
              style={{ backgroundColor: currentHex }}
            />
            <div className="flex-1 text-sm font-mono text-foreground">{currentHex}</div>
          </div>

          {/* Hex Input */}
          <div className="mb-3">
            <label className="text-xs text-muted-foreground mb-1 block">HEX</label>
            <input
              type="text"
              value={hexInput}
              onChange={handleHexChange}
              className="w-full px-2 py-1.5 text-sm rounded border border-input bg-background text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-ring"
              maxLength={7}
            />
          </div>

          {/* RGB Inputs */}
          <div className="mb-3">
            <label className="text-xs text-muted-foreground mb-1 block">RGB</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={rgbInput.r}
                onChange={(e) => handleRgbChange('r', e.target.value)}
                className="w-full px-2 py-1.5 text-sm rounded border border-input bg-background text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-ring"
                min={0}
                max={255}
              />
              <input
                type="number"
                value={rgbInput.g}
                onChange={(e) => handleRgbChange('g', e.target.value)}
                className="w-full px-2 py-1.5 text-sm rounded border border-input bg-background text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-ring"
                min={0}
                max={255}
              />
              <input
                type="number"
                value={rgbInput.b}
                onChange={(e) => handleRgbChange('b', e.target.value)}
                className="w-full px-2 py-1.5 text-sm rounded border border-input bg-background text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-ring"
                min={0}
                max={255}
              />
            </div>
          </div>

          {/* Preset Colors */}
          <div className="mb-3">
            <label className="text-xs text-muted-foreground mb-1 block">Presets</label>
            <div className="flex gap-1.5 flex-wrap">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color.hex}
                  onClick={() => {
                    const hsv = hexToHsv(color.hex);
                    setHue(hsv.h);
                    setSaturation(hsv.s);
                    setBrightness(hsv.v);
                  }}
                  className={cn(
                    'w-6 h-6 rounded-full transition-transform hover:scale-110 ring-offset-1 ring-offset-popover',
                    currentHex.toUpperCase() === color.hex.toUpperCase() && 'ring-2 ring-primary'
                  )}
                  style={{ backgroundColor: color.hex }}
                  title={color.label}
                />
              ))}
            </div>
          </div>

          {/* Apply Button */}
          <button
            onClick={applyColor}
            className="w-full py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors text-sm"
          >
            Apply Color
          </button>
        </div>
      )}
    </div>
  );
}
