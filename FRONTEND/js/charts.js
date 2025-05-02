function initializeCharts() {
  const ctx = document.getElementById('analysisChart').getContext('2d');
  
  const data = {
    labels: ['April', 'May', 'June', 'July', 'August', 'September'],
    datasets: [{
      label: 'Predicted Growth',
      data: [20, 35, 45, 60, 75, 90],
      borderColor: '#1e3a29',
      backgroundColor: 'rgba(30, 58, 41, 0.1)',
      tension: 0.4,
      fill: true
    }]
  };
  
  const config = {
    type: 'line',
    data: data,
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
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: value => `${value}%`
          }
        }
      }
    }
  };
  
  new Chart(ctx, config);
}