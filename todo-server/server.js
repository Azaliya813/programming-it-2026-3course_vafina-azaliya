const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());

app.use(express.static(__dirname));

let tasks = [];

app.get('/api/v1/tasks', (req, res) => {
    res.json(tasks);
});

app.post('/api/v1/tasks', (req, res) => {
    const { title, studentId } = req.body;

    if (!title || typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({ message: "title должен быть непустой строкой" });
    }

    const newTask = {
        id: Date.now().toString(), 
        title: title.trim(),
        completed: false,
        studentId: studentId || "unknown"
    };

    tasks.push(newTask);
    res.status(201).json(newTask);
});

app.delete('/api/v1/tasks/:id', (req, res) => {
    const index = tasks.findIndex(t => t.id === req.params.id);
    
    if (index === -1) {
        return res.status(404).json({ message: "Задача не найдена" });
    }

    tasks.splice(index, 1);
    res.status(204).end(); 
});

app.listen(PORT, () => {
    console.log(`Сервер запущен: http://localhost:${PORT}`);
});