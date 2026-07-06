const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const DIST_PATH = path.join(__dirname, 'apps/frontend/dist');

const server = http.createServer((req, res) => {
  let filePath = path.join(DIST_PATH, req.url === '/' ? 'index.html' : req.url);
  
  // Security: prevent directory traversal
  if (!filePath.startsWith(DIST_PATH)) {
    filePath = path.join(DIST_PATH, 'index.html');
  }
  
  // Try to serve the file
  fs.readFile(filePath, (err, data) => {
    if (err) {
      // If file not found and it's not index.html, serve index.html (SPA routing)
      if (filePath !== path.join(DIST_PATH, 'index.html')) {
        fs.readFile(path.join(DIST_PATH, 'index.html'), (err2, data2) => {
          if (err2) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not found');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data2);
          }
        });
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not found');
      }
    } else {
      // Determine content type
      const ext = path.extname(filePath);
      let contentType = 'text/plain';
      if (ext === '.html') contentType = 'text/html';
      else if (ext === '.js') contentType = 'application/javascript';
      else if (ext === '.css') contentType = 'text/css';
      else if (ext === '.svg') contentType = 'image/svg+xml';
      else if (ext === '.json') contentType = 'application/json';
      
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Frontend server running on port ${PORT}`);
});
