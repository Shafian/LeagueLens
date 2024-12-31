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

const server = createServer(async (req, res) => {
  // Check if the request is for the odds API endpoint
  if (req.url.startsWith('/api/odds')) {
    try {
      const sports = ['soccer_epl', 'basketball_nba']; // Fetch odds for both EPL and NBA
      const region = 'us'; // Default region
      const market = 'h2h'; // Default market

      let combinedOdds = [];
      console.log(`Fetching odds data for sports: ${sports.join(', ')}`);

      // Fetch odds for each sport
      for (const sport of sports) {
        const apiResponse = await axios.get(`https://api.the-odds-api.com/v4/sports/${sport}/odds`, {
          params: {
            apiKey: API_KEY,
            regions: region,
            markets: market,
            oddsFormat: 'decimal',
          },
        });
        console.log(`Fetched odds for ${sport}`);
        combinedOdds = combinedOdds.concat(apiResponse.data);
      }

      console.log('Successfully fetched combined odds data.');

      // Return the combined data as JSON
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(combinedOdds));
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
    return;
  }

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
