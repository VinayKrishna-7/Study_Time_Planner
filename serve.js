// Lightweight local development server using Node.js built-in modules (zero npm dependencies)
const http = require('http');
const fs = require('fs');
const path = require('path');

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  let safePath = path.normalize(decodeURIComponent(req.url.split('?')[0])).replace(/^(\.\.[\/\\])+/, '');
  if (safePath === '/' || safePath === '\\') safePath = '/index.html';

  let filePath = path.join(__dirname, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

// Try preferred ports, fallback automatically
const PORTS_TO_TRY = [5500, 8080, 5000, 4000, 0];

function startServer(portIndex) {
  const port = PORTS_TO_TRY[portIndex];
  server.listen(port, () => {
    const actualPort = server.address().port;
    console.log(`Study Time Planner is live at: http://localhost:${actualPort}`);
  });

  server.once('error', (err) => {
    if (err.code === 'EADDRINUSE' && portIndex < PORTS_TO_TRY.length - 1) {
      startServer(portIndex + 1);
    } else {
      console.error('Server error:', err);
    }
  });
}

startServer(0);
