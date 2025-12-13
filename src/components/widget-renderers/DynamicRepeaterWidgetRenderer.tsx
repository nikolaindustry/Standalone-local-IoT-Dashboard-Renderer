import React from 'react';
import { IoTDashboardWidget } from '../../types';
import { DynamicRepeaterWidget } from '../widgets/DynamicRepeaterWidget';

interface DynamicRepeaterWidgetRendererProps {
  widget: IoTDashboardWidget;
  deviceId: string | undefined;
  isDesignMode: boolean;
  commonStyles: React.CSSProperties;
}

export const DynamicRepeaterWidgetRenderer: React.FC<DynamicRepeaterWidgetRendererProps> = ({
  widget,
  deviceId,
  isDesignMode,
  commonStyles
}) => {
  return (
    <DynamicRepeaterWidget
      title={widget.title}
      productId={widget.config.productId}
      deviceId={deviceId}
      tableName={widget.config.runtimeTableName || widget.config.tableName}
      refreshInterval={widget.config.refreshInterval || 5000}
      style={commonStyles}
      isDesignMode={isDesignMode}
      // Dynamic Repeater customization props
      repeaterItemTemplate={widget.config.repeaterItemTemplate}
      itemsPerPage={widget.config.itemsPerPage || 10}
      showPagination={widget.config.showPagination !== false}
      autoGenerateTemplate={widget.config.autoGenerateTemplate || false}
      showContainer={widget.config.showContainer !== false}
    />
  );
};