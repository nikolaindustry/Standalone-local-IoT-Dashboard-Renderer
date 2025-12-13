import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Database, Save, AlertCircle } from 'lucide-react';

interface TableColumn {
  name: string;
  type: 'text' | 'number' | 'boolean' | 'date' | 'json';
  required: boolean;
  default?: string;
  description?: string;
}

interface DatabaseTableConfig {
  columns: TableColumn[];
  indexes?: string[];
  description?: string;
}

interface DatabaseFormWidgetProps {
  title: string;
  productId?: string;
  deviceId?: string;
  tableName?: string;
  schemaId?: string;
  style?: React.CSSProperties;
  isDesignMode?: boolean;
  // Form customization props
  formFields?: Array<{
    id: string;
    type: 'text' | 'number' | 'email' | 'textarea' | 'select' | 'checkbox' | 'date';
    label: string;
    placeholder?: string;
    required?: boolean;
    options?: Array<{ label: string; value: string }>;
  }>;
  submitLabel?: string;
  resetAfterSubmit?: boolean;
  // Form styling props
  showContainer?: boolean;
  formBackgroundColor?: string;
  formTextColor?: string;
  formBorderColor?: string;
  formBorderWidth?: number;
  formBorderRadius?: number;
  formPadding?: string;
  labelFontSize?: string;
  labelFontWeight?: string;
  labelTextColor?: string;
  fieldBackgroundColor?: string;
  fieldTextColor?: string;
  fieldBorderColor?: string;
  fieldBorderWidth?: number;
  fieldBorderRadius?: number;
  fieldPadding?: string;
  fieldFontSize?: string;
  fieldFontWeight?: string;
  buttonBackgroundColor?: string;
  buttonTextColor?: string;
  buttonBorderColor?: string;
  buttonBorderWidth?: number;
  buttonBorderRadius?: number;
  buttonPadding?: string;
  buttonFontSize?: string;
  buttonFontWeight?: string;
  // Auto-generation flag
  autoGenerateFields?: boolean;
}

export const DatabaseFormWidget: React.FC<DatabaseFormWidgetProps> = ({
  title,
  productId,
  deviceId,
  tableName,
  schemaId,
  style,
  isDesignMode = false,
  formFields = [],
  submitLabel = 'Submit',
  resetAfterSubmit = true,
  // Form styling props with defaults
  showContainer = true,
  formBackgroundColor = '#ffffff',
  formTextColor = '#000000',
  formBorderColor = '#e2e8f0',
  formBorderWidth = 1,
  formBorderRadius = 6,
  formPadding = '16px',
  labelFontSize = '14px',
  labelFontWeight = 'normal',
  labelTextColor = '#000000',
  fieldBackgroundColor = '#ffffff',
  fieldTextColor = '#000000',
  fieldBorderColor = '#cbd5e1',
  fieldBorderWidth = 1,
  fieldBorderRadius = 4,
  fieldPadding = '8px',
  fieldFontSize = '14px',
  fieldFontWeight = 'normal',
  buttonBackgroundColor = '#3b82f6',
  buttonTextColor = '#ffffff',
  buttonBorderColor = '#3b82f6',
  buttonBorderWidth = 1,
  buttonBorderRadius = 6,
  buttonPadding = '8px 16px',
  buttonFontSize = '14px',
  buttonFontWeight = 'normal',
  // Auto-generation flag
  autoGenerateFields = false
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tableColumns, setTableColumns] = useState<TableColumn[]>([]);
  const [schemaLoading, setSchemaLoading] = useState(false);

  // Form styling
  const formContainerStyle = {
    backgroundColor: formBackgroundColor,
    color: formTextColor,
    borderColor: formBorderColor,
    borderWidth: `${formBorderWidth}px`,
    borderRadius: `${formBorderRadius}px`,
    padding: formPadding,
  };

  const labelStyle = {
    fontSize: labelFontSize,
    fontWeight: labelFontWeight,
    color: labelTextColor,
  };

  const fieldStyle = {
    backgroundColor: fieldBackgroundColor,
    color: fieldTextColor,
    borderColor: fieldBorderColor,
    borderWidth: `${fieldBorderWidth}px`,
    borderRadius: `${fieldBorderRadius}px`,
    padding: fieldPadding,
    fontSize: fieldFontSize,
    fontWeight: fieldFontWeight,
  };

  const buttonStyle = {
    backgroundColor: buttonBackgroundColor,
    color: buttonTextColor,
    borderColor: buttonBorderColor,
    borderWidth: `${buttonBorderWidth}px`,
    borderRadius: `${buttonBorderRadius}px`,
    padding: buttonPadding,
    fontSize: buttonFontSize,
    fontWeight: buttonFontWeight,
  };

  // Fetch table schema and generate form fields
  const fetchTableSchema = async () => {
    if (!productId || !tableName || !autoGenerateFields || isDesignMode) {
      return;
    }

    // Require schemaId to be provided when auto-generating fields
    if (!schemaId) {
      setError('Schema ID is required for auto-generating fields');
      console.error('Schema ID is required for auto-generating fields');
      return;
    }

    setSchemaLoading(true);
    try {
      // Fetch the table configuration using the provided schemaId
      const { data: tables, error: tableError } = await supabase
        .from('product_database_tables')
        .select('table_config')
        .eq('schema_id', schemaId)
        .eq('table_name', tableName)
        .limit(1);

      if (tableError) throw tableError;

      if (!tables || tables.length === 0) {
        throw new Error('Table not found');
      }

      // Parse the table configuration
      const tableConfig = typeof tables[0].table_config === 'string' 
        ? JSON.parse(tables[0].table_config) 
        : tables[0].table_config;

      setTableColumns(tableConfig.columns || []);
    } catch (err) {
      console.error('Error fetching table schema:', err);
      setError('Failed to load table schema');
    } finally {
      setSchemaLoading(false);
    }
  };

  // Generate form fields from table columns
  const generateFormFieldsFromColumns = (): DatabaseFormWidgetProps['formFields'] => {
    if (!autoGenerateFields || tableColumns.length === 0) {
      return formFields;
    }

    return tableColumns
      .filter(column => column.name !== 'id' && column.name !== 'created_at' && column.name !== 'updated_at') // Exclude system columns
      .map(column => {
        // Map database column types to form field types
        let fieldType: 'text' | 'number' | 'email' | 'textarea' | 'select' | 'checkbox' | 'date' = 'text';
        
        switch (column.type) {
          case 'number':
            fieldType = 'number';
            break;
          case 'boolean':
            fieldType = 'checkbox';
            break;
          case 'date':
            fieldType = 'date';
            break;
          case 'json':
            fieldType = 'textarea';
            break;
          default:
            fieldType = 'text';
        }

        return {
          id: column.name,
          type: fieldType,
          label: column.name.charAt(0).toUpperCase() + column.name.slice(1), // Capitalize first letter
          placeholder: column.description || `Enter ${column.name}`,
          required: column.required || false,
        };
      });
  };

  // Fetch schema when component mounts or when dependencies change
  useEffect(() => {
    if (autoGenerateFields && productId && tableName && schemaId) {
      fetchTableSchema();
    }
  }, [productId, tableName, schemaId, autoGenerateFields, isDesignMode]);
  
  // Get the form fields to use (either manually configured or auto-generated)
  const fieldsToUse = generateFormFieldsFromColumns();

  const renderFormField = (field: DatabaseFormWidgetProps['formFields'][0]) => {
    if (!field) return null;
    
    const fieldValue = formData[field.id] || '';

    switch (field.type) {
      case 'textarea':
        return (
          <Textarea
            id={field.id}
            placeholder={field.placeholder}
            value={fieldValue}
            onChange={(e) => setFormData(prev => ({ ...prev, [field.id]: e.target.value }))}
            disabled={isDesignMode}
            required={field.required}
            rows={3}
            style={fieldStyle}
          />
        );
        
      case 'select':
        return (
          <Select
            value={fieldValue}
            onValueChange={(value) => setFormData(prev => ({ ...prev, [field.id]: value }))}
            disabled={isDesignMode}
          >
            <SelectTrigger style={fieldStyle}>
              <SelectValue placeholder={field.placeholder || 'Select an option'} />
            </SelectTrigger>
            <SelectContent>
              {(field.options || [])
                .filter(option => option.value && option.value.trim() !== '')
                .map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label || option.value}
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
              disabled={isDesignMode}
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
            disabled={isDesignMode}
            required={field.required}
            style={fieldStyle}
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
            disabled={isDesignMode}
            required={field.required}
            style={fieldStyle}
          />
        );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isDesignMode) return;
    
    if (!productId || !tableName) {
      setError('Form not properly configured');
      toast({
        title: "Configuration Error",
        description: "Product ID and Table Name are required",
        variant: "destructive"
      });
      return;
    }

    // Validate required fields
    const missingFields = fieldsToUse
      .filter(field => field.required && (formData[field.id] === undefined || formData[field.id] === ''))
      .map(field => field.label);

    if (missingFields.length > 0) {
      toast({
        title: "Form Validation Error",
        description: `Please fill in required fields: ${missingFields.join(', ')}`,
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Prepare data payload (exclude form metadata)
      const dataPayload: Record<string, any> = {};
      fieldsToUse.forEach(field => {
        if (formData[field.id] !== undefined) {
          dataPayload[field.id] = formData[field.id];
        }
      });

      // Insert data into product_runtime_data table
      const { error: insertError } = await supabase
        .from('product_runtime_data')
        .insert({
          product_id: productId,
          device_id: deviceId || null,
          table_name: tableName,
          data_payload: dataPayload
        });

      if (insertError) throw insertError;

      toast({
        title: "Success",
        description: "Form data submitted successfully",
      });

      // Reset form if configured
      if (resetAfterSubmit) {
        setFormData({});
      }
    } catch (err) {
      console.error('Error submitting form data:', err);
      setError('Failed to submit form data');
      toast({
        title: "Submission Error",
        description: "Failed to submit form data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // If showContainer is false, render only the form without the card container
  if (!showContainer) {
    if (isDesignMode) {
      return (
        <div className="h-full w-full flex items-center justify-center text-muted-foreground">
          <Database className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Database Form Preview</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="h-full w-full flex items-center justify-center text-destructive">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">{error}</p>
        </div>
      );
    }

    return (
      <div className="h-full w-full" style={formContainerStyle}>
        <form
          onSubmit={handleSubmit}
          className="space-y-4 h-full flex flex-col"
          style={{ 
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: 0,
            padding: formContainerStyle.padding
          }}
        >
          {fieldsToUse.map((field) => (
            <div key={field.id} className="space-y-2">
              <Label htmlFor={field.id} className="text-sm font-medium" style={labelStyle}>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              
              {renderFormField(field)}
            </div>
          ))}

          {(fieldsToUse.length === 0 && !schemaLoading) && (
            <div className="text-xs text-muted-foreground text-center py-4">
              No form fields configured. Connect to a database table or add fields manually.
            </div>
          )}

          {schemaLoading && (
            <div className="text-xs text-muted-foreground text-center py-4">
              Loading form fields from database...
            </div>
          )}

          <div className="mt-auto">
            <Button
              type="submit"
              variant="default"
              className="w-full"
              disabled={isDesignMode || loading}
              style={buttonStyle}
            >
              {loading ? (
                <>
                  <Save className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {submitLabel}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // Render form with container (default behavior)
  return (
    <Card className="h-full" style={{ ...formContainerStyle, ...style }}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <span>{title}</span>
          <Database className="w-4 h-4" />
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <form onSubmit={handleSubmit} className="space-y-4">
          {fieldsToUse.map((field) => (
            <div key={field.id} className="space-y-2">
              <Label htmlFor={field.id} className="text-sm font-medium" style={labelStyle}>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              
              {renderFormField(field)}
            </div>
          ))}

          {(fieldsToUse.length === 0 && !schemaLoading) && (
            <div className="text-xs text-muted-foreground text-center py-4">
              No form fields configured. Connect to a database table or add fields manually.
            </div>
          )}

          {schemaLoading && (
            <div className="text-xs text-muted-foreground text-center py-4">
              Loading form fields from database...
            </div>
          )}

          <Button
            type="submit"
            variant="default"
            className="w-full"
            disabled={isDesignMode || loading}
            style={buttonStyle}
          >
            {loading ? (
              <>
                <Save className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {submitLabel}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};