import './style.css'

const storageKey = 'ledger-tasks'
const themeKey = 'ledger-theme'
const initialTasks = [
  { id: 1, title: 'Review the quarterly notes', detail: 'The small print matters.', tag: 'Work', due: 'Today', done: false },
  { id: 2, title: 'Book a table for Thursday', detail: 'Somewhere worth lingering.', tag: 'Personal', due: 'Tomorrow', done: false },
  { id: 3, title: 'Send the thank-you note', detail: 'A gracious close to the week.', tag: 'Personal', due: 'Fri, 14 Jun', done: true },
  { id: 4, title: 'Order fresh stationery', detail: 'Cream paper, black ink.', tag: 'Errands', due: 'Sat, 15 Jun', done: false },
]

let tasks = JSON.parse(localStorage.getItem(storageKey) || 'null') || initialTasks
let activeFilter = 'All items'
let query = ''
const app = document.querySelector('#app')

const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character])
const save = () => localStorage.setItem(storageKey, JSON.stringify(tasks))
const remaining = () => tasks.filter((task) => !task.done).length

function render() {
  const visibleTasks = tasks.filter((task) => {
    const matchesFilter = activeFilter === 'All items' || (activeFilter === 'Open' && !task.done) || (activeFilter === 'Completed' && task.done)
    const matchesQuery = `${task.title} ${task.detail} ${task.tag}`.toLowerCase().includes(query.toLowerCase())
    return matchesFilter && matchesQuery
  })

  app.innerHTML = `
    <div class="app-shell">
      <header class="topbar">
        <a class="brand" href="#" aria-label="Ledger home"><span class="brand-mark">L</span><span>Ledger</span></a>
        <div class="topbar-actions"><span class="local-note"><span class="status-dot"></span>Saved locally</span><button class="icon-button" id="theme-toggle" aria-label="Switch theme" title="Switch theme">◐</button></div>
      </header>
      <main>
        <section class="intro">
          <div><p class="eyebrow">Sunday, 09 June 2024</p><h1>A considered day.</h1><p class="subtitle">Keep the important things in view.</p></div>
          <div class="completion"><span class="completion-value">${Math.round((tasks.filter((task) => task.done).length / Math.max(tasks.length, 1)) * 100)}%</span><span>of your ledger<br>is complete</span></div>
        </section>
        <section class="workspace">
          <aside class="sidebar">
            <div class="section-label">View</div>
            <nav class="filters" aria-label="Task filters">
              ${['All items', 'Open', 'Completed'].map((filter) => `<button class="filter ${activeFilter === filter ? 'active' : ''}" data-filter="${filter}"><span>${filter}</span><span class="filter-count">${filter === 'All items' ? tasks.length : filter === 'Open' ? remaining() : tasks.filter((task) => task.done).length}</span></button>`).join('')}
            </nav>
            <div class="sidebar-rule"></div><div class="section-label">By collection</div>
            <div class="collections"><span><i class="collection-dot work"></i>Work</span><span><i class="collection-dot personal"></i>Personal</span><span><i class="collection-dot errands"></i>Errands</span></div>
            <p class="sidebar-foot">A quiet place for a<br>clearer mind.</p>
          </aside>
          <section class="task-panel">
            <div class="panel-head"><div><span class="section-label">Your ledger</span><h2>${activeFilter}</h2></div><label class="search"><span>⌕</span><input id="search-input" value="${escapeHtml(query)}" placeholder="Find a task" aria-label="Find a task"></label></div>
            <form class="new-task" id="new-task-form"><span class="plus">＋</span><input id="new-task-input" placeholder="Add a new item to your day..." aria-label="New task" autocomplete="off"><button type="submit">Add item</button></form>
            <div class="task-list">${visibleTasks.length ? visibleTasks.map(taskTemplate).join('') : `<div class="empty-state"><span>✦</span><strong>Nothing here for now.</strong><p>Enjoy the cleared space, or add something new above.</p></div>`}</div>
            <div class="panel-foot"><span>${remaining()} ${remaining() === 1 ? 'item' : 'items'} remaining</span><span>Private by design</span></div>
          </section>
        </section>
      </main>
      <footer><span>LEDGER / VOL. I</span><span>All your notes, kept close.</span><span>2024</span></footer>
    </div>`
  bindEvents()
}

function taskTemplate(task) {
  return `<article class="task ${task.done ? 'is-done' : ''}" data-id="${task.id}"><button class="check" data-action="toggle" aria-label="${task.done ? 'Mark as open' : 'Mark as complete'}">${task.done ? '✓' : ''}</button><div class="task-copy"><h3>${escapeHtml(task.title)}</h3><p>${escapeHtml(task.detail)}</p></div><span class="tag tag-${task.tag.toLowerCase()}">${escapeHtml(task.tag)}</span><span class="due ${task.due === 'Today' ? 'today' : ''}">${escapeHtml(task.due)}</span><button class="delete" data-action="delete" aria-label="Delete ${escapeHtml(task.title)}">×</button></article>`
}

function bindEvents() {
  document.querySelectorAll('[data-filter]').forEach((button) => button.addEventListener('click', () => { activeFilter = button.dataset.filter; render() }))
  document.querySelector('#new-task-form').addEventListener('submit', (event) => {
    event.preventDefault()
    const input = document.querySelector('#new-task-input')
    if (!input.value.trim()) return
    tasks.unshift({ id: Date.now(), title: input.value.trim(), detail: 'Added just now.', tag: 'Personal', due: 'Today', done: false })
    save(); render()
  })
  document.querySelector('#search-input').addEventListener('input', (event) => { query = event.target.value; render(); document.querySelector('#search-input').focus() })
  document.querySelectorAll('[data-action]').forEach((button) => button.addEventListener('click', () => {
    const task = tasks.find((item) => item.id === Number(button.closest('.task').dataset.id))
    if (button.dataset.action === 'toggle') task.done = !task.done
    if (button.dataset.action === 'delete') tasks = tasks.filter((item) => item.id !== task.id)
    save(); render()
  }))
  document.querySelector('#theme-toggle').addEventListener('click', () => {
    const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = nextTheme; localStorage.setItem(themeKey, nextTheme)
  })
}

document.documentElement.dataset.theme = localStorage.getItem(themeKey) || 'light'
render()
