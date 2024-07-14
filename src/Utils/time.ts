import { WeatherGenerator } from "@spt/generators/WeatherGenerator";
import { IWeatherData } from "@spt/models/eft/weather/IWeatherData";


export function getCurrentTime(weatherGenerator: WeatherGenerator): string 
{
    let result: IWeatherData = { acceleration: 0, time: "", date: "", weather: undefined, season: 1 }; 

    result = weatherGenerator.calculateGameTime(result);

    return result.time;
}

export function getCurrentHour(currentTime: string, timeVariant: string): number 
{
    const [hourStr, minStr, secStr] = currentTime.split(":");
    const hour = parseInt(hourStr);

    if (timeVariant === "PAST") 
    {
        return Math.abs(hour - 12);
    }
    return hour;
}

export function nightTimeCheck(currentTime: string, timeVariant: string, location: string): boolean 
{
    let currentHour;
    switch (location)
    {
        case "factory4_night":
            return true;
        case "factory4_day":
            return false;
        case "laboratory":
            return false;
        default:
            currentHour = getCurrentHour(currentTime, timeVariant);
            if (currentHour >= 22 || currentHour <= 5) return true;
            return false;
    }
}