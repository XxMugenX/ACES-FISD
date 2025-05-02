document.addEventListener('DOMContentLoaded', () => {
    initializeSensorCharts();
    fetchSensorData();
});

// Global variables to store data and chart instances
let allSensorData = [];
let sensorDataAvg = {};
const sensorCharts = {}; 

function initializeSensorCharts() {
    const chartConfig = {
        type: 'line',
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                },
                x: { // Configure x-axis for time labels
                    type: 'category', // Treat labels as categories
                }
            }
        }
    };

    const charts = ['soilMoisture', 'temperature', 'humidity', 'ph']; // Use keys matching data
    charts.forEach(sensor => {
        const ctx = document.getElementById(`${sensor}Chart`).getContext('2d');
        // Initialize chart with empty data
        const data = {
            labels: [],
            datasets: [{
                data: [],
                borderColor: '#1e4c42',
                tension: 0.4,
                pointRadius: 3, // Add point radius to see individual data points
                pointBackgroundColor: '#1e4c42'
            }]
        };
        // Store the chart instance
        sensorCharts[sensor] = new Chart(ctx, { ...chartConfig, data });
    });
}

async function fetchSensorData() {
    try {
        const token = localStorage.getItem("token") || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MTMyZjM2OGY1YzhiZWJiYjlkOGYwNyIsIlVzZXJOYW1lIjoidGVzdGVyMSIsImlhdCI6MTc0NjEzMzgyNH0.m3xaFsKX_28kUlNGkHVBXZ9n3uX0prlOIUjifkUFCb4"
      const sensor = "all"
    // Attempt to fetch sensor data
    const sensorResponse = await fetch(`https://aces-fisd.onrender.com/api/sensor?Token=${token}&sensor=${sensor}`);
    let sensorResult = []
    if (sensorResponse.ok) {
       sensorResult = (await sensorResponse.json())?.sensordata;
}
        // Store the full data array
        allSensorData = sensorResult;

        // Calculate averages for recent entries
        const itemsToAverage = Math.min(5, allSensorData.length);
        const recentEntries = allSensorData.slice(-itemsToAverage);

        let tempSum = 0;
        let humiditySum = 0;
        let pHSum = 0;
        let soilMoistureSum = 0;

        for (const entry of recentEntries) {
            tempSum += entry.temperature;
            humiditySum += entry.humidity;
            pHSum += entry.pH;
            soilMoistureSum += entry.soilMoisture;
        }

        // Calculate averages
        sensorDataAvg = {
            temperature: parseFloat((tempSum / itemsToAverage).toFixed(2)) || 0,
            humidity: parseFloat((humiditySum / itemsToAverage).toFixed(2)) || 0,
            ph: parseFloat((pHSum / itemsToAverage).toFixed(2)) || 0,
            soilMoisture: parseFloat((soilMoistureSum / itemsToAverage).toFixed(2)) || 0
        };

        // Update sensor values on the page with averages
        updateSensorValues(sensorDataAvg);

        // Update charts with the fetched data
        updateSensorCharts(allSensorData);

    } catch (error) {
        console.error('Error processing sensor data:', error);
    }
}

function updateSensorCharts(dataArray) {
    if (!dataArray || dataArray.length === 0) {
        console.warn("No data available to update charts.");
        return;
    }

    const labels = dataArray.map(entry => {
        const date = new Date(entry.timestamp * 1000); // Convert Unix timestamp to milliseconds
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // Format time
    });

    const temperatureData = dataArray.map(entry => entry.temperature);
    const humidityData = dataArray.map(entry => entry.humidity);
    const phData = dataArray.map(entry => entry.pH);
    const soilMoistureData = dataArray.map(entry => entry.soilMoisture);

    // Update each chart
    if (sensorCharts.temperature) {
        sensorCharts.temperature.data.labels = labels;
        sensorCharts.temperature.data.datasets[0].data = temperatureData;
        sensorCharts.temperature.update();
    }
    if (sensorCharts.humidity) {
        sensorCharts.humidity.data.labels = labels;
        sensorCharts.humidity.data.datasets[0].data = humidityData;
        sensorCharts.humidity.update();
    }
    if (sensorCharts.ph) {
        sensorCharts.ph.data.labels = labels;
        sensorCharts.ph.data.datasets[0].data = phData;
        sensorCharts.ph.update();
    }
    if (sensorCharts.soilMoisture) {
        sensorCharts.soilMoisture.data.labels = labels;
        sensorCharts.soilMoisture.data.datasets[0].data = soilMoistureData;
        sensorCharts.soilMoisture.update();
    }
}


function updateSensorValues(data) {
    const sensorElements = document.querySelectorAll('.sensor-value');
    sensorElements.forEach(element => {
        // Extract sensor type from the heading text, handling case variations and 'Soil PH' vs 'PH'
        let sensorType = element.parentElement.querySelector('h3').textContent.toLowerCase();
        if (sensorType.includes('soil')) {
             sensorType = sensorType.replace('soil ', ''); // Normalize 'soil moisture' to 'moisture' or 'soil ph' to 'ph'
        }


        // Map display names to data keys
        const dataKeyMap = {
            'moisture': 'soilMoisture',
            'temperature': 'temperature',
            'humidity': 'humidity',
            'ph': 'ph' // pH from heading maps to 'ph' key in data
        };

        const dataKey = dataKeyMap[sensorType];

        if (dataKey && data.hasOwnProperty(dataKey)) {
             element.textContent = `${data[dataKey]}${getSensorUnit(sensorType)}`;
        } else {
            console.warn(`Sensor type '${sensorType}' not found in data or mapping.`);
        }
    });
}

function getSensorUnit(sensorType) {
    const units = {
        'moisture': '%',
        'temperature': '°C',
        'humidity': '%',
        'ph': ''
    };
    return units[sensorType] || '';
}

