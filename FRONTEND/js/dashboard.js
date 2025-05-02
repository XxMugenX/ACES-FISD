document.addEventListener('DOMContentLoaded', () => {
//  initializeDashboard();
});

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
    // Set up event listeners
  const citySelect = document.getElementById('city-select');
  citySelect.addEventListener('change', handleCityChange);
  
  // Initial data fetch
  fetchWeatherData('benin-city');
  
  // Set up intervals for real-time updates
  setUpIntervals();
  
  // Update dates for the forecast
  updateForecastDates();

}


// Weather API configuration
const API_KEY = 'f989c7738b11457b5b178533a0a09dd2'; // Replace with actual API key
const WEATHER_API_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// City coordinates in Edo State
const cityCoordinates = {
  'benin-city': { lat: 6.3350, lon: 5.6037, name: 'Benin City' },
  'auchi': { lat: 7.0675, lon: 6.2661, name: 'Auchi' },
  'ekpoma': { lat: 6.7437, lon: 6.1364, name: 'Ekpoma' },
  'uromi': { lat: 6.7015, lon: 6.3288, name: 'Uromi' },
  'igarra': { lat: 7.2935, lon: 6.1086, name: 'Igarra' }
};

// Weather condition icons mapping
const weatherIcons = {
  'Clear': '☀️',
  'Clouds': '☁️',
  'Rain': '🌧️',
  'Drizzle': '🌦️',
  'Thunderstorm': '⛈️',
  'Snow': '❄️',
  'Mist': '🌫️',
  'Fog': '🌫️',
  'Haze': '🌫️',
  'Dust': '💨',
  'Smoke': '💨',
  'Tornado': '🌪️',
  'default': '🌤️'
};



// Handle city selection change
function handleCityChange(event) {
  const selectedCity = event.target.value;
  fetchWeatherData(selectedCity);
}

// Fetch weather data from API
async function fetchWeatherData(cityId) {
  try {
    showLoading(true);
    
    const city = cityCoordinates[cityId];
    if (!city) {
      console.error('City not found');
      return;
    }
    
    // Fetch current weather
    const currentWeatherUrl = `${WEATHER_API_BASE_URL}/weather?lat=${city.lat}&lon=${city.lon}&units=metric&appid=${API_KEY}`;
    const currentWeatherResponse = await fetchWithFallback(currentWeatherUrl);
    
    // Fetch forecast
    const forecastUrl = `${WEATHER_API_BASE_URL}/forecast?lat=${city.lat}&lon=${city.lon}&units=metric&appid=${API_KEY}`;
    const forecastResponse = await fetchWithFallback(forecastUrl);
    
    // Fetch air pollution data
    const airPollutionUrl = `${WEATHER_API_BASE_URL}/air_pollution?lat=${city.lat}&lon=${city.lon}&appid=${API_KEY}`;
    const airPollutionResponse = await fetchWithFallback(airPollutionUrl);
    
    // Update UI with fetched data
    updateCurrentWeather(currentWeatherResponse);
    updateForecast(forecastResponse);
    updateAirQuality(airPollutionResponse);
    
    // Simulate soil data (since real API won't have this)
    updateSoilData(city);
    
    showLoading(false);
  } catch (error) {
    console.error('Error fetching weather data:', error);
    showLoading(false);
    // Use mock data when API fails
    useMockData(cityId);
  }
}

// Fallback fetch function with retry logic
async function fetchWithFallback(url, retries = 3) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying... (${retries} attempts left)`);
      return fetchWithFallback(url, retries - 1);
    } else {
      throw error;
    }
  }
}

// Update current weather UI
function updateCurrentWeather(data) {
  if (!data) return;
  
  const airTempValue = document.querySelector('#airTempValue');
  airTempValue.textContent = `${data.main.temp.toFixed(2)} °C`;
  
  // Update the spray card title based on weather condition
  const sprayCardTitle = document.querySelector('.spray-card h3');
  const isGoodForSpraying = isWeatherGoodForSpraying(data);
  sprayCardTitle.textContent = isGoodForSpraying 
    ? "It's the perfect day for spraying" 
    : "Not recommended for spraying today";
  
  if (!isGoodForSpraying) {
    sprayCardTitle.style.color = '#d9534f';
  } else {
    sprayCardTitle.style.color = '';
  }
}

// Determine if weather is good for spraying
function isWeatherGoodForSpraying(weatherData) {

  const temp = weatherData.main.temp;
  const windSpeed = weatherData.wind.speed;
  const weatherCondition = weatherData.weather[0].main;
  
  const noRain = !['Rain', 'Thunderstorm', 'Drizzle'].includes(weatherCondition);
  const moderateWind = windSpeed < 5.5; // m/s (about 20 km/h)
  const goodTemp = temp > 10 && temp < 30;
  
  return noRain && moderateWind && goodTemp;
}

// Update forecast UI
function updateForecast(data) {
  if (!data || !data.list) return;
  
  const weatherColumn = document.getElementById('weather-column');
  weatherColumn.innerHTML = '';
  
  // Group forecast by day and get next 4 days
  const forecastByDay = groupForecastByDay(data.list);
  const nextFourDays = Object.keys(forecastByDay).slice(0, 4);
  
  nextFourDays.forEach(day => {
    const dayData = forecastByDay[day];
    const midDayForecast = dayData[Math.floor(dayData.length / 2)]; // Get middle of day forecast
    
    const weatherItem = document.createElement('div');
    weatherItem.className = 'weather-item';
    
    const tempElement = document.createElement('div');
    tempElement.className = 'temp';
    tempElement.textContent = `${Math.round(midDayForecast.main.temp)}°`;
    
    const conditionElement = document.createElement('div');
    conditionElement.className = 'condition';
    conditionElement.textContent = midDayForecast.weather[0].description;
    
    const iconElement = document.createElement('div');
    iconElement.className = 'weather-icon';
    const weatherMain = midDayForecast.weather[0].main;
    iconElement.textContent = weatherIcons[weatherMain] || weatherIcons.default;
    
    weatherItem.appendChild(tempElement);
    weatherItem.appendChild(conditionElement);
    weatherItem.appendChild(iconElement);
    
    weatherColumn.appendChild(weatherItem);
  });
}

// Group forecast data by day
function groupForecastByDay(forecastList) {
  const forecastByDay = {};
  
  forecastList.forEach(item => {
    const date = new Date(item.dt * 1000);
    const day = date.toISOString().split('T')[0];
    
    if (!forecastByDay[day]) {
      forecastByDay[day] = [];
    }
    
    forecastByDay[day].push(item);
  });
  
  return forecastByDay;
}

// Update air quality UI
function updateAirQuality(data) {
  if (!data || !data.list || !data.list[0]) return;
  
  const airQualityData = data.list[0];
  const airQualityIndex = airQualityData.main.aqi; // 1(Good) to 5(Very Poor)
  
  const airQualityElement = document.getElementById('airQuality');
  
  // Convert AQI to percentage (simplified)
  const qualityPercentage = Math.max(0, 100 - (airQualityIndex - 1) * 20);
  airQualityElement.textContent = `${qualityPercentage}%`;
  
  // Color coding based on quality
  if (qualityPercentage > 80) {
    airQualityElement.style.color = '#4CAF50'; // Green
  } else if (qualityPercentage > 60) {
    airQualityElement.style.color = '#8BC34A'; // Light green
  } else if (qualityPercentage > 40) {
    airQualityElement.style.color = '#FFC107'; // Amber
  } else if (qualityPercentage > 20) {
    airQualityElement.style.color = '#FF9800'; // Orange
  } else {
    airQualityElement.style.color = '#F44336'; // Red
  }
}

// Update soil data (simulated)
function updateSoilData(city) {
  const soilMoistureRandom = 15 + Math.floor(Math.random() * 35); // 15-50%
  const fertilityRandom = 70 + Math.floor(Math.random() * 30); // 70-100%
  const pHValue = 6.5 + (Math.random() * 1.5 - 0.75); // pH 5.75-8.0
  
  // Apply some city-specific biases
  let soilMoisture = soilMoistureRandom;
  let fertility = fertilityRandom;
  let pH = pHValue;
  
  switch (city.name) {
    case 'Benin City':
      soilMoisture += 5;
      break;
    case 'Auchi':
      fertility += 5;
      break;
    case 'Ekpoma':
      pH += 0.3;
      break;
    case 'Uromi':
      soilMoisture -= 3;
      fertility += 2;
      break;
    case 'Igarra':
      pH -= 0.2;
      soilMoisture += 2;
      break;
  }
  
  // Ensure values stay within reasonable ranges
  soilMoisture = Math.min(Math.max(soilMoisture, 10), 60);
  fertility = Math.min(Math.max(fertility, 50), 100);
  pH = Math.min(Math.max(pH, 5.5), 8.5);
  
  // Update UI
  document.getElementById('soilMoisture').textContent = `${Math.round(soilMoisture)}%`;
  document.getElementById('landFertility').textContent = `${Math.round(fertility)}%`;
  document.getElementById('pHValue').textContent = `pH${pH.toFixed(1)}`;
}

// Update forecast dates
function updateForecastDates() {
  const dateColumn = document.getElementById('date-column');
  dateColumn.innerHTML = '';
  
  const today = new Date();
  
  for (let i = 0; i < 4; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    const dateItem = document.createElement('div');
    dateItem.className = 'date-item';
    
    const dayElement = document.createElement('h3');
    dayElement.textContent = date.getDate();
    
    const monthElement = document.createElement('p');
    monthElement.textContent = date.toLocaleString('default', { month: 'long' });
    
    dateItem.appendChild(dayElement);
    dateItem.appendChild(monthElement);
    dateColumn.appendChild(dateItem);
  }
}

// Set up intervals for real-time updates
function setUpIntervals() {
  // Update temperature data every 5 minutes
  setInterval(() => {
    const selectedCity = document.getElementById('city-select').value;
    fetchWeatherData(selectedCity);
  }, 300000);
  
  // Update metrics with small variations every minute
  setInterval(updateMetricsWithVariation, 60000);
}

// Update metrics with small variations
function updateMetricsWithVariation() {
  const airQuality = document.getElementById('airQuality');
  const soilMoisture = document.getElementById('soilMoisture');
  const landFertility = document.getElementById('landFertility');
  const airTemp = document.getElementById('airTempValue');
  const pH = document.getElementById('pHValue');
  
  // Extract current values
  const currentAirQuality = parseInt(airQuality.textContent);
  const currentSoilMoisture = parseInt(soilMoisture.textContent);
  const currentLandFertility = parseInt(landFertility.textContent);
  const currentAirTemp = parseFloat(airTemp.textContent);
  const currentPH = parseFloat(pH.textContent.replace('pH', ''));
  
  // Apply small random variations
  const airQualityVariation = Math.random() > 0.5 ? 1 : -1;
  const soilMoistureVariation = Math.random() > 0.5 ? 1 : -1;
  const landFertilityVariation = Math.random() > 0.5 ? 1 : -1;
  const airTempVariation = (Math.random() * 0.2 - 0.1).toFixed(2);
  const pHVariation = (Math.random() * 0.2 - 0.1).toFixed(1);
  
  // Update UI with new values
  airQuality.textContent = `${currentAirQuality + airQualityVariation}%`;
  soilMoisture.textContent = `${currentSoilMoisture + soilMoistureVariation}%`;
  landFertility.textContent = `${currentLandFertility + landFertilityVariation}%`;
  airTemp.textContent = `${(currentAirTemp + parseFloat(airTempVariation)).toFixed(2)} °C`;
  pH.textContent = `pH${(currentPH + parseFloat(pHVariation)).toFixed(1)}`;
}

// Show or hide loading state
function showLoading(isLoading) {
  const cards = document.querySelectorAll('.spray-card, .weather-card, .metrics-card');
  
  if (isLoading) {
    cards.forEach(card => {
      card.classList.add('loading');
      card.dataset.originalContent = card.innerHTML;
      card.innerHTML = '';
    });
  } else {
    cards.forEach(card => {
      if (card.dataset.originalContent) {
        card.classList.remove('loading');
        card.innerHTML = card.dataset.originalContent;
        delete card.dataset.originalContent;
      }
    });
  }
}

// Use mock data when API fails
function useMockData(cityId) {
  const city = cityCoordinates[cityId];
  
  // Mock current weather
  updateCurrentWeather({
    main: { temp: 25 + Math.random() * 5 },
    wind: { speed: 2 + Math.random() * 3 },
    weather: [{ main: 'Clear', description: 'clear sky' }]
  });
  
  // Mock forecast
  const mockForecast = {
    list: []
  };
  
  const today = new Date();
  for (let i = 0; i < 4; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    for (let hour = 0; hour < 24; hour += 3) {
      date.setHours(hour);
      mockForecast.list.push({
        dt: Math.floor(date.getTime() / 1000),
        main: {
          temp: 22 + Math.random() * 10
        },
        weather: [{
          main: ['Clear', 'Clouds', 'Rain'][Math.floor(Math.random() * 3)],
          description: 'mock weather'
        }]
      });
    }
  }
  
  updateForecast(mockForecast);
  
  // Mock air quality
  updateAirQuality({
    list: [{
      main: {
        aqi: Math.floor(Math.random() * 3) + 1 // 1-3 (Good to Moderate)
      }
    }]
  });
  
  // Simulate soil data
  updateSoilData(city);
  
  // Update dates
  updateForecastDates();
}