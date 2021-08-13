import path from 'path'
import fs from 'fs'
import express from 'express'
import { html } from './api/assets/html/html'
import routes from './api/index.routes'
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get('/', (req, res, next)=>{
  res.status(404).json({name: 'API', version: '1.0', status: 404, message: 'not_found'});
});

// assets renders
app.use('/img', express.static('./api/assets/img'))
app.use('/svg-img', express.static('./api/assets/svg'))
app.use('/html', (req, res) => { res.send(html()) })
app.get("/video/bigbuck.mp4", function (req, res) {
  const path = 'api/assets/video/bigbuck.mp4'
  const stat = fs.statSync(path)
  const fileSize = stat.size
  const range = req.headers.range
  if (range) {
    const parts = range.replace(/bytes=/, "").split("-")
    const start = parseInt(parts[0], 10)
    const end = parts[1] 
      ? parseInt(parts[1], 10)
      : fileSize-1
    const chunksize = (end-start)+1
    const file = fs.createReadStream(path, {start, end})
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    }
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    }
    res.writeHead(200, head)
    fs.createReadStream(path).pipe(res)
  }
})

app.use('/api', routes)

// if (process.env.NODE_ENV === 'developement') {
  const PORT = process.env.PORT || 8080
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`)
  })
// }

// export default app
