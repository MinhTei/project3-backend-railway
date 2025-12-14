const express = require('express');
const cors = require('cors'); // Cho phép người lạ truy cập
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// 1. MỞ CỔNG (QUAN TRỌNG NHẤT PROJECT 3)
app.use(cors()); 
app.use(express.json());

// 2. Kết nối Database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Bắt buộc cho Render
});

// 3. Các API (Chỉ trả về data, không trả về HTML)

// Test server sống hay chết
app.get('/', (req, res) => {
  res.json({ message: "Hello! Đây là Backend của Minh Tài Project 3" });
});

// Lấy danh sách công việc
app.get('/todos', async (req, res) => {
  try {
    const allTodos = await pool.query('SELECT * FROM todos');
    res.json(allTodos.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi Server');
  }
});

// Thêm công việc mới
app.post('/todos', async (req, res) => {
  try {
    const { description } = req.body;
    const newTodo = await pool.query(
      'INSERT INTO todos (description) VALUES($1) RETURNING *',
      [description]
    );
    res.json(newTodo.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
});

// Chạy server
app.listen(port, () => {
  console.log(`Backend đang chạy tại cổng ${port}`);
});