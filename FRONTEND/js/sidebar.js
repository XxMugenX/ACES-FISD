function initializeSidebar() {
  const navItems = document.querySelectorAll('.navigation li');
  
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      // Remove active class from all items
      navItems.forEach(i => i.classList.remove('active'));
      
      // Add active class to clicked item
      item.classList.add('active');
      
      // Prevent default anchor behavior
      e.preventDefault();
      
      // Get the href value
      const href = item.querySelector('a').getAttribute('href');
      
      // Handle navigation
      console.log('Navigating to:', href);
    });
  });
}