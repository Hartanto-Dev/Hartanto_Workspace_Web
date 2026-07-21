export function initActionItems(container) {
  const checkboxes = container.querySelectorAll('.action-checkbox input[type="checkbox"]');
  
  checkboxes.forEach(cb => {
    cb.addEventListener('change', (e) => {
      const item = e.target.closest('.action-item');
      if (e.target.checked) {
        item.style.opacity = '0.5';
        item.querySelector('.action-title').style.textDecoration = 'line-through';
      } else {
        item.style.opacity = '1';
        item.querySelector('.action-title').style.textDecoration = 'none';
      }
    });
  });
}
