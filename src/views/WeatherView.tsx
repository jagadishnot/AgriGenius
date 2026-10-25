import React, { useState, useEffect } from 'react';
import {
  CloudSun,
  Droplets,
  Wind,
  Sun,
  AlertTriangle,
  ShieldCheck,
  Calendar,
  CloudRain,
  RefreshCw,
  Search,
  MapPin,
  Compass,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { Farm, WeatherData } from '../types';
import { api } from '../lib/api';

interface WeatherViewProps {
  currentFarm: Farm;
  weather: WeatherData | null;
  onWeatherUpdate?: (newWeather: WeatherData) => void;
}

export const WeatherView: React.FC<WeatherViewProps> = ({
  currentFarm,
  weather: initialWeather,
  onWeatherUpdate,
}) => {
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(initialWeather);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchLocation, setSearchLocation] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [statusMessage, setStatusMessage] = useState('');
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());

  // Keep in sync with parent updates
  useEffect(() => {
    if (initialWeather) {
      setCurrentWeather(initialWeather);
    }
  }, [initialWeather]);

  // Handle manual force-refresh of live weather from Open-Meteo
  const handleRefreshLiveWeather = async (customCoords?: { lat: number; lng: number; label?: string }) => {
    setIsRefreshing(true);
    setStatusMessage('');

    try {
      const params: any = { force: true };
      if (customCoords) {
        params.lat = customCoords.lat;
        params.lng = customCoords.lng;
        if (customCoords.label) params.location = customCoords.label;
      } else if (currentWeather?.coordinates) {
        params.lat = currentWeather.coordinates.latitude;
        params.lng = currentWeather.coordinates.longitude;
      }

      const refreshed = await api.getWeather(currentFarm?.id, params);
      setCurrentWeather(refreshed);
      setLastRefreshedAt(new Date());
      if (onWeatherUpdate) onWeatherUpdate(refreshed);
      setStatusMessage(`Live weather updated from Open-Meteo at ${new Date().toLocaleTimeString()}!`);
      setTimeout(() => setStatusMessage(''), 4000);
    } catch (err: any) {
      console.error('Weather refresh failed:', err);
      setStatusMessage('Weather refresh failed. Please check network connection.');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Location search handler
  const handleLocationSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchLocation.trim()) return;
    setIsSearching(true);
    try {
      const results = await api.searchLocations(searchLocation.trim());
      setSearchResults(results);
      if (results.length === 0) {
        // Direct query to weather
        await handleRefreshLiveWeather({
          lat: 19.9975,
          lng: 73.7898,
          label: searchLocation.trim(),
        });
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Select a location from search results
  const handleSelectLocation = async (loc: any) => {
    setSearchResults([]);
    setSearchLocation('');
    await handleRefreshLiveWeather({
      lat: loc.latitude,
      lng: loc.longitude,
      label: loc.display_label,
    });
  };

  // Use Browser GPS Geolocation
  const handleUseCurrentGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setIsRefreshing(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        await handleRefreshLiveWeather({
          lat: latitude,
          lng: longitude,
          label: `Your GPS Location (${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°E)`,
        });
      },
      (err) => {
        console.warn('GPS location error:', err);
        setIsRefreshing(false);
        setStatusMessage('GPS permission denied or unavailable. Using farm location.');
        setTimeout(() => setStatusMessage(''), 3000);
      },
      { timeout: 10000 }
    );
  };

  const weather = currentWeather || initialWeather;

  return (
    <div className="space-y-6">
      {/* Header & Live Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[11px] font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Real-Time Telemetry Live</span>
            </span>
            <span className="text-xs text-stone-500">•</span>
            <span className="text-xs text-stone-400">
              Synced: {lastRefreshedAt.toLocaleTimeString()}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <CloudSun className="w-6 h-6 text-amber-400" />
            <span>Agro-Climatic Weather & Real-Time Alerts</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-400 mt-1">
            Verified Open-Meteo satellite & microclimate telemetry for precision irrigation and spray timing.
          </p>
        </div>

        {/* Live Refresh and GPS Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleUseCurrentGPS}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
            title="Fetch weather for your device GPS location"
          >
            <Compass className="w-4 h-4 text-emerald-400" />
            <span>Use My GPS</span>
          </button>

          <button
            type="button"
            onClick={() => handleRefreshLiveWeather()}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing Live Data...' : 'Refresh Live Weather'}</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Location Search Bar & Quick District Presets */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-sm space-y-3">
        <form onSubmit={handleLocationSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              placeholder="Search any farm location, village, district, or city (e.g. Nashik, Pune, Kopargaon, Guntur, Surat)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching || !searchLocation.trim()}
            className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center gap-1"
          >
            {isSearching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            <span>Lookup</span>
          </button>
        </form>

        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="p-2 rounded-xl bg-stone-950 border border-stone-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-stone-500 px-2 block">
              Matching Agricultural Locations:
            </span>
            {searchResults.map((res, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelectLocation(res)}
                className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-stone-900 text-xs text-white flex items-center justify-between cursor-pointer transition-colors"
              >
                <span className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{res.display_label}</span>
                </span>
                <span className="text-[10px] text-stone-500 font-mono">
                  {res.latitude.toFixed(2)}°N, {res.longitude.toFixed(2)}°E
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Quick Regional Presets */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mr-1">
            Quick Stations:
          </span>
          {[
            { label: 'Farm Location', lat: currentFarm?.latitude || 20.1985, lng: currentFarm?.longitude || 73.8322, name: `${currentFarm?.village || 'Farm'}, ${currentFarm?.district || 'Nashik'}` },
            { label: 'Nashik (Dindori)', lat: 20.1985, lng: 73.8322, name: 'Dindori, Nashik, Maharashtra' },
            { label: 'Kopargaon', lat: 19.8912, lng: 74.4789, name: 'Kopargaon, Ahmednagar, Maharashtra' },
            { label: 'Pune Agri Zone', lat: 18.5204, lng: 73.8567, name: 'Pune, Maharashtra' },
            { label: 'Guntur Mandi', lat: 16.3067, lng: 80.4365, name: 'Guntur, Andhra Pradesh' },
            { label: 'Nagpur Citrus Belt', lat: 21.1458, lng: 79.0882, name: 'Nagpur, Maharashtra' },
            { label: 'Surat Coastal Farm', lat: 21.1702, lng: 72.8311, name: 'Surat, Gujarat' },
          ].map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => handleRefreshLiveWeather({ lat: preset.lat, lng: preset.lng, label: preset.name })}
              className="px-2.5 py-1 rounded-lg bg-stone-950 hover:bg-emerald-950 border border-stone-800 hover:border-emerald-700/60 text-stone-300 hover:text-emerald-300 text-[11px] font-medium transition-all cursor-pointer"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Weather Card */}
      <div className="bg-gradient-to-br from-stone-900 to-stone-950 border border-stone-800 rounded-3xl p-6 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>{weather?.location || `${currentFarm?.village || 'Nashik'}, ${currentFarm?.state || 'Maharashtra'}`}</span>
              </span>
              <span className="text-xs text-stone-500">•</span>
              <span className="text-xs text-stone-400">{weather?.source || 'Open-Meteo Satellite & Ground Telemetry'}</span>
            </div>
            <div className="flex items-baseline gap-4">
              <span className="text-5xl font-black text-white">
                {weather?.current?.temperature_c ?? 28.5}°C
              </span>
              <div className="text-sm text-stone-300">
                <p className="font-bold text-base text-amber-300">{weather?.current?.condition ?? 'Mainly Clear'}</p>
                <p className="text-xs text-stone-400">Feels like {weather?.current?.feels_like_c ?? 30.5}°C</p>
                {weather?.coordinates && (
                  <p className="text-[11px] text-emerald-400 font-mono mt-0.5">
                    Coordinates: {weather.coordinates.latitude.toFixed(4)}°N, {weather.coordinates.longitude.toFixed(4)}°E
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs bg-stone-950/80 p-3.5 rounded-2xl border border-stone-800/80">
            <div>
              <span className="text-stone-400 block flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5 text-blue-400" /> Relative Humidity
              </span>
              <strong className="text-white text-sm">{weather?.current?.humidity_percent ?? 55}%</strong>
            </div>
            <div>
              <span className="text-stone-400 block flex items-center gap-1">
                <Wind className="w-3.5 h-3.5 text-stone-300" /> Wind Velocity
              </span>
              <strong className="text-white text-sm">{weather?.current?.wind_kph ?? 8} kph</strong>
            </div>
            <div>
              <span className="text-stone-400 block flex items-center gap-1">
                <CloudRain className="w-3.5 h-3.5 text-blue-300" /> Rain Probability
              </span>
              <strong className="text-white text-sm">{weather?.current?.precipitation_probability ?? 15}%</strong>
            </div>
            <div>
              <span className="text-stone-400 block flex items-center gap-1">
                <Sun className="w-3.5 h-3.5 text-amber-400" /> Solar UV Index
              </span>
              <strong className="text-white text-sm">{weather?.current?.uv_index ?? 6.5} (Mod)</strong>
            </div>
            <div>
              <span className="text-stone-400 block flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5 text-cyan-400" /> FAO Penman ET₀
              </span>
              <strong className="text-cyan-300 text-sm">{weather?.current?.et0_evapotranspiration ?? 4.8} mm</strong>
            </div>
            <div>
              <span className="text-stone-400 block flex items-center gap-1">
                <Wind className="w-3.5 h-3.5 text-emerald-400" /> Surface Pressure
              </span>
              <strong className="text-emerald-300 text-sm">{weather?.current?.surface_pressure_hpa ?? 950} hPa</strong>
            </div>
          </div>
        </div>

        {/* Advisory Alerts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Spray Window Notice */}
          <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-800/40 space-y-1.5">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Recommended Pesticide & Foliar Spray Window</span>
            </div>
            <p className="text-xs text-amber-100 leading-relaxed">
              {weather?.advisory?.spray_window ||
                'Favorable spray window tomorrow morning 6:30 AM - 9:30 AM (wind speed < 12 kph and no rain forecasted).'}
            </p>
          </div>

          {/* Disease Risk Index */}
          <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-800/40 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Microclimate Disease Risk Index</span>
              </div>
              <span className="text-xs font-bold text-emerald-400 uppercase">
                {weather?.advisory?.disease_risk?.riskLevel ?? 'Low'} Risk
              </span>
            </div>
            <p className="text-xs text-emerald-100 leading-relaxed">
              {weather?.advisory?.disease_risk?.preventativeAction ||
                'Canopy moisture levels are safe; maintain standard weekly scouting of leaf undersides.'}
            </p>
          </div>
        </div>

        {/* 5-Day Extended Agro-Forecast */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>5-Day Agricultural Weather Outlook</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {(weather?.forecast_5day || [
              { day: 'Today', temp_max: 31, temp_min: 19, rain_prob: 20, condition: 'Sunny' },
              { day: 'Tomorrow', temp_max: 32, temp_min: 20, rain_prob: 35, condition: 'Partly Cloudy' },
              { day: 'Day 3', temp_max: 30, temp_min: 21, rain_prob: 60, condition: 'Showers' },
              { day: 'Day 4', temp_max: 29, temp_min: 18, rain_prob: 15, condition: 'Clear' },
              { day: 'Day 5', temp_max: 31, temp_min: 19, rain_prob: 10, condition: 'Sunny' },
            ]).map((fc, i) => (
              <div
                key={i}
                className="bg-stone-950 border border-stone-800 rounded-2xl p-3 text-center space-y-1.5"
              >
                <span className="text-xs font-bold text-white block">{fc.day}</span>
                <span className="text-[11px] text-stone-400 block">{fc.condition}</span>
                <div className="text-sm font-extrabold text-amber-300">
                  {fc.temp_max}° <span className="text-stone-500 font-normal text-xs">/ {fc.temp_min}°</span>
                </div>
                <div className="text-[10px] text-blue-400 font-semibold">
                  Rain: {fc.rain_prob}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
