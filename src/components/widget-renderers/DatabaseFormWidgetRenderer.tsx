import React from 'react';
import { IoTDashboardWidget } from '../../types';
import { DatabaseFormWidget } from '../widgets/DatabaseFormWidget';

interface DatabaseFormWidgetRendererProps {
  widget: IoTDashboardWidget;
  deviceId: string | undefined;
  isDesignMode: boolean;
  commonStyles: React.CSSProperties;
}

export const DatabaseFormWidgetRenderer: React.FC<DatabaseFormWidgetRendererProps> = ({
  widget,
  deviceId,
  isDesignMode,
  commonStyles
}) => {
  // Transform FormField[] to the format expected by DatabaseFormWidget
  // Filter out unsupported field types
  const databaseFormFields = (widget.config.formFields || []).filter(field => 
    field.type !== 'password' && 
    field.type !== 'qr-scanner'
  ).map(field => ({
    id: field.id,
    type: field.type as 'text' | 'number' | 'email' | 'textarea' | 'select' | 'checkbox' | 'date',
    label: field.label,
    placeholder: field.placeholder,
    required: field.required,
    options: field.options
  }));

  return (
    <DatabaseFormWidget
      title={widget.title}
      productId={widget.config.productId}
      deviceId={deviceId}
      tableName={widget.config.runtimeTableName || widget.config.tableName}
      schemaId={widget.config.schemaId}
      style={commonStyles}
      isDesignMode={isDesignMode}
      // Form fields configuration
      formFields={databaseFormFields}
      submitLabel={widget.config.submitLabel}
      resetAfterSubmit={widget.config.resetAfterSubmit}
      // Form styling props
      showContainer={widget.config.showFormContainer}
      formBackgroundColor={widget.config.formBackgroundColor}
      formTextColor={widget.config.formTextColor}
      formBorderColor={widget.config.formBorderColor}
      formBorderWidth={widget.config.formBorderWidth}
      formBorderRadius={widget.config.formBorderRadius}
      formPadding={widget.config.formPadding}
      labelFontSize={widget.config.labelFontSize}
      labelFontWeight={widget.config.labelFontWeight}
      labelTextColor={widget.config.labelTextColor}
      fieldBackgroundColor={widget.config.fieldBackgroundColor}
      fieldTextColor={widget.config.fieldTextColor}
      fieldBorderColor={widget.config.fieldBorderColor}
      fieldBorderWidth={widget.config.fieldBorderWidth}
      fieldBorderRadius={widget.config.fieldBorderRadius}
      fieldPadding={widget.config.fieldPadding}
      fieldFontSize={widget.config.fieldFontSize}
      fieldFontWeight={widget.config.fieldFontWeight}
      buttonBackgroundColor={widget.config.buttonBackgroundColor}
      buttonTextColor={widget.config.buttonTextColor}
      buttonBorderColor={widget.config.buttonBorderColor}
      buttonBorderWidth={widget.config.buttonBorderWidth as unknown as number}
      buttonBorderRadius={widget.config.buttonBorderRadius}
      buttonPadding={widget.config.buttonPadding}
      buttonFontSize={widget.config.buttonFontSize}
      buttonFontWeight={widget.config.buttonFontWeight}
      // Auto-generation flag
      autoGenerateFields={widget.config.autoGenerateFields}
    />
  );
};