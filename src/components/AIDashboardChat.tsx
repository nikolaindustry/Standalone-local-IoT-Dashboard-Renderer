import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, Send, X, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useIoTBuilder } from '../contexts/IoTBuilderContext';
import type { IoTDashboardConfig } from '../types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIDashboardChatProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIDashboardChat: React.FC<AIDashboardChatProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hi! I can help you design your IoT dashboard. Describe what you want to monitor and control, and I\'ll create the perfect dashboard for you.',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { state, actions } = useIoTBuilder();

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-dashboard-designer', {
        body: { prompt: input }
      });

      if (error) throw error;

      if (data.error) {
        if (data.error.includes('Rate limit')) {
          toast.error('Rate limit exceeded. Please try again in a moment.');
        } else if (data.error.includes('Payment required')) {
          toast.error('AI credits depleted. Please add credits to continue.');
        } else {
          toast.error(data.error);
        }
        
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Sorry, I encountered an error: ${data.error}`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
        return;
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I\'ve created a dashboard based on your requirements. Would you like me to apply it?',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Store the configuration for potential application
      if (data.dashboardConfig) {
        setTimeout(() => {
          const confirmApply = window.confirm('Apply this AI-generated dashboard configuration?');
          if (confirmApply) {
            applyDashboardConfig(data.dashboardConfig);
          }
        }, 500);
      }

    } catch (error) {
      console.error('Error calling AI:', error);
      toast.error('Failed to generate dashboard. Please try again.');
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I had trouble generating the dashboard. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const applyDashboardConfig = (config: any) => {
    try {
      if (!state.config) {
        toast.error('No active dashboard to update');
        return;
      }

      // Helper function to normalize widget structure
      const normalizeWidget = (widget: any) => {
        const normalized: any = {
          id: widget.id || generateId(),
          type: widget.type,
          title: widget.title || `New ${widget.type}`,
          config: widget.config || {},
        };

        // Normalize position - handle both formats
        if (widget.position) {
          normalized.position = widget.position;
        } else if (widget.x !== undefined && widget.y !== undefined) {
          normalized.position = { x: widget.x, y: widget.y };
        } else {
          normalized.position = { x: 50, y: 50 }; // Default position
        }

        // Normalize size - handle both formats
        if (widget.size) {
          normalized.size = widget.size;
        } else if (widget.width !== undefined && widget.height !== undefined) {
          normalized.size = { width: widget.width, height: widget.height };
        } else {
          normalized.size = { width: 200, height: 200 }; // Default size
        }

        return normalized;
      };

      // Build the updated configuration
      const updatedConfig: Partial<IoTDashboardConfig> = {};

      // Apply pages if provided
      if (config.pages && config.pages.length > 0) {
        updatedConfig.pages = config.pages.map((page: any) => ({
          id: page.id || generateId(),
          name: page.name || 'New Page',
          widgets: (page.widgets || []).map(normalizeWidget),
          layout: page.layout || { cols: 12, rows: 12, gap: 10 },
        }));
      }

      // Apply theme if provided
      if (config.theme) {
        updatedConfig.theme = {
          ...state.config.theme,
          ...config.theme,
        };
      }

      // Update the configuration
      actions.updateConfig(updatedConfig);
      
      toast.success('Dashboard configuration applied successfully!');
      onClose();
    } catch (error) {
      console.error('Error applying dashboard config:', error);
      toast.error('Failed to apply dashboard configuration.');
    }
  };

  const generateId = () => `iot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-background border-l border-border shadow-lg z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-foreground">AI Dashboard Designer</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <span className="text-xs opacity-70 mt-1 block">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg p-3">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Describe your dashboard..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={isLoading || !input.trim()} size="icon">
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Example: "Create a dashboard to monitor temperature, humidity, and control lights"
        </p>
      </div>
    </div>
  );
};
