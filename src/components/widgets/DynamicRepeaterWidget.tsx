import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Database, List } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { IoTDashboardWidget } from '../../types/index';
import { IoTEnhancedWidgetRenderer } from '../IoTEnhancedWidgetRenderer';

interface DynamicRepeaterWidgetProps {
  title: string;
  productId?: string;
  deviceId?: string;
  tableName?: string;
  refreshInterval?: number;
  style?: React.CSSProperties;
  isDesignMode?: boolean;
  repeaterItemTemplate?: IoTDashboardWidget[];
  itemsPerPage?: number;
  showPagination?: boolean;
  autoGenerateTemplate?: boolean;
  // New prop to control outer container visibility
  showContainer?: boolean;
}

export const DynamicRepeaterWidget: React.FC<DynamicRepeaterWidgetProps> = ({
  title,
  productId,
  deviceId,
  tableName,
  refreshInterval = 5000,
  style,
  isDesignMode = false,
  repeaterItemTemplate = [],
  itemsPerPage = 10,
  showPagination = true,
  autoGenerateTemplate = false,
  showContainer = true
}) => {
  const { toast } = useToast();
  const [data, setData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchTableData = async () => {
    if (!productId || !tableName || isDesignMode) {
      setError('Repeater not configured');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('product_runtime_data')
        .select('*')
        .eq('product_id', productId)
        .eq('table_name', tableName);

      // Filter by device ID if provided
      if (deviceId) {
        query = query.eq('device_id', deviceId);
      }

      const { data: tableData, error: fetchError } = await query
        .order('created_at', { ascending: false })
        .limit(1000); // Limit to 1000 records to prevent performance issues

      if (fetchError) throw fetchError;

      if (tableData && tableData.length > 0) {
        // Extract columns from data_payload
        const samplePayload = tableData[0].data_payload;
        const cols = Object.keys(samplePayload || {});
        setColumns(cols);

        // Transform data for display - flatten the JSON structure
        const transformedData = tableData.map(row => {
          const payload = row.data_payload as Record<string, any> || {};
          return {
            id: row.id,
            created_at: new Date(row.created_at).toLocaleString(),
            ...payload
          };
        });

        setData(transformedData);
      } else {
        setData([]);
        setColumns([]);
      }
    } catch (err) {
      console.error('Error fetching repeater data:', err);
      setError('Failed to load repeater data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTableData();

    if (!isDesignMode && refreshInterval > 0) {
      const interval = setInterval(fetchTableData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [productId, deviceId, tableName, refreshInterval, isDesignMode]);

  // Calculate pagination
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = data.slice(startIndex, endIndex);

  // Handle page change
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Render a single item using the template
  const renderItem = (item: any, index: number) => {
    // If no template is defined and autoGenerateTemplate is true, create a simple template
    if ((!repeaterItemTemplate || repeaterItemTemplate.length === 0) && autoGenerateTemplate) {
      return (
        <Card key={item.id || index} className="mb-4">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(item).map(([key, value]) => (
                <div key={key} className="border-b pb-2">
                  <div className="text-xs text-muted-foreground">{key}</div>
                  <div className="text-sm font-medium">
                    {value !== null && value !== undefined ? String(value) : '-'}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      );
    }

    // Render using the defined template
    return (
      <div key={item.id || index} className="mb-4">
        {repeaterItemTemplate && repeaterItemTemplate.map((widgetTemplate) => {
          // Create a copy of the widget with data-specific values
          const widgetWithData = {
            ...widgetTemplate,
            config: {
              ...widgetTemplate.config,
              // Replace placeholders in the widget config with actual data values
              // This is a simplified approach - in a real implementation, you might want
              // a more sophisticated templating system
              ...(Object.fromEntries(
                Object.entries(widgetTemplate.config || {}).map(([key, value]) => {
                  if (typeof value === 'string') {
                    // Check if the string contains any {{fieldName}} placeholders
                    let processedValue = value;
                    const placeholderRegex = /\{\{([^}]+)\}\}/g;
                    let match;
                    while ((match = placeholderRegex.exec(value)) !== null) {
                      const fieldName = match[1];
                      const fieldValue = item[fieldName] !== undefined ? String(item[fieldName]) : '';
                      processedValue = processedValue.replace(match[0], fieldValue);
                    }
                    return [key, processedValue];
                  }
                  return [key, value];
                })
              ))
            }
          };

          return (
            <div 
              key={widgetTemplate.id} 
              className="mb-2"
              style={{
                width: widgetTemplate.size?.width ? `${widgetTemplate.size.width}px` : '100%',
                height: widgetTemplate.size?.height ? `${widgetTemplate.size.height}px` : 'auto'
              }}
            >
              <IoTEnhancedWidgetRenderer
                widget={widgetWithData}
                isDesignMode={isDesignMode}
                deviceId={deviceId}
              />
            </div>
          );
        })}
      </div>
    );
  };

  // If showContainer is false, render only the repeater without the card container
  if (!showContainer) {
    if (isDesignMode) {
      return (
        <div className="h-full w-full flex items-center justify-center text-muted-foreground">
          <List className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Dynamic Repeater Preview</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="h-full w-full flex items-center justify-center text-destructive">
          <Database className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">{error}</p>
        </div>
      );
    }

    return (
      <div className="h-full w-full overflow-auto">
        {loading && data.length === 0 ? (
          <div className="h-full w-full flex items-center justify-center text-muted-foreground">
            <RefreshCw className="w-8 h-8 mx-auto mb-2 opacity-50 animate-spin" />
            <p className="text-sm">Loading data...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="h-full w-full flex items-center justify-center text-muted-foreground">
            <Database className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No data available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {currentData && currentData.map((item, index) => renderItem(item, index))}
            
            {showPagination && totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Render with container (default behavior)
  if (isDesignMode) {
    return (
      <Card className="h-full" style={style}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            <span>{title}</span>
            <List className="w-4 h-4" />
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center text-muted-foreground py-8">
            <List className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Dynamic Repeater Preview</p>
            <p className="text-xs mt-1">Configure data source to see live data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full" style={style}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            <span>{title}</span>
            <List className="w-4 h-4" />
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center text-muted-foreground py-8">
            <Database className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col" style={style}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <span>{title}</span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchTableData}
              disabled={loading}
              className="h-6 w-6 p-0"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <List className="w-4 h-4" />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 flex-1 overflow-auto">
        {loading && data.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <RefreshCw className="w-8 h-8 mx-auto mb-2 opacity-50 animate-spin" />
            <p className="text-sm">Loading data...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <Database className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No data available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {currentData.map((item, index) => renderItem(item, index))}
            
            {showPagination && totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};