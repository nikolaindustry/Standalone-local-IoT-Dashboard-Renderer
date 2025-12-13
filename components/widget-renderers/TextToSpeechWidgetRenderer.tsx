import React from 'react';
import { IoTDashboardWidget } from '../../types';
import { TextToSpeechWidget } from '../widgets/TextToSpeechWidget';

interface TextToSpeechWidgetRendererProps {
  widget: IoTDashboardWidget;
  isDesignMode?: boolean;
  localValue?: any;
  commonStyles?: React.CSSProperties;
}

export const TextToSpeechWidgetRenderer: React.FC<TextToSpeechWidgetRendererProps> = ({
  widget,
  isDesignMode,
  localValue,
  commonStyles
}) => {
  return (
    <TextToSpeechWidget
      value={localValue}
      config={widget.config as any}
      style={commonStyles}
      isDesignMode={isDesignMode}
    />
  );
};
