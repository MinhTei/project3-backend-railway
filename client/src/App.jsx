import { useEffect, useState } from 'react';

function App() {
  const [todos, setTodos] = useState([]);
  const [task, setTask] = useState('');

  // 1. Khi web vừa load -> Gọi API lấy danh sách
  useEffect(() => {
    fetch('/api/todos') // Gọi thẳng /api vì đang chạy chung domain (Monolith)
      .then(res => res.json())
      .then(data => setTodos(data))
      .catch(err => console.error("Lỗi:", err));
  }, []);

  // 2. Hàm thêm công việc mới
  const addTask = async (e) => {
    e.preventDefault(); // Chặn load lại trang
    if(!task) return;

    try {
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task })
      });
      const newTodo = await res.json();
      
      // Cập nhật giao diện ngay lập tức
      setTodos([...todos, newTodo]);
      setTask(''); // Xóa ô nhập
    } catch (err) {
      alert("Lỗi thêm task: " + err);
    }
  };

  return (
    <div style={{ padding: "40px", fontFamily: "Arial", maxWidth: "600px", margin: "0 auto" }}>
      <h1 style={{ color: "#646cff" }}>Project 2: Fullstack Render 🚀</h1>
      <p>Node.js + React + PostgreSQL (Chạy chung 1 chỗ)</p>
      
      <form onSubmit={addTask} style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <input 
          value={task} 
          onChange={e => setTask(e.target.value)} 
          placeholder="Nhập công việc cần làm..." 
          style={{ padding: "10px", flex: 1, fontSize: "16px" }}
        />
        <button style={{ padding: "10px 20px", cursor: "pointer" }}>Thêm</button>
      </form>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {todos.map(t => (
          <li key={t.id} style={{ 
            background: "#f4f4f4", 
            margin: "5px 0", 
            padding: "10px", 
            borderRadius: "5px",
            borderLeft: "5px solid #646cff"
          }}>
            {t.task}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;