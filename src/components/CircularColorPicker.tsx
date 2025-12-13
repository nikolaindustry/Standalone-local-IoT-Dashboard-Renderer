import React, { useState, useRef, useEffect } from 'react';

interface CircularColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  size?: number;
}

export const CircularColorPicker: React.FC<CircularColorPickerProps> = ({ 
  value, 
  onChange,
  size = 200
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedColor, setSelectedColor] = useState(value);

  // Convert HSV to RGB
  const hsvToRgb = (h: number, s: number, v: number) => {
    let r, g, b;
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);
    
    switch (i % 6) {
      case 0: r = v; g = t; b = p; break;
      case 1: r = q; g = v; b = p; break;
      case 2: r = p; g = v; b = t; break;
      case 3: r = p; g = q; b = v; break;
      case 4: r = t; g = p; b = v; break;
      case 5: r = v; g = p; b = q; break;
    }
    
    return {
      r: Math.round((r || 0) * 255),
      g: Math.round((g || 0) * 255),
      b: Math.round((b || 0) * 255)
    };
  };

  // Convert RGB to Hex
  const rgbToHex = (r: number, g: number, b: number) => {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  };

  // Get color from angle and distance
  const getColorFromPosition = (angle: number, distance: number) => {
    // Convert angle from Math.atan2 (-π to π) to hue (0 to 1)
    // The wheel is drawn with angle 0 at 3 o'clock position (red)
    // Math.atan2 also has 0 at 3 o'clock, so we don't need to adjust
    // Just normalize to 0-1 range
    let normalizedAngle = angle;
    if (normalizedAngle < 0) {
      normalizedAngle += Math.PI * 2; // Convert [-π, 0) to [π, 2π)
    }
    
    // Convert to hue (0-1 range)
    const normalizedHue = normalizedAngle / (Math.PI * 2);
    
    // Saturation is distance from center (0-1)
    const saturation = Math.min(1, Math.max(0, distance / (size / 2)));
    
    // Value is fixed at 1 for vibrant colors
    const value = 1;
    
    const rgb = hsvToRgb(normalizedHue, saturation, value);
    return rgbToHex(rgb.r, rgb.g, rgb.b);
  };

  // Draw the color wheel
  const drawColorWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 10;
    
    // Clear canvas
    ctx.clearRect(0, 0, size, size);
    
    // Draw color wheel
    for (let angle = 0; angle < 360; angle += 1) {
      const startAngle = (angle - 2) * Math.PI / 180;
      const endAngle = (angle + 2) * Math.PI / 180;
      
      const hue = angle / 360;
      const rgb = hsvToRgb(hue, 1, 1);
      const color = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      
      ctx.fillStyle = color;
      ctx.fill();
    }
    
    // Draw saturation gradient in the center
    const gradient = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, radius
    );
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(1, 'transparent');
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Draw border
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  // Handle mouse/touch events
  const handleInteractionStart = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    const centerX = size / 2;
    const centerY = size / 2;
    
    // Calculate angle and distance from center
    const dx = x - centerX;
    const dy = y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);
    
    // Only update if within the color wheel
    if (distance <= size / 2) {
      const color = getColorFromPosition(angle, distance);
      setSelectedColor(color);
      onChange(color);
      setIsDragging(true);
    }
  };

  const handleInteractionMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    const centerX = size / 2;
    const centerY = size / 2;
    
    // Calculate angle and distance from center
    const dx = x - centerX;
    const dy = y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);
    
    // Only update if within the color wheel
    if (distance <= size / 2) {
      const color = getColorFromPosition(angle, distance);
      setSelectedColor(color);
      onChange(color);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    handleInteractionStart(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleInteractionMove(e.clientX, e.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleInteractionStart(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleInteractionMove(touch.clientX, touch.clientY);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Initialize and redraw when size changes
  useEffect(() => {
    drawColorWheel();
    setSelectedColor(value);
  }, [size, value]);

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          className="rounded-full cursor-pointer touch-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUp}
        />
        {/* Center indicator */}
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-md"
          style={{ backgroundColor: selectedColor }}
        />
      </div>
      <div className="mt-2 text-sm font-mono bg-muted px-2 py-1 rounded">
        {selectedColor}
      </div>
    </div>
  );
};