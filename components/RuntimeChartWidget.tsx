import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Database } from 'lucide-react';

interface RuntimeChartWidgetProps {
  productId: string;
  deviceId?: string;
  tableName: string;
  chartType?: 'line' | 'bar' | 'area';
  metricColors?: Record<string, string>;
  showGrid?: boolean;
  showAxis?: boolean;
  showLegend?: boolean;
  maxDataPoints?: number;
  style?: React.CSSProperties;
  // Additional customization props
  chartGridColor?: string;
  chartAxisColor?: string;
  chartLegendColor?: string;
  lineStrokeWidth?: number;
  barBorderRadius?: number;
  areaOpacity?: number;
  tooltipBackgroundColor?: string;
  tooltipTextColor?: string;
  tooltipBorderColor?: string;
  tooltipBorderRadius?: number;
  tooltipFontSize?: string;
  chartFontFamily?: string;
  chartFontSize?: string;
  chartFontWeight?: string;
}

export const RuntimeChartWidget: React.FC<RuntimeChartWidgetProps> = ({
  productId,
  deviceId,
  tableName,
  chartType = 'line',
  metricColors = {},
  showGrid = true,
  showAxis = true,
  showLegend = true,
  maxDataPoints = 50,
  style,
  // Additional customization props
  chartGridColor = '#e2e8f0',
  chartAxisColor = '#000000',
  chartLegendColor = '#000000',
  lineStrokeWidth = 2,
  barBorderRadius = 0,
  areaOpacity = 0.5,
  tooltipBackgroundColor = '#ffffff',
  tooltipTextColor = '#000000',
  tooltipBorderColor = '#e2e8f0',
  tooltipBorderRadius = 6,
  tooltipFontSize = '12px',
  chartFontFamily = 'inherit',
  chartFontSize = '12px',
  chartFontWeight = 'normal'
}) => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metricKeys, setMetricKeys] = useState<string[]>([]);

  useEffect(() => {
    if (productId && tableName) {
      fetchRuntimeData();
      
      // Set up real-time subscription
      const channel = supabase
        .channel('runtime-data-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'product_runtime_data',
            filter: `product_id=eq.${productId}`
          },
          (payload) => {
            if (payload.new.table_name === tableName) {
              if (!deviceId || payload.new.device_id === deviceId) {
                fetchRuntimeData();
              }
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [productId, deviceId, tableName]);

  const fetchRuntimeData = async () => {
    console.log('RuntimeChartWidget: Starting data fetch', { productId, tableName, deviceId });
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('product_runtime_data')
        .select('*')
        .eq('product_id', productId)
        .eq('table_name', tableName)
        .order('created_at', { ascending: false })
        .limit(maxDataPoints);

      if (deviceId) {
        query = query.eq('device_id', deviceId);
      }

      const { data, error: fetchError } = await query;

      console.log('RuntimeChartWidget: Query result', { 
        dataLength: data?.length || 0, 
        error: fetchError,
        sampleData: data?.[0]
      });

      if (fetchError) throw fetchError;

      if (data && data.length > 0) {
        // Process data for chart
        const processedData = data
          .slice()
          .reverse()
          .map((item, index) => {
            // Convert non-numeric values to numeric where possible
            const processedPayload: Record<string, any> = {};
            const conversionInfo: Record<string, string> = {}; // Track what was converted
            
            if (typeof item.data_payload === 'object' && item.data_payload !== null) {
              Object.keys(item.data_payload).forEach(key => {
                const value = item.data_payload[key];
                // Try to convert to number if it's a string that represents a number
                if (typeof value === 'string' && !isNaN(Number(value)) && value.trim() !== '') {
                  processedPayload[key] = Number(value);
                  conversionInfo[key] = `string "${value}" converted to number`;
                } else if (typeof value === 'boolean') {
                  // Convert boolean to 0/1
                  processedPayload[key] = value ? 1 : 0;
                  conversionInfo[key] = `boolean "${value}" converted to number`;
                } else if (typeof value === 'number') {
                  // Keep numeric values as is
                  processedPayload[key] = value;
                } else if (typeof value === 'string') {
                  // Track non-convertible strings
                  conversionInfo[key] = `string "${value}" - not numeric`;
                } else {
                  // Track other types
                  conversionInfo[key] = `${typeof value} "${value}" - not convertible`;
                }
              });
            }
            
            return {
              timestamp: new Date(item.created_at).toLocaleTimeString(),
              fullTimestamp: item.created_at,
              ...processedPayload
            };
          });

        console.log('RuntimeChartWidget: Processed data', { 
          processedDataLength: processedData.length,
          sampleProcessed: processedData[0]
        });

        setChartData(processedData);

        // Extract metric keys from first data point (now only numeric values)
        const firstItem = processedData[0];
        console.log('RuntimeChartWidget: First item payload', { 
          payload: firstItem,
          payloadType: typeof firstItem
        });
        
        // Get conversion info from the original data for debugging
        const originalFirstItem = data[0];
        const conversionInfo = {};
        if (typeof originalFirstItem.data_payload === 'object' && originalFirstItem.data_payload !== null) {
          Object.keys(originalFirstItem.data_payload).forEach(key => {
            const value = originalFirstItem.data_payload[key];
            if (typeof value === 'string' && !isNaN(Number(value)) && value.trim() !== '') {
              conversionInfo[key] = `string "${value}" converted to number`;
            } else if (typeof value === 'boolean') {
              conversionInfo[key] = `boolean "${value}" converted to number`;
            } else if (typeof value === 'number') {
              conversionInfo[key] = `number ${value}`;
            } else if (typeof value === 'string') {
              conversionInfo[key] = `string "${value}" - not numeric`;
            } else {
              conversionInfo[key] = `${typeof value} "${value}" - not convertible`;
            }
          });
        }
        
        if (firstItem) {
          const allKeys = Object.keys(firstItem).filter(key => key !== 'timestamp' && key !== 'fullTimestamp');
          const keys = allKeys.filter(key => 
            typeof firstItem[key] === 'number'
          );
          
          console.log('RuntimeChartWidget: Extracted metric keys', { 
            allKeys,
            numericKeys: keys,
            keyTypes: allKeys.map(k => ({ key: k, type: typeof firstItem[k], value: firstItem[k] })),
            conversionInfo: conversionInfo
          });
          
          setMetricKeys(keys);
        } else {
          console.log('RuntimeChartWidget: No processed data found');
        }
      } else {
        console.log('RuntimeChartWidget: No data returned from query');
        setChartData([]);
        setMetricKeys([]);
      }
    } catch (err) {
      console.error('RuntimeChartWidget: Error fetching runtime data:', err);
      setError('Failed to load chart data');
      setChartData([]);
    } finally {
      setLoading(false);
    }
  };

  // Predefined colors for metrics
  const defaultColors = {
    temperature: '#ef4444',
    humidity: '#3b82f6',
    pressure: '#8b5cf6',
    voltage: '#10b981',
    current: '#f59e0b',
    power: '#ec4899',
    speed: '#06b6d4',
    value: '#6366f1'
  };

  const fallbackColors = [
    '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6',
    '#ec4899', '#06b6d4', '#6366f1', '#14b8a6', '#f97316'
  ];

  const getMetricColor = (metric: string, index: number) => {
    if (metricColors[metric]) return metricColors[metric];
    if (defaultColors[metric as keyof typeof defaultColors]) return defaultColors[metric as keyof typeof defaultColors];
    return fallbackColors[index % fallbackColors.length];
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // Find the full data point for additional info
      const dataPoint = chartData.find(d => d.timestamp === label);
      
      return (
        <div 
          className="border rounded-lg shadow-lg p-3"
          style={{
            backgroundColor: tooltipBackgroundColor,
            borderColor: tooltipBorderColor,
            borderRadius: `${tooltipBorderRadius}px`,
            color: tooltipTextColor,
            fontFamily: chartFontFamily,
            fontSize: tooltipFontSize
          }}
        >
          <p className="font-medium mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.dataKey}: {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    // Chart text styles
    const chartTextStyle = {
      fontFamily: chartFontFamily,
      fontSize: chartFontSize,
      fontWeight: chartFontWeight,
      color: chartAxisColor
    };

    if (chartType === 'bar') {
      return (
        <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: showLegend ? 25 : 5 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" opacity={0.3} stroke={chartGridColor} />}
          {showAxis && <XAxis dataKey="timestamp" tick={{ ...chartTextStyle, fontSize: chartFontSize }} stroke={chartAxisColor} />}
          {showAxis && <YAxis tick={{ ...chartTextStyle, fontSize: chartFontSize }} stroke={chartAxisColor} />}
          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend wrapperStyle={{ ...chartTextStyle, color: chartLegendColor }} />}
          {metricKeys.map((metric, index) => (
            <Bar
              key={metric}
              dataKey={metric}
              fill={getMetricColor(metric, index)}
              name={metric.charAt(0).toUpperCase() + metric.slice(1)}
              radius={[barBorderRadius, barBorderRadius, 0, 0]}
            />
          ))}
        </BarChart>
      );
    } else if (chartType === 'area') {
      return (
        <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: showLegend ? 25 : 5 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" opacity={0.3} stroke={chartGridColor} />}
          {showAxis && <XAxis dataKey="timestamp" tick={{ ...chartTextStyle, fontSize: chartFontSize }} stroke={chartAxisColor} />}
          {showAxis && <YAxis tick={{ ...chartTextStyle, fontSize: chartFontSize }} stroke={chartAxisColor} />}
          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend wrapperStyle={{ ...chartTextStyle, color: chartLegendColor }} />}
          {metricKeys.map((metric, index) => (
            <Area
              key={metric}
              type="monotone"
              dataKey={metric}
              stroke={getMetricColor(metric, index)}
              fill={getMetricColor(metric, index)}
              strokeWidth={lineStrokeWidth}
              isAnimationActive={false}
              name={metric.charAt(0).toUpperCase() + metric.slice(1)}
              fillOpacity={areaOpacity}
            />
          ))}
        </AreaChart>
      );
    } else {
      return (
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: showLegend ? 25 : 5 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" opacity={0.3} stroke={chartGridColor} />}
          {showAxis && <XAxis dataKey="timestamp" tick={{ ...chartTextStyle, fontSize: chartFontSize }} stroke={chartAxisColor} />}
          {showAxis && <YAxis tick={{ ...chartTextStyle, fontSize: chartFontSize }} stroke={chartAxisColor} />}
          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend wrapperStyle={{ ...chartTextStyle, color: chartLegendColor }} />}
          {metricKeys.map((metric, index) => (
            <Line
              key={metric}
              type="monotone"
              dataKey={metric}
              stroke={getMetricColor(metric, index)}
              strokeWidth={lineStrokeWidth}
              dot={false}
              activeDot={{ r: 4 }}
              isAnimationActive={false}
              name={metric.charAt(0).toUpperCase() + metric.slice(1)}
            />
          ))}
        </LineChart>
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full" style={style}>
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-destructive" style={style}>
        {error}
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-muted-foreground" style={style}>
        No data available
      </div>
    );
  }

  // Check if we have numeric data to display
  if (metricKeys.length === 0) {
    // Check if we have non-numeric data that could be converted
    const firstItem = chartData[0];
    const allKeys = Object.keys(firstItem).filter(key => key !== 'timestamp' && key !== 'fullTimestamp');
    const nonNumericKeys = allKeys.filter(key => typeof firstItem[key] !== 'number');
    
    return (
      <div className="flex flex-col items-center justify-center h-full text-sm text-muted-foreground p-4 text-center" style={style}>
        <Database className="w-8 h-8 mb-2 opacity-50" />
        <p className="font-medium">No numeric data available for chart</p>
        {nonNumericKeys.length > 0 && (
          <p className="text-xs mt-1 max-w-xs">
            Found {nonNumericKeys.length} non-numeric field(s): {nonNumericKeys.join(', ')}. 
            Charts can only display numeric data.
          </p>
        )}
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      {renderChart()}
    </ResponsiveContainer>
  );
};

export default RuntimeChartWidget;
