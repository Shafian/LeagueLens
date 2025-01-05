const fs = require('fs'); // Import the 'fs' module
const path = require('path');
const { createServer } = require('node:http');
const axios = require('axios'); // Import Axios for API requests
require('dotenv').config(); // Import dotenv to load environment variables


const hostname = '127.0.0.1';
const port = 3000;

// Load the Odds API key from .env
const API_KEY = process.env.ODDS_API_KEY;

// Check if the API key is loaded
if (!API_KEY) {
  console.error('Error: ODDS_API_KEY is not defined in the .env file.');
  process.exit(1); // Exit the application
}

console.log('Loaded API Key:', API_KEY);

const server = createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/signin') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      const formData = new URLSearchParams(body);
      const username = formData.get('username');
      const email = formData.get('email');
      const password = formData.get('password');

      if (!username || !email || !password) {
        res.statusCode = 400;
        res.end('Missing required fields.');
        return;
      }

      try {
        // Simulate user authentication
        console.log('User authentication received:', {
          username,
          email,
          password,
        });

        res.writeHead(302, { Location: '/home.html' }); // Redirect to home.html
        res.end();
      } catch (error) {
        console.error('Error during sign-in:', error.message);
        res.statusCode = 500;
        res.end('Error during sign-in.');
      }
    });
    return;
  }

  // Check if the request is for the odds API endpoint
  if (req.url.startsWith('/api/odds')) {
    (async () => {
      try {
        // Parse URL parameters
        const urlParams = new URLSearchParams(req.url.split('?')[1]);
        const sport = urlParams.get('sport') || 'soccer_epl'; // Default to EPL
        const region = urlParams.get('region') || 'us'; // Default to 'us'
        const market = urlParams.get('market') || 'h2h'; // Default to 'h2h'

        console.log(`Fetching odds data for sport: ${sport}, region: ${region}, market: ${market}`);

        // Fetch odds data from the Odds API
        const apiResponse = await axios.get(`https://api.the-odds-api.com/v4/sports/${sport}/odds`, {
          params: {
            apiKey: API_KEY,
            regions: region,
            markets: market,
            oddsFormat: 'decimal',
          },
        });

        console.log('Successfully fetched odds data.');

        // Return the data as JSON
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(apiResponse.data));
      } catch (error) {
        console.error(`Error fetching odds data: ${error.message}`);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          error: 'Failed to fetch odds data',
          message: error.message,
          details: error.response?.data || null,
        }));
      }
    })(); // Immediately invoke the async function
    return;
  }

  // Default file path is index.html
  const cleanUrl = req.url.split('?')[0]; // Clean URL by removing query parameters
  let filePath = path.join(__dirname, 'public', cleanUrl === '/' ? 'index.html' : cleanUrl);

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
