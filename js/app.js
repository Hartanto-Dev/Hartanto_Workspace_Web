import { initSidebar } from './sidebar.js';
import { initNavigation } from './navigation.js';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize lucide icons globally
  lucide.createIcons();

  // Initialize modular components
  initSidebar();
  initNavigation();
  
  // Attach global ripple effect
  document.addEventListener('click', (event) => {
    const button = event.target.closest('.primary-button, .pill-button, .icon-button');
    if (!button) return;

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
  });
});
