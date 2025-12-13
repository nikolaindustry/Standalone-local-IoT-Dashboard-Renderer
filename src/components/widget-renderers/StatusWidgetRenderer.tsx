import React from 'react';
import { IoTDashboardWidget } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatusWidgetRendererProps {
  widget: IoTDashboardWidget;
  localValue: any;
  lastUpdate?: Date;
  commonStyles: React.CSSProperties;
}

// Helper function to get status color
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'online':
    case 'active':
    case 'on':
      return 'bg-green-500';
    case 'offline':
    case 'inactive':
    case 'off':
      return 'bg-red-500';
    case 'warning':
    case 'pending':
      return 'bg-yellow-500';
    default:
      return 'bg-gray-500';
  }
};

export const StatusWidgetRenderer: React.FC<StatusWidgetRendererProps> = ({
  widget,
  localValue,
  lastUpdate,
  commonStyles
}) => {
  const statusValue = localValue || widget.config.defaultValue || 'unknown';
  const statusColor = getStatusColor(statusValue);
  
  return (
    <Card className="h-full" style={commonStyles}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <span>{widget.title}</span>
          {/* Removed getStatusIcon() from status widget */}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center justify-center">
            <div className={`w-4 h-4 rounded-full ${statusColor} mr-2`} />
            <span className="font-medium capitalize">{statusValue}</span>
          </div>
          
          {lastUpdate && (
            <div className="text-xs text-muted-foreground text-center">
              Updated: {lastUpdate.toLocaleTimeString()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};