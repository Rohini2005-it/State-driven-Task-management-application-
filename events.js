/**
 * events.js — All DOM event bindings
 * Uses event delegation on the task list for performance.
 */

const Events = (() => {

  // ── Add Task ──────────────────────────────────────────────
  function _bindAddTask() {
    const input  = document.getElementById('taskInput');
    const btn    = document.getElementById('addTaskBtn');
    const select = document.getElementById('prioritySelect');

    function submit() {
      const text = input.value.trim();
      if (!text) {
        input.focus();
        input.classList.add('shake');
        setTimeout(() => input.classList.remove('shake'), 400);
        return;
      }
      State.addTask(text, select.value);
      input.value = '';
      select.value = 'medium';
      input.focus();
      Render.all();
      Render.toast('Task added ✓');
    }

    btn.addEventListener('click', submit);

    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') submit();
    });
  }

  // ── Task List Delegation ──────────────────────────────────
  function _bindTaskList() {
    const list = document.getElementById('taskList');

    list.addEventListener('click', e => {
      const item = e.target.closest('.task-item');
      if (!item) return;
      const id = item.dataset.id;

      // Toggle completion
      if (e.target.closest('[data-action="toggle"]')) {
        State.toggleTask(id);
        Render.all();
        return;
      }

      // Edit
      if (e.target.closest('[data-action="edit"]')) {
        const task = State.getTask(id);
        if (!task) return;
        State.setEditing(id);
        Render.openModal(task);
        return;
      }

      // Delete
      if (e.target.closest('[data-action="delete"]')) {
        State.deleteTask(id);
        Render.all();
        Render.toast('Task deleted');
        return;
      }

      // Selection checkbox
      if (e.target.classList.contains('task-select')) {
        State.toggleSelect(id);
        Render.tasks();
        Render.bulkActions();
        return;
      }
    });

    // Double-click task text to edit
    list.addEventListener('dblclick', e => {
      const text = e.target.closest('.task-text');
      if (!text) return;
      const item = text.closest('.task-item');
      if (!item) return;
      const task = State.getTask(item.dataset.id);
      if (!task) return;
      State.setEditing(task.id);
      Render.openModal(task);
    });
  }

  // ── Filter Nav ────────────────────────────────────────────
  function _bindNav() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        State.setFilter(btn.dataset.filter);
        Render.all();
      });
    });
  }

  // ── Sort Buttons ──────────────────────────────────────────
  function _bindSort() {
    document.querySelectorAll('.sort-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        State.setSort(btn.dataset.sort);
        Render.all();
      });
    });
  }

  // ── Select All ────────────────────────────────────────────
  function _bindSelectAll() {
    document.getElementById('selectAllBtn').addEventListener('click', () => {
      State.selectAll();
      Render.tasks();
      Render.bulkActions();
    });
  }

  // ── Clear Completed ───────────────────────────────────────
  function _bindClearCompleted() {
    document.getElementById('clearCompleted').addEventListener('click', () => {
      const count = State.clearCompleted();
      Render.all();
      if (count > 0) {
        Render.toast(`Cleared ${count} completed task${count !== 1 ? 's' : ''}`);
      } else {
        Render.toast('No completed tasks to clear');
      }
    });
  }

  // ── Bulk Actions ──────────────────────────────────────────
  function _bindBulkActions() {
    document.getElementById('bulkComplete').addEventListener('click', () => {
      const count = State.completeSelected();
      Render.all();
      Render.toast(`Marked ${count} task${count !== 1 ? 's' : ''} done`);
    });

    document.getElementById('bulkDelete').addEventListener('click', () => {
      const count = State.deleteSelected();
      Render.all();
      Render.toast(`Deleted ${count} task${count !== 1 ? 's' : ''}`);
    });

    document.getElementById('bulkCancel').addEventListener('click', () => {
      State.clearSelection();
      Render.tasks();
      Render.bulkActions();
    });
  }

  // ── Edit Modal ────────────────────────────────────────────
  function _bindModal() {
    // Priority chips
    document.getElementById('modalPriorityGroup').addEventListener('click', e => {
      const chip = e.target.closest('.priority-chip');
      if (!chip) return;
      document.querySelectorAll('.priority-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
    });

    // Save
    document.getElementById('modalSave').addEventListener('click', _saveModal);

    // Cancel
    document.getElementById('modalCancel').addEventListener('click', Render.closeModal.bind(Render));

    // Overlay click
    document.getElementById('modalOverlay').addEventListener('click', e => {
      if (e.target === document.getElementById('modalOverlay')) {
        Render.closeModal();
      }
    });

    // Enter key in modal input
    document.getElementById('modalInput').addEventListener('keydown', e => {
      if (e.key === 'Enter') _saveModal();
      if (e.key === 'Escape') Render.closeModal();
    });
  }

  function _saveModal() {
    const { text, priority } = Render.getModalValues();
    if (!text.trim()) {
      document.getElementById('modalInput').focus();
      return;
    }
    const id = State.editingId;
    if (id) {
      State.updateTask(id, text, priority);
      Render.all();
      Render.toast('Task updated ✓');
    }
    Render.closeModal();
  }

  // ── Keyboard Shortcuts ────────────────────────────────────
  function _bindKeyboard() {
    document.addEventListener('keydown', e => {
      const modal = document.getElementById('modalOverlay');
      if (!modal.hidden) return;

      // Escape: clear selection
      if (e.key === 'Escape') {
        State.clearSelection();
        Render.tasks();
        Render.bulkActions();
      }

      // n or /: focus add input
      if ((e.key === 'n' || e.key === '/') && !e.ctrlKey && !e.metaKey) {
        const input = document.getElementById('taskInput');
        if (document.activeElement !== input) {
          e.preventDefault();
          input.focus();
        }
      }
    });
  }

  // ── Public ────────────────────────────────────────────────
  return {
    init() {
      _bindAddTask();
      _bindTaskList();
      _bindNav();
      _bindSort();
      _bindSelectAll();
      _bindClearCompleted();
      _bindBulkActions();
      _bindModal();
      _bindKeyboard();
    },
  };
})();
