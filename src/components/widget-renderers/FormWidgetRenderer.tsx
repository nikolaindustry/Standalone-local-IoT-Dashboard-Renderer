import React, { useState } from 'react';
import { IoTDashboardWidget } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { QRScannerField } from './QRScannerField';

// Form field type definition
interface FormField {
  id: string;
  label: string;
  type: string;
  placeholder?: string;
  defaultValue?: any;
  required?: boolean;
  options?: Array<{ label: string; value: string }>;
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    minDate?: string;
    maxDate?: string;
  };
}

interface FormWidgetRendererProps {
  widget: IoTDashboardWidget;
  isDesignMode: boolean;
  deviceStatus: 'online' | 'offline' | 'connecting';
  formData: Record<string, any>;
  setFormData: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  executeAction: (actionId: string, parameters?: Record<string, any>) => void;
  commonStyles: React.CSSProperties;
}

export { QRScannerField } from './QRScannerField';

export const FormWidgetRenderer: React.FC<FormWidgetRendererProps> = ({
  widget,
  isDesignMode,
  deviceStatus,
  formData,
  setFormData,
  executeAction,
  commonStyles
}) => {
  const { toast } = useToast();

  // Form customization styles
  const formContainerStyle = {
    backgroundColor: widget.config.formBackgroundColor || commonStyles.backgroundColor,
    color: widget.config.formTextColor || commonStyles.color,
    borderColor: widget.config.formBorderColor || commonStyles.borderColor,
    borderWidth: widget.config.formBorderWidth ? `${widget.config.formBorderWidth}px` : commonStyles.borderWidth,
    borderRadius: widget.config.formBorderRadius ? `${widget.config.formBorderRadius}px` : commonStyles.borderRadius,
    padding: widget.config.formPadding || commonStyles.padding,
  };

  const labelStyle = {
    fontSize: widget.config.labelFontSize,
    fontWeight: widget.config.labelFontWeight,
    color: widget.config.labelTextColor,
    fontFamily: widget.config.labelFontFamily,
    marginBottom: widget.config.labelMarginBottom,
  };

  const fieldStyle = {
    backgroundColor: widget.config.fieldBackgroundColor,
    color: widget.config.fieldTextColor,
    borderColor: widget.config.fieldBorderColor,
    borderWidth: widget.config.fieldBorderWidth ? `${widget.config.fieldBorderWidth}px` : undefined,
    borderRadius: widget.config.fieldBorderRadius ? `${widget.config.fieldBorderRadius}px` : undefined,
    padding: widget.config.fieldPadding,
    fontSize: widget.config.fieldFontSize,
    fontWeight: widget.config.fieldFontWeight,
    fontFamily: widget.config.fieldFontFamily,
    height: widget.config.fieldHeight,
    marginBottom: widget.config.fieldMarginBottom,
  };

  const buttonStyle = {
    backgroundColor: widget.config.buttonBackgroundColor,
    color: widget.config.buttonTextColor,
    borderColor: widget.config.buttonBorderColor,
    borderWidth: widget.config.buttonBorderWidth ? `${widget.config.buttonBorderWidth}px` : undefined,
    borderRadius: widget.config.buttonBorderRadius ? `${widget.config.buttonBorderRadius}px` : undefined,
    padding: widget.config.buttonPadding,
    fontSize: widget.config.buttonFontSize,
    fontWeight: widget.config.buttonFontWeight,
    fontFamily: widget.config.buttonFontFamily,
    height: widget.config.buttonHeight,
  };

  const renderFormField = (field: FormField) => {
    const fieldValue = formData[field.id] || field.defaultValue || '';
    
    // Apply additional styling for focus and error states
    const getFieldStyle = (baseStyle: React.CSSProperties) => {
      return {
        ...baseStyle,
        '--placeholder-color': widget.config.fieldPlaceholderColor || '#94a3b8',
      } as React.CSSProperties;
    };

    switch (field.type) {
      case 'textarea':
        return (
          <Textarea
            id={field.id}
            placeholder={field.placeholder}
            value={fieldValue}
            onChange={(e) => setFormData(prev => ({ ...prev, [field.id]: e.target.value }))}
            disabled={isDesignMode || deviceStatus === 'offline'}
            required={field.required}
            rows={3}
            style={getFieldStyle(fieldStyle)}
            className="[&::placeholder]:text-[color:var(--placeholder-color)]"
          />
        );
        
      case 'select':
        return (
          <Select
            value={fieldValue}
            onValueChange={(value) => setFormData(prev => ({ ...prev, [field.id]: value }))}
            disabled={isDesignMode || deviceStatus === 'offline'}
          >
            <SelectTrigger style={getFieldStyle(fieldStyle)} className="[&::placeholder]:text-[color:var(--placeholder-color)]">
              <SelectValue placeholder={field.placeholder || 'Select an option'} />
            </SelectTrigger>
            <SelectContent>
              {(field.options || []).map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
        
      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.id}
              checked={fieldValue || false}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, [field.id]: checked }))}
              disabled={isDesignMode || deviceStatus === 'offline'}
            />
            <Label htmlFor={field.id} className="text-sm" style={labelStyle}>
              {field.placeholder || field.label}
            </Label>
          </div>
        );
        
      case 'date':
        return (
          <Input
            id={field.id}
            type="date"
            value={fieldValue}
            onChange={(e) => setFormData(prev => ({ ...prev, [field.id]: e.target.value }))}
            disabled={isDesignMode || deviceStatus === 'offline'}
            required={field.required}
            min={field.validation?.minDate}
            max={field.validation?.maxDate}
            style={getFieldStyle(fieldStyle)}
            className="[&::placeholder]:text-[color:var(--placeholder-color)]"
          />
        );
        
      case 'qr-scanner':
        return (
          <QRScannerField
            id={field.id}
            value={fieldValue}
            onChange={(value) => setFormData(prev => ({ ...prev, [field.id]: value }))}
            disabled={isDesignMode || deviceStatus === 'offline'}
            required={field.required}
            placeholder={field.placeholder}
          />
        );
        
      default:
        return (
          <Input
            id={field.id}
            type={field.type}
            placeholder={field.placeholder}
            value={fieldValue}
            onChange={(e) => {
              const value = field.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
              setFormData(prev => ({ ...prev, [field.id]: value }));
            }}
            disabled={isDesignMode || deviceStatus === 'offline'}
            required={field.required}
            min={field.validation?.min}
            max={field.validation?.max}
            minLength={field.validation?.minLength}
            maxLength={field.validation?.maxLength}
            pattern={field.validation?.pattern}
            style={getFieldStyle(fieldStyle)}
            className="[&::placeholder]:text-[color:var(--placeholder-color)]"
          />
        );
    }
  };

  // Determine whether to show the container
  const showFormContainer = widget.config.showFormContainer !== false;

  if (!showFormContainer) {
    // Render form without container
    return (
      <div className="h-full" style={formContainerStyle}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (isDesignMode) return;

            // Validate required fields
            const formFields = widget.config.formFields || [];
            const missingFields = formFields
              .filter((field: FormField) => field.required && !formData[field.id])
              .map((field: FormField) => field.label);

            if (missingFields.length > 0) {
              toast({
                title: "Form Validation Error",
                description: `Please fill in required fields: ${missingFields.join(', ')}`,
                variant: "destructive"
              });
              return;
            }

            // Submit form data
            // Convert field IDs to field labels for better readability
            const labeledFormData: Record<string, any> = {};
            
            Object.keys(formData).forEach(fieldId => {
              const field = formFields.find((f: FormField) => f.id === fieldId);
              if (field) {
                // Use field label as key instead of field ID
                labeledFormData[field.label] = formData[fieldId];
              } else {
                // Fallback to field ID if label not found
                labeledFormData[fieldId] = formData[fieldId];
              }
            });
            
            executeAction('submit', { formData: labeledFormData });

            // Reset form if configured
            if (widget.config.resetAfterSubmit) {
              setFormData({});
            }

            toast({
              title: "Form Submitted",
              description: "Form data has been sent successfully",
            });
          }}
          className="space-y-4 h-full flex flex-col"
          style={{ 
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: 0,
            padding: formContainerStyle.padding
          }}
        >
          {(widget.config.formFields || []).map((field: FormField) => (
            <div key={field.id} className="space-y-2">
              <Label htmlFor={field.id} className="text-sm font-medium" style={labelStyle}>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              
              {renderFormField(field)}
            </div>
          ))}

          {(widget.config.formFields || []).length === 0 && (
            <div className="text-xs text-muted-foreground text-center py-4">
              No form fields configured
            </div>
          )}

          <div className="mt-auto">
            <Button
              type="submit"
              variant="default"
              size="lg"
              className="w-full"
              disabled={isDesignMode || deviceStatus === 'offline'}
              style={buttonStyle}
            >
              {widget.config.submitLabel || 'Submit'}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // Render form with container (default behavior)
  return (
    <Card className="h-full" style={formContainerStyle}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <span>{widget.title}</span>
          {/* Removed getStatusIcon() from form widget */}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (isDesignMode) return;

            // Validate required fields
            const formFields = widget.config.formFields || [];
            const missingFields = formFields
              .filter((field: FormField) => field.required && !formData[field.id])
              .map((field: FormField) => field.label);

            if (missingFields.length > 0) {
              toast({
                title: "Form Validation Error",
                description: `Please fill in required fields: ${missingFields.join(', ')}`,
                variant: "destructive"
              });
              return;
            }

            // Submit form data
            // Convert field IDs to field labels for better readability
            const labeledFormData: Record<string, any> = {};
            
            Object.keys(formData).forEach(fieldId => {
              const field = formFields.find((f: FormField) => f.id === fieldId);
              if (field) {
                // Use field label as key instead of field ID
                labeledFormData[field.label] = formData[fieldId];
              } else {
                // Fallback to field ID if label not found
                labeledFormData[fieldId] = formData[fieldId];
              }
            });
            
            executeAction('submit', { formData: labeledFormData });

            // Reset form if configured
            if (widget.config.resetAfterSubmit) {
              setFormData({});
            }

            toast({
              title: "Form Submitted",
              description: "Form data has been sent successfully",
            });
          }}
          className="space-y-4"
        >
          {(widget.config.formFields || []).map((field: FormField) => (
            <div key={field.id} className="space-y-2">
              <Label htmlFor={field.id} className="text-sm font-medium" style={labelStyle}>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              
              {renderFormField(field)}
            </div>
          ))}

          {(widget.config.formFields || []).length === 0 && (
            <div className="text-xs text-muted-foreground text-center py-4">
              No form fields configured
            </div>
          )}

          <Button
            type="submit"
            variant="default"
            size="lg"
            className="w-full"
            disabled={isDesignMode || deviceStatus === 'offline'}
            style={buttonStyle}
          >
            {widget.config.submitLabel || 'Submit'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};