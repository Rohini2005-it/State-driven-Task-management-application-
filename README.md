# Taskflow — State-Driven Task Management Application

A fully client-side, state-driven To-Do list app built with **vanilla JavaScript**, demonstrating professional patterns for DOM manipulation, event delegation, and localStorage persistence.

---

## Getting Started

1. Unzip the project folder.
2. Open `index.html` in any modern browser — no build step, no dependencies, no server required.

---

## Features

### CRUD Operations
| Action | How |
|--------|-----|
| **Create** | Type in the top input + press Enter or click **+** |
| **Read** | Tasks render instantly from state on load |
| **Update** | Click the ✏️ icon **or** double-click any task text |
| **Delete** | Click the 🗑️ icon on hover, or select + bulk-delete |

### Filtering
Use the left sidebar to switch between **All**, **Active**, and **Completed** views. Filter preference is persisted.

### Sorting
Sort the visible list by **Date created** (newest first), **Priority** (high → low), or **A–Z** alphabetically.

### Bulk Actions
Tick the selection checkboxes on multiple tasks to:
- Mark all selected as **Done**
- **Delete** all selected at once
- Hit **Cancel** to deselect

### localStorage Persistence
Every change (add, toggle, edit, delete, filter) is immediately written to `localStorage` under the key `taskflow_v1`. Reload the page — your data is still there.

### Keyboard Shortcuts
| Key | Action |
|-----|--------|
| `N` or `/` | Focus the add-task input |
| `Enter` | Submit new task / save edit |
| `Escape` | Clear selection / close modal |

---

## Architecture

```
index.html          — Shell, semantic markup, no inline JS
css/
  style.css         — All styles; CSS custom properties for theming
js/
  state.js          — Single source of truth (IIFE module, localStorage)
  render.js         — Pure DOM rendering; reads State, writes DOM
  events.js         — All event listeners; delegates on task list
  app.js            — Bootstrap: init → render → bind events
```

### Data Flow

```
User Action
    │
    ▼
events.js  ──calls──▶  State mutator  ──saves──▶  localStorage
                              │
                              ▼
                       Render.all()  ──updates──▶  DOM
```

### State Shape (localStorage JSON)

```json
{
  "tasks": [
    {
      "id": "t_1718000000000_abc12",
      "text": "My task",
      "completed": false,
      "priority": "high",
      "createdAt": 1718000000000,
      "updatedAt": 1718000000000
    }
  ],
  "filter": "all",
  "sort": "created"
}
```

---

## Design Tokens

| Token | Value | Role |
|-------|-------|------|
| `--bg-base` | `#0e0f14` | App background |
| `--bg-card` | `#1a1d27` | Task cards |
| `--accent` | `#00e5c3` | Neon cyan — CTAs, active states |
| `--priority-high` | `#ff5757` | High priority |
| `--priority-medium` | `#ffb547` | Medium priority |
| `--priority-low` | `#4c8dff` | Low priority |

Fonts: **DM Sans** (UI) + **DM Mono** (badges, dates, stats). Loaded from Google Fonts.

---

## Browser Support

Works in all modern browsers (Chrome, Firefox, Safari, Edge). Requires no polyfills.
