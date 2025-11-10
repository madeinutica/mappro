const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Add Stripe for checkout
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

console.log('Environment loaded, STRIPE_SECRET_KEY present:', !!process.env.STRIPE_SECRET_KEY);

const server = http.createServer((req, res) => {
  try {
    const parsedUrl = url.parse(req.url, true);
    let pathname = parsedUrl.pathname;

    console.log(`Request: ${req.method} ${pathname}`);

    // Handle checkout endpoint
    if (pathname === '/api/create-checkout' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', async () => {
        try {
          const { clientId, planId, billingInterval = 'monthly' } = JSON.parse(body);

          // Get the origin from request headers to create proper redirect URLs
          const origin = req.headers.origin || `http://${req.headers.host}`;
          
          // For demo purposes, create a simple checkout session
          const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
              price: billingInterval === 'yearly' ? 'price_1SOObWJ17KVc8UXY0ODncfph' : 'price_1SOObWJ17KVc8UXY0ODncfph', // Use the same price for demo
              quantity: 1,
            }],
            mode: 'subscription',
            success_url: `${origin}/admin?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/admin?canceled=true`,
            metadata: {
              client_id: clientId,
              plan_id: planId
            }
          });

          res.writeHead(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
          });
          res.end(JSON.stringify({ url: session.url }));
        } catch (error) {
          console.error('Checkout error:', error);
          res.writeHead(500, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          });
          res.end(JSON.stringify({ error: error.message }));
        }
      });
      return;
    }

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

    // Check if file exists
    const filePath = path.join(__dirname, 'dist', pathname);

    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        // File doesn't exist, serve index.html for SPA routing
        const indexPath = path.join(__dirname, 'dist', 'index.html');
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
            'Content-Security-Policy': "default-src * 'unsafe-inline' 'unsafe-eval'; script-src * 'unsafe-inline' 'unsafe-eval'; style-src * 'unsafe-inline'; img-src * data:; connect-src *; font-src *; frame-src *;"
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
            'Content-Security-Policy': "default-src * 'unsafe-inline' 'unsafe-eval'; script-src * 'unsafe-inline' 'unsafe-eval'; style-src * 'unsafe-inline'; img-src * data:; connect-src *; font-src *; frame-src *;"
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
const host = '127.0.0.1';

server.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}`);
  console.log(`Also accessible at http://localhost:${port}`);
});

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