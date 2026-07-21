export function initSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const sidebarToggle = document.querySelector('.sidebar-toggle');
  const mobileMenuButton = document.querySelector('#mobile-menu-button');
  const sidebarOverlay = document.querySelector('#sidebar-overlay');

  if (!sidebar || !sidebarToggle || !mobileMenuButton || !sidebarOverlay) return;

  const closeSidebar = () => {
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('visible');
    mobileMenuButton.setAttribute('aria-label', 'Open navigation menu');
  };

  const toggleSidebar = () => {
    if (window.innerWidth > 768) {
      document.querySelector('.app-shell').classList.toggle('collapsed');
      return;
    }
    const isOpen = sidebar.classList.toggle('open');
    sidebarOverlay.classList.toggle('visible', isOpen);
    mobileMenuButton.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
  };

  sidebarToggle.addEventListener('click', toggleSidebar);
  mobileMenuButton.addEventListener('click', toggleSidebar);
  sidebarOverlay.addEventListener('click', closeSidebar);

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeSidebar();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) closeSidebar();
  });

  // Expose closeSidebar for navigation.js to use
  window.closeSidebar = closeSidebar;
}
