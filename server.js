const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// 1. Kết nối Database PostgreSQL (Lấy link từ biến môi trường Render)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Bắt buộc cho Render
});

// 2. Tạo bảng dữ liệu nếu chưa có (Chạy 1 lần đầu)
pool.query(`
  CREATE TABLE IF NOT EXISTS todos (
    id SERIAL PRIMARY KEY,
    task TEXT NOT NULL
  );
`);

// 3. API Lấy danh sách
app.get('/api/todos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM todos');
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// 4. API Thêm công việc
app.post('/api/todos', async (req, res) => {
  try {
    const { task } = req.body;
    const result = await pool.query('INSERT INTO todos (task) VALUES ($1) RETURNING *', [task]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// 5. Cấu hình phục vụ React (Sau khi Build)
app.use(express.static(path.join(__dirname, 'client/dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});