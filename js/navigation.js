export function initNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const footerItems = document.querySelectorAll('.footer-item');
  const pageContainer = document.querySelector('#page-container');
  
  // Cache loaded pages
  const pageCache = new Map();

  const loadPage = async (sectionName) => {
    // Show loader
    pageContainer.innerHTML = `
      <div class="page-loader" style="display: flex; justify-content: center; align-items: center; height: 100%;">
        <i data-lucide="loader-2" style="animation: spin 1s linear infinite; width: 32px; height: 32px; color: var(--primary-accent);"></i>
      </div>
    `;
    lucide.createIcons();

    let htmlContent = '';

    try {
      // Add cache buster to prevent browser from caching the fetch request
      const response = await fetch(`pages/${sectionName}.html?t=${new Date().getTime()}`);
      if (!response.ok) throw new Error('Page not found');
      htmlContent = await response.text();
      } catch (error) {
        htmlContent = `
          <div style="padding: 40px; text-align: center;">
            <h2>Page not found</h2>
            <p style="color: var(--muted);">We couldn't load the ${sectionName} page.</p>
          </div>
        `;
      }

    // Wrap the loaded content in the page-section wrapper
    pageContainer.innerHTML = `<div class="page-section active" data-page="${sectionName}">${htmlContent}</div>`;
    
    // Re-init icons
    lucide.createIcons();

    // Init page specific scripts
    initPageScripts(sectionName, pageContainer);
  };

  const initPageScripts = async (sectionName, container) => {
    if (sectionName === 'dashboard') {
      const module = await import('./pages/dashboard.js?v=3');
      module.initDashboard(container);
    } else if (sectionName === 'all-meetings') {
      const module = await import('./pages/meetings.js');
      module.initMeetings(container);
    } else if (sectionName === 'action-items') {
      const module = await import('./pages/action-items.js');
      module.initActionItems(container);
    } else if (sectionName === 'reporting') {
      const module = await import('./pages/reporting.js?v=7');
      module.initReporting(container);
    }
  };

  // Nav item click handlers
  navItems.forEach((item) => {
    item.addEventListener('click', (event) => {
      const section = event.currentTarget.dataset.section;

      // Update active state on nav items
      navItems.forEach((navItem) => navItem.classList.remove('active'));
      footerItems.forEach((fi) => fi.classList.remove('active'));
      event.currentTarget.classList.add('active');

      loadPage(section);

      if (window.innerWidth <= 768 && window.closeSidebar) window.closeSidebar();
    });
  });

  // Footer item click handlers
  footerItems.forEach((item) => {
    item.addEventListener('click', (event) => {
      const section = event.currentTarget.dataset.section;
      if (section) {
        navItems.forEach((navItem) => navItem.classList.remove('active'));
        footerItems.forEach((fi) => fi.classList.remove('active'));
        event.currentTarget.classList.add('active');
        loadPage(section);
      }
      if (window.innerWidth <= 768 && window.closeSidebar) window.closeSidebar();
    });
  });

  // Load default page
  const activeNav = document.querySelector('.nav-item.active') || navItems[0];
  if (activeNav) {
    loadPage(activeNav.dataset.section);
  }
}
