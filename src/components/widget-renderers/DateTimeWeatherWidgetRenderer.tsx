import React, { useState, useEffect } from 'react';
import { IoTDashboardWidget } from '../../types';
import { Card, CardContent } from '@/components/ui/card';
import { Cloud, CloudRain, CloudSnow, Sun, CloudDrizzle, Wind, Thermometer, MapPin, Clock } from 'lucide-react';

interface DateTimeWeatherWidgetRendererProps {
  widget: IoTDashboardWidget;
  commonStyles: React.CSSProperties;
  isDesignMode?: boolean;
}

interface WeatherData {
  temperature: number;
  condition: string;
  location: string;
  icon: string;
}

export const DateTimeWeatherWidgetRenderer: React.FC<DateTimeWeatherWidgetRendererProps> = ({
  widget,
  commonStyles,
  isDesignMode = false
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weatherData, setWeatherData] = useState<WeatherData>({
    temperature: 22,
    condition: 'Sunny',
    location: widget.config.location || 'Default Location',
    icon: 'sun'
  });
  const [loading, setLoading] = useState(false);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Fetch weather data
  useEffect(() => {
    if (isDesignMode) return;

    const fetchWeather = async () => {
      setLoading(true);
      try {
        // If API endpoint is configured, fetch from there
        if (widget.config.weatherApiEndpoint) {
          const response = await fetch(widget.config.weatherApiEndpoint);
          const data = await response.json();
          
          setWeatherData({
            temperature: data.temperature || data.temp || 22,
            condition: data.condition || data.weather || 'Sunny',
            location: data.location || widget.config.location || 'Default Location',
            icon: data.icon || getWeatherIcon(data.condition || 'sunny')
          });
        } else {
          // Use mock data if no API is configured
          setWeatherData({
            temperature: 22,
            condition: 'Sunny',
            location: widget.config.location || 'Default Location',
            icon: 'sun'
          });
        }
      } catch (error) {
        console.error('Error fetching weather:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();

    // Refresh weather data at configured interval (default: 30 minutes)
    const refreshInterval = (widget.config.weatherRefreshInterval || 30) * 60 * 1000;
    const weatherTimer = setInterval(fetchWeather, refreshInterval);

    return () => clearInterval(weatherTimer);
  }, [widget.config.weatherApiEndpoint, widget.config.location, widget.config.weatherRefreshInterval, isDesignMode]);

  const getWeatherIcon = (condition: string) => {
    const lowerCondition = condition.toLowerCase();
    if (lowerCondition.includes('rain')) return 'rain';
    if (lowerCondition.includes('snow')) return 'snow';
    if (lowerCondition.includes('cloud')) return 'cloud';
    if (lowerCondition.includes('drizzle')) return 'drizzle';
    if (lowerCondition.includes('wind')) return 'wind';
    return 'sun';
  };

  const WeatherIcon = () => {
    const iconName = weatherData.icon || getWeatherIcon(weatherData.condition);
    const iconProps = { className: "w-12 h-12", strokeWidth: 1.5 };
    
    switch (iconName) {
      case 'rain':
        return <CloudRain {...iconProps} />;
      case 'snow':
        return <CloudSnow {...iconProps} />;
      case 'cloud':
        return <Cloud {...iconProps} />;
      case 'drizzle':
        return <CloudDrizzle {...iconProps} />;
      case 'wind':
        return <Wind {...iconProps} />;
      case 'sun':
      default:
        return <Sun {...iconProps} />;
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: widget.config.use12Hour !== false
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: widget.config.showWeekday !== false ? 'long' : undefined,
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const showWeather = widget.config.showWeather !== false;
  const showDate = widget.config.showDate !== false;
  const showTime = widget.config.showTime !== false;
  const showContainer = widget.config.showContainer !== false;
  const iconColor = widget.config.iconColor || widget.style?.textColor;

  const content = (
    <div className={`p-4 h-full flex flex-col justify-center ${!showContainer ? 'w-full' : ''}`}>
      {/* Time Display */}
      {showTime && (
        <div className="text-center mb-2">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Clock className="w-5 h-5 opacity-70" style={{ color: iconColor }} />
            <h2 
              className="font-bold"
              style={{
                fontSize: widget.style?.fontSize || '2rem',
                color: widget.style?.textColor
              }}
            >
              {formatTime(currentTime)}
            </h2>
          </div>
        </div>
      )}

      {/* Date Display */}
      {showDate && (
        <div className="text-center mb-3">
          <p 
            className="opacity-80"
            style={{
              fontSize: widget.style?.fontSize ? `calc(${widget.style.fontSize} * 0.5)` : '1rem',
              color: widget.style?.textColor
            }}
          >
            {formatDate(currentTime)}
          </p>
        </div>
      )}

      {/* Weather Display */}
      {showWeather && (
        <div className="border-t pt-3 mt-2">
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center justify-center" style={{ color: iconColor }}>
              <WeatherIcon />
            </div>
            
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <Thermometer className="w-5 h-5 opacity-70" style={{ color: iconColor }} />
                <span 
                  className="font-semibold"
                  style={{
                    fontSize: widget.style?.fontSize ? `calc(${widget.style.fontSize} * 0.75)` : '1.5rem',
                    color: widget.style?.textColor
                  }}
                >
                  {weatherData.temperature}°{widget.config.temperatureUnit || 'C'}
                </span>
              </div>
              
              <p 
                className="opacity-80"
                style={{
                  fontSize: widget.style?.fontSize ? `calc(${widget.style.fontSize} * 0.4)` : '0.875rem',
                  color: widget.style?.textColor
                }}
              >
                {weatherData.condition}
              </p>
              
              <div className="flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3 opacity-60" style={{ color: iconColor }} />
                <p 
                  className="opacity-60 text-xs"
                  style={{ color: widget.style?.textColor }}
                >
                  {weatherData.location}
                </p>
              </div>
            </div>
          </div>
          
          {loading && (
            <p className="text-xs text-center mt-2 opacity-50" style={{ color: widget.style?.textColor }}>
              Updating weather...
            </p>
          )}
        </div>
      )}
    </div>
  );

  if (!showContainer) {
    return (
      <div
        className="h-full w-full"
        style={{
          ...commonStyles,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {content}
      </div>
    );
  }

  return (
    <Card 
      className="h-full w-full overflow-hidden"
      style={{
        ...commonStyles,
        border: widget.style?.borderWidth ? `${widget.style.borderWidth} solid ${widget.style.borderColor || 'hsl(var(--border))'}` : undefined
      }}
    >
      <CardContent className="p-0 h-full">
        {content}
      </CardContent>
    </Card>
  );
};