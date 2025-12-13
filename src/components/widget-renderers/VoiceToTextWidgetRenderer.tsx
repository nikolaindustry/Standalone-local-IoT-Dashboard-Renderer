import React, { useState, useEffect, useRef, useCallback } from 'react';
import { IoTDashboardWidget } from '../../types/index';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mic, MicOff, Send } from 'lucide-react';
import deviceWebSocketService from '@/services/deviceWebSocketService';
import { toast } from 'sonner';

interface VoiceToTextWidgetRendererProps {
  widget: IoTDashboardWidget;
  deviceId?: string;
  onUpdate?: (id: string, updates: Partial<IoTDashboardWidget>) => void;
  onAction?: (actionId: string, parameters?: Record<string, any>) => void;
  onWidgetEvent?: (widgetId: string, event: string, value: any) => void;
  isDesignMode?: boolean;
}

export const VoiceToTextWidgetRenderer: React.FC<VoiceToTextWidgetRendererProps> = ({
  widget,
  deviceId,
  onUpdate,
  onAction,
  onWidgetEvent,
  isDesignMode = false,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  // Use runtime deviceId if available, otherwise fall back to config targetId (for design mode)
  const targetId = deviceId || widget.config?.targetId || '';
  const commandKey = widget.config?.commandKey || 'text';
  const autoSend = widget.config?.autoSend || false;
  const language = widget.config?.language || 'en-US';
  const continuous = widget.config?.continuous !== false;
  const alwaysListening = widget.config?.alwaysListening || false;

  const sendTextToWebSocket = useCallback((text: string) => {
    if (!targetId) {
      toast.error('No target device configured');
      return;
    }

    console.log('Voice-to-text: Preparing to send text:', text);
    console.log('Voice-to-text: Target ID:', targetId);
    console.log('Voice-to-text: Widget ID:', widget.id);

    const message = {
      targetId: targetId,
      payload: {
        widgetId: widget.id,
        value: text,
      }
    };

    console.log('Voice-to-text: Full message structure:', message);

    const success = deviceWebSocketService.sendMessage(message);
    
    if (success) {
      toast.success('Text sent via WebSocket');
      console.log('Voice-to-text: Message sent successfully');
    } else {
      toast.error('WebSocket not connected. Please check connection.');
      console.error('Voice-to-text: Failed to send message - WebSocket not connected');
    }
  }, [targetId, widget.id]);

  useEffect(() => {
    // Check if browser supports Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      toast.error('Speech recognition is not supported in this browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = continuous;
    recognition.interimResults = true;
    recognition.lang = language;

    recognition.onstart = () => {
      console.log('Voice recognition started');
      setIsListening(true);
      
      // Trigger speechStart event
      onAction?.('speechStart', { widgetId: widget.id });
      onWidgetEvent?.(widget.id, 'speechStart', { widgetId: widget.id });
    };

    recognition.onresult = (event: any) => {
      let interimText = '';
      let finalText = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPiece = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalText += transcriptPiece;
        } else {
          interimText += transcriptPiece;
        }
      }

      if (finalText) {
        const newTranscript = transcript + finalText;
        setTranscript(newTranscript);
        setInterimTranscript('');

        // Trigger speechResult event with the text
        const speechData = {
          widgetId: widget.id,
          text: newTranscript,
          finalText: finalText
        };
        
        console.log('[VoiceToText] Speech result recognized:', speechData);
        onAction?.('speechResult', speechData);
        onWidgetEvent?.(widget.id, 'speechResult', speechData);

        // If auto-send is enabled, trigger speechEnd/submit events
        if (autoSend) {
          console.log('[VoiceToText] Auto-send enabled, triggering speechEnd event');
          onAction?.('speechEnd', speechData);
          onAction?.('submit', speechData);
          onWidgetEvent?.(widget.id, 'speechEnd', speechData);
          onWidgetEvent?.(widget.id, 'submit', speechData);
          
          // Also send via legacy WebSocket if targetId is configured
          if (targetId) {
            sendTextToWebSocket(newTranscript);
          }
        }
      } else {
        setInterimTranscript(interimText);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      
      if (event.error !== 'aborted') {
        toast.error(`Voice recognition error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      console.log('Voice recognition ended');
      setIsListening(false);
      
      // Auto-restart if alwaysListening is enabled
      if (alwaysListening) {
        console.log('Auto-restarting voice recognition (always listening mode)');
        setTimeout(() => {
          if (recognitionRef.current && !isListening) {
            try {
              recognitionRef.current.start();
            } catch (error) {
              console.error('Error restarting recognition:', error);
            }
          }
        }, 100); // Small delay to ensure recognition has fully stopped
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [language, continuous, autoSend, targetId, sendTextToWebSocket, transcript]);

  // Auto-start listening if alwaysListening is enabled
  useEffect(() => {
    if (alwaysListening && recognitionRef.current && !isListening) {
      console.log('Auto-starting voice recognition (always listening mode)');
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error auto-starting recognition:', error);
      }
    }
  }, [alwaysListening]);


  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition not available');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setTranscript('');
      setInterimTranscript('');
      recognitionRef.current.start();
    }
  };

  const handleSend = useCallback(() => {
    console.log('Voice-to-text: handleSend called');
    console.log('Voice-to-text: Current transcript:', transcript);
    console.log('Voice-to-text: Transcript length:', transcript.length);
    
    if (transcript) {
      console.log('Voice-to-text: Sending transcript...');
      
      const speechData = {
        widgetId: widget.id,
        text: transcript
      };
      
      // Trigger submit/speechEnd event
      console.log('[VoiceToText] Calling onAction for speechEnd', speechData);
      onAction?.('speechEnd', speechData);
      onAction?.('submit', speechData);
      
      console.log('[VoiceToText] Calling onWidgetEvent', { widgetId: widget.id, event: 'speechEnd', onWidgetEvent: !!onWidgetEvent });
      onWidgetEvent?.(widget.id, 'speechEnd', speechData);
      onWidgetEvent?.(widget.id, 'submit', speechData);
      
      setTranscript('');
      setInterimTranscript('');
    } else {
      console.log('Voice-to-text: No transcript to send');
      toast.error('No text to send');
    }
  }, [transcript, widget.id, onAction, onWidgetEvent]);

  const handleClear = () => {
    setTranscript('');
    setInterimTranscript('');
  };

  const displayText = transcript + (interimTranscript ? ` ${interimTranscript}` : '');

  return (
    <Card 
      className="p-0 flex flex-col overflow-hidden bg-gradient-to-br from-background to-muted/30"
      style={{
        width: '100%',
        height: '100%',
      }}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b bg-background/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">{widget.title}</h3>
          {!alwaysListening && (
            <Button
              size="sm"
              variant={isListening ? "destructive" : "default"}
              onClick={toggleListening}
              className="gap-2"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              <span>{isListening ? 'Stop' : 'Start'}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
        {/* Microphone Icon with Animation */}
        <div className="relative">
          <div 
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
              isListening 
                ? 'bg-primary/20 ring-4 ring-primary/30 animate-pulse' 
                : 'bg-muted'
            }`}
          >
            <Mic className={`w-10 h-10 transition-colors ${
              isListening ? 'text-primary' : 'text-muted-foreground'
            }`} />
          </div>
          
          {/* Listening Indicator Rings */}
          {isListening && (
            <>
              <div className="absolute inset-0 w-20 h-20 rounded-full bg-primary/10 animate-ping" />
              <div className="absolute inset-0 w-20 h-20 rounded-full bg-primary/5 animate-pulse" style={{ animationDelay: '0.5s' }} />
            </>
          )}
        </div>

        {/* Status Text */}
        <div className="text-center">
          {isListening ? (
            <p className="text-sm font-medium text-primary flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              Listening...
            </p>
          ) : alwaysListening ? (
            <p className="text-sm text-muted-foreground">Always listening mode</p>
          ) : (
            <p className="text-sm text-muted-foreground">Click Start to begin</p>
          )}
        </div>

        {/* Transcript Display */}
        <div className="w-full flex-1 min-h-[80px] max-h-[200px] overflow-y-auto">
          <div className="p-4 rounded-lg bg-background border border-border/50 min-h-full">
            {displayText ? (
              <p className="text-base leading-relaxed">
                <span className="text-foreground">{transcript}</span>
                {interimTranscript && (
                  <span className="text-muted-foreground italic"> {interimTranscript}</span>
                )}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground italic text-center">
                {isListening ? 'Start speaking...' : 'Your text will appear here'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {!autoSend && (
        <div className="px-4 pb-4 flex gap-2">
          <Button
            size="default"
            onClick={handleSend}
            disabled={!transcript}
            className="flex-1 gap-2"
          >
            <Send className="w-4 h-4" />
            Send Text
          </Button>
          <Button
            size="default"
            variant="outline"
            onClick={handleClear}
            disabled={!transcript && !interimTranscript}
          >
            Clear
          </Button>
        </div>
      )}
    </Card>
  );
};
