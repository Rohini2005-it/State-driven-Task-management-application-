/**
 * app.js — Bootstrap
 * Initialises State → Render → Events in order.
 */

(function () {
  'use strict';

  // 1. Load persisted state
  State.init();

  // 2. Seed demo tasks for first-time users
  if (State.tasks.length === 0) {
    const demos = [
      { text: 'Welcome to Taskflow! Double-click any task to edit it.', priority: 'high' },
      { text: 'Press N or / to quickly focus the add-task field.', priority: 'medium' },
      { text: 'Select multiple tasks with checkboxes for bulk actions.', priority: 'low' },
      { text: 'Your tasks persist automatically across browser reloads.', priority: 'medium' },
    ];
    // Add in reverse so newest-first ordering looks natural
    [...demos].reverse().forEach(d => State.addTask(d.text, d.priority));
  }

  // 3. Initial render
  Render.initDate();
  Render.all();

  // 4. Bind events
  Events.init();

  // 5. Focus input
  document.getElementById('taskInput').focus();

  console.log('%c Taskflow loaded ', 'background:#00e5c3;color:#0e0f14;font-weight:bold;border-radius:4px;padding:2px 8px;');
})();
