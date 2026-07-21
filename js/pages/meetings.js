export function initMeetings(container) {
  const mainSearch = container.querySelector('#main-search');
  const meetingCards = container.querySelectorAll('.meeting-card');
  const filterButton = container.querySelector('#filter-button');
  const filterDropdown = container.querySelector('#filter-dropdown');
  const createMeetingCard = container.querySelector('#create-meeting-card');
  const newMeetingButton = container.querySelector('#new-meeting-button');
  const statusFilter = container.querySelector('#status-filter');
  const typeFilter = container.querySelector('#type-filter');

  const filterCards = () => {
    if (!mainSearch || !statusFilter || !typeFilter) return;
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
    if (!filterDropdown || !filterButton) return;
    const isOpen = filterDropdown.hasAttribute('hidden');
    filterDropdown.toggleAttribute('hidden', !isOpen);
    filterButton.setAttribute('aria-expanded', String(isOpen));
  };

  const animateNewMeeting = () => {
    if (!createMeetingCard) return;
    createMeetingCard.classList.remove('create-active');
    void createMeetingCard.offsetWidth;
    createMeetingCard.classList.add('create-active');
  };

  if (mainSearch) mainSearch.addEventListener('input', filterCards);
  if (statusFilter) statusFilter.addEventListener('change', filterCards);
  if (typeFilter) typeFilter.addEventListener('change', filterCards);
  if (filterButton) filterButton.addEventListener('click', toggleFilter);
  if (createMeetingCard) createMeetingCard.addEventListener('click', animateNewMeeting);
  if (newMeetingButton) newMeetingButton.addEventListener('click', animateNewMeeting);

  // Close filter dropdown when clicking outside
  const closeFilterDropdown = (event) => {
    if (filterDropdown && filterButton) {
      if (!event.target.closest('#filter-button, #filter-dropdown')) {
        filterDropdown.setAttribute('hidden', '');
        filterButton.setAttribute('aria-expanded', 'false');
      }
    }
  };
  
  document.addEventListener('click', closeFilterDropdown);

  // Cleanup to avoid memory leaks when page unloads
  container.addEventListener('DOMNodeRemoved', function cleanup(e) {
    if (e.target === container) {
      document.removeEventListener('click', closeFilterDropdown);
      container.removeEventListener('DOMNodeRemoved', cleanup);
    }
  });
}
