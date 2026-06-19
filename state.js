/**
 * state.js — Single source of truth
 * All application data lives here. State is persisted to localStorage.
 */

const STORAGE_KEY = 'taskflow_v1';

const State = (() => {
  // Internal state object
  let _state = {
    tasks: [],
    filter: 'all',       // 'all' | 'active' | 'completed'
    sort: 'created',     // 'created' | 'priority' | 'alpha'
    selectedIds: new Set(),
    editingId: null,
  };

  // ── Persistence ──────────────────────────────────────────
  function _load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        _state.tasks = saved.tasks || [];
        _state.filter = saved.filter || 'all';
        _state.sort = saved.sort || 'created';
      }
    } catch (e) {
      console.warn('Taskflow: failed to load state', e);
    }
  }

  function _save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        tasks: _state.tasks,
        filter: _state.filter,
        sort: _state.sort,
      }));
    } catch (e) {
      console.warn('Taskflow: failed to save state', e);
    }
  }

  // ── Task helpers ─────────────────────────────────────────
  function _genId() {
    return `t_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  }

  // ── Public API ───────────────────────────────────────────
  return {
    init() {
      _load();
    },

    // Getters
    get tasks()       { return _state.tasks; },
    get filter()      { return _state.filter; },
    get sort()        { return _state.sort; },
    get selectedIds() { return _state.selectedIds; },
    get editingId()   { return _state.editingId; },

    getTask(id) {
      return _state.tasks.find(t => t.id === id) || null;
    },

    getFilteredSortedTasks() {
      let list = [..._state.tasks];

      // Filter
      if (_state.filter === 'active') {
        list = list.filter(t => !t.completed);
      } else if (_state.filter === 'completed') {
        list = list.filter(t => t.completed);
      }

      // Sort
      const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };
      if (_state.sort === 'priority') {
        list.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
      } else if (_state.sort === 'alpha') {
        list.sort((a, b) => a.text.localeCompare(b.text));
      } else {
        // 'created' — newest first
        list.sort((a, b) => b.createdAt - a.createdAt);
      }

      return list;
    },

    getCounts() {
      const total = _state.tasks.length;
      const completed = _state.tasks.filter(t => t.completed).length;
      const active = total - completed;
      return { total, active, completed };
    },

    // Mutators
    addTask(text, priority = 'medium') {
      const task = {
        id: _genId(),
        text: text.trim(),
        completed: false,
        priority,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      _state.tasks.unshift(task);
      _save();
      return task;
    },

    toggleTask(id) {
      const task = _state.tasks.find(t => t.id === id);
      if (task) {
        task.completed = !task.completed;
        task.updatedAt = Date.now();
        _save();
      }
    },

    updateTask(id, text, priority) {
      const task = _state.tasks.find(t => t.id === id);
      if (task) {
        task.text = text.trim();
        task.priority = priority;
        task.updatedAt = Date.now();
        _save();
      }
    },

    deleteTask(id) {
      _state.tasks = _state.tasks.filter(t => t.id !== id);
      _state.selectedIds.delete(id);
      _save();
    },

    deleteSelected() {
      const ids = [..._state.selectedIds];
      _state.tasks = _state.tasks.filter(t => !_state.selectedIds.has(t.id));
      _state.selectedIds.clear();
      _save();
      return ids.length;
    },

    completeSelected() {
      _state.tasks.forEach(t => {
        if (_state.selectedIds.has(t.id)) {
          t.completed = true;
          t.updatedAt = Date.now();
        }
      });
      const count = _state.selectedIds.size;
      _state.selectedIds.clear();
      _save();
      return count;
    },

    clearCompleted() {
      const count = _state.tasks.filter(t => t.completed).length;
      _state.tasks = _state.tasks.filter(t => !t.completed);
      _state.selectedIds.clear();
      _save();
      return count;
    },

    setFilter(filter) {
      _state.filter = filter;
      _state.selectedIds.clear();
      _save();
    },

    setSort(sort) {
      _state.sort = sort;
    },

    toggleSelect(id) {
      if (_state.selectedIds.has(id)) {
        _state.selectedIds.delete(id);
      } else {
        _state.selectedIds.add(id);
      }
    },

    selectAll() {
      const visible = this.getFilteredSortedTasks();
      const allSelected = visible.every(t => _state.selectedIds.has(t.id));
      if (allSelected) {
        _state.selectedIds.clear();
      } else {
        visible.forEach(t => _state.selectedIds.add(t.id));
      }
    },

    clearSelection() {
      _state.selectedIds.clear();
    },

    setEditing(id) {
      _state.editingId = id;
    },
  };
})();
