import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table as LucideTable, RefreshCw, Database, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';

interface TableWidgetProps {
  title: string;
  productId?: string;
  deviceId?: string;
  tableName?: string;
  refreshInterval?: number;
  style?: React.CSSProperties;
  isDesignMode?: boolean;
  // Table customization props
  showHeader?: boolean;
  headerBackgroundColor?: string;
  headerTextColor?: string;
  rowBackgroundColor?: string;
  rowTextColor?: string;
  alternateRowBackgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  cellPadding?: string;
  showStripedRows?: boolean;
  showHoverEffect?: boolean;
  fontSize?: string;
  fontWeight?: string;
  // New prop to control outer container visibility
  showContainer?: boolean;
  // New prop for inline editing
  enableInlineEditing?: boolean;
}

export const TableWidget: React.FC<TableWidgetProps> = ({
  title,
  productId,
  deviceId,
  tableName,
  refreshInterval = 5000,
  style,
  isDesignMode = false,
  // Table customization props with defaults
  showHeader = true,
  headerBackgroundColor = '#f1f5f9',
  headerTextColor = '#000000',
  rowBackgroundColor = '#ffffff',
  rowTextColor = '#000000',
  alternateRowBackgroundColor = '#f8fafc',
  borderColor = '#e2e8f0',
  borderWidth = 1,
  borderRadius = 6,
  cellPadding = '8px',
  showStripedRows = true,
  showHoverEffect = true,
  fontSize = '14px',
  fontWeight = 'normal',
  // New prop to control outer container visibility
  showContainer = true,
  // New prop for inline editing
  enableInlineEditing = false
}) => {
  const { toast } = useToast();
  const [data, setData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // State for inline editing
  const [editingCell, setEditingCell] = useState<{ rowId: string; column: string } | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const fetchTableData = async () => {
    if (!productId || !tableName || isDesignMode) {
      setError('Table not configured');
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
        .limit(100);

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
      console.error('Error fetching table data:', err);
      setError('Failed to load table data');
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

  // Table styling
  const tableStyle = {
    border: `${borderWidth}px solid ${borderColor}`,
    borderRadius: `${borderRadius}px`,
    overflow: 'hidden'
  };

  const headerStyle = {
    backgroundColor: headerBackgroundColor,
    color: headerTextColor,
    fontSize: fontSize,
    fontWeight: fontWeight,
  };

  const cellStyle = {
    color: rowTextColor,
    fontSize: fontSize,
    fontWeight: fontWeight,
    padding: cellPadding,
  };

  const rowStyle = {
    backgroundColor: rowBackgroundColor,
  };

  // Handle cell click for editing
  const handleCellClick = (rowId: string, column: string, currentValue: any) => {
    if (!enableInlineEditing || isDesignMode) return;
    
    setEditingCell({ rowId, column });
    setEditValue(String(currentValue || ''));
  };

  // Save edited value
  const saveEdit = async () => {
    if (!editingCell || !productId || !tableName) return;

    setSaving(true);
    try {
      // Find the row data
      const rowData = data.find(row => row.id === editingCell.rowId);
      if (!rowData) throw new Error('Row not found');

      // Get the original data_payload
      const { data: originalData, error: fetchError } = await supabase
        .from('product_runtime_data')
        .select('data_payload')
        .eq('id', editingCell.rowId)
        .single();

      if (fetchError) throw fetchError;

      // Ensure we have a valid data_payload object
      const currentPayload = originalData && typeof originalData.data_payload === 'object' 
        ? originalData.data_payload as Record<string, any>
        : {};

      // Update the specific field in data_payload
      const updatedPayload = {
        ...currentPayload,
        [editingCell.column]: editValue
      };

      // Update the database
      const { error: updateError } = await supabase
        .from('product_runtime_data')
        .update({ data_payload: updatedPayload })
        .eq('id', editingCell.rowId);

      if (updateError) throw updateError;

      // Update local state
      setData(prevData => 
        prevData.map(row => 
          row.id === editingCell.rowId 
            ? { ...row, [editingCell.column]: editValue } 
            : row
        )
      );

      // Reset editing state
      setEditingCell(null);
      setEditValue('');

      toast({
        title: "Success",
        description: "Cell value updated successfully",
      });
    } catch (err) {
      console.error('Error updating cell value:', err);
      toast({
        title: "Error",
        description: "Failed to update cell value",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingCell(null);
    setEditValue('');
  };

  // Handle key press in edit input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  // If showContainer is false, render only the table without the card container
  if (!showContainer) {
    if (isDesignMode) {
      return (
        <div className="h-full w-full flex items-center justify-center text-muted-foreground">
          <Database className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Table Preview</p>
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
          <div style={tableStyle} className="h-full w-full">
            <Table className="h-full w-full">
              {showHeader && (
                <TableHeader>
                  <TableRow style={headerStyle}>
                    <TableHead style={{ ...headerStyle, padding: cellPadding }}>Time</TableHead>
                    {columns.map((col) => (
                      <TableHead key={col} style={{ ...headerStyle, padding: cellPadding }}>
                        {col}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
              )}
              <TableBody>
                {data.map((row, index) => (
                  <TableRow 
                    key={row.id || index}
                    style={{
                      ...rowStyle,
                      backgroundColor: showStripedRows && index % 2 === 1 
                        ? alternateRowBackgroundColor 
                        : rowBackgroundColor,
                    }}
                    className={showHoverEffect ? "hover:bg-muted/50" : ""}
                  >
                    <TableCell style={cellStyle} className="font-mono text-xs">
                      {row.created_at}
                    </TableCell>
                    {columns.map((col) => (
                      <TableCell 
                        key={col} 
                        style={cellStyle}
                        onClick={() => handleCellClick(row.id, col, row[col])}
                        className={enableInlineEditing && !isDesignMode ? "cursor-pointer hover:bg-muted/50" : ""}
                      >
                        {editingCell?.rowId === row.id && editingCell?.column === col ? (
                          <div className="flex items-center gap-1">
                            <Input
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={handleKeyPress}
                              autoFocus
                              className="h-6 text-xs"
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={saveEdit}
                              disabled={saving}
                              className="h-6 w-6 p-0"
                            >
                              {saving ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={cancelEdit}
                              className="h-6 w-6 p-0"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            {row[col] !== null && row[col] !== undefined
                              ? String(row[col])
                              : '-'}
                            {enableInlineEditing && !isDesignMode && (
                              <span className="ml-1 text-muted-foreground opacity-0 group-hover:opacity-100">#</span>
                            )}
                          </>
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
            <LucideTable className="w-4 h-4" />
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center text-muted-foreground py-8">
            <Database className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Table Preview</p>
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
            <LucideTable className="w-4 h-4" />
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
            <LucideTable className="w-4 h-4" />
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
          <div style={tableStyle}>
            <Table>
              {showHeader && (
                <TableHeader>
                  <TableRow style={headerStyle}>
                    <TableHead style={{ ...headerStyle, padding: cellPadding }}>Time</TableHead>
                    {columns.map((col) => (
                      <TableHead key={col} style={{ ...headerStyle, padding: cellPadding }}>
                        {col}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
              )}
              <TableBody>
                {data.map((row, index) => (
                  <TableRow 
                    key={row.id || index}
                    style={{
                      ...rowStyle,
                      backgroundColor: showStripedRows && index % 2 === 1 
                        ? alternateRowBackgroundColor 
                        : rowBackgroundColor,
                    }}
                    className={showHoverEffect ? "hover:bg-muted/50" : ""}
                  >
                    <TableCell style={cellStyle} className="font-mono text-xs">
                      {row.created_at}
                    </TableCell>
                    {columns.map((col) => (
                      <TableCell 
                        key={col} 
                        style={cellStyle}
                        onClick={() => handleCellClick(row.id, col, row[col])}
                        className={`${enableInlineEditing && !isDesignMode ? "cursor-pointer hover:bg-muted/50" : ""} group`}
                      >
                        {editingCell?.rowId === row.id && editingCell?.column === col ? (
                          <div className="flex items-center gap-1">
                            <Input
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={handleKeyPress}
                              autoFocus
                              className="h-6 text-xs"
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={saveEdit}
                              disabled={saving}
                              className="h-6 w-6 p-0"
                            >
                              {saving ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={cancelEdit}
                              className="h-6 w-6 p-0"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            {row[col] !== null && row[col] !== undefined
                              ? String(row[col])
                              : '-'}
                            {enableInlineEditing && !isDesignMode && (
                              <span className="ml-1 text-muted-foreground opacity-0 group-hover:opacity-100">#</span>
                            )}
                          </>
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};