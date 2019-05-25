const http = require('http')
const path = require('path')
const fs = require('fs')
const index = '/Users/longpeng/Documents/GitHub/note/Programming/Source/Tree-Shaking%E6%80%A7%E8%83%BD%E4%BC%98%E5%8C%96%E5%AE%9E%E8%B7%B5%20-%20%E5%8E%9F%E7%90%86%E7%AF%87%20-%20%E6%8E%98%E9%87%91.htm'

http.createServer(function(req, res) {
  let url = req.url.slice(1)
  if (!url) url = index
  else url = path.join(path.dirname(index), url)
  url = decodeURIComponent(url)
  // res.setHeader('content-type', 'text/html')
  if (fs.existsSync(url))
    fs.createReadStream(url).pipe(res)
  else {
    console.error(url, req.url)
    res.writeHead(404)
    res.end('404')
  }
}).listen(8080)
