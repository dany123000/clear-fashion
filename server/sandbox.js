/* eslint-disable no-console, no-process-exit */
const dedicatedbrand = require('./sources/dedicatedbrand');
var fs = require('fs');

async function sandbox () {
  try {
    let websites = [];
    websites.push('https://www.dedicatedbrand.com/en/men/news');
    websites.push('https://www.montlimart.com/polos-t-shirts.html');
    websites.push('https://adresse.paris/608-pulls-et-sweatshirts');

    fs.unlink('products.json', err => {
      if (err)
        console.log(err);
      });
    
    for(let eshop in websites){
      console.log(`🕵️‍♀️  browsing ${websites[eshop]} source`);

      const products = await dedicatedbrand.scrape(websites[eshop]);
  
      console.log(products);
      fs.appendFile('products.json', JSON.stringify(products), 'utf8', err => {
        if (err)
          console.log(err);
        });
      console.log('done');
    }
    process.exit(0);

  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

const [,,] = process.argv;

sandbox();
