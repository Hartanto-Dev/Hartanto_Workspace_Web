document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();

  const sidebar = document.querySelector('.sidebar');
  const sidebarToggle = document.querySelector('.sidebar-toggle');
  const mobileMenuButton = document.querySelector('#mobile-menu-button');
  const sidebarOverlay = document.querySelector('#sidebar-overlay');
  const navItems = document.querySelectorAll('.nav-item');
  const mainSearch = document.querySelector('#main-search');
  const meetingCards = document.querySelectorAll('.meeting-card');
  const filterButton = document.querySelector('#filter-button');
  const filterDropdown = document.querySelector('#filter-dropdown');
  const createMeetingCard = document.querySelector('#create-meeting-card');
  const newMeetingButton = document.querySelector('#new-meeting-button');
  const statusFilter = document.querySelector('#status-filter');
  const typeFilter = document.querySelector('#type-filter');

  const closeSidebar = () => {
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('visible');
    mobileMenuButton.setAttribute('aria-label', 'Open navigation menu');
  };

  const toggleSidebar = () => {
    const isOpen = sidebar.classList.toggle('open');
    sidebarOverlay.classList.toggle('visible', isOpen);
    mobileMenuButton.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
  };

  const filterCards = () => {
    const query = mainSearch.value.toLowerCase().trim();
    const selectedStatus = statusFilter.value;
    const selectedType = typeFilter.value;

    meetingCards.forEach((card) => {
      const title = card.dataset.title.toLowerCase();
      const description = card.dataset.description.toLowerCase();
      const status = card.querySelector('.status-badge').textContent.toLowerCase();
      const matchesQuery = title.includes(query) || description.includes(query);
      const matchesStatus = selectedStatus === 'all' || status === selectedStatus;
      const matchesType = selectedType === 'all' || card.dataset.type === selectedType;

      card.hidden = !(matchesQuery && matchesStatus && matchesType);
    });
  };

  const toggleFilter = () => {
    const isOpen = filterDropdown.hasAttribute('hidden');
    filterDropdown.toggleAttribute('hidden', !isOpen);
    filterButton.setAttribute('aria-expanded', String(isOpen));
  };

  const createRipple = (event) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const ripple = document.createElement('span');
    const diameter = Math.max(rect.width, rect.height);

    ripple.className = 'ripple';
    ripple.style.width = `${diameter}px`;
    ripple.style.height = `${diameter}px`;
    ripple.style.left = `${event.clientX - rect.left - diameter / 2}px`;
    ripple.style.top = `${event.clientY - rect.top - diameter / 2}px`;

    button.querySelector('.ripple')?.remove();
    button.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  };

  const animateNewMeeting = () => {
    createMeetingCard.classList.remove('create-active');
    void createMeetingCard.offsetWidth;
    createMeetingCard.classList.add('create-active');
  };

  navItems.forEach((item) => {
    item.addEventListener('click', (event) => {
      navItems.forEach((navItem) => navItem.classList.remove('active'));
      event.currentTarget.classList.add('active');

      if (window.innerWidth <= 768) closeSidebar();
    });
  });

  sidebarToggle.addEventListener('click', toggleSidebar);
  mobileMenuButton.addEventListener('click', toggleSidebar);
  sidebarOverlay.addEventListener('click', closeSidebar);
  mainSearch.addEventListener('input', filterCards);
  statusFilter.addEventListener('change', filterCards);
  typeFilter.addEventListener('change', filterCards);
  filterButton.addEventListener('click', toggleFilter);
  createMeetingCard.addEventListener('click', animateNewMeeting);
  newMeetingButton.addEventListener('click', animateNewMeeting);

  document.querySelectorAll('.primary-button, .pill-button, .icon-button').forEach((button) => {
    button.addEventListener('click', createRipple);
  });

  document.addEventListener('click', (event) => {
    if (!event.target.closest('#filter-button, #filter-dropdown')) {
      filterDropdown.setAttribute('hidden', '');
      filterButton.setAttribute('aria-expanded', 'false');
    }
  });

  window.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    closeSidebar();
    filterDropdown.setAttribute('hidden', '');
    filterButton.setAttribute('aria-expanded', 'false');
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) closeSidebar();
  });
});
