let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';

const form = document.getElementById('task-form');
const input = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const filterBtns = document.querySelectorAll('.filter-btn');
const themeToggle = document.getElementById('theme-toggle');

if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-theme');
    themeToggle.textContent = '☀️';
}

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    if (document.body.classList.contains('dark-theme')) {
        localStorage.setItem('theme', 'dark');
        themeToggle.textContent = '☀️';
    } else {
        localStorage.setItem('theme', 'light');
        themeToggle.textContent = '🌙';
    }
});

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function renderTasks() {
    taskList.innerHTML = '';

    let filteredTasks = tasks;
    if (currentFilter === 'active') {
        filteredTasks = tasks.filter(task => !task.completed);
    } else if (currentFilter === 'completed') {
        filteredTasks = tasks.filter(task => task.completed);
    }

    if (filteredTasks.length === 0) {
        taskList.innerHTML = `<li style="text-align:center; padding: 20px; color: var(--text-muted); font-style: italic;">Задач пока нет...</li>`;
        return;
    }

    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        li.dataset.id = task.id;

        li.innerHTML = `
            <div class="task-content">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <span class="task-text">${task.text}</span>
            </div>
            <button class="btn-delete" title="Удалить задачу">✕</button>
        `;

        taskList.appendChild(li);
    });
}

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    
    if (text === '') {

        input.style.border = '2px solid #ff5252';
        setTimeout(() => input.style.border = 'none', 1000);
        return;
    }

    const newTask = {
        id: Date.now().toString(),
        text: text,
        completed: false
    };

    tasks.push(newTask);
    saveTasks();
    renderTasks();
    
    input.value = '';
    input.focus();
});

taskList.addEventListener('click', (e) => {
    const li = e.target.closest('.task-item');
    if (!li) return;

    const taskId = li.dataset.id;

    if (e.target.classList.contains('btn-delete')) {
        tasks = tasks.filter(task => task.id !== taskId);
        saveTasks();
        renderTasks();
    }
    
    if (e.target.classList.contains('task-checkbox')) {
        const task = tasks.find(task => task.id === taskId);
        if (task) {
            task.completed = e.target.checked;
            saveTasks();
            renderTasks();
        }
    }
});

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        currentFilter = btn.dataset.filter;
        renderTasks();
    });
});

renderTasks();