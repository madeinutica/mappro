const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const server = http.createServer((req, res) => {
  try {
    const parsedUrl = url.parse(req.url, true);
    let pathname = parsedUrl.pathname;

    console.log(`Request: ${req.method} ${pathname}`);

    // Handle preflight OPTIONS requests
    if (req.method === 'OPTIONS') {
      res.writeHead(200, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'text/plain'
      });
      res.end();
      return;
    }

    // Default to index.html for root path
    if (pathname === '/') {
      pathname = '/index.html';
    }

    // Check if file exists in frontend/dist
    const filePath = path.join(__dirname, 'frontend', 'dist', pathname);

    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        // File doesn't exist, serve index.html for SPA routing
        const indexPath = path.join(__dirname, 'frontend', 'dist', 'index.html');
        fs.readFile(indexPath, (err, data) => {
          if (err) {
            console.error('Error loading index.html:', err);
            res.writeHead(500, {
              'Content-Type': 'text/plain',
              'Access-Control-Allow-Origin': '*'
            });
            res.end('Error loading index.html');
            return;
          }
          res.writeHead(200, {
            'Content-Type': 'text/html',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Content-Security-Policy': "default-src * 'unsafe-inline' 'unsafe-eval'; script-src * 'unsafe-inline' 'unsafe-eval'; style-src * 'unsafe-inline'; img-src * data:; connect-src *; font-src *; frame-src *;",
            'Cache-Control': 'public, max-age=31536000, immutable',
            'X-Content-Type-Options': 'nosniff'
          });
          res.end(data);
        });
      } else {
        // File exists, serve it
        const ext = path.extname(filePath);
        const contentType = {
          '.html': 'text/html',
          '.js': 'text/javascript',
          '.css': 'text/css',
          '.json': 'application/json',
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.ico': 'image/x-icon'
        }[ext] || 'text/plain';

        fs.readFile(filePath, (err, data) => {
          if (err) {
            console.error('Error loading file:', err);
            res.writeHead(500, {
              'Content-Type': 'text/plain',
              'Access-Control-Allow-Origin': '*'
            });
            res.end('Error loading file');
            return;
          }
          res.writeHead(200, {
            'Content-Type': contentType,
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Content-Security-Policy': "default-src * 'unsafe-inline' 'unsafe-eval'; script-src * 'unsafe-inline' 'unsafe-eval'; style-src * 'unsafe-inline'; img-src * data:; connect-src *; font-src *; frame-src *;",
            'Cache-Control': 'public, max-age=31536000, immutable',
            'X-Content-Type-Options': 'nosniff'
          });
          res.end(data);
        });
      }
    });
  } catch (error) {
    console.error('Server error:', error);
    try {
      res.writeHead(500, {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*'
      });
      res.end('Internal server error');
    } catch (responseError) {
      console.error('Error sending error response:', responseError);
    }
  }
});

const port = 3008;
const host = '0.0.0.0';

try {
  server.listen(port, host, () => {
    console.log(`Server running at http://${host}:${port}`);
    console.log(`Also accessible at http://localhost:${port}`);
    console.log(`Serving files from: ${path.join(__dirname, 'frontend', 'dist')}`);
    console.log('Server started successfully');
  });
} catch (error) {
  console.error('Failed to start server:', error);
  process.exit(1);
}

// Keep the process alive
setInterval(() => {
  // Keep alive
}, 1000);

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
  process.exit(1);
});