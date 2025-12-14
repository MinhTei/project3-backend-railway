const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// ✅ CORS PHẢI ĐƯỢC ĐẶT ĐẦU TIÊN - TRƯỚC TẤT CẢ ROUTES
app.use(cors());

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

app.use(express.json());

// 2. KẾT NỐI DATABASE (Render Postgres)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Test kết nối database
pool.on('error', (err) => {
  console.error('🔴 Database connection error:', err);
});

pool.connect()
  .then(client => {
    console.log('✅ Database connected successfully!');
    client.release();
  })
  .catch(err => {
    console.error('🔴 Database connection failed:', err.message);
  });

// 3. CÁC API

// Test server
app.get('/', (req, res) => {
  res.json({ message: "Backend Project 3 đang chạy ngon lành!" });
});

// Lấy danh sách (GET)
app.get('/todos', async (req, res) => {
  try {
    console.log('📡 GET /todos - fetching...');
    const allTodos = await pool.query('SELECT * FROM todos ORDER BY todo_id ASC');
    console.log('✅ Fetched:', allTodos.rows.length, 'todos');
    res.json(allTodos.rows);
  } catch (err) {
    console.error('❌ GET /todos error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Thêm mới (POST)
app.post('/todos', async (req, res) => {
  try {
    const { description } = req.body;
    console.log('📡 POST /todos - description:', description);
    const newTodo = await pool.query(
      'INSERT INTO todos (description) VALUES($1) RETURNING *',
      [description]
    );
    console.log('✅ Created todo:', newTodo.rows[0]);
    res.json(newTodo.rows[0]);
  } catch (err) {
    console.error('❌ POST /todos error:', err.message);
    res.status(500).json({ error: err.message });
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
app.listen(port, '0.0.0.0', () => {
  console.log(`Backend đang chạy tại cổng ${port}`);
});