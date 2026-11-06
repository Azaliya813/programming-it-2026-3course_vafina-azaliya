const API_URL = "/api/v1/tasks";
const STUDENT_ID = "Vafina_Azaliya"; 

const form = document.getElementById('task-form');
const input = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const filterBtns = document.querySelectorAll('.filter-btn');
const themeToggle = document.getElementById('theme-toggle');

let tasks = [];
let currentFilter = 'all';

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

async function loadTasks() {
    taskList.innerHTML = '<li style="text-align:center; padding: 20px; color: var(--text-muted);">Загрузка задач...</li>';
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status}`);
        const allTasks = await response.json();
        tasks = allTasks.filter(task => task.studentId === STUDENT_ID);
        renderTasks();
    } catch (error) {
        console.error(error);
        taskList.innerHTML = `<li style="text-align:center; padding: 20px; color: #ff5252;">⚠️ Ошибка загрузки данных.</li>`;
    }
}

function renderTasks() {
    taskList.innerHTML = '';
    let filteredTasks = tasks;
    if (currentFilter === 'active') filteredTasks = tasks.filter(task => !task.completed);
    else if (currentFilter === 'completed') filteredTasks = tasks.filter(task => task.completed);

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
                <span class="task-text">${task.title}</span>
            </div>
            <button class="btn-delete" title="Удалить задачу">✕</button>
        `;
        taskList.appendChild(li);
    });
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (text === '') return;
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: text, completed: false, studentId: STUDENT_ID })
        });
        if (!response.ok) throw new Error("Не удалось создать");
        input.value = '';
        await loadTasks();
    } catch (error) { alert(error.message); }
});

taskList.addEventListener('click', async (e) => {
    const li = e.target.closest('.task-item');
    if (!li) return;
    const taskId = li.dataset.id;

    if (e.target.classList.contains('btn-delete')) {
        try {
            await fetch(`${API_URL}/${taskId}`, { method: "DELETE" });
            await loadTasks(); 
        } catch (error) { alert("Ошибка удаления"); }
    }

    if (e.target.classList.contains('task-checkbox')) {
        const task = tasks.find(t => t.id == taskId);
        if (task) {
            task.completed = e.target.checked;
            try {
                const response = await fetch(`${API_URL}/${taskId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ completed: task.completed })
                });
                if (!response.ok) throw new Error("Ошибка сервера");
                renderTasks(); 
            } catch (error) {
                console.error(error);
                task.completed = !task.completed; 
                renderTasks();
            }
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

loadTasks();