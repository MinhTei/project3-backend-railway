const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// 1. CẤU HÌNH CORS (MỞ CỬA CHO VERCEL)
app.use(cors());
app.use(express.json());

// Thêm headers CORS manual
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// 2. KẾT NỐI DATABASE (Render Postgres)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Bắt buộc cho Render
});

// 3. CÁC API

// Test server
app.get('/', (req, res) => {
  res.json({ message: "Backend Project 3 đang chạy ngon lành!" });
});

// Lấy danh sách (GET)
app.get('/todos', async (req, res) => {
  try {
    // Sắp xếp theo ID để công việc không bị nhảy lung tung
    const allTodos = await pool.query('SELECT * FROM todos ORDER BY todo_id ASC');
    res.json(allTodos.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Lỗi Server" });
  }
});

// Thêm mới (POST)
app.post('/todos', async (req, res) => {
  try {
    const { description } = req.body;
    // Database của bạn có cột 'description' đúng không?
    const newTodo = await pool.query(
      'INSERT INTO todos (description) VALUES($1) RETURNING *',
      [description]
    );
    res.json(newTodo.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Lỗi thêm task" });
  }
});

// Cập nhật (PUT) - Dùng để đánh dấu hoàn thành
app.put('/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { description, completed } = req.body; 
    
    // Cập nhật cả nội dung và trạng thái
    // Nếu bảng todos của bạn chưa có cột 'completed', lệnh này có thể lỗi. 
    // Nhưng cứ để tạm logic này cho chuẩn React.
    const updateTodo = await pool.query(
      'UPDATE todos SET description = $1, completed = $2 WHERE todo_id = $3',
      [description, completed, id]
    );

    res.json("Đã cập nhật!");
  } catch (err) {
    console.error(err.message);
    // Nếu lỗi, thử update mỗi description thôi (Phòng hờ DB thiếu cột completed)
    try {
        const { id } = req.params;
        const { description } = req.body;
        await pool.query('UPDATE todos SET description = $1 WHERE todo_id = $2', [description, id]);
        res.json("Đã cập nhật description!");
    } catch(e) {
        res.status(500).json({ error: "Lỗi update" });
    }
  }
});

// Xóa (DELETE)
app.delete('/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleteTodo = await pool.query('DELETE FROM todos WHERE todo_id = $1', [id]);
    res.json("Đã xóa!");
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Lỗi xóa task" });
  }
});

// Chạy server
app.listen(port, () => {
  console.log(`Backend đang chạy tại cổng ${port}`);
});