import express from 'express';
import path from 'node:path';
import * as fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const app = express();
const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, 'data', 'tasks.json');

app.use(express.json());
app.use(express.static(__dirname));

async function loadTasks() {
    try {
        const text = await fs.readFile(DATA_FILE, 'utf8');
        return JSON.parse(text);
    } catch (error) {
        if (error.code === 'ENOENT') return []; 
        throw error;
    }
}

async function saveTasks(nextTasks) {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    const text = JSON.stringify(nextTasks, null, 2);
    await fs.writeFile(DATA_FILE, text, 'utf8');
}

app.get('/api/v1/tasks', async (req, res) => {
    try {
        const tasks = await loadTasks(); 
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: "Ошибка чтения файла" });
    }
});

app.post('/api/v1/tasks', async (req, res) => {
    const { title, studentId } = req.body;
    
    if (!title || typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({ message: "title должен быть непустой строкой" });
    }

    try {
        const tasks = await loadTasks(); 

        const newTask = {
            id: Date.now().toString(),
            title: title.trim(),
            completed: false,
            studentId: studentId || "unknown"
        };

        const nextTasks = [...tasks, newTask];
        await saveTasks(nextTasks); 

        res.status(201).json(newTask);
    } catch (error) {
        res.status(500).json({ message: "Ошибка записи файла" });
    }
});

app.delete('/api/v1/tasks/:id', async (req, res) => {
    try {
        const tasks = await loadTasks();
        const index = tasks.findIndex(t => t.id === req.params.id);
        
        if (index === -1) {
            return res.status(404).json({ message: "Задача не найдена" });
        }

        const nextTasks = tasks.filter(t => t.id !== req.params.id);
        await saveTasks(nextTasks); 

        res.status(204).end();
    } catch (error) {
        res.status(500).json({ message: "Ошибка при удалении" });
    }
});

app.listen(PORT, () => {
    console.log(`Сервер запущен: http://localhost:${PORT}`);
});