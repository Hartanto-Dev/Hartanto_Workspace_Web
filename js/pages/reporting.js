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

  // --- Generate Recap Logic ---
  const generateRecapButton = container.querySelector('#generate-recap-button');
  const aiRecapContent = container.querySelector('#ai-recap-content');
  const inprogressColumn = container.querySelector('#col-inprogress');
  const doneColumn = container.querySelector('#col-done');

  if (generateRecapButton && aiRecapContent) {
    generateRecapButton.addEventListener('click', () => {
      // Add loading state
      const originalText = generateRecapButton.innerHTML;
      generateRecapButton.innerHTML = `<i data-lucide="loader-2" style="animation: spin 1s linear infinite;"></i> Generating...`;
      generateRecapButton.style.opacity = '0.7';
      generateRecapButton.disabled = true;
      lucide.createIcons();

      setTimeout(() => {
        // Collect task counts/titles
        const todoTasks = todoColumn ? todoColumn.querySelectorAll('.dev-task-card').length : 0;
        const progressTasks = inprogressColumn ? Array.from(inprogressColumn.querySelectorAll('.dev-task-title')).map(el => el.textContent) : [];
        const doneTasks = doneColumn ? Array.from(doneColumn.querySelectorAll('.dev-task-title')).map(el => el.textContent) : [];

        let recapMessage = `We currently have <strong>${todoTasks} tasks</strong> waiting in the To-Do queue. `;
        
        if (progressTasks.length > 0) {
          recapMessage += `Our main focus right now is on <em>${progressTasks[0]}</em>. `;
        }
        
        if (doneTasks.length > 0) {
          recapMessage += `Great job completing <em>${doneTasks[0]}</em> recently!`;
        } else {
          recapMessage += `Let's keep pushing to get tasks across the finish line!`;
        }

        // Generate new recap card
        aiRecapContent.innerHTML = `
          <div class="dev-task-card" style="border: 1px solid rgba(139, 92, 246, 0.4); background: rgba(255, 255, 255, 0.95); animation: fadeInPage 0.4s ease;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <i data-lucide="bot" style="color: #8b5cf6; width: 18px; height: 18px;"></i>
              <p class="dev-task-title" style="margin: 0; color: #6d28d9; font-weight: 700;">Latest Recap</p>
            </div>
            <p style="margin: 0; font-size: 0.85rem; color: #334155; line-height: 1.6;">${recapMessage}</p>
          </div>
        `;
        
        lucide.createIcons();
        
        // Restore button state
        generateRecapButton.innerHTML = originalText;
        generateRecapButton.style.opacity = '1';
        generateRecapButton.disabled = false;
        lucide.createIcons();
      }, 1500); // Simulate network request delay
    });
  }
}
