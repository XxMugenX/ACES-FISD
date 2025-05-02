function initializeDashboard() {
  // Animate growth bars
  const growthBars = document.querySelectorAll('.growth-bar');
  
  growthBars.forEach(bar => {
    const width = bar.style.width;
    bar.style.width = '0';
    
    setTimeout(() => {
      bar.style.width = width;
    }, 100);
  });
  
  // Update weather data
  updateWeatherData();
  
  // Update metrics
  updateMetrics();
}
 //Fetches weather and air quality data for Benin City, Nigeria
 // from Open-Meteo APIs for a 5-day window centered around today.
  //Includes daily temperature (max/min), weather code, hourly soil moisture,
 // and hourly air quality parameters (PM10, PM2.5, European AQI).
 
async function getBeninCityWeatherData() {
  // Coordinates for Benin City, Nigeria (approximate)
  const latitude = 6.30;
  const longitude = 5.62;

  // Define the 5-day window: today, two days before, two days after.
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 2); // Two days before

  const endDate = new Date(today);
  endDate.setDate(today.getDate() + 2); // Two days after

  // Format dates as YYYY-MM-DD for API
  const formatDate = (date) => date.toISOString().split('T')[0];
  const formattedStartDate = formatDate(startDate);
  const formattedEndDate = formatDate(endDate);

  // Base URLs for Open-Meteo APIs
  const weatherApiBaseUrl = 'https://api.open-meteo.com/v1/forecast';
  const airQualityApiBaseUrl = 'https://air-quality-api.open-meteo.com/v1/air-quality';

  // Construct the Weather API URL
  const weatherApiUrl = `${weatherApiBaseUrl}?latitude=${latitude}&longitude=${longitude}&timezone=auto&start_date=${formattedStartDate}&end_date=${formattedEndDate}&daily=temperature_2m_max,temperature_2m_min,weathercode&hourly=soil_moisture_0_to_7cm`;

  // Construct the Air Quality API URL
  const airQualityApiUrl = `${airQualityApiBaseUrl}?latitude=${latitude}&longitude=${longitude}&timezone=auto&start_date=${formattedStartDate}&end_date=${formattedEndDate}&hourly=pm10,pm25,european_aqi`; // Added common AQI parameters

  try {
    // Use Promise.all to fetch data from both APIs concurrently
    const [weatherResponse, airQualityResponse] = await Promise.all([
      fetch(weatherApiUrl),
      fetch(airQualityApiUrl)
    ]);

    // Check if both responses are OK
    if (!weatherResponse.ok) {
      throw new Error(`Weather API HTTP error! status: ${weatherResponse.status}`);
    }
    if (!airQualityResponse.ok) {
       throw new Error(`Air Quality API HTTP error! status: ${airQualityResponse.status}`);
    }

    // Parse the JSON responses
    const weatherData = await weatherResponse.json();
    const airQualityData = await airQualityResponse.json();

    // Return the combined data
    return { weatherData, airQualityData };

  } catch (error) {
    console.error("Error fetching data:", error);
    // Re-throw the error so the caller can handle it
    throw error;
  }
}



function updateWeatherData() {
  getBeninCityWeatherData()
    .then(data => {
      console.log("Successfully fetched data:");
      console.log("Weather Data:", data.weatherData);
      console.log("Air Quality Data:", data.airQualityData);
  
      // Example of how to access daily weather data
      if (data.weatherData && data.weatherData.daily) {
          console.log("\nDaily Weather Summary:");
          const daily = data.weatherData.daily;
          for(let i = 0; i < daily.time.length; i++) {
              console.log(`Date: ${daily.time[i]}`);
              console.log(`  Max Temp: ${daily.temperature_2m_max[i]}°C`);
              console.log(`  Min Temp: ${daily.temperature_2m_min[i]}°C`);
              console.log(`  Weather Code: ${daily.weathercode[i]}`); // Need to map this code to a description
          }
      }
  
      // Example of how to access hourly soil moisture data
       if (data.weatherData && data.weatherData.hourly) {
          console.log("\nHourly Soil Moisture (first few entries):");
          const hourlyWeather = data.weatherData.hourly;
          for(let i = 0; i < Math.min(5, hourlyWeather.time.length); i++) { // Log first 5 entries
              console.log(`Date/Time: ${hourlyWeather.time[i]}`);
              console.log(`  Soil Moisture (0-7cm): ${hourlyWeather.soil_moisture_0_to_7cm[i]}%`);
          }
      }
  
       // Example of how to access hourly air quality data
       if (data.airQualityData && data.airQualityData.hourly) {
          console.log("\nHourly Air Quality (first few entries):");
          const hourlyAirQuality = data.airQualityData.hourly;
           for(let i = 0; i < Math.min(5, hourlyAirQuality.time.length); i++) { // Log first 5 entries
              console.log(`Date/Time: ${hourlyAirQuality.time[i]}`);
              console.log(`  PM10: ${hourlyAirQuality.pm10[i]} µg/m³`);
              console.log(`  PM2.5: ${hourlyAirQuality.pm25[i]} µg/m³`);
              console.log(`  European AQI: ${hourlyAirQuality.european_aqi[i]}`);
          }
      }
  
  
    })
    .catch(error => {
      console.error("Failed to fetch weather and air quality data:", error);
    });
  // Simulate real-time weather updates
  setInterval(() => {
    const temps = document.querySelectorAll('.temp');
    temps.forEach(temp => {
      const currentTemp = parseInt(temp.textContent);
      const variation = Math.random() > 0.5 ? 1 : -1;
      temp.textContent = `${currentTemp + variation}°`;
    });
  }, 300000); // Update every 5 minutes
}

function updateMetrics() {
  // Simulate real-time metric updates
  setInterval(() => {
    const metrics = document.querySelectorAll('.metric-value');
    metrics.forEach(metric => {
      const currentValue = parseInt(metric.textContent);
      const variation = Math.random() > 0.5 ? 1 : -1;
      metric.textContent = `${currentValue + variation}%`;
    });
  }, 60000); // Update every minute
}