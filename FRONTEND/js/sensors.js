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
                x: {
                    type: 'category',
                }
            }
        }
    };

    const charts = ['soilMoisture', 'temperature', 'humidity', 'ph'];
    charts.forEach(sensor => {
        const ctx = document.getElementById(`${sensor}Chart`).getContext('2d');
        const data = {
            labels: [],
            datasets: [{
                data: [],
                borderColor: '#1e4c42',
                tension: 0.4,
                pointRadius: 3,
                pointBackgroundColor: '#1e4c42'
            }]
        };
        sensorCharts[sensor] = new Chart(ctx, { ...chartConfig, data });
    });
}

async function handleSensorSubmit(event) {
    event.preventDefault();
    
    const newSensorData = {
        soilMoisture: parseFloat(document.getElementById('soilMoisture').value),
        temperature: parseFloat(document.getElementById('temperature').value),
        humidity: parseFloat(document.getElementById('humidity').value),
        pH: parseFloat(document.getElementById('ph').value),
        timestamp: Math.floor(Date.now() / 1000)
    };

    // Add new data to allSensorData
    allSensorData.push(newSensorData);

    try {
        const token = localStorage.getItem("token");
        const response = await fetch('https://aces-fisd.onrender.com/api/sensordata', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                Token: token,
                data: allSensorData
            })
        });

        const result = await response.json();
        
        if (result.message === 'ok') {
            alert('Sensor data added successfully!');
            document.getElementById('sensorForm').reset();
            updateSensorValues({
                temperature: newSensorData.temperature,
                humidity: newSensorData.humidity,
                ph: newSensorData.pH,
                soilMoisture: newSensorData.soilMoisture
            });
            updateSensorCharts(allSensorData);
        } else {
            alert('Error adding sensor data: ' + result.error);
        }
    } catch (error) {
        console.error('Error submitting sensor data:', error);
        alert('Failed to submit sensor data');
    }
}

async function fetchSensorData() {
    try {
        const token = localStorage.getItem("token") || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MTMyZjM2OGY1YzhiZWJiYjlkOGYwNyIsIlVzZXJOYW1lIjoidGVzdGVyMSIsImlhdCI6MTc0NjEzMzgyNH0.m3xaFsKX_28kUlNGkHVBXZ9n3uX0prlOIUjifkUFCb4"
        const sensor = "all"
        const sensorResponse = await fetch(`https://aces-fisd.onrender.com/api/sensor?Token=${token}&sensor=${sensor}`);
        let sensorResult = []
        if (sensorResponse.ok) {
           sensorResult = (await sensorResponse.json())?.sensordata;
        }
        
        allSensorData = sensorResult;

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

        sensorDataAvg = {
            temperature: parseFloat((tempSum / itemsToAverage).toFixed(2)) || 0,
            humidity: parseFloat((humiditySum / itemsToAverage).toFixed(2)) || 0,
            ph: parseFloat((pHSum / itemsToAverage).toFixed(2)) || 0,
            soilMoisture: parseFloat((soilMoistureSum / itemsToAverage).toFixed(2)) || 0
        };

        updateSensorValues(sensorDataAvg);
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
        const date = new Date(entry.timestamp * 1000);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    });

    const temperatureData = dataArray.map(entry => entry.temperature);
    const humidityData = dataArray.map(entry => entry.humidity);
    const phData = dataArray.map(entry => entry.pH);
    const soilMoistureData = dataArray.map(entry => entry.soilMoisture);

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
        let sensorType = element.parentElement.querySelector('h3').textContent.toLowerCase();
        if (sensorType.includes('soil')) {
             sensorType = sensorType.replace('soil ', '');
        }

        const dataKeyMap = {
            'moisture': 'soilMoisture',
            'temperature': 'temperature',
            'humidity': 'humidity',
            'ph': 'ph'
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