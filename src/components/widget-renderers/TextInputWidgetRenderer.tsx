import React, { useState } from 'react';
import { IoTDashboardWidget } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, X } from 'lucide-react';

interface TextInputWidgetRendererProps {
  widget: IoTDashboardWidget;
  isDesignMode: boolean;
  localValue: string;
  handleValueChange: (value: string) => void;
  executeAction: (actionId: string, parameters?: Record<string, any>) => void;
  commonStyles: React.CSSProperties;
}

export const TextInputWidgetRenderer: React.FC<TextInputWidgetRendererProps> = ({
  widget,
  isDesignMode,
  localValue,
  handleValueChange,
  executeAction,
  commonStyles
}) => {
  const [inputValue, setInputValue] = useState(localValue || widget.config.textInputDefaultValue || '');
  const [isValid, setIsValid] = useState(true);

  const validateInput = (value: string): boolean => {
    // Check max length
    if (widget.config.textInputMaxLength && value.length > widget.config.textInputMaxLength) {
      return false;
    }

    // Check pattern if specified
    if (widget.config.textInputPattern) {
      try {
        const regex = new RegExp(widget.config.textInputPattern);
        if (!regex.test(value)) {
          return false;
        }
      } catch (e) {
        console.error('Invalid regex pattern:', widget.config.textInputPattern);
      }
    }

    // Type-specific validation
    const inputType = widget.config.textInputType || 'text';
    if (inputType === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return false;
      }
    }

    if (inputType === 'url' && value) {
      try {
        new URL(value);
      } catch {
        return false;
      }
    }

    return true;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Check max length
    if (widget.config.textInputMaxLength && newValue.length > widget.config.textInputMaxLength) {
      return;
    }

    setInputValue(newValue);
    const valid = validateInput(newValue);
    setIsValid(valid);

    // Update value in real-time and trigger change event
    if (valid) {
      handleValueChange(newValue);
      // Also trigger change action for event system
      executeAction('change', { value: newValue });
    }
  };

  const handleSubmit = () => {
    if (!isValid || isDesignMode) {
      return;
    }

    // Execute submit action
    executeAction('submit', { value: inputValue });
    
    // Clear after submit if configured
    if (widget.config.textInputClearButton) {
      setInputValue('');
      handleValueChange('');
    }
  };

  const handleClear = () => {
    setInputValue('');
    handleValueChange('');
    setIsValid(true);
    // Trigger clear action for event system
    executeAction('clear', { value: '' });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && widget.config.textInputSubmitButton) {
      handleSubmit();
    }
  };

  const inputStyle: React.CSSProperties = {
    borderRadius: widget.config.textInputBorderRadius ? `${widget.config.textInputBorderRadius}px` : undefined,
    padding: widget.config.textInputPadding || undefined,
    fontSize: widget.config.textInputFontSize || undefined,
    borderColor: !isValid ? 'red' : widget.config.textInputBorderColor || undefined,
    borderWidth: widget.config.textInputBorderWidth || undefined,
    backgroundColor: widget.config.textInputBackgroundColor || undefined,
    color: widget.config.textInputTextColor || undefined,
    height: widget.config.textInputHeight ? `${widget.config.textInputHeight}px` : undefined
  };

  // Add custom CSS for placeholder color
  const placeholderStyle = widget.config.textInputPlaceholderColor ? `
    input::placeholder {
      color: ${widget.config.textInputPlaceholderColor} !important;
      opacity: 1;
    }
  ` : '';

  const content = (
    <div className="space-y-2 w-full">
      {placeholderStyle && (
        <style>{placeholderStyle}</style>
      )}
      <div className="flex items-center gap-2 w-full">
        <Input
          type={widget.config.textInputType || 'text'}
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder={widget.config.textInputPlaceholder || 'Enter text...'}
          maxLength={widget.config.textInputMaxLength}
          required={widget.config.textInputRequired}
          disabled={isDesignMode}
          className={!isValid ? 'border-red-500' : ''}
          style={inputStyle}
        />
      
        {widget.config.textInputClearButton && inputValue && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            disabled={isDesignMode}
            className="flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        
        {widget.config.textInputSubmitButton && (
          <Button
            variant="default"
            size="sm"
            onClick={handleSubmit}
            disabled={isDesignMode || !isValid || (!inputValue && widget.config.textInputRequired)}
            className="flex-shrink-0"
          >
            {widget.config.textInputSubmitLabel || <Send className="h-4 w-4" />}
          </Button>
        )}
      </div>
      
      {/* Validation message */}
      {!isValid && (
        <p className="text-xs text-red-500">
          Please enter a valid value
        </p>
      )}
      
      {/* Character count */}
      {widget.config.textInputShowCharCount && widget.config.textInputMaxLength && (
        <p className="text-xs text-muted-foreground">
          {inputValue.length} / {widget.config.textInputMaxLength} characters
        </p>
      )}
    </div>
  );

  // Show/hide container based on configuration
  if (widget.config.showTextInputContainer === false) {
    return (
      <div style={commonStyles} className="h-full flex items-center p-2">
        {content}
      </div>
    );
  }

  return (
    <Card className="h-full" style={commonStyles}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">{widget.title}</CardTitle>
      </CardHeader>
      <CardContent>
        {content}
      </CardContent>
    </Card>
  );
};
