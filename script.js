const API_URL = "https://6ac64b73bea0e72cf5c8d494.mockapi.io/api/v1/tasks";
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

        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }

        const allTasks = await response.json();

        tasks = allTasks.filter(task => task.studentId === STUDENT_ID);
        
        renderTasks();

    } catch (error) {
        console.error(error);

        taskList.innerHTML = `
            <li style="text-align:center; padding: 20px; color: #ff5252;">
                ⚠️ Ошибка загрузки данных.<br>
                <button onclick="loadTasks()" style="margin-top:10px; padding: 8px 16px; border:none; border-radius:5px; background:var(--btn-bg); color:white; cursor:pointer;">Повторить</button>
            </li>
        `;
    }
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
    
    if (text === '') {
        input.style.border = '2px solid #ff5252';
        setTimeout(() => input.style.border = 'none', 1000);
        return;
    }

    const submitBtn = form.querySelector('.btn-add');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Отправка...';

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                title: text, 
                completed: false,
                studentId: STUDENT_ID 
            })
        });

        if (!response.ok) throw new Error("Не удалось создать задачу");

        input.value = '';
        await loadTasks();

    } catch (error) {
        alert("Ошибка при создании задачи: " + error.message);
    } finally {

        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        input.focus();
    }
});

taskList.addEventListener('click', async (e) => {
    const li = e.target.closest('.task-item');
    if (!li) return;

    const taskId = li.dataset.id;

    if (e.target.classList.contains('btn-delete')) {
        try {
            const response = await fetch(`${API_URL}/${taskId}`, { method: "DELETE" });
            if (!response.ok) throw new Error("Не удалось удалить");
            await loadTasks(); // Перезагружаем список
        } catch (error) {
            alert("Ошибка при удалении: " + error.message);
        }
    }

    if (e.target.classList.contains('task-checkbox')) {

        const task = tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = e.target.checked;

            await fetch(`${API_URL}/${taskId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ completed: task.completed })
            });
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

loadTasks();