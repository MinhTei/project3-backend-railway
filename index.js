const express = require('express')
const app = express()
const port = process.env.PORT || 3000 // Render sẽ tự điền cổng vào đây

app.get('/', (req, res) => {
  res.send('<h1>Chao mung den voi Cloud Platform (Render) 🚀</h1><p>Trang web nay duoc Deploy tu dong!</p><h2>Minh tài đã thành công Flatform </h2>')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})