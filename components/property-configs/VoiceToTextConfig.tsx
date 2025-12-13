import React from 'react';
import { IoTDashboardWidget } from '../../types';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Mic, Settings, Globe } from 'lucide-react';

interface VoiceToTextConfigProps {
  widget: IoTDashboardWidget;
  onConfigChange: (property: string, value: any) => void;
}

export const VoiceToTextConfig: React.FC<VoiceToTextConfigProps> = ({
  widget,
  onConfigChange
}) => {
  const languages = [
    { value: 'en-US', label: 'English (US)' },
    { value: 'en-GB', label: 'English (UK)' },
    { value: 'es-ES', label: 'Spanish' },
    { value: 'fr-FR', label: 'French' },
    { value: 'de-DE', label: 'German' },
    { value: 'it-IT', label: 'Italian' },
    { value: 'pt-BR', label: 'Portuguese (Brazil)' },
    { value: 'zh-CN', label: 'Chinese (Simplified)' },
    { value: 'ja-JP', label: 'Japanese' },
    { value: 'ko-KR', label: 'Korean' },
    { value: 'ar-SA', label: 'Arabic' },
    { value: 'hi-IN', label: 'Hindi' },
  ];

  return (
    <>
      <h4 className="text-sm font-medium flex items-center gap-2">
        <Mic className="w-4 h-4" />
        Voice-to-Text Configuration
      </h4>
      
      {/* Language Selection */}
      <div className="space-y-1">
        <Label className="text-xs flex items-center gap-2">
          <Globe className="w-3 h-3" />
          Recognition Language
        </Label>
        <Select
          value={widget.config.language || 'en-US'}
          onValueChange={(value) => onConfigChange('language', value)}
        >
          <SelectTrigger className="h-8 text-sm">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            {languages.map((lang) => (
              <SelectItem key={lang.value} value={lang.value}>
                {lang.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Recognition Settings */}
      <h4 className="text-sm font-medium flex items-center gap-2">
        <Settings className="w-4 h-4" />
        Recognition Settings
      </h4>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-xs">Auto-send on Speech End</Label>
            <p className="text-xs text-muted-foreground">
              Automatically send recognized text when speech ends
            </p>
          </div>
          <Switch
            checked={widget.config.autoSend || false}
            onCheckedChange={(checked) => onConfigChange('autoSend', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-xs">Continuous Recognition</Label>
            <p className="text-xs text-muted-foreground">
              Keep listening continuously (vs. single phrase)
            </p>
          </div>
          <Switch
            checked={widget.config.continuous !== false}
            onCheckedChange={(checked) => onConfigChange('continuous', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-xs">Always Listening</Label>
            <p className="text-xs text-muted-foreground">
              Auto-start and continuously listen/send without clicking Start
            </p>
          </div>
          <Switch
            checked={widget.config.alwaysListening || false}
            onCheckedChange={(checked) => onConfigChange('alwaysListening', checked)}
          />
        </div>
      </div>

      <Separator />

      {/* Information */}
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 dark:bg-blue-950 dark:border-blue-800">
        <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
          <p className="font-medium">Web Speech API Requirements:</p>
          <p>• Uses the browser-native Web Speech API</p>
          <p>• Works best in Chrome, Edge, and Safari</p>
          <p>• Requires microphone permissions</p>
        </div>
      </div>
    </>
  );
};
