const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function getBarcelonaRoster() {
  try {
    const url = 'https://www.transfermarkt.com/fc-barcelona/startseite/verein/131';
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const roster = [];

    // Select each player row in the table
    $('.items > tbody > tr').each((index, element) => {
      const name = $(element).find('.hauptlink .hide-for-small').text().trim();
      const position = $(element).find('td.zentriert:nth-child(2)').attr('title') || 'N/A';
      const age = $(element)
        .find('td.zentriert:nth-child(3)')
        .text()
        .match(/\((\d+)\)/)?.[1] || 'N/A';
      const nationality = $(element).find('td.zentriert:nth-child(2) img').attr('title') || 'N/A';
      const marketValue = $(element).find('.rechts.hauptlink').text().trim() || 'N/A';
    
      if (name) {
        roster.push({ name, position, age, nationality, marketValue });
      }
    });
    

    // Save the roster to a JSON file
    saveRosterToFile(roster);

    return roster;
  } catch (error) {
    console.error(`Error scraping data: ${error.message}`);
    throw new Error('Failed to fetch Barcelona roster');
  }
}

// Function to save roster data to a file
function saveRosterToFile(roster) {
  const filePath = './public/Sports Data/barcelona-roster.json';

  if (roster.length > 0) {
    const cleanedRoster = roster.map((player) => ({
      name: player.name,
      position: player.position,
      age: player.age || 'N/A', // Handle missing ages
      nationality: player.nationality || 'N/A',
      marketValue: player.marketValue || 'N/A',
    }));

    fs.writeFileSync(filePath, JSON.stringify(cleanedRoster, null, 2));
    console.log(`Roster saved to ${filePath}`);
  } else {
    console.warn('No data to save.');
  }
}

// Export the function
module.exports = { getBarcelonaRoster };

// If the script is run directly, execute the function
if (require.main === module) {
  getBarcelonaRoster()
    .then(() => console.log('Scraping completed successfully'))
    .catch((err) => console.error('Scraping failed:', err.message));
}
