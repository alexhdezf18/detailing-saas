"use client";

import { useEffect, useState } from "react";
import {
  CloudRain,
  Sun,
  Cloud,
  CloudLightning,
  Thermometer,
} from "lucide-react";
import { format } from "date-fns";

interface WeatherProps {
  date: Date | undefined;
}

export function WeatherWidget({ date }: WeatherProps) {
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Coordenadas de Chihuahua, CUU
  const LAT = 28.6353;
  const LON = -106.0889;

  useEffect(() => {
    async function fetchWeather() {
      if (!date) return;

      setLoading(true);
      try {
        const dateStr = format(date, "yyyy-MM-dd");

        // Pedimos clima para ese día específico
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&daily=weather_code,temperature_2m_max,precipitation_probability_max&timezone=auto&start_date=${dateStr}&end_date=${dateStr}`,
        );
        const data = await res.json();

        if (data.daily) {
          setWeather({
            code: data.daily.weather_code[0],
            tempMax: data.daily.temperature_2m_max[0],
            rainChance: data.daily.precipitation_probability_max[0],
          });
        }
      } catch (error) {
        console.error("Error clima:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
  }, [date]);

  if (!date) return null;

  // Lógica para elegir icono según código WMO
  const getWeatherIcon = (code: number) => {
    if (code <= 1) return <Sun className="h-8 w-8 text-yellow-500" />;
    if (code <= 3) return <Cloud className="h-8 w-8 text-gray-400" />;
    if (code <= 67) return <CloudRain className="h-8 w-8 text-blue-400" />;
    if (code >= 95)
      return <CloudLightning className="h-8 w-8 text-purple-500" />;
    return <CloudRain className="h-8 w-8 text-blue-400" />; // Default lluvia
  };

  const getRecomendation = (rainChance: number) => {
    if (rainChance > 50) return "⚠️ Alto riesgo de lluvia. ¿Seguro?";
    if (rainChance > 20) return "☁️ Posible lluvia ligera.";
    return "☀️ ¡Excelente día para lavar!";
  };

  if (loading)
    return (
      <div className="text-xs text-zinc-500 animate-pulse">
        Consultando clima...
      </div>
    );
  if (!weather) return null;

  return (
    <div
      className={`mt-4 p-4 rounded-lg border ${weather.rainChance > 50 ? "bg-red-950/20 border-red-900" : "bg-blue-950/20 border-blue-900"}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getWeatherIcon(weather.code)}
          <div>
            <p className="text-sm font-medium text-zinc-200">
              Pronóstico {format(date, "d MMM")}
            </p>
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <span className="flex items-center">
                <Thermometer className="h-3 w-3 mr-1" /> {weather.tempMax}°C
              </span>
              <span className="flex items-center text-blue-400">
                <CloudRain className="h-3 w-3 mr-1" /> {weather.rainChance}%
                Lluvia
              </span>
            </div>
          </div>
        </div>
      </div>
      <p
        className={`text-xs mt-2 font-medium ${weather.rainChance > 50 ? "text-red-400" : "text-green-400"}`}
      >
        {getRecomendation(weather.rainChance)}
      </p>
    </div>
  );
}
