export function initReporting(container) {
  const addTaskButton = container.querySelector('#add-task-button');
  const todoColumn = container.querySelector('#col-todo');

  // Handle Add Task
  if (addTaskButton && todoColumn) {
    addTaskButton.addEventListener('click', () => {
      // In a real app, this would open a modal to enter details.
      // For now, we'll create a simple task card and append it.
      const taskTitle = prompt('Enter new task title:');
      if (!taskTitle) return;

      const newTask = document.createElement('div');
      newTask.className = 'dev-task-card';
      newTask.setAttribute('draggable', 'true');
      newTask.innerHTML = `
        <p class="dev-task-title">${taskTitle}</p>
        <span class="priority-tag medium">Medium</span>
      `;
      todoColumn.appendChild(newTask);

      // Re-initialize drag events for the new task
      setupDraggable(newTask);
    });
  }

  // --- Drag and Drop Logic ---
  const columns = container.querySelectorAll('.dev-column:not(:last-child)'); // Exclude AI Recaption column
  let draggedElement = null;

  function setupDraggable(taskCard) {
    taskCard.addEventListener('dragstart', (e) => {
      draggedElement = taskCard;
      taskCard.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      // Required for Firefox
      e.dataTransfer.setData('text/plain', '');
    });

    taskCard.addEventListener('dragend', () => {
      draggedElement = null;
      taskCard.classList.remove('dragging');
    });
  }

  // Initial setup for existing task cards
  const existingCards = container.querySelectorAll('.dev-column:not(:last-child) .dev-task-card');
  existingCards.forEach(setupDraggable);

  columns.forEach(column => {
    column.addEventListener('dragover', (e) => {
      e.preventDefault(); // Allow drop
      e.dataTransfer.dropEffect = 'move';
      column.classList.add('drag-over');
    });

    column.addEventListener('dragleave', () => {
      column.classList.remove('drag-over');
    });

    column.addEventListener('drop', (e) => {
      e.preventDefault();
      column.classList.remove('drag-over');
      
      if (draggedElement && draggedElement.parentNode !== column) {
        column.appendChild(draggedElement);
      }
    });
  });
}
