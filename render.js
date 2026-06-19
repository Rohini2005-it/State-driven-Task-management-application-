/**
 * render.js — Pure DOM rendering layer
 * Reads from State, writes to DOM. No business logic here.
 */

const Render = (() => {

  // ── Element references ────────────────────────────────────
  const els = {
    taskList:     () => document.getElementById('taskList'),
    emptyState:   () => document.getElementById('emptyState'),
    progressBar:  () => document.getElementById('progressBar'),
    viewTitle:    () => document.getElementById('viewTitle'),
    currentDate:  () => document.getElementById('currentDate'),
    badgeAll:     () => document.getElementById('badge-all'),
    badgeActive:  () => document.getElementById('badge-active'),
    badgeCompleted: () => document.getElementById('badge-completed'),
    statTotal:    () => document.getElementById('stat-total'),
    statDone:     () => document.getElementById('stat-done'),
    navBtns:      () => document.querySelectorAll('.nav-btn'),
    sortBtns:     () => document.querySelectorAll('.sort-btn'),
    bulkActions:  () => document.getElementById('bulkActions'),
    bulkCount:    () => document.getElementById('bulkCount'),
    modalOverlay: () => document.getElementById('modalOverlay'),
    modalInput:   () => document.getElementById('modalInput'),
    modalPriorityGroup: () => document.getElementById('modalPriorityGroup'),
    toast:        () => document.getElementById('toast'),
  };

  // ── Helpers ───────────────────────────────────────────────
  function _formatDate(ts) {
    const d = new Date(ts);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  function _escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  const FILTER_TITLES = { all: 'All Tasks', active: 'Active', completed: 'Completed' };

  // ── Build a task <li> element ─────────────────────────────
  function _buildTaskEl(task, isSelected) {
    const li = document.createElement('li');
    li.className = `task-item${task.completed ? ' completed' : ''}${isSelected ? ' selected' : ''}`;
    li.dataset.id = task.id;

    li.innerHTML = `
      <input type="checkbox" class="task-select" ${isSelected ? 'checked' : ''} aria-label="Select task" />
      <span class="priority-dot" data-priority="${task.priority}" title="${task.priority} priority"></span>
      <button class="task-check ${task.completed ? 'checked' : ''}" data-action="toggle" aria-label="${task.completed ? 'Mark incomplete' : 'Mark complete'}"></button>
      <span class="task-text" title="${_escapeHTML(task.text)}">${_escapeHTML(task.text)}</span>
      <span class="task-meta">${_formatDate(task.createdAt)}</span>
      <div class="task-actions">
        <button class="task-action-btn" data-action="edit" aria-label="Edit task">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9.5 1.5L12.5 4.5L5 12H2V9L9.5 1.5Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>
          </svg>
        </button>
        <button class="task-action-btn delete" data-action="delete" aria-label="Delete task">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 3.5H12M5.5 3.5V2H8.5V3.5M5 5.5V10M9 5.5V10M3 3.5L3.5 12H10.5L11 3.5H3Z" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    `;

    return li;
  }

  // ── Toast timer ───────────────────────────────────────────
  let _toastTimer = null;

  // ── Public API ────────────────────────────────────────────
  return {

    initDate() {
      const now = new Date();
      els.currentDate().textContent = now.toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric'
      });
    },

    tasks() {
      const list    = els.taskList();
      const empty   = els.emptyState();
      const tasks   = State.getFilteredSortedTasks();
      const selIds  = State.selectedIds;

      // Diff-aware update: rebuild list
      list.innerHTML = '';

      if (tasks.length === 0) {
        empty.hidden = false;
        const filter = State.filter;
        document.getElementById('emptyTitle').textContent =
          filter === 'completed' ? 'No completed tasks' :
          filter === 'active'    ? 'All caught up!' :
                                   'No tasks yet';
        document.getElementById('emptySub').textContent =
          filter === 'all' ? 'Add your first task above to get started.' :
          filter === 'active' ? 'Add a new task or check your completed list.' :
          'Complete some tasks to see them here.';
      } else {
        empty.hidden = true;
        const frag = document.createDocumentFragment();
        tasks.forEach(t => {
          frag.appendChild(_buildTaskEl(t, selIds.has(t.id)));
        });
        list.appendChild(frag);
      }
    },

    stats() {
      const { total, active, completed } = State.getCounts();
      els.badgeAll().textContent       = total;
      els.badgeActive().textContent    = active;
      els.badgeCompleted().textContent = completed;
      els.statTotal().textContent      = total;

      const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
      els.statDone().textContent       = `${pct}%`;
      els.progressBar().style.width    = `${pct}%`;
    },

    filter() {
      const f = State.filter;
      els.navBtns().forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === f);
      });
      els.viewTitle().textContent = FILTER_TITLES[f];
    },

    sort() {
      const s = State.sort;
      els.sortBtns().forEach(btn => {
        btn.classList.toggle('active', btn.dataset.sort === s);
      });
    },

    bulkActions() {
      const count   = State.selectedIds.size;
      const panel   = els.bulkActions();
      panel.hidden  = count === 0;
      if (count > 0) {
        els.bulkCount().textContent = `${count} selected`;
      }
    },

    openModal(task) {
      const input  = els.modalInput();
      const group  = els.modalPriorityGroup();
      input.value  = task.text;

      group.querySelectorAll('.priority-chip').forEach(chip => {
        chip.classList.toggle('active', chip.dataset.value === task.priority);
      });

      els.modalOverlay().hidden = false;
      input.focus();
      input.select();
    },

    closeModal() {
      els.modalOverlay().hidden = true;
      State.setEditing(null);
    },

    getModalValues() {
      const text     = els.modalInput().value;
      const group    = els.modalPriorityGroup();
      const active   = group.querySelector('.priority-chip.active');
      const priority = active ? active.dataset.value : 'medium';
      return { text, priority };
    },

    toast(message, duration = 2500) {
      const el = els.toast();
      el.textContent = message;
      el.classList.add('visible');
      if (_toastTimer) clearTimeout(_toastTimer);
      _toastTimer = setTimeout(() => el.classList.remove('visible'), duration);
    },

    // Full re-render shortcut
    all() {
      this.tasks();
      this.stats();
      this.filter();
      this.sort();
      this.bulkActions();
    },
  };
})();
