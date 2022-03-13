require('dotenv').config();
const {MongoClient} = require('mongodb');
const fs = require('fs');

const MONGODB_DB_NAME = 'clearfashion';
const MONGODB_COLLECTION = 'products';
const MONGODB_URI = 'mongodb+srv://mongodb:lnxB2Eb1bSTcDhn5@cluster0.4tpuw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';

let client = null;
let database = null;

function ComparePrices(a,b){
  if(a['price'] < b['price']){
    return -1;
  }
  else if(a['price'] > b['price']){
    return 1;
  }
  else{
    return 0;
  }
}

/**
 * Get db connection
 * @type {MongoClient}
 */
const getDB = module.exports.getDB = async () => {
  try {
    if (database) {
      return database;
    }

    client = await MongoClient.connect(MONGODB_URI, {'useNewUrlParser': true});
    database = client.db(MONGODB_DB_NAME);

    console.log('💽  Connected');

    return database;
  } catch (error) {
    console.error('🚨 MongoClient.connect...', error);
    return null;
  }
};

/**
 * Insert list of products
 * @param  {Array}  products
 * @return {Object}
 */
 module.exports.insert = async products => {
  try {
    const db = await getDB();
    const collection = db.collection(MONGODB_COLLECTION);
    // More details
    // https://docs.mongodb.com/manual/reference/method/db.collection.insertMany/#insert-several-document-specifying-an-id-field
    const result = await collection.insertMany(products, {'ordered': false});

    return result;
  } catch (error) {
    console.error('🚨 collection.insertMany...', error);
    fs.writeFileSync('products.json', JSON.stringify(products));
    return {
      'insertedCount': error.result.nInserted
    };
  }
};

/**
 * Delete all products
 * @return {Object}
 */
 module.exports.deleteAll = async () => {
  try {
    const db = await getDB();
    const collection = db.collection(MONGODB_COLLECTION);
    const result = await collection.deleteMany({});

    return result;
  } catch (error) {
    console.error('🚨 collection.delete...', error);
    fs.writeFileSync('products.json', JSON.stringify(products));
    return {

    };
  }
};

/**
 * Find products based on query
 * @param  {Array}  query
 * @return {Array}
 */
 module.exports.find = async query => {
  try {
    const db = await getDB();
    const collection = db.collection(MONGODB_COLLECTION);
    const result = await collection.find(query).toArray();

    return result;
  } catch (error) {
    console.error('🚨 collection.find...', error);
    return null;
  }
};

/**
 * Find products for API
 * @param  {Array}  query
 * @return {Array}
 */
 module.exports.api = async query => {
  try {
    let ask = {};
    let limit = 12;
    if(query.hasOwnProperty("limit")){
      limit = query['limit'];
    }
    if(query.hasOwnProperty("brand")){
      ask['brand'] = query['brand'];
    }
    if(query.hasOwnProperty("price")){
      ask['price'] = {'$lte' : parseInt(query['price'])};
    }
    const db = await getDB();
    const collection = db.collection(MONGODB_COLLECTION);
    const result = Array.from(await collection.find(ask).toArray()).slice(0,limit);
    result.sort(ComparePrices);
    return result;
  } catch (error) {
    console.error('🚨 collection.find...', error);
    return null;
  }
};

/**
 * Aggregate products based on query
 * @param  {Array}  query
 * @return {Array}
 */
 module.exports.aggregate = async query => {
  try {
    const db = await getDB();
    const collection = db.collection(MONGODB_COLLECTION);
    const result = await collection.aggregate(query).toArray();

    return result;
  } catch (error) {
    console.error('🚨 collection.aggregate...', error);
    return null;
  }
};

/**
 * Close the connection
 */
module.exports.close = async () => {
  try {
    await client.close();
  } catch (error) {
    console.error('🚨 MongoClient.close...', error);
  }
};
