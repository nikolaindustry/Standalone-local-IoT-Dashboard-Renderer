/**
 * SpectralGraphWidgetRenderer Component
 * 
 * A real-time graph visualization widget for WebSocket data with wavelength association.
 * 
 * Features:
 * - Real-time WebSocket data parsing and visualization
 * - Multiple chart types (line, bar, area, scatter)
 * - Wavelength (nm) association for each data point
 * - Customizable wavelength ranges and intervals
 * - Auto-scaling and manual scale controls
 * - Color-coding based on wavelength (visible spectrum)
 * - Data smoothing and filtering options
 * - Export capabilities
 * - Historical data tracking
 * 
 * WebSocket Message Format:
 * {
 *   "from": "device-id",
 *   "payload": {
 *     "widgetId": "widget-id",
 *     "value": [3.22, 24.19, 106.11, ...]
 *   }
 * }
 * 
 * @component
 */

import React, { useState, useEffect, useRef } from 'react';
import { IoTDashboardWidget } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, RefreshCw, Settings, Trash2 } from 'lucide-react';

interface SpectralGraphWidgetRendererProps {
  widget: IoTDashboardWidget;
  localValue?: any;
  commonStyles: React.CSSProperties;
  isDesignMode?: boolean;
  onWidgetEvent?: (widgetId: string, event: string, value: any) => void;
}

interface DataPoint {
  index: number;
  wavelength: number;
  value: number;
  timestamp: number;
  color?: string;
}

export const SpectralGraphWidgetRenderer: React.FC<SpectralGraphWidgetRendererProps> = ({
  widget,
  localValue,
  commonStyles,
  isDesignMode = false,
  onWidgetEvent
}) => {
  // Configuration
  const chartType = widget.config.spectralChartType || 'line';
  const showContainer = widget.config.spectralShowContainer !== false;
  const customTitle = widget.config.spectralCustomTitle || 'Spectral Graph';
  const startWavelength = widget.config.spectralStartWavelength || 380;
  const endWavelength = widget.config.spectralEndWavelength || 780;
  const wavelengthUnit = widget.config.spectralWavelengthUnit || 'nm';
  const autoScale = widget.config.spectralAutoScale !== false;
  const manualMin = widget.config.spectralManualMin || 0;
  const manualMax = widget.config.spectralManualMax || 100;
  const showGrid = widget.config.spectralShowGrid !== false;
  const showLegend = widget.config.spectralShowLegend !== false;
  const showTooltip = widget.config.spectralShowTooltip !== false;
  const dataPointColor = widget.config.spectralDataPointColor || '#3b82f6';
  const useSpectrumColors = widget.config.spectralUseSpectrumColors !== false;
  const maxDataPoints = widget.config.spectralMaxDataPoints || 100;
  const smoothing = widget.config.spectralSmoothing || 'none';
  const showCurrentValue = widget.config.spectralShowCurrentValue !== false;
  const animationDuration = widget.config.spectralAnimationDuration || 300;
  
  // State
  const [data, setData] = useState<DataPoint[]>([]);
  const [currentReading, setCurrentReading] = useState<number[] | null>(null);
  const dataHistoryRef = useRef<DataPoint[][]>([]);

  // Wavelength to RGB color conversion (visible spectrum approximation)
  const wavelengthToColor = (wavelength: number): string => {
    if (!useSpectrumColors) return dataPointColor;
    
    let r = 0, g = 0, b = 0;
    
    if (wavelength >= 380 && wavelength < 440) {
      r = -(wavelength - 440) / (440 - 380);
      g = 0;
      b = 1;
    } else if (wavelength >= 440 && wavelength < 490) {
      r = 0;
      g = (wavelength - 440) / (490 - 440);
      b = 1;
    } else if (wavelength >= 490 && wavelength < 510) {
      r = 0;
      g = 1;
      b = -(wavelength - 510) / (510 - 490);
    } else if (wavelength >= 510 && wavelength < 580) {
      r = (wavelength - 510) / (580 - 510);
      g = 1;
      b = 0;
    } else if (wavelength >= 580 && wavelength < 645) {
      r = 1;
      g = -(wavelength - 645) / (645 - 580);
      b = 0;
    } else if (wavelength >= 645 && wavelength <= 780) {
      r = 1;
      g = 0;
      b = 0;
    }
    
    // Intensity falloff at edges
    let factor = 1.0;
    if (wavelength >= 380 && wavelength < 420) {
      factor = 0.3 + 0.7 * (wavelength - 380) / (420 - 380);
    } else if (wavelength >= 700 && wavelength <= 780) {
      factor = 0.3 + 0.7 * (780 - wavelength) / (780 - 700);
    }
    
    r = Math.round(r * factor * 255);
    g = Math.round(g * factor * 255);
    b = Math.round(b * factor * 255);
    
    return `rgb(${r}, ${g}, ${b})`;
  };

  // Process WebSocket data
  useEffect(() => {
    console.log('[SpectralGraphWidget] useEffect triggered:', {
      widgetId: widget.id,
      localValue,
      isDesignMode,
      hasLocalValue: !!localValue
    });

    if (!localValue || isDesignMode) {
      console.log('[SpectralGraphWidget] Skipping - no localValue or design mode');
      return;
    }

    try {
      let values: number[] = [];
      
      console.log('[SpectralGraphWidget] Processing localValue:', localValue);
      
      // Handle different data formats
      if (Array.isArray(localValue)) {
        values = localValue;
        console.log('[SpectralGraphWidget] Format: Direct array, length:', values.length);
      } else if (typeof localValue === 'object' && localValue.value && Array.isArray(localValue.value)) {
        values = localValue.value;
        console.log('[SpectralGraphWidget] Format: Object with value array, length:', values.length);
      } else if (typeof localValue === 'object' && localValue.payload) {
        if (Array.isArray(localValue.payload.value)) {
          values = localValue.payload.value;
          console.log('[SpectralGraphWidget] Format: Object with payload.value array, length:', values.length);
        } else if (Array.isArray(localValue.payload)) {
          values = localValue.payload;
          console.log('[SpectralGraphWidget] Format: Object with payload array, length:', values.length);
        }
      }

      console.log('[SpectralGraphWidget] Parsed values:', values.length, 'items');
      if (values.length === 0) {
        console.warn('[SpectralGraphWidget] No values extracted from localValue');
        return;
      }

      setCurrentReading(values);

      // Calculate wavelength step
      const wavelengthStep = (endWavelength - startWavelength) / (values.length - 1);
      
      // Create data points
      const timestamp = Date.now();
      const newDataPoints: DataPoint[] = values.map((value, index) => {
        const wavelength = startWavelength + (index * wavelengthStep);
        return {
          index,
          wavelength: parseFloat(wavelength.toFixed(2)),
          value: typeof value === 'number' ? value : parseFloat(value),
          timestamp,
          color: wavelengthToColor(wavelength)
        };
      });

      // Apply smoothing if enabled
      let processedData = newDataPoints;
      if (smoothing === 'average' && newDataPoints.length > 2) {
        processedData = newDataPoints.map((point, i) => {
          if (i === 0 || i === newDataPoints.length - 1) return point;
          const avgValue = (newDataPoints[i - 1].value + point.value + newDataPoints[i + 1].value) / 3;
          return { ...point, value: avgValue };
        });
      }

      setData(processedData);
      
      // Store in history
      dataHistoryRef.current.push(processedData);
      if (dataHistoryRef.current.length > maxDataPoints) {
        dataHistoryRef.current.shift();
      }

      // Trigger event
      onWidgetEvent?.(widget.id, 'dataload', { values, dataPoints: processedData });
    } catch (error) {
      console.error('Error processing spectral data:', error);
      onWidgetEvent?.(widget.id, 'error', error);
    }
  }, [localValue, startWavelength, endWavelength, smoothing, useSpectrumColors, dataPointColor, isDesignMode, onWidgetEvent, widget.id, autoScale, manualMin, manualMax, maxDataPoints]);

  // Export data
  const handleExport = () => {
    if (data.length === 0) return;

    const csvContent = [
      ['Index', 'Wavelength (nm)', 'Value', 'Timestamp'],
      ...data.map(d => [d.index, d.wavelength, d.value, new Date(d.timestamp).toISOString()])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spectral-data-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Clear data
  const handleClear = () => {
    setData([]);
    setCurrentReading(null);
    dataHistoryRef.current = [];
    onWidgetEvent?.(widget.id, 'clear', null);
  };



  // Render chart
  const renderChart = () => {
    if (data.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Waiting for data...</p>
            <p className="text-xs mt-1">Data will appear when WebSocket messages arrive</p>
          </div>
        </div>
      );
    }

    const yMin = autoScale ? Math.min(...data.map(d => d.value)) * 0.9 : manualMin;
    const yMax = autoScale ? Math.max(...data.map(d => d.value)) * 1.1 : manualMax;

    const chartData = data.map(d => ({
      wavelength: d.wavelength,
      value: d.value,
      fill: d.color,
      stroke: d.color
    }));

    const commonProps = {
      data: chartData,
      margin: { top: 10, right: 30, left: 0, bottom: 0 }
    };

    const chartComponents = {
      line: (
        <LineChart {...commonProps}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" opacity={0.3} />}
          <XAxis 
            dataKey="wavelength" 
            label={{ value: `Wavelength (${wavelengthUnit})`, position: 'insideBottom', offset: -5 }}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            domain={[yMin, yMax]}
            label={{ value: 'Intensity', angle: -90, position: 'insideLeft' }}
            tick={{ fontSize: 12 }}
          />
          {showTooltip && (
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const value = payload[0].value;
                  const displayValue = typeof value === 'number' ? value.toFixed(2) : String(value);
                  const wavelength = payload[0].payload.wavelength;
                  const color = payload[0].payload.stroke;
                  return (
                    <div className="bg-background border rounded p-2 shadow-lg text-xs">
                      <p className="font-semibold">λ: {wavelength} nm</p>
                      <p>Value: {displayValue}</p>
                      {useSpectrumColors && (
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-4 h-4 rounded" style={{ backgroundColor: color }} />
                          <span className="text-xs opacity-70">Spectrum color</span>
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
          )}
          {showLegend && <Legend />}
          <Line
            type="monotone"
            dataKey="value"
            stroke={useSpectrumColors ? 'url(#spectrumGradient)' : dataPointColor}
            strokeWidth={2}
            dot={useSpectrumColors ? (props: any) => {
              const { cx, cy, payload } = props;
              return (
                <circle
                  cx={cx}
                  cy={cy}
                  r={3}
                  fill={payload.stroke}
                  stroke="white"
                  strokeWidth={1}
                />
              );
            } : false}
            animationDuration={animationDuration}
          />
          {/* Define spectrum gradient */}
          {useSpectrumColors && (
            <defs>
              <linearGradient id="spectrumGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                {data.map((point, i) => (
                  <stop
                    key={i}
                    offset={`${(i / (data.length - 1)) * 100}%`}
                    stopColor={point.color}
                  />
                ))}
              </linearGradient>
            </defs>
          )}
        </LineChart>
      ),
      bar: (
        <BarChart {...commonProps}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" opacity={0.3} />}
          <XAxis 
            dataKey="wavelength"
            label={{ value: `Wavelength (${wavelengthUnit})`, position: 'insideBottom', offset: -5 }}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            domain={[yMin, yMax]}
            label={{ value: 'Intensity', angle: -90, position: 'insideLeft' }}
            tick={{ fontSize: 12 }}
          />
          {showTooltip && (
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const value = payload[0].value;
                  const displayValue = typeof value === 'number' ? value.toFixed(2) : String(value);
                  const wavelength = payload[0].payload.wavelength;
                  const color = payload[0].payload.fill;
                  return (
                    <div className="bg-background border rounded p-2 shadow-lg text-xs">
                      <p className="font-semibold">λ: {wavelength} nm</p>
                      <p>Value: {displayValue}</p>
                      {useSpectrumColors && (
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-4 h-4 rounded" style={{ backgroundColor: color }} />
                          <span className="text-xs opacity-70">Spectrum color</span>
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
          )}
          {showLegend && <Legend />}
          <Bar 
            dataKey="value" 
            fill={dataPointColor}
            animationDuration={animationDuration}
            shape={useSpectrumColors ? (props: any) => {
              const { x, y, width, height, payload } = props;
              return (
                <rect
                  x={x}
                  y={y}
                  width={width}
                  height={height}
                  fill={payload.fill}
                  stroke={payload.stroke}
                />
              );
            } : undefined}
          />
        </BarChart>
      ),
      area: (
        <AreaChart {...commonProps}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" opacity={0.3} />}
          <XAxis 
            dataKey="wavelength"
            label={{ value: `Wavelength (${wavelengthUnit})`, position: 'insideBottom', offset: -5 }}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            domain={[yMin, yMax]}
            label={{ value: 'Intensity', angle: -90, position: 'insideLeft' }}
            tick={{ fontSize: 12 }}
          />
          {showTooltip && (
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const value = payload[0].value;
                  const displayValue = typeof value === 'number' ? value.toFixed(2) : String(value);
                  const wavelength = payload[0].payload.wavelength;
                  const color = payload[0].payload.fill;
                  return (
                    <div className="bg-background border rounded p-2 shadow-lg text-xs">
                      <p className="font-semibold">λ: {wavelength} nm</p>
                      <p>Value: {displayValue}</p>
                      {useSpectrumColors && (
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-4 h-4 rounded" style={{ backgroundColor: color }} />
                          <span className="text-xs opacity-70">Spectrum color</span>
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
          )}
          {showLegend && <Legend />}
          <Area
            type="monotone"
            dataKey="value"
            stroke={dataPointColor}
            fill={dataPointColor}
            fillOpacity={0.3}
            animationDuration={animationDuration}
          />
        </AreaChart>
      ),
      scatter: (
        <ScatterChart {...commonProps}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" opacity={0.3} />}
          <XAxis 
            dataKey="wavelength"
            label={{ value: `Wavelength (${wavelengthUnit})`, position: 'insideBottom', offset: -5 }}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            domain={[yMin, yMax]}
            label={{ value: 'Intensity', angle: -90, position: 'insideLeft' }}
            tick={{ fontSize: 12 }}
          />
          {showTooltip && (
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const value = payload[0].value;
                  const displayValue = typeof value === 'number' ? value.toFixed(2) : String(value);
                  const wavelength = payload[0].payload.wavelength;
                  const color = payload[0].payload.fill;
                  return (
                    <div className="bg-background border rounded p-2 shadow-lg text-xs">
                      <p className="font-semibold">λ: {wavelength} nm</p>
                      <p>Value: {displayValue}</p>
                      {useSpectrumColors && (
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-4 h-4 rounded" style={{ backgroundColor: color }} />
                          <span className="text-xs opacity-70">Spectrum color</span>
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
          )}
          {showLegend && <Legend />}
          <Scatter
            dataKey="value"
            fill={dataPointColor}
            animationDuration={animationDuration}
            shape={useSpectrumColors ? (props: any) => {
              const { cx, cy, payload } = props;
              return (
                <circle
                  cx={cx}
                  cy={cy}
                  r={4}
                  fill={payload.fill}
                  stroke={payload.stroke}
                  strokeWidth={1}
                />
              );
            } : undefined}
          />
        </ScatterChart>
      )
    };

    return (
      <div className="relative">
        <ResponsiveContainer width="100%" height={300}>
          {chartComponents[chartType as keyof typeof chartComponents] || chartComponents.line}
        </ResponsiveContainer>
        
        {/* Spectrum color bar */}
        {useSpectrumColors && data.length > 0 && (
          <div className="mt-2 px-8">
            <div className="h-4 rounded flex overflow-hidden border border-border">
              {data.map((point, i) => (
                <div
                  key={i}
                  style={{
                    backgroundColor: point.color,
                    flex: 1,
                  }}
                  title={`${point.wavelength} nm`}
                />
              ))}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{startWavelength} nm</span>
              <span className="text-center">Visible Spectrum</span>
              <span>{endWavelength} nm</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render controls
  const renderControls = () => {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        {showCurrentValue && currentReading && (
          <Badge variant="secondary" className="text-xs">
            {currentReading.length} data points
          </Badge>
        )}
        {!isDesignMode && (
          <>

            <Button
              size="sm"
              variant="outline"
              onClick={handleExport}
              disabled={data.length === 0}
              className="h-7 text-xs"
            >
              <Download className="w-3 h-3 mr-1" />
              Export
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleClear}
              disabled={data.length === 0}
              className="h-7 text-xs"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Clear
            </Button>
          </>
        )}
      </div>
    );
  };

  if (!showContainer) {
    return (
      <div className="h-full w-full flex flex-col" style={commonStyles}>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold">{customTitle}</h3>
          {renderControls()}
        </div>
        {renderChart()}
      </div>
    );
  }

  return (
    <Card className="h-full flex flex-col" style={commonStyles}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">{customTitle}</CardTitle>
          {renderControls()}
        </div>
      </CardHeader>
      <CardContent className="flex-1 pt-2 p-4 overflow-auto">
        {renderChart()}
        {isDesignMode && (
          <div className="text-xs text-muted-foreground text-center mt-2">
            Spectral Graph Widget - Configure wavelength range and chart type in properties
          </div>
        )}
      </CardContent>
    </Card>
  );
};
