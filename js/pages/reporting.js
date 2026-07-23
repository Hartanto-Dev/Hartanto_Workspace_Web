export function initReporting(container) {
  const addTaskButton = container.querySelector('#add-task-button');
  const todoColumn = container.querySelector('#col-todo');
  const inprogressColumn = container.querySelector('#col-inprogress');
  const doneColumn = container.querySelector('#col-done');
  const generateRecapButton = container.querySelector('#generate-recap-button');
  const aiRecapContent = container.querySelector('#ai-recap-content');

  // ===== MODAL (injected into body to avoid SPA re-render conflicts) =====
  // Remove any stale modal from previous page loads
  const staleModal = document.getElementById('task-modal');
  if (staleModal) staleModal.remove();

  const modalEl = document.createElement('div');
  modalEl.id = 'task-modal';
  modalEl.style.cssText = 'display:none; position:fixed; inset:0; background:rgba(15,23,42,0.45); z-index:9999; align-items:center; justify-content:center; backdrop-filter:blur(4px); opacity:0; transition:opacity 0.25s;';
  modalEl.innerHTML = `
    <div id="task-modal-inner" style="background:#fff; width:100%; max-width:440px; border-radius:20px; padding:28px; box-shadow:0 24px 48px rgba(0,0,0,0.12); transform:translateY(24px); transition:transform 0.3s ease; font-family:inherit;">
      <h3 id="task-modal-title" style="margin:0 0 20px; font-size:1.15rem; font-weight:700; color:#0f172a;">Add New Task</h3>
      <div style="display:flex; flex-direction:column; gap:14px; margin-bottom:24px;">
        <div>
          <label style="font-size:0.78rem; font-weight:600; color:#64748b; margin-bottom:5px; display:block;">Task Title *</label>
          <input type="text" id="task-input-title" placeholder="e.g., Update Homepage Design"
            style="width:100%; padding:10px 14px; border-radius:10px; border:1.5px solid #e2e8f0; font-family:inherit; font-size:0.9rem; outline:none; box-sizing:border-box; transition:border-color 0.2s;" />
        </div>
        <div>
          <label style="font-size:0.78rem; font-weight:600; color:#64748b; margin-bottom:5px; display:block;">Category</label>
          <input type="text" id="task-input-category" placeholder="e.g., Web Design"
            style="width:100%; padding:10px 14px; border-radius:10px; border:1.5px solid #e2e8f0; font-family:inherit; font-size:0.9rem; outline:none; box-sizing:border-box;" />
        </div>
        <div style="display:flex; gap:12px;">
          <div style="flex:1;">
            <label style="font-size:0.78rem; font-weight:600; color:#64748b; margin-bottom:5px; display:block;">Priority</label>
            <select id="task-input-priority" style="width:100%; padding:10px 14px; border-radius:10px; border:1.5px solid #e2e8f0; background:#f8fafc; font-family:inherit; font-size:0.9rem; outline:none;">
              <option value="high">Urgent</option>
              <option value="medium" selected>Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div style="flex:1;">
            <label style="font-size:0.78rem; font-weight:600; color:#64748b; margin-bottom:5px; display:block;">Due Date</label>
            <input type="date" id="task-input-due"
              style="width:100%; padding:10px 14px; border-radius:10px; border:1.5px solid #e2e8f0; font-family:inherit; font-size:0.9rem; outline:none; box-sizing:border-box;" />
          </div>
        </div>
      </div>
      <div style="display:flex; justify-content:flex-end; gap:10px;">
        <button id="task-modal-cancel" style="padding:10px 18px; border-radius:10px; background:transparent; border:1.5px solid #e2e8f0; color:#64748b; font-weight:600; cursor:pointer; font-family:inherit; font-size:0.9rem;">Cancel</button>
        <button id="task-modal-save" style="padding:10px 22px; border-radius:10px; background:#1e40af; color:#fff; border:none; font-weight:600; cursor:pointer; font-family:inherit; font-size:0.9rem; box-shadow:0 4px 14px rgba(30,64,175,0.25);">Save Task</button>
      </div>
    </div>
  `;
  document.body.appendChild(modalEl);

  const modalInner = document.getElementById('task-modal-inner');
  const modalTitle = document.getElementById('task-modal-title');
  const inputTitle = document.getElementById('task-input-title');
  const inputCategory = document.getElementById('task-input-category');
  const inputPriority = document.getElementById('task-input-priority');
  const inputDue = document.getElementById('task-input-due');
  const btnCancel = document.getElementById('task-modal-cancel');
  const btnSave = document.getElementById('task-modal-save');

  let currentEditCard = null;

  // ===== MODAL OPEN / CLOSE =====
  const openModal = (cardToEdit = null) => {
    currentEditCard = cardToEdit;

    if (cardToEdit) {
      modalTitle.textContent = 'Edit Task';
      const titleEl = cardToEdit.querySelector('.dev-task-title');
      const catEl = cardToEdit.querySelector('.task-category');
      const pTag = cardToEdit.querySelector('.priority-tag');
      inputTitle.value = titleEl ? titleEl.textContent.trim() : '';
      inputCategory.value = catEl ? catEl.textContent.trim() : '';
      if (pTag) {
        if (pTag.classList.contains('high')) inputPriority.value = 'high';
        else if (pTag.classList.contains('low')) inputPriority.value = 'low';
        else inputPriority.value = 'medium';
      }
      inputDue.value = '';
    } else {
      modalTitle.textContent = 'Add New Task';
      inputTitle.value = '';
      inputCategory.value = '';
      inputPriority.value = 'medium';
      inputDue.value = '';
    }

    modalEl.style.display = 'flex';
    requestAnimationFrame(() => {
      modalEl.style.opacity = '1';
      modalInner.style.transform = 'translateY(0)';
    });
    setTimeout(() => inputTitle.focus(), 200);
  };

  const closeModal = () => {
    modalEl.style.opacity = '0';
    modalInner.style.transform = 'translateY(24px)';
    setTimeout(() => {
      modalEl.style.display = 'none';
      currentEditCard = null;
    }, 280);
  };

  // Close on backdrop click
  modalEl.addEventListener('click', (e) => {
    if (e.target === modalEl) closeModal();
  });
  btnCancel.addEventListener('click', closeModal);

  // Keyboard close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalEl.style.display === 'flex') closeModal();
  });

  // ===== FORMAT DATE =====
  const formatDate = (dateStr) => {
    if (!dateStr) return 'TBD';
    const d = new Date(dateStr + 'T00:00:00');
    return isNaN(d.getTime()) ? 'TBD' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
  };

  // ===== SAVE HANDLER =====
  btnSave.addEventListener('click', () => {
    const title = inputTitle.value.trim();
    if (!title) {
      inputTitle.style.borderColor = '#ef4444';
      inputTitle.focus();
      setTimeout(() => { inputTitle.style.borderColor = '#e2e8f0'; }, 1500);
      return;
    }

    const pLevel = inputPriority.value;
    const pLabel = pLevel === 'high' ? 'Urgent' : pLevel === 'medium' ? 'Medium' : 'Low';
    const dateFormatted = formatDate(inputDue.value);
    const category = inputCategory.value.trim() || 'General';

    if (currentEditCard) {
      // ---- UPDATE existing card ----
      const titleEl = currentEditCard.querySelector('.dev-task-title');
      const catEl = currentEditCard.querySelector('.task-category');
      const dueDateEl = currentEditCard.querySelector('.task-due-date');
      const pTag = currentEditCard.querySelector('.priority-tag');

      if (titleEl) titleEl.textContent = title;
      if (catEl) catEl.textContent = category;
      if (dueDateEl) dueDateEl.innerHTML = `<i data-lucide="calendar"></i> Due to: ${dateFormatted}`;
      if (pTag) {
        pTag.className = `priority-tag ${pLevel}`;
        pTag.innerHTML = `<i data-lucide="flag"></i> ${pLabel}`;
      }
      lucide.createIcons({ nodes: currentEditCard.querySelectorAll('[data-lucide]') });
    } else {
      // ---- CREATE new card ----
      const randomId = Math.floor(Math.random() * 900) + 100;
      const randomAvatarId = Math.floor(Math.random() * 70) + 1;

      const newTask = document.createElement('div');
      newTask.className = 'dev-task-card';
      newTask.setAttribute('draggable', 'true');
      newTask.innerHTML = `
        <div class="task-header">
          <div class="task-id"><i data-lucide="link-2"></i> WEB - ${randomId}</div>
          <div class="task-header-right" style="display: flex; align-items: center; gap: 8px;">
            <span class="priority-tag ${pLevel}"><i data-lucide="flag"></i> ${pLabel}</span>
            <button class="delete-task-btn" aria-label="Delete task" style="background: none; border: none; cursor: pointer; padding: 2px; color: #ef4444; opacity: 0.6; transition: opacity 0.2s; display: inline-flex; align-items: center; justify-content: center;">
              <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
            </button>
          </div>
        </div>
        <div class="task-body">
          <p class="dev-task-title">${title}</p>
          <p class="task-category">${category}</p>
          <div class="task-due-date"><i data-lucide="calendar"></i> Due to: ${dateFormatted}</div>
        </div>
        <div class="task-footer">
          <div class="task-avatars">
            <img src="https://i.pravatar.cc/150?img=${randomAvatarId}" alt="avatar" />
          </div>
          <div class="task-meta">
            <i data-lucide="message-square"></i> 0
            <span class="meta-divider">|</span>
            <span>Just now</span>
          </div>
        </div>
      `;

      if (todoColumn) todoColumn.appendChild(newTask);
      lucide.createIcons({ nodes: newTask.querySelectorAll('[data-lucide]') });
      setupDraggable(newTask);
      makeClickable(newTask);
    }

    closeModal();
  });

  // ===== ADD TASK BUTTON =====
  if (addTaskButton) {
    addTaskButton.addEventListener('click', () => openModal());
  }

  // ===== DRAG AND DROP =====
  let draggedElement = null;

  function setupDraggable(card) {
    card.addEventListener('dragstart', (e) => {
      draggedElement = card;
      card.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', '');
    });
    card.addEventListener('dragend', () => {
      draggedElement = null;
      card.classList.remove('dragging');
    });
  }

  // ===== CLICK TO EDIT =====
  function makeClickable(card) {
    let mouseDownTime = 0;
    let mouseStartX = 0;
    let mouseStartY = 0;

    card.addEventListener('mousedown', (e) => {
      mouseDownTime = Date.now();
      mouseStartX = e.clientX;
      mouseStartY = e.clientY;
    });

    card.addEventListener('mouseup', (e) => {
      const elapsed = Date.now() - mouseDownTime;
      const dx = Math.abs(e.clientX - mouseStartX);
      const dy = Math.abs(e.clientY - mouseStartY);

      // Only open modal if it was a quick click (not a drag)
      if (elapsed < 300 && dx < 5 && dy < 5) {
        if (e.target.closest('.delete-task-btn')) {
          return;
        }
        openModal(card);
      }
    });
  }

  // ===== DELETE TASK HANDLER =====
  container.addEventListener('click', (e) => {
    const deleteBtn = e.target.closest('.delete-task-btn');
    if (deleteBtn) {
      e.stopPropagation();
      const card = deleteBtn.closest('.dev-task-card');
      if (card && confirm('Are you sure you want to delete this task?')) {
        card.remove();
      }
    }
  });

  // ===== INIT EXISTING CARDS =====
  const existingCards = container.querySelectorAll('.dev-column:not(#col-ai) .dev-task-card');
  existingCards.forEach(card => {
    setupDraggable(card);
    makeClickable(card);
  });

  // ===== COLUMN DROP ZONES =====
  const columns = container.querySelectorAll('.dev-column:not(#col-ai)');
  columns.forEach(column => {
    column.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      column.classList.add('drag-over');
    });
    column.addEventListener('dragleave', (e) => {
      if (!column.contains(e.relatedTarget)) {
        column.classList.remove('drag-over');
      }
    });
    column.addEventListener('drop', (e) => {
      e.preventDefault();
      column.classList.remove('drag-over');
      if (draggedElement) {
        column.appendChild(draggedElement);
      }
    });
  });

  // ===== GENERATE AI RECAP =====
  const reportSummaryContent = container.querySelector('#report-summary-content');

  if (generateRecapButton && aiRecapContent) {
    generateRecapButton.addEventListener('click', () => {
      const origHTML = generateRecapButton.innerHTML;
      generateRecapButton.innerHTML = `<i data-lucide="loader-2" style="animation:spin 1s linear infinite; display:inline-block;"></i> Generating...`;
      generateRecapButton.disabled = true;
      generateRecapButton.style.opacity = '0.7';
      lucide.createIcons({ nodes: generateRecapButton.querySelectorAll('[data-lucide]') });

      setTimeout(() => {
        // Helper to extract full task data from a card
        const extractCards = (col) => {
          if (!col) return [];
          return Array.from(col.querySelectorAll('.dev-task-card')).map(card => ({
            title: card.querySelector('.dev-task-title')?.textContent.trim() || '—',
            category: card.querySelector('.task-category')?.textContent.trim() || '—',
            due: card.querySelector('.task-due-date')?.textContent.replace(/\s+/g, ' ').trim().replace(/^.*?Due to:/, 'Due to:') || 'TBD',
            priority: card.querySelector('.priority-tag')?.textContent.trim() || '—',
          }));
        };

        const todoTasks = extractCards(todoColumn);
        const progressTasks = extractCards(inprogressColumn);
        const doneTasks = extractCards(doneColumn);
        const total = todoTasks.length + progressTasks.length + doneTasks.length;

        const now = new Date().toLocaleDateString('id-ID', {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });

        // Build a plain-text section
        const buildSection = (label, tasks) => {
          if (tasks.length === 0) return '';
          let text = `${label}\n${'─'.repeat(40)}\n`;
          tasks.forEach((t, i) => {
            text += `${i + 1}. ${t.title}\n`;
            text += `   Kategori   : ${t.category}\n`;
            text += `   Prioritas  : ${t.priority}\n`;
            text += `   ${t.due}\n`;
            text += `\n`;
          });
          return text;
        };

        // Compose the full plain text recap
        let plainText = '';
        plainText += `===========================================\n`;
        plainText += `         PROJECT BOARD RECAP\n`;
        plainText += `===========================================\n`;
        plainText += `Tanggal   : ${now}\n`;
        plainText += `Total Task: ${total} task${total !== 1 ? 's' : ''}\n`;
        plainText += `\n`;
        plainText += buildSection('📋 TO-DO', todoTasks);
        plainText += buildSection('🔄 ON-PROGRESS', progressTasks);
        plainText += buildSection('✅ DONE', doneTasks);
        if (total === 0) {
          plainText += 'Tidak ada task pada board saat ini.\n';
        }
        plainText += `===========================================\n`;
        plainText += `Generated by Meeting Checkpoint System\n`;
        plainText += `===========================================`;

        // Build the UI card for AI Recaption column
        aiRecapContent.innerHTML = '';
        const recapCard = document.createElement('div');
        recapCard.className = 'dev-task-card';
        recapCard.style.cssText = 'border:1px solid rgba(71,85,105,0.2); background:#ffffff; padding:14px;';
        recapCard.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <div style="display:flex; align-items:center; gap:7px;">
              <i data-lucide="file-text" style="color:#475569; width:15px; height:15px;"></i>
              <span style="font-weight:700; font-size:0.85rem; color:#1e293b;">Recap (Siap Copy)</span>
            </div>
            <button id="copy-recap-btn" style="display:inline-flex; align-items:center; gap:5px; padding:5px 12px; border-radius:8px; background:#334155; color:#fff; border:none; font-size:0.75rem; font-weight:600; cursor:pointer;">
              <i data-lucide="copy" style="width:12px; height:12px;"></i> Copy
            </button>
          </div>
          <textarea id="recap-textarea" readonly style="width:100%; height:260px; font-family:'Courier New', monospace; font-size:0.75rem; line-height:1.6; color:#334155; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px; resize:none; box-sizing:border-box; white-space:pre;">${plainText}</textarea>
        `;

        aiRecapContent.appendChild(recapCard);

        // Wire up Copy button
        const copyBtn = document.getElementById('copy-recap-btn');
        const textarea = document.getElementById('recap-textarea');
        if (copyBtn && textarea) {
          copyBtn.addEventListener('click', () => {
            textarea.select();
            navigator.clipboard.writeText(textarea.value).then(() => {
              copyBtn.innerHTML = '<i data-lucide="check" style="width:12px;height:12px;"></i> Copied!';
              copyBtn.style.background = '#166534';
              setTimeout(() => {
                copyBtn.innerHTML = '<i data-lucide="copy" style="width:12px;height:12px;"></i> Copy';
                copyBtn.style.background = '#334155';
                lucide.createIcons({ nodes: copyBtn.querySelectorAll('[data-lucide]') });
              }, 2000);
              lucide.createIcons({ nodes: copyBtn.querySelectorAll('[data-lucide]') });
            });
          });
        }

        // ===== POPULATE REPORT SUMMARY CARD =====
        if (reportSummaryContent) {
          // Build a styled HTML summary for the Report Summary widget
          const buildSummaryHTML = (label, emoji, tasks) => {
            if (tasks.length === 0) return '';
            let html = `<div style="margin-bottom: 16px;">`;
            html += `<div style="display: flex; align-items: center; gap: 6px; margin-bottom: 8px; font-weight: 700; font-size: 0.85rem; color: var(--foreground);">${emoji} ${label} <span style="font-weight: 500; color: var(--muted);">(${tasks.length})</span></div>`;
            tasks.forEach((t) => {
              html += `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; margin-bottom: 4px; background: #f8fafc; border-radius: 8px; border: 1px solid var(--border);">
                  <div style="display: flex; flex-direction: column; gap: 2px;">
                    <span style="font-weight: 600; font-size: 0.85rem; color: var(--foreground);">${t.title}</span>
                    <span style="font-size: 0.75rem; color: var(--muted);">${t.category} · ${t.priority}</span>
                  </div>
                  <span style="font-size: 0.72rem; color: var(--muted); white-space: nowrap;">${t.due}</span>
                </div>`;
            });
            html += `</div>`;
            return html;
          };

          const hasTasks = total > 0;
          
          let summaryHTML = `
            <style>
              .report-accordion summary::-webkit-details-marker { display: none; }
              .report-accordion summary { list-style: none; outline: none; }
              .report-accordion[open] summary .accordion-icon { transform: rotate(180deg); }
            </style>
            <details class="report-accordion" style="width: 100%; border: 1px solid var(--border); border-radius: 12px; background: #f8fafc; overflow: hidden; margin-bottom: 16px;">
              <summary style="padding: 14px 16px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; font-weight: 600; font-size: 0.9rem; color: var(--foreground); user-select: none; transition: background 0.2s;" onmouseover="this.style.background='rgba(0,0,0,0.02)'" onmouseout="this.style.background='transparent'">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <div style="background: rgba(37,99,235,0.1); width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                    <i data-lucide="calendar" style="width: 16px; height: 16px; color: #2563eb;"></i>
                  </div>
                  <span>${now}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 12px;">
                  <span style="font-size: 0.75rem; background: rgba(37,99,235,0.15); color: #1e40af; padding: 4px 10px; border-radius: 6px; font-weight: 700;">${total} task${total !== 1 ? 's' : ''}</span>
                  <i data-lucide="chevron-down" class="accordion-icon" style="width: 18px; height: 18px; color: var(--muted); transition: transform 0.3s;"></i>
                </div>
              </summary>
              <div style="padding: 16px; border-top: 1px solid var(--border); background: #ffffff;">
          `;

          if (hasTasks) {
            summaryHTML += buildSummaryHTML('To-Do', '📋', todoTasks);
            summaryHTML += buildSummaryHTML('On-Progress', '🔄', progressTasks);
            summaryHTML += buildSummaryHTML('Done', '✅', doneTasks);
          } else {
            summaryHTML += `<p style="color: var(--muted); font-size: 0.85rem; text-align: center; margin: 0;">Tidak ada task pada board saat ini.</p>`;
          }

          summaryHTML += `
              </div>
            </details>
          `;

          reportSummaryContent.style.alignItems = 'stretch';
          reportSummaryContent.style.justifyContent = 'flex-start';
          reportSummaryContent.style.minHeight = 'auto';
          reportSummaryContent.innerHTML = summaryHTML;
          // Create icons inside the newly added accordion HTML
          lucide.createIcons({ nodes: reportSummaryContent.querySelectorAll('[data-lucide]') });
        }

        // ===== REMOVE ALL TASK CARDS FROM COLUMNS =====
        const allCards = container.querySelectorAll('.dev-column:not(#col-ai) .dev-task-card');
        allCards.forEach((card, index) => {
          setTimeout(() => {
            card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            card.style.opacity = '0';
            card.style.transform = 'scale(0.9) translateY(-10px)';
            setTimeout(() => card.remove(), 400);
          }, index * 100);
        });

        // Scroll to Report Summary after animation
        setTimeout(() => {
          const summaryWidget = container.querySelector('#report-summary-widget');
          if (summaryWidget) {
            summaryWidget.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, allCards.length * 100 + 500);

        generateRecapButton.innerHTML = origHTML;
        generateRecapButton.disabled = false;
        generateRecapButton.style.opacity = '1';
        lucide.createIcons({ nodes: recapCard.querySelectorAll('[data-lucide]') });
        lucide.createIcons({ nodes: generateRecapButton.querySelectorAll('[data-lucide]') });
      }, 1500);
    });
  }
}

