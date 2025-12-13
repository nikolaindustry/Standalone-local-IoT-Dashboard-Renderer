import React, { useState, useEffect } from 'react';
import { IoTDashboardWidget } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface HeatmapPoint {
  x: number;
  y: number;
  value: number;
}

interface HeatmapWidgetRendererProps {
  widget: IoTDashboardWidget;
  localValue: HeatmapPoint[] | any;
  handleValueChange: (value: any) => void;
  executeAction: (actionId: string, parameters?: Record<string, any>) => void;
  commonStyles: React.CSSProperties;
}

// Function to get color based on value and color scheme
const getColorForValue = (value: number, minValue: number, maxValue: number, colorScheme: string, customColors?: string[]) => {
  const normalizedValue = (value - minValue) / (maxValue - minValue);
  
  // Custom color scheme
  if (colorScheme === 'custom' && customColors && customColors.length > 0) {
    const index = Math.min(Math.floor(normalizedValue * customColors.length), customColors.length - 1);
    return customColors[index];
  }
  
  // Predefined color schemes
  switch (colorScheme) {
    case 'blue':
      // Blue gradient from light to dark
      const blueValue = Math.floor(255 * (1 - normalizedValue));
      return `rgb(${blueValue}, ${blueValue}, 255)`;
    case 'red':
      // Red gradient from light to dark
      const redValue = Math.floor(255 * normalizedValue);
      return `rgb(255, ${255 - redValue}, ${255 - redValue})`;
    case 'green':
      // Green gradient from light to dark
      const greenValue = Math.floor(255 * normalizedValue);
      return `rgb(${255 - greenValue}, 255, ${255 - greenValue})`;
    case 'purple':
      // Purple gradient
      const purpleValue = Math.floor(255 * normalizedValue);
      return `rgb(${purpleValue}, 0, ${255 - purpleValue})`;
    case 'rainbow':
      // Rainbow gradient
      const hue = normalizedValue * 360;
      return `hsl(${hue}, 100%, 50%)`;
    default:
      // Default blue gradient
      const defaultBlueValue = Math.floor(255 * (1 - normalizedValue));
      return `rgb(${defaultBlueValue}, ${defaultBlueValue}, 255)`;
  }
};

export const HeatmapWidgetRenderer: React.FC<HeatmapWidgetRendererProps> = ({
  widget,
  localValue,
  handleValueChange,
  executeAction,
  commonStyles
}) => {
  const [heatmapData, setHeatmapData] = useState<HeatmapPoint[]>(localValue || []);
  
  useEffect(() => {
    if (Array.isArray(localValue)) {
      setHeatmapData(localValue);
    }
  }, [localValue]);
  
  // Get heatmap configuration with defaults
  const colorScheme = widget.config.heatmapColorScheme || 'blue';
  const minValue = widget.config.heatmapMinValue || 0;
  const maxValue = widget.config.heatmapMaxValue || 100;
  const pointSize = widget.config.heatmapPointSize || 10;
  const pointShape = widget.config.heatmapPointShape || 'circle';
  const showLabels = widget.config.heatmapShowLabels !== false;
  const labelFontSize = widget.config.heatmapLabelFontSize || 12;
  const showAxis = widget.config.heatmapShowAxis !== false;
  const axisColor = widget.config.heatmapAxisColor || '#000000';
  const backgroundColor = widget.config.heatmapBackgroundColor || '#ffffff';
  const borderColor = widget.config.heatmapBorderColor || '#e2e8f0';
  const borderWidth = widget.config.heatmapBorderWidth || 1;
  const borderRadius = widget.config.heatmapBorderRadius || 4;
  const showContainer = widget.config.heatmapShowContainer !== false;
  const customColors = widget.config.heatmapCustomColors;
  const showGrid = widget.config.heatmapShowGrid !== false;
  const gridColor = widget.config.heatmapGridColor || '#e5e7eb';
  const showLegend = widget.config.heatmapShowLegend !== false;
  const xAxisLabel = widget.config.heatmapXAxisLabel || 'X Coordinate';
  const yAxisLabel = widget.config.heatmapYAxisLabel || 'Y Coordinate';
  const smoothingRadius = widget.config.heatmapSmoothingRadius || 30;
  const showContours = widget.config.heatmapShowContours === true;
  const contourColor = widget.config.heatmapContourColor || '#000000';
  const contourWidth = widget.config.heatmapContourWidth || 1;
  
  // Determine if container should be shown
  if (!showContainer) {
    return (
      <div className="h-full w-full flex items-center justify-center" style={commonStyles}>
        <HeatmapDisplay 
          data={heatmapData}
          width={widget.size.width}
          height={widget.size.height}
          colorScheme={colorScheme}
          minValue={minValue}
          maxValue={maxValue}
          pointSize={pointSize}
          pointShape={pointShape}
          showLabels={showLabels}
          labelFontSize={labelFontSize}
          showAxis={showAxis}
          axisColor={axisColor}
          backgroundColor={backgroundColor}
          borderColor={borderColor}
          borderWidth={borderWidth}
          borderRadius={borderRadius}
          customColors={customColors}
          showGrid={showGrid}
          gridColor={gridColor}
          showLegend={showLegend}
          xAxisLabel={xAxisLabel}
          yAxisLabel={yAxisLabel}
          smoothingRadius={smoothingRadius}
          showContours={showContours}
          contourColor={contourColor}
          contourWidth={contourWidth}
        />
      </div>
    );
  }
  
  return (
    <Card className="h-full" style={commonStyles}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <span>{widget.title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 p-4 flex items-center justify-center">
        <HeatmapDisplay 
          data={heatmapData}
          width={widget.size.width}
          height={widget.size.height}
          colorScheme={colorScheme}
          minValue={minValue}
          maxValue={maxValue}
          pointSize={pointSize}
          pointShape={pointShape}
          showLabels={showLabels}
          labelFontSize={labelFontSize}
          showAxis={showAxis}
          axisColor={axisColor}
          backgroundColor={backgroundColor}
          borderColor={borderColor}
          borderWidth={borderWidth}
          borderRadius={borderRadius}
          customColors={customColors}
          showGrid={showGrid}
          gridColor={gridColor}
          showLegend={showLegend}
          xAxisLabel={xAxisLabel}
          yAxisLabel={yAxisLabel}
          smoothingRadius={smoothingRadius}
          showContours={showContours}
          contourColor={contourColor}
          contourWidth={contourWidth}
        />
      </CardContent>
    </Card>
  );
};

interface HeatmapDisplayProps {
  data: HeatmapPoint[];
  width: number;
  height: number;
  colorScheme: string;
  minValue: number;
  maxValue: number;
  pointSize: number;
  pointShape: string;
  showLabels: boolean;
  labelFontSize: number;
  showAxis: boolean;
  axisColor: string;
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  customColors?: string[];
  showGrid: boolean;
  gridColor: string;
  showLegend: boolean;
  xAxisLabel: string;
  yAxisLabel: string;
  smoothingRadius: number;
  showContours: boolean;
  contourColor: string;
  contourWidth: number;
}

const HeatmapDisplay: React.FC<HeatmapDisplayProps> = ({
  data,
  width,
  height,
  colorScheme,
  minValue,
  maxValue,
  pointSize,
  pointShape,
  showLabels,
  labelFontSize,
  showAxis,
  axisColor,
  backgroundColor,
  borderColor,
  borderWidth,
  borderRadius,
  customColors,
  showGrid,
  gridColor,
  showLegend,
  xAxisLabel,
  yAxisLabel,
  smoothingRadius,
  showContours,
  contourColor,
  contourWidth
}) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  // Calculate margins for axes and labels
  const marginLeft = showAxis ? 60 : 20;
  const marginBottom = showAxis ? 60 : 20;
  const marginTop = 20;
  const marginRight = showLegend ? 80 : 20;
  
  const plotWidth = width - marginLeft - marginRight;
  const plotHeight = height - marginTop - marginBottom;
  
  // Calculate coordinate ranges from data with padding
  const padding = 10; // Padding percentage
  let xMin = 0;
  let xMax = 0;
  let yMin = 0;
  let yMax = 0;
  
  if (data.length > 0) {
    const xValues = data.map(p => p.x);
    const yValues = data.map(p => p.y);
    
    const dataXMin = Math.min(...xValues);
    const dataXMax = Math.max(...xValues);
    const dataYMin = Math.min(...yValues);
    const dataYMax = Math.max(...yValues);
    
    // Add padding to ranges
    const xRange = dataXMax - dataXMin || 100; // Default range if all points are same
    const yRange = dataYMax - dataYMin || 100;
    const xPadding = xRange * (padding / 100);
    const yPadding = yRange * (padding / 100);
    
    xMin = dataXMin - xPadding;
    xMax = dataXMax + xPadding;
    yMin = dataYMin - yPadding;
    yMax = dataYMax + yPadding;
  } else {
    // Default ranges when no data
    xMin = -100;
    xMax = 100;
    yMin = -100;
    yMax = 100;
  }
  
  // Determine axis positions based on coordinate ranges
  const hasNegativeX = xMin < 0;
  const hasPositiveX = xMax > 0;
  const hasNegativeY = yMin < 0;
  const hasPositiveY = yMax > 0;
  
  // Calculate where axes should be positioned
  let yAxisXPosition: number;
  let xAxisYPosition: number;
  
  if (hasNegativeX && hasPositiveX) {
    // Y-axis at x=0 (center)
    yAxisXPosition = marginLeft + ((0 - xMin) / (xMax - xMin)) * plotWidth;
  } else if (hasNegativeX) {
    // All negative X: Y-axis at right edge
    yAxisXPosition = width - marginRight;
  } else {
    // All positive X: Y-axis at left edge
    yAxisXPosition = marginLeft;
  }
  
  if (hasNegativeY && hasPositiveY) {
    // X-axis at y=0 (center)
    xAxisYPosition = height - marginBottom - ((0 - yMin) / (yMax - yMin)) * plotHeight;
  } else if (hasNegativeY) {
    // All negative Y: X-axis at top edge
    xAxisYPosition = marginTop;
  } else {
    // All positive Y: X-axis at bottom edge
    xAxisYPosition = height - marginBottom;
  }
  
  // Create tick marks (5 evenly spaced ticks)
  const xTicks = Array.from({ length: 5 }, (_, i) => xMin + (i * (xMax - xMin)) / 4);
  const yTicks = Array.from({ length: 5 }, (_, i) => yMin + (i * (yMax - yMin)) / 4);
  
  // Helper function to convert data coordinates to SVG coordinates
  const dataToSvgX = (dataX: number) => marginLeft + ((dataX - xMin) / (xMax - xMin)) * plotWidth;
  const dataToSvgY = (dataY: number) => height - marginBottom - ((dataY - yMin) / (yMax - yMin)) * plotHeight;
  
  // Gradient rendering with canvas
  React.useEffect(() => {
    if (pointShape === 'gradient' && canvasRef.current && data.length > 0) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Set canvas size to match display size
      const dpr = window.devicePixelRatio || 1;
      canvas.width = plotWidth * dpr;
      canvas.height = plotHeight * dpr;
      canvas.style.width = `${plotWidth}px`;
      canvas.style.height = `${plotHeight}px`;
      ctx.scale(dpr, dpr);
      
      // Clear canvas
      ctx.clearRect(0, 0, plotWidth, plotHeight);
      
      // Create a density grid
      const gridResolution = 4; // pixels per grid cell
      const gridWidth = Math.ceil(plotWidth / gridResolution);
      const gridHeight = Math.ceil(plotHeight / gridResolution);
      const densityGrid: number[] = new Array(gridWidth * gridHeight).fill(0);
      
      // Calculate density at each grid point using Gaussian kernel
      for (let gy = 0; gy < gridHeight; gy++) {
        for (let gx = 0; gx < gridWidth; gx++) {
          const px = gx * gridResolution;
          const py = gy * gridResolution;
          
          let totalWeight = 0;
          let weightedValue = 0;
          
          // Sum contributions from all data points
          data.forEach(point => {
            const svgX = dataToSvgX(point.x) - marginLeft;
            const svgY = dataToSvgY(point.y) - marginTop;
            
            const dx = px - svgX;
            const dy = py - svgY;
            const distSq = dx * dx + dy * dy;
            
            // Gaussian kernel
            const sigma = smoothingRadius;
            const weight = Math.exp(-distSq / (2 * sigma * sigma));
            
            totalWeight += weight;
            weightedValue += weight * point.value;
          });
          
          const avgValue = totalWeight > 0 ? weightedValue / totalWeight : minValue;
          densityGrid[gy * gridWidth + gx] = avgValue;
        }
      }
      
      // Render the gradient
      const imageData = ctx.createImageData(gridWidth, gridHeight);
      for (let i = 0; i < densityGrid.length; i++) {
        const value = densityGrid[i];
        const color = getColorForValue(value, minValue, maxValue, colorScheme, customColors);
        
        // Parse RGB from color string
        let r = 0, g = 0, b = 0;
        if (color.startsWith('rgb')) {
          const matches = color.match(/\d+/g);
          if (matches && matches.length >= 3) {
            r = parseInt(matches[0]);
            g = parseInt(matches[1]);
            b = parseInt(matches[2]);
          }
        } else if (color.startsWith('hsl')) {
          // Convert HSL to RGB - extract h, s, l values
          const hslMatch = color.match(/hsl\((\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?)%,\s*(\d+(?:\.\d+)?)%\)/);
          if (hslMatch && hslMatch.length >= 4) {
            const h = parseFloat(hslMatch[1]) / 360;
            const s = parseFloat(hslMatch[2]) / 100;
            const l = parseFloat(hslMatch[3]) / 100;
            
            // HSL to RGB conversion
            const hue2rgb = (p: number, q: number, t: number) => {
              if (t < 0) t += 1;
              if (t > 1) t -= 1;
              if (t < 1/6) return p + (q - p) * 6 * t;
              if (t < 1/2) return q;
              if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
              return p;
            };
            
            if (s === 0) {
              r = g = b = Math.round(l * 255);
            } else {
              const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
              const p = 2 * l - q;
              r = Math.round(hue2rgb(p, q, h + 1/3) * 255);
              g = Math.round(hue2rgb(p, q, h) * 255);
              b = Math.round(hue2rgb(p, q, h - 1/3) * 255);
            }
          }
        } else if (color.startsWith('#')) {
          // Parse hex color
          const hex = color.replace('#', '');
          if (hex.length === 6) {
            r = parseInt(hex.substring(0, 2), 16);
            g = parseInt(hex.substring(2, 4), 16);
            b = parseInt(hex.substring(4, 6), 16);
          }
        }
        
        const idx = i * 4;
        imageData.data[idx] = r;
        imageData.data[idx + 1] = g;
        imageData.data[idx + 2] = b;
        imageData.data[idx + 3] = 255; // Full opacity
      }
      
      // Create a temporary canvas for the image data
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = gridWidth;
      tempCanvas.height = gridHeight;
      const tempCtx = tempCanvas.getContext('2d');
      if (tempCtx) {
        tempCtx.putImageData(imageData, 0, 0);
        
        // Draw scaled version to main canvas with smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(tempCanvas, 0, 0, gridWidth, gridHeight, 0, 0, plotWidth, plotHeight);
      }
      
      // Draw contour lines if enabled
      if (showContours) {
        const contourLevels = 5;
        for (let level = 1; level < contourLevels; level++) {
          const threshold = minValue + (level / contourLevels) * (maxValue - minValue);
          ctx.strokeStyle = contourColor;
          ctx.lineWidth = contourWidth;
          
          // March squares to find contours
          for (let y = 0; y < gridHeight - 1; y++) {
            for (let x = 0; x < gridWidth - 1; x++) {
              const v00 = densityGrid[y * gridWidth + x];
              const v10 = densityGrid[y * gridWidth + (x + 1)];
              const v01 = densityGrid[(y + 1) * gridWidth + x];
              const v11 = densityGrid[(y + 1) * gridWidth + (x + 1)];
              
              const edges: [number, number][] = [];
              
              // Check edges for threshold crossings
              if ((v00 < threshold && v10 >= threshold) || (v00 >= threshold && v10 < threshold)) {
                const t = (threshold - v00) / (v10 - v00);
                edges.push([x + t, y]);
              }
              if ((v00 < threshold && v01 >= threshold) || (v00 >= threshold && v01 < threshold)) {
                const t = (threshold - v00) / (v01 - v00);
                edges.push([x, y + t]);
              }
              if ((v10 < threshold && v11 >= threshold) || (v10 >= threshold && v11 < threshold)) {
                const t = (threshold - v10) / (v11 - v10);
                edges.push([x + 1, y + t]);
              }
              if ((v01 < threshold && v11 >= threshold) || (v01 >= threshold && v11 < threshold)) {
                const t = (threshold - v01) / (v11 - v01);
                edges.push([x + t, y + 1]);
              }
              
              // Draw contour segments
              if (edges.length >= 2) {
                const scale = plotWidth / gridWidth;
                ctx.beginPath();
                ctx.moveTo(edges[0][0] * scale, edges[0][1] * scale);
                ctx.lineTo(edges[1][0] * scale, edges[1][1] * scale);
                ctx.stroke();
              }
            }
          }
        }
      }
    }
  }, [pointShape, data, plotWidth, plotHeight, colorScheme, minValue, maxValue, smoothingRadius, showContours, contourColor, contourWidth, customColors, marginLeft, marginTop, xMin, xMax, yMin, yMax, dataToSvgX, dataToSvgY]);
  
  // Create SVG for the heatmap
  return (
    <div className="relative flex gap-2" style={{ width: '100%', height: '100%' }}>
      <svg 
        width="100%" 
        height="100%" 
        viewBox={`0 0 ${width} ${height}`}
        style={{ 
          backgroundColor,
          border: `${borderWidth}px solid ${borderColor}`,
          borderRadius: `${borderRadius}px`
        }}
      >
        {/* Grid lines */}
        {showGrid && (
          <g>
            {/* Vertical grid lines */}
            {xTicks.map((tick, i) => {
              const x = dataToSvgX(tick);
              return (
                <line
                  key={`vgrid-${i}`}
                  x1={x}
                  y1={marginTop}
                  x2={x}
                  y2={height - marginBottom}
                  stroke={gridColor}
                  strokeWidth="1"
                  strokeDasharray="4,4"
                  opacity="0.5"
                />
              );
            })}
            {/* Horizontal grid lines */}
            {yTicks.map((tick, i) => {
              const y = dataToSvgY(tick);
              return (
                <line
                  key={`hgrid-${i}`}
                  x1={marginLeft}
                  y1={y}
                  x2={width - marginRight}
                  y2={y}
                  stroke={gridColor}
                  strokeWidth="1"
                  strokeDasharray="4,4"
                  opacity="0.5"
                />
              );
            })}
          </g>
        )}
        
        {/* Render gradient heatmap using canvas */}
        {pointShape === 'gradient' && (
          <foreignObject
            x={marginLeft}
            y={marginTop}
            width={plotWidth}
            height={plotHeight}
          >
            <canvas
              ref={canvasRef}
              style={{ width: '100%', height: '100%', display: 'block' }}
            />
          </foreignObject>
        )}
        
        {/* Render heatmap points */}
        {pointShape !== 'gradient' && data.map((point, index) => {
          const color = getColorForValue(point.value, minValue, maxValue, colorScheme, customColors);
          // Convert data coordinates to SVG coordinates
          const x = dataToSvgX(point.x);
          const y = dataToSvgY(point.y);
          
          // Render point based on shape
          let pointElement;
          switch (pointShape) {
            case 'square':
              pointElement = (
                <rect
                  key={index}
                  x={x - pointSize / 2}
                  y={y - pointSize / 2}
                  width={pointSize}
                  height={pointSize}
                  fill={color}
                  opacity="0.8"
                />
              );
              break;
            case 'triangle':
              pointElement = (
                <polygon
                  key={index}
                  points={`${x},${y - pointSize / 2} ${x - pointSize / 2},${y + pointSize / 2} ${x + pointSize / 2},${y + pointSize / 2}`}
                  fill={color}
                  opacity="0.8"
                />
              );
              break;
            case 'circle':
            default:
              pointElement = (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r={pointSize / 2}
                  fill={color}
                  opacity="0.8"
                />
              );
          }
          
          return pointElement;
        })}
        
        {/* Render labels if enabled */}
        {showLabels && pointShape !== 'gradient' && data.map((point, index) => {
          // Convert data coordinates to SVG coordinates
          const x = dataToSvgX(point.x);
          const y = dataToSvgY(point.y);
          
          return (
            <text
              key={`label-${index}`}
              x={x}
              y={y - pointSize / 2 - 2}
              textAnchor="middle"
              fontSize={labelFontSize}
              fill={axisColor}
            >
              {point.value}
            </text>
          );
        })}
        
        {/* Render axis if enabled */}
        {showAxis && (
          <>
            {/* X-axis - positioned dynamically based on data */}
            <line
              x1={marginLeft}
              y1={xAxisYPosition}
              x2={width - marginRight}
              y2={xAxisYPosition}
              stroke={axisColor}
              strokeWidth="2"
            />
            {/* Y-axis - positioned dynamically based on data */}
            <line
              x1={yAxisXPosition}
              y1={marginTop}
              x2={yAxisXPosition}
              y2={height - marginBottom}
              stroke={axisColor}
              strokeWidth="2"
            />
            
            {/* X-axis ticks and labels */}
            {xTicks.map((tick, i) => {
              const x = dataToSvgX(tick);
              return (
                <g key={`xtick-${i}`}>
                  <line
                    x1={x}
                    y1={xAxisYPosition}
                    x2={x}
                    y2={xAxisYPosition + 5}
                    stroke={axisColor}
                    strokeWidth="2"
                  />
                  <text
                    x={x}
                    y={xAxisYPosition + 20}
                    textAnchor="middle"
                    fontSize="12"
                    fill={axisColor}
                  >
                    {Math.round(tick)}
                  </text>
                </g>
              );
            })}
            
            {/* Y-axis ticks and labels */}
            {yTicks.map((tick, i) => {
              const y = dataToSvgY(tick);
              return (
                <g key={`ytick-${i}`}>
                  <line
                    x1={yAxisXPosition - 5}
                    y1={y}
                    x2={yAxisXPosition}
                    y2={y}
                    stroke={axisColor}
                    strokeWidth="2"
                  />
                  <text
                    x={yAxisXPosition - 10}
                    y={y + 4}
                    textAnchor="end"
                    fontSize="12"
                    fill={axisColor}
                  >
                    {Math.round(tick)}
                  </text>
                </g>
              );
            })}
            
            {/* X-axis label */}
            <text
              x={marginLeft + plotWidth / 2}
              y={height - 10}
              textAnchor="middle"
              fontSize="14"
              fill={axisColor}
              fontWeight="500"
            >
              {xAxisLabel}
            </text>
            
            {/* Y-axis label */}
            <text
              x={15}
              y={marginTop + plotHeight / 2}
              textAnchor="middle"
              fontSize="14"
              fill={axisColor}
              fontWeight="500"
              transform={`rotate(-90, 15, ${marginTop + plotHeight / 2})`}
            >
              {yAxisLabel}
            </text>
          </>
        )}
        
        {/* Color legend */}
        {showLegend && (
          <g>
            {/* Legend gradient */}
            <defs>
              <linearGradient id="legendGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                {[0, 0.25, 0.5, 0.75, 1].map((offset) => {
                  const value = minValue + offset * (maxValue - minValue);
                  const color = getColorForValue(value, minValue, maxValue, colorScheme, customColors);
                  return <stop key={offset} offset={`${offset * 100}%`} stopColor={color} />;
                })}
              </linearGradient>
            </defs>
            
            {/* Legend rectangle */}
            <rect
              x={width - marginRight + 20}
              y={marginTop + 40}
              width="30"
              height={plotHeight - 80}
              fill="url(#legendGradient)"
              stroke={axisColor}
              strokeWidth="1"
            />
            
            {/* Legend ticks and labels */}
            {[minValue, (minValue + maxValue) / 2, maxValue].map((value, i) => {
              const y = marginTop + 40 + (plotHeight - 80) * (1 - (value - minValue) / (maxValue - minValue));
              return (
                <g key={`legend-${i}`}>
                  <line
                    x1={width - marginRight + 50}
                    y1={y}
                    x2={width - marginRight + 55}
                    y2={y}
                    stroke={axisColor}
                    strokeWidth="1"
                  />
                  <text
                    x={width - marginRight + 58}
                    y={y + 4}
                    fontSize="10"
                    fill={axisColor}
                  >
                    {Math.round(value)}
                  </text>
                </g>
              );
            })}
            
            {/* Legend title */}
            <text
              x={width - marginRight + 35}
              y={marginTop + 25}
              textAnchor="middle"
              fontSize="12"
              fill={axisColor}
              fontWeight="500"
            >
              Value
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};