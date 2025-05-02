// Initialize analytics page functionality
const cropsList = []
document.addEventListener('DOMContentLoaded', () => {
  initializeAnalytics();
});

async function initializeAnalytics() {
  const token = localStorage.getItem("token") || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MTMyZjM2OGY1YzhiZWJiYjlkOGYwNyIsIlVzZXJOYW1lIjoidGVzdGVyMSIsImlhdCI6MTc0NjEzMzgyNH0.m3xaFsKX_28kUlNGkHVBXZ9n3uX0prlOIUjifkUFCb4"
  // Handle crop selection change
  const cropSelect = document.getElementById('cropSelect');
  if (cropSelect) {
    cropSelect.addEventListener('change', updateAnalysis);
  }
  
  //Populate cropSelect
    const response = await fetch(`https://aces-fisd.onrender.com/api/aiAnalytics?Token=${token}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const cropsData = await response.json();
    console.log("API Response:", cropsData);
    let listContent = ""
  if(cropsData) {
    for (const key in cropsData) {
     if (Object.hasOwnProperty.call(cropsData, key)) {
        const crop = cropsData[key];
         cropsList.push(crop)
        listContent +=  `<option data-id="${crop.id}" value="${crop.crop}">${crop.crop}</option>`
      }
    }
    cropSelect.innerHTML = listContent
  }
  // Initialize buttons
  //initializeButtons();
  
  // Initial analysis update
  updateAnalysis();
}

async function updateAnalysis() {
  const cropSelect = document.getElementById('cropSelect');
  const selectedCrop = cropSelect.value;
    
  const token = localStorage.getItem("token") || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MTMyZjM2OGY1YzhiZWJiYjlkOGYwNyIsIlVzZXJOYW1lIjoidGVzdGVyMSIsImlhdCI6MTc0NjEzMzgyNH0.m3xaFsKX_28kUlNGkHVBXZ9n3uX0prlOIUjifkUFCb4"

  const selectedOption = cropSelect.options[cropSelect.selectedIndex];
  const fruitId = selectedOption.getAttribute('data-id');

  // Fetch sensor data from API or use default values
  let sensorData = {
    temperature: 0,
    humidity: 0,
    ph: 0,
    soilMoisture: 0
  };
  
  try {
    const sensor = "all"
    // Attempt to fetch sensor data
    const sensorResponse = await fetch(`https://aces-fisd.onrender.com/api/sensor?Token=${token}&sensor=${sensor}`);
    if (sensorResponse.ok) {
      const sensorResult = (await sensorResponse.json())?.sensordata;
      
     // calculate averages to define sensorData
  const itemsToAverage = Math.min(5, sensorResult.length);
  const recentEntries = sensorResult.slice(-itemsToAverage);
  
  // Initialize sum variables
  let tempSum = 0;
  let humiditySum = 0;
  let pHSum = 0;
  let soilMoistureSum = 0;
  
  // Sum up the values
  for (const entry of recentEntries) {
    tempSum += entry.temperature;
    humiditySum += entry.humidity;
    pHSum += entry.pH;
    soilMoistureSum += entry.soilMoisture;
  }
  
  // Calculate averages
    let temperatureAvg = parseFloat((tempSum / itemsToAverage).toFixed(2));
    let humidityAvg = parseFloat((humiditySum / itemsToAverage).toFixed(2));
    let pHAvg = parseFloat((pHSum / itemsToAverage).toFixed(2));
    let soilMoistureAvg = parseFloat((soilMoistureSum / itemsToAverage).toFixed(2));


      // Update sensor data if available
      sensorData = {
        temperature: temperatureAvg || 0,
        humidity: humidityAvg || 0,
        ph: pHAvg || 0,
        soilMoisture: soilMoistureAvg || 0
      };
    }
  } catch (error) {
    console.error("Error fetching sensor data:", error);
    // Continue with default values
  }  

  
  try {
    // Make API request
    const response = await fetch(`https://aces-fisd.onrender.com/api/aiAnalytics/${fruitId}?Token=${token}&fruitId=${fruitId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const cropData = await response.json();
    console.log("API Response:", cropData);
    
    if (cropData) {      
      // Update UI based on response

      // Mapping of span IDs to the data source (sensorData or apiData) and the key within that source.
        const updates = {
          temperatureAvg: { source: sensorData, key: 'temperature' },
          temperatureRange: { source: cropData, key: 'temp' },
          humidityAvg: { source: sensorData, key: 'humidity' },
          humidityRange: { source: cropData, key: 'humidity' }, 
          pHAvg: { source: sensorData, key: 'ph' },
          pHRange: { source: cropData, key: 'phRange' },
          soilMoistureAvg: { source: sensorData, key: 'soilMoisture' },
          soilMoistureRange: { source: cropData, key: 'soilMoisture' },
          nitrogenRange: { source: cropData, key: 'n' }, 
          phosphorusRange: { source: cropData, key: 'p' }, 
          potassiumRange: { source: cropData, key: 'k' }, 
         };
  
        // Update spans based on the mapping
        for (const spanId in updates) {
          if (Object.hasOwnProperty.call(updates, spanId)) {
            const element = document.getElementById(spanId);
            const dataInfo = updates[spanId];
            const sourceData = dataInfo.source;
            const dataKey = dataInfo.key;
  
            if (element) {
              // Get the value, use 'N/A' if the data is missing or undefined
              const value = (sourceData && sourceData.hasOwnProperty(dataKey) && sourceData[dataKey] !== undefined && sourceData[dataKey] !== null)
                            ? sourceData[dataKey]
                            : 'N/A';
              element.textContent = value;
            } else {
              console.warn(`Element with ID "${spanId}" not found.`);
            }
          }
        }
  
      
      const warning = document.getElementById('unsuitableWarning');
      
      
      // Update warning message if needed
      
      // Check if the current parameters match the ideal crop conditions
      const isIdealCondition = checkIdealConditions(sensorData, cropData);
      
      console.log("is Ideal", isIdealCondition)

      if (!isIdealCondition) {
        warning.textContent = `❌ Unsuitable for ${selectedCrop.charAt(0).toUpperCase() + selectedCrop.slice(1)}`;
        warning.style.display = 'block';
        
        // Update suitable crops list with recommended alternatives
        const suitableCropsList = document.getElementById('suitableCropsList');


    let suitableList = "";
     cropsList.forEach(crop => {
      if(checkIdealConditions(sensorData, crop)) suitableList += `<li>${crop.crop}</li>`
     })

        suitableCropsList.innerHTML = suitableList; 
      } else {
        warning.style.display = 'none';
        // Update the UI to show it's suitable
      }
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    // Handle error in UI
  }
}

// Helper function to check if current parameters are ideal for the crop

// Checks if user sensor data falls within the ideal ranges provided by API data.
function checkIdealConditions(userData, apiData) {
  // Helper function to parse a range string "min - max" into [min, max] numbers
  const parseRange = (rangeString) => {
    if (typeof rangeString !== 'string') {
      console.error("Invalid range string provided:", rangeString);
      return null; // Or throw an error
    }
    const parts = rangeString.split(' - ');
    if (parts.length !== 2) {
      console.error("Invalid range string format:", rangeString);
      return null; 
    }

    const min = parseFloat(parts[0]);
    const max = parseFloat(parts[1]);

    if (isNaN(min) || isNaN(max)) {
       console.error("Failed to parse range values:", rangeString);
       return null; 
    }
    return [min, max];
  };

  // Get user sensor values
  const userTemperature = parseFloat(userData.temperature);
  const userHumidity = parseFloat(userData.humidity);
  const userPh = parseFloat(userData.ph);
  const userSoilMoisture = parseFloat(userData.soilMoisture);

  // Parse API ideal ranges
  const apiTempRange = parseRange(apiData.temp);
  const apiHumidityRange = parseRange(apiData.humidity);
  const apiPhRange = parseRange(apiData.phRange);
  const apiSoilMoistureRange = parseRange(apiData.soilMoisture);

  // Check if parsing was successful for all required ranges
  if (!apiTempRange || !apiHumidityRange || !apiPhRange || !apiSoilMoistureRange) {
      console.error("Could not parse all necessary API ranges. Cannot perform check.");
      return false; // Cannot check conditions without valid ranges
  }

  const [apiMinTemp, apiMaxTemp] = apiTempRange;
  const [apiMinHumidity, apiMaxHumidity] = apiHumidityRange;
  const [apiMinPh, apiMaxPh] = apiPhRange;
  const [apiMinSoilMoisture, apiMaxSoilMoisture] = apiSoilMoistureRange;

  // Check if user values are within API ranges
  const isTempIdeal = userTemperature >= apiMinTemp && userTemperature <= apiMaxTemp;
  const isHumidityIdeal = userHumidity >= apiMinHumidity && userHumidity <= apiMaxHumidity;
  const isPhIdeal = userPh >= apiMinPh && userPh <= apiMaxPh;
  const isSoilMoistureIdeal = userSoilMoisture >= apiMinSoilMoisture && userSoilMoisture <= apiMaxSoilMoisture;

  // Return true only if ALL checked conditions are ideal
  return isTempIdeal && isHumidityIdeal && isPhIdeal && isSoilMoistureIdeal;
}


function initializeButtons() {
  const viewRequirementsBtn = document.getElementById('viewRequirements');
  const aboutAppBtn = document.getElementById('aboutApp');
  
  if (viewRequirementsBtn) {
    viewRequirementsBtn.addEventListener('click', () => {
      console.log('Opening requirements table...');
    });
  }
  
  if (aboutAppBtn) {
    aboutAppBtn.addEventListener('click', () => {
      console.log('Opening about dialog...');
    });
  }
}