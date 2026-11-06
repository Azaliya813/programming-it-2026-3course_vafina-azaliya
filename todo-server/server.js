import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pool from './db.js'; 

const app = express();
const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.static(__dirname));

app.get('/api/v1/tasks', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, title, completed, student_id AS studentId FROM tasks');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Ошибка базы данных" });
    }
});

app.post('/api/v1/tasks', async (req, res) => {
    const { title, studentId } = req.body;
    if (!title || typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({ message: "title должен быть непустой строкой" });
    }
    try {
        const [result] = await pool.execute(
            'INSERT INTO tasks (title, student_id) VALUES (?, ?)',
            [title.trim(), studentId || "unknown"]
        );
        const newTask = {
            id: result.insertId,
            title: title.trim(),
            completed: false,
            studentId: studentId || "unknown"
        };
        res.status(201).json(newTask);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Ошибка при создании задачи" });
    }
});

app.delete('/api/v1/tasks/:id', async (req, res) => {
    try {
        const [result] = await pool.execute('DELETE FROM tasks WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Задача не найдена" });
        }
        res.status(204).end();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Ошибка при удалении" });
    }
});

app.put('/api/v1/tasks/:id', async (req, res) => {
    const { completed } = req.body;
    const taskId = req.params.id;

    if (typeof completed !== 'boolean') {
        return res.status(400).json({ message: "completed должен быть boolean" });
    }

    try {

        const [result] = await pool.execute(
            'UPDATE tasks SET completed = ? WHERE id = ?',
            [Number(completed), taskId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Задача не найдена" });
        }
        res.status(200).json({ id: taskId, completed: completed });
    } catch (error) {
        console.error("Ошибка при обновлении:", error);
        res.status(500).json({ message: "Ошибка при обновлении задачи" });
    }
});

app.listen(PORT, () => {
    console.log(`Сервер запущен: http://localhost:3000`);
});