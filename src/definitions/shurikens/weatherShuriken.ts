import { z } from 'zod';
import { Shuriken } from '../../core/shuriken.js';

const weatherSchema = z.object({
  city: z.string().describe('The city name to get weather for'),
  unit: z.enum(['celsius', 'fahrenheit']).optional().describe('Temperature unit preference')
});

async function getWeatherImplementation(params: { city: string; unit?: 'celsius' | 'fahrenheit' }) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const temp = params.unit === 'celsius' ? 22 : 72;
  const unitSymbol = params.unit === 'celsius' ? '°C' : '°F';
  
  return {
    city: params.city,
    temperature: temp,
    unit: unitSymbol,
    condition: 'Partly cloudy',
    humidity: 65,
    windSpeed: '10 km/h',
    forecast: {
      tomorrow: `${temp + 2}${unitSymbol} - Sunny`,
      dayAfter: `${temp - 1}${unitSymbol} - Light rain`
    }
  };
}

export const weatherShuriken = new Shuriken(
  'get_weather',
  'Get current weather information and short-term forecast for a specific city',
  weatherSchema,
  getWeatherImplementation
);