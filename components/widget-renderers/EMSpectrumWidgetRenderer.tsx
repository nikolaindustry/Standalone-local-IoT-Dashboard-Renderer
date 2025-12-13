/**
 * EMSpectrumWidgetRenderer Component
 * 
 * A comprehensive electromagnetic spectrum visualization widget for the IoT Dashboard Builder.
 * 
 * Features:
 * - Displays all EM spectrum bands (Radio to Gamma Ray)
 * - Customizable orientation (horizontal/vertical)
 * - Label positioning (inside/outside bands)
 * - Wavelength and frequency information display
 * - Band highlighting with glow effects
 * - Interactive hover tooltips
 * - Legend display
 * - Full design customization (colors, sizes, spacing)
 * - Responsive layout support
 * 
 * Configuration Options:
 * - Band dimensions and spacing
 * - Label styles and positioning
 * - Highlight effects and animations
 * - Container visibility
 * - Custom title
 * 
 * Use Cases:
 * - Educational dashboards
 * - Radio frequency monitoring
 * - Spectrum analyzer interfaces
 * - Scientific visualization
 * - IoT wireless communication displays
 * 
 * @component
 */

import React from 'react';
import { IoTDashboardWidget } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface EMSpectrumWidgetRendererProps {
  widget: IoTDashboardWidget;
  localValue?: any;
  commonStyles: React.CSSProperties;
  isDesignMode?: boolean;
}

// Electromagnetic spectrum bands with wavelengths
const spectrumBands = [
  { name: 'Radio', color: '#8B4513', start: 0, end: 10, wavelength: '> 1m' },
  { name: 'Microwave', color: '#A0522D', start: 10, end: 15, wavelength: '1mm - 1m' },
  { name: 'Infrared', color: '#FF0000', start: 15, end: 30, wavelength: '780nm - 1mm' },
  { name: 'Visible', color: 'linear-gradient(to right, #8B00FF, #0000FF, #00FF00, #FFFF00, #FF7F00, #FF0000)', start: 30, end: 45, wavelength: '380-780nm' },
  { name: 'Ultraviolet', color: '#9370DB', start: 45, end: 60, wavelength: '10-380nm' },
  { name: 'X-Ray', color: '#4169E1', start: 60, end: 80, wavelength: '0.01-10nm' },
  { name: 'Gamma Ray', color: '#000080', start: 80, end: 100, wavelength: '< 0.01nm' }
];

export const EMSpectrumWidgetRenderer: React.FC<EMSpectrumWidgetRendererProps> = ({
  widget,
  localValue,
  commonStyles,
  isDesignMode = false
}) => {
  // Configuration options with defaults
  const showLabels = widget.config.emShowLabels !== false;
  const showWavelengths = widget.config.emShowWavelengths !== false;
  const showContainer = widget.config.emShowContainer !== false;
  const orientation = widget.config.emOrientation || 'horizontal';
  const showTitle = widget.config.emShowTitle !== false;
  const customTitle = widget.config.emCustomTitle || 'Electromagnetic Spectrum';
  const bandHeight = widget.config.emBandHeight || 60;
  const labelPosition = widget.config.emLabelPosition || 'inside';
  const labelColor = widget.config.emLabelColor || '#ffffff';
  const labelFontSize = widget.config.emLabelFontSize || 12;
  const wavelengthFontSize = widget.config.emWavelengthFontSize || 10;
  const borderRadius = widget.config.emBorderRadius || 8;
  const bandSpacing = widget.config.emBandSpacing || 0;
  const showFrequency = widget.config.emShowFrequency !== false;
  const frequencyUnit = widget.config.emFrequencyUnit || 'Hz';
  const highlightBand = widget.config.emHighlightBand;
  const highlightColor = widget.config.emHighlightColor || '#FFD700';
  const highlightOpacity = widget.config.emHighlightOpacity || 0.3;
  const customBands = widget.config.emCustomBands || spectrumBands;
  const showLegend = widget.config.emShowLegend !== false;
  const animateHighlight = widget.config.emAnimateHighlight !== false;
  
  // Frequency ranges (approximations in Hz)
  const frequencyRanges: Record<string, string> = {
    'Radio': '< 300 GHz',
    'Microwave': '300 MHz - 300 GHz',
    'Infrared': '300 GHz - 400 THz',
    'Visible': '400 - 790 THz',
    'Ultraviolet': '750 THz - 30 PHz',
    'X-Ray': '30 PHz - 30 EHz',
    'Gamma Ray': '> 30 EHz'
  };

  const renderSpectrum = () => {
    const isVertical = orientation === 'vertical';
    
    return (
      <div 
        className={`relative w-full h-full ${isVertical ? 'flex flex-col' : 'flex flex-row'}`}
        style={{
          gap: `${bandSpacing}px`
        }}
      >
        {customBands.map((band, index) => {
          const isHighlighted = highlightBand === band.name;
          const bandStyle: React.CSSProperties = {
            background: band.color,
            flex: isVertical ? `${band.end - band.start}` : `${band.end - band.start}`,
            height: isVertical ? 'auto' : `${bandHeight}px`,
            width: isVertical ? `${bandHeight}px` : 'auto',
            borderRadius: `${borderRadius}px`,
            position: 'relative',
            overflow: 'hidden',
            transition: animateHighlight ? 'all 0.3s ease-in-out' : 'none',
            border: isHighlighted ? `2px solid ${highlightColor}` : 'none',
            boxShadow: isHighlighted ? `0 0 20px ${highlightColor}` : 'none'
          };

          if (isHighlighted) {
            bandStyle.filter = `brightness(1.2)`;
          }

          return (
            <div
              key={index}
              style={bandStyle}
              className="group relative"
            >
              {/* Highlight overlay */}
              {isHighlighted && (
                <div
                  className={`absolute inset-0 ${animateHighlight ? 'animate-pulse' : ''}`}
                  style={{
                    background: highlightColor,
                    opacity: highlightOpacity
                  }}
                />
              )}

              {/* Labels */}
              {showLabels && labelPosition === 'inside' && (
                <div
                  className="absolute inset-0 flex items-center justify-center p-2"
                  style={{
                    color: labelColor,
                    fontSize: `${labelFontSize}px`,
                    fontWeight: 'bold',
                    textAlign: 'center',
                    textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                    zIndex: 10
                  }}
                >
                  <div className={isVertical ? 'transform -rotate-90 whitespace-nowrap' : ''}>
                    {band.name}
                  </div>
                </div>
              )}

              {/* Wavelength info */}
              {showWavelengths && (
                <div
                  className="absolute bottom-1 left-0 right-0 text-center px-1"
                  style={{
                    color: labelColor,
                    fontSize: `${wavelengthFontSize}px`,
                    textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                    zIndex: 10
                  }}
                >
                  <div className={isVertical ? 'transform -rotate-90 whitespace-nowrap' : ''}>
                    {band.wavelength}
                  </div>
                </div>
              )}

              {/* Frequency info */}
              {showFrequency && (
                <div
                  className="absolute top-1 left-0 right-0 text-center px-1"
                  style={{
                    color: labelColor,
                    fontSize: `${wavelengthFontSize}px`,
                    textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                    zIndex: 10
                  }}
                >
                  <div className={isVertical ? 'transform -rotate-90 whitespace-nowrap' : ''}>
                    {frequencyRanges[band.name]}
                  </div>
                </div>
              )}

              {/* Hover tooltip */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 flex items-center justify-center p-2">
                <div className="text-white text-xs text-center">
                  <div className="font-bold">{band.name}</div>
                  <div>{band.wavelength}</div>
                  {showFrequency && <div className="text-[10px]">{frequencyRanges[band.name]}</div>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderLegend = () => {
    if (!showLegend) return null;

    return (
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-xs">
        {customBands.map((band, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ background: band.color }}
            />
            <span className="font-medium">{band.name}</span>
          </div>
        ))}
      </div>
    );
  };

  // External labels
  const renderExternalLabels = () => {
    if (!showLabels || labelPosition !== 'outside') return null;

    const isVertical = orientation === 'vertical';

    return (
      <div className={`${isVertical ? 'flex flex-col ml-2' : 'flex flex-row mt-2'} gap-${bandSpacing > 0 ? bandSpacing : 0}`}>
        {customBands.map((band, index) => (
          <div
            key={index}
            style={{
              flex: `${band.end - band.start}`,
              fontSize: `${labelFontSize}px`,
              fontWeight: 'bold',
              textAlign: 'center',
              color: commonStyles.color || '#000000'
            }}
          >
            {band.name}
          </div>
        ))}
      </div>
    );
  };

  if (!showContainer) {
    return (
      <div className="h-full w-full flex flex-col" style={commonStyles}>
        {showTitle && (
          <h3 className="text-lg font-bold mb-2 text-center">{customTitle}</h3>
        )}
        {renderSpectrum()}
        {labelPosition === 'outside' && renderExternalLabels()}
        {renderLegend()}
      </div>
    );
  }

  return (
    <Card className="h-full" style={commonStyles}>
      {showTitle && (
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            <span>{customTitle}</span>
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className="pt-0 p-4">
        {renderSpectrum()}
        {labelPosition === 'outside' && renderExternalLabels()}
        {renderLegend()}
        {isDesignMode && (
          <div className="text-xs text-muted-foreground text-center mt-2">
            EM Spectrum Widget
          </div>
        )}
      </CardContent>
    </Card>
  );
};
