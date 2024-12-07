const fs = require('fs'); // Import the 'fs' module
const path = require('path');
const { createServer } = require('node:http');

const hostname = '127.0.0.1';
const port = 3000;

const server = createServer((req, res) => {
  // Default file path is index.html
  let filePath = __dirname + '/public' + (req.url === '/' ? '/index.html' : req.url);

  // Get the file extension
  const ext = path.extname(filePath);

  // Set default content type
  let contentType = 'text/html';

  // Match content type based on file extension
  switch (ext) {
    case '.css':
      contentType = 'text/css';
      break;
    case '.js':
      contentType = 'application/javascript';
      break;
    case '.png':
      contentType = 'image/png';
      break;
    case '.jpg':
      contentType = 'image/jpeg';
      break;
    case '.ico':
      contentType = 'image/x-icon';
      break;
    default:
      contentType = 'text/html';
  }

  // Read and serve the requested file
  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.error(`Error reading file: ${err.message}`);
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain');
      res.end('404 - File Not Found');
      return;
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', contentType);
    res.end(data);
  });
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
