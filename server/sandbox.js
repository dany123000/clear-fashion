/* eslint-disable no-console, no-process-exit */
const dedicatedbrand = require('./sources/dedicatedbrand');
var fs = require('fs');

async function sandbox () {
  try {
    var products = [];
    let websites = [];
    websites.push('https://www.dedicatedbrand.com/en/men/all-men');
    websites.push('https://www.dedicatedbrand.com/en/women/all-women');
    websites.push('https://www.montlimart.com/toute-la-collection.html');
    websites.push('https://adresse.paris/630-toute-la-collection');

    for(let eshop in websites){
      console.log(`🕵️‍♀️  browsing ${websites[eshop]} source`);
      
      let currentProducts = await dedicatedbrand.scrape(websites[eshop]);
      for(let i in currentProducts){
        products.push(currentProducts[i]);
      }
      console.log(currentProducts.length, 'products found');
    }  
    fs.writeFileSync('products.json', JSON.stringify(products), 'utf8');
    process.exit(0);

  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

const [,,] = process.argv;

sandbox();
