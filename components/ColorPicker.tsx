import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
}

const presetColors = [
  '#ffffff', '#f8fafc', '#f1f5f9', '#e2e8f0', '#cbd5e1', '#94a3b8', '#64748b', '#475569', '#334155', '#1e293b', '#0f172a',
  '#fef2f2', '#fee2e2', '#fecaca', '#fca5a5', '#f87171', '#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d',
  '#fff7ed', '#ffedd5', '#fed7aa', '#fdba74', '#fb923c', '#f97316', '#ea580c', '#c2410c', '#9a3412', '#7c2d12',
  '#fefce8', '#fef3c7', '#fde68a', '#fcd34d', '#fbbf24', '#f59e0b', '#d97706', '#b45309', '#92400e', '#78350f',
  '#f0fdf4', '#dcfce7', '#bbf7d0', '#86efac', '#4ade80', '#22c55e', '#16a34a', '#15803d', '#166534', '#14532d',
  '#ecfdf5', '#d1fae5', '#a7f3d0', '#6ee7b7', '#34d399', '#10b981', '#059669', '#047857', '#065f46', '#064e3b',
  '#f0fdfa', '#ccfbf1', '#99f6e4', '#5eead4', '#2dd4bf', '#14b8a6', '#0d9488', '#0f766e', '#115e59', '#134e4a',
  '#ecfeff', '#cffafe', '#a5f3fc', '#67e8f9', '#22d3ee', '#06b6d4', '#0891b2', '#0e7490', '#155e75', '#164e63',
  '#f0f9ff', '#e0f2fe', '#bae6fd', '#7dd3fc', '#38bdf8', '#0ea5e9', '#0284c7', '#0369a1', '#075985', '#0c4a6e',
  '#eff6ff', '#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a',
  '#eef2ff', '#e0e7ff', '#c7d2fe', '#a5b4fc', '#818cf8', '#6366f1', '#4f46e5', '#4338ca', '#3730a3', '#312e81',
  '#f5f3ff', '#ede9fe', '#ddd6fe', '#c4b5fd', '#a78bfa', '#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95',
  '#faf5ff', '#f3e8ff', '#e9d5ff', '#d8b4fe', '#c084fc', '#a855f7', '#9333ea', '#7e22ce', '#6b21a8', '#581c87',
  '#fdf4ff', '#fae8ff', '#f5d0fe', '#f0abfc', '#e879f9', '#d946ef', '#c026d3', '#a21caf', '#86198f', '#701a75',
  '#fdf2f8', '#fce7f3', '#fbcfe8', '#f9a8d4', '#f472b6', '#ec4899', '#db2777', '#be185d', '#9d174d', '#831843'
];

export const ColorPicker: React.FC<ColorPickerProps> = ({ value, onChange, label }) => {
  const [customColor, setCustomColor] = useState(value);
  const [isOpen, setIsOpen] = useState(false);

  const handlePresetColorClick = (color: string) => {
    onChange(color);
    setCustomColor(color);
    setIsOpen(false);
  };

  const handleCustomColorChange = (color: string) => {
    setCustomColor(color);
    onChange(color);
  };

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full h-10 p-1 flex items-center gap-2"
          >
            <div
              className="w-6 h-6 rounded border border-border flex-shrink-0"
              style={{ backgroundColor: value }}
            />
            <span className="flex-1 text-left text-sm font-mono">{value}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-4" align="start">
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Custom Color</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  type="color"
                  value={customColor}
                  onChange={(e) => handleCustomColorChange(e.target.value)}
                  className="w-12 h-8 p-0 border rounded cursor-pointer"
                />
                <Input
                  value={customColor}
                  onChange={(e) => handleCustomColorChange(e.target.value)}
                  placeholder="#000000"
                  className="flex-1 font-mono text-sm"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Preset Colors</Label>
              <div className="grid grid-cols-11 gap-1 mt-2">
                {presetColors.map((color, index) => (
                  <button
                    key={index}
                    className={`w-5 h-5 rounded border-2 hover:scale-110 transition-transform ${
                      value === color ? 'border-primary' : 'border-transparent hover:border-border'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => handlePresetColorClick(color)}
                    title={color}
                  />
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">CSS Variables</Label>
              <div className="grid grid-cols-2 gap-1 mt-2">
                {[
                  'hsl(var(--primary))',
                  'hsl(var(--secondary))',
                  'hsl(var(--background))',
                  'hsl(var(--foreground))',
                  'hsl(var(--muted))',
                  'hsl(var(--border))',
                  'hsl(var(--accent))',
                  'hsl(var(--destructive))'
                ].map((cssVar) => (
                  <Button
                    key={cssVar}
                    variant="outline"
                    size="sm"
                    className="text-xs h-8 justify-start"
                    onClick={() => handlePresetColorClick(cssVar)}
                  >
                    {cssVar.split('(--')[1].split(')')[0]}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};