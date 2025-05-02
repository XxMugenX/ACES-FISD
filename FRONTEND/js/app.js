// Main application initialization
document.addEventListener('DOMContentLoaded', () => {
  
  // Initialize all components
  
    //Initialise login token if not set previouly

 if(!localStorage.getItem("token")) {
    localStorage.setItem("token", "")  
   window.location.replace('./account.html')
 } else if(localStorage.getItem("token") === "" || localStorage.getItem("token") === undefined){
   console.log("token is empty")
 }
  
  // Handle logout
  const logoutBtn = document.querySelector('#logout-btn');
  console.log(logoutBtn)
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      console.log('Logging out...');
   localStorage.removeItem("token")  
   window.location.replace('./account.html')
    });
  }
  
  initializeSidebar();
 initializeDashboard();
  //initializeCharts();
  
  // Handle search functionality
  const searchInput = document.querySelector('.search-bar input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      // Implement search functionality here
      console.log('Searching for:', e.target.value);
    });
  }

});