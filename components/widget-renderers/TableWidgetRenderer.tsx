import React from 'react';
import { IoTDashboardWidget } from '../../types';
import { TableWidget } from '../widgets/TableWidget';

interface TableWidgetRendererProps {
  widget: IoTDashboardWidget;
  deviceId: string | undefined;
  isDesignMode: boolean;
  commonStyles: React.CSSProperties;
}

export const TableWidgetRenderer: React.FC<TableWidgetRendererProps> = ({
  widget,
  deviceId,
  isDesignMode,
  commonStyles
}) => {
  return (
    <TableWidget
      title={widget.title}
      productId={widget.config.productId}
      deviceId={deviceId}
      tableName={widget.config.runtimeTableName}
      refreshInterval={widget.config.refreshInterval || 5000}
      style={commonStyles}
      isDesignMode={isDesignMode}
      // Table customization props
      showHeader={widget.config.showHeader}
      headerBackgroundColor={widget.config.headerBackgroundColor}
      headerTextColor={widget.config.headerTextColor}
      rowBackgroundColor={widget.config.rowBackgroundColor}
      rowTextColor={widget.config.rowTextColor}
      alternateRowBackgroundColor={widget.config.alternateRowBackgroundColor}
      borderColor={widget.config.borderColor}
      borderWidth={widget.config.borderWidth}
      borderRadius={widget.config.borderRadius}
      cellPadding={widget.config.cellPadding}
      showStripedRows={widget.config.showStripedRows}
      showHoverEffect={widget.config.showHoverEffect}
      fontSize={widget.config.fontSize}
      fontWeight={widget.config.fontWeight}
      showContainer={widget.config.showContainer}
      // Inline editing prop
      enableInlineEditing={widget.config.enableInlineEditing}
    />
  );
};