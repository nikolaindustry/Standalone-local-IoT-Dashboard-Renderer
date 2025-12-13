import React from 'react';
import { IoTDashboardWidget } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import RuntimeChartWidget from '../RuntimeChartWidget';
import { Activity } from 'lucide-react';

interface ChartWidgetRendererProps {
  widget: IoTDashboardWidget;
  deviceId: string | undefined;
  commonStyles: React.CSSProperties;
}

export const ChartWidgetRenderer: React.FC<ChartWidgetRendererProps> = ({
  widget,
  deviceId,
  commonStyles
}) => {
  const productId = widget.config.productId;
  // Support both old runtimeTableName and new tableId/tableName configurations
  const tableName = widget.config.runtimeTableName || widget.config.tableName;
  const chartType = widget.config.chartType || 'line';
  const maxDataPoints = widget.config.maxDataPoints || 50;
  
  console.log('Chart widget config:', {
    productId,
    tableName,
    runtimeTableName: widget.config.runtimeTableName,
    configTableName: widget.config.tableName,
    tableId: widget.config.tableId,
    fullConfig: widget.config
  });
  
  if (!productId || !tableName) {
    return (
      <Card className="h-full" style={commonStyles}>
        <CardHeader>
          <CardTitle className="text-sm">{widget.title}</CardTitle>
        </CardHeader>
        <CardContent className="h-[calc(100%-4rem)] flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Configure chart data source</p>
            {widget.config.tableId && !tableName && (
              <p className="text-xs mt-2">Table ID found but name missing</p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Chart customization styles
  const chartContainerStyle = {
    backgroundColor: widget.config.chartBackgroundColor || commonStyles.backgroundColor,
    color: widget.config.chartTextColor || commonStyles.color,
    borderColor: widget.config.chartBorderColor || commonStyles.borderColor,
    borderWidth: widget.config.chartBorderWidth ? `${widget.config.chartBorderWidth}px` : commonStyles.borderWidth,
    borderRadius: widget.config.chartBorderRadius ? `${widget.config.chartBorderRadius}px` : commonStyles.borderRadius,
    padding: widget.config.chartPadding || commonStyles.padding,
  };

  // Determine whether to show the container
  const showChartContainer = widget.config.showChartContainer !== false;

  if (!showChartContainer) {
    // Render chart without container
    return (
      <div className="h-full w-full" style={chartContainerStyle}>
        <RuntimeChartWidget
          productId={productId}
          deviceId={deviceId}
          tableName={tableName}
          chartType={chartType}
          metricColors={widget.config.metricColors}
          showGrid={widget.config.showGrid !== false}
          showAxis={widget.config.showAxis !== false}
          showLegend={widget.config.showLegend !== false}
          maxDataPoints={maxDataPoints}
          style={{ width: '100%', height: '100%' }}
          // Additional customization props
          chartGridColor={widget.config.chartGridColor}
          chartAxisColor={widget.config.chartAxisColor}
          chartLegendColor={widget.config.chartLegendColor}
          lineStrokeWidth={widget.config.lineStrokeWidth}
          barBorderRadius={widget.config.barBorderRadius}
          areaOpacity={widget.config.areaOpacity}
          tooltipBackgroundColor={widget.config.tooltipBackgroundColor}
          tooltipTextColor={widget.config.tooltipTextColor}
          tooltipBorderColor={widget.config.tooltipBorderColor}
          tooltipBorderRadius={widget.config.tooltipBorderRadius}
          tooltipFontSize={widget.config.tooltipFontSize}
          chartFontFamily={widget.config.chartFontFamily}
          chartFontSize={widget.config.chartFontSize}
          chartFontWeight={widget.config.chartFontWeight}
        />
      </div>
    );
  }

  return (
    <Card className="h-full" style={chartContainerStyle}>
      <CardHeader>
        <CardTitle className="text-sm">{widget.title}</CardTitle>
      </CardHeader>
      <CardContent className="h-[calc(100%-4rem)]">
        <RuntimeChartWidget
          productId={productId}
          deviceId={deviceId}
          tableName={tableName}
          chartType={chartType}
          metricColors={widget.config.metricColors}
          showGrid={widget.config.showGrid !== false}
          showAxis={widget.config.showAxis !== false}
          showLegend={widget.config.showLegend !== false}
          maxDataPoints={maxDataPoints}
          style={{ width: '100%', height: '100%' }}
          // Additional customization props
          chartGridColor={widget.config.chartGridColor}
          chartAxisColor={widget.config.chartAxisColor}
          chartLegendColor={widget.config.chartLegendColor}
          lineStrokeWidth={widget.config.lineStrokeWidth}
          barBorderRadius={widget.config.barBorderRadius}
          areaOpacity={widget.config.areaOpacity}
          tooltipBackgroundColor={widget.config.tooltipBackgroundColor}
          tooltipTextColor={widget.config.tooltipTextColor}
          tooltipBorderColor={widget.config.tooltipBorderColor}
          tooltipBorderRadius={widget.config.tooltipBorderRadius}
          tooltipFontSize={widget.config.tooltipFontSize}
          chartFontFamily={widget.config.chartFontFamily}
          chartFontSize={widget.config.chartFontSize}
          chartFontWeight={widget.config.chartFontWeight}
        />
      </CardContent>
    </Card>
  );
};