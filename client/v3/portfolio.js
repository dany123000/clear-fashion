// Invoking strict mode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode#invoking_strict_mode
'use strict';

// current products on the page
let currentProducts = [];
let currentPagination = {};
var allProducts=[];
var allBrands=[];
var selectedBrand="All";
var currentBrand=0;
var recentlyReleased=false;
var cheap=false;
var onlyFavorites=false;
var newProducts=[];
var p50=0;
var p90=0;
var p95=0;
var lastRelease = Date();
var allProductsByPrice=[];
var allProductsByDate=[];
var favorites=[];

// instantiate the selectors
const selectShow = document.querySelector('#show-select');
const selectPage = document.querySelector('#page-select');
const selectBrand = document.querySelector('#brand-select');
const selectRecent = document.querySelector('#recent');
const selectCheap = document.querySelector('#cheap');
const sectionProducts = document.querySelector('#products');
const sectionFavorites = document.querySelector('#favorites');
const spanNbProducts = document.querySelector('#nbProducts');
const spanNbNewProducts = document.querySelector('#nbNewProducts');
const sort = document.querySelector('#sort-select');
const spanp50 = document.querySelector('#p50');
const spanp90 = document.querySelector('#p90');
const spanp95 = document.querySelector('#p95');
const spanLastRelease = document.querySelector('#lastRelease');
const favoritesFilter = document.querySelector('#favorites-filter');

/**
 * Set global value
 * @param {Array} result - products to display
 * @param {Object} meta - pagination meta info
 */
const setCurrentProducts = ({result, meta}) => {
  currentProducts = result;
  currentPagination = meta;
};

/**
 * Fetch products from api
 * @param  {Number}  [page=1] - current page to fetch
 * @param  {Number}  [size=12] - size of the page
 * @param  {String}  [brand="All"] - selected brand
 * @return {Object}
 */
const fetchProducts = async (page = 1, size = 12, brand = 'All') => {
  try {
    var response='';
    if(brand=='All'){
      response = await fetch(
        //`https://clear-fashion-api.vercel.app?page=${page}&size=${size}`
        `http://localhost:8092/products/search?`
    );
    }
    else{
      response = await fetch(
        `https://clear-fashion-api.vercel.app?page=${page}&size=${size}&brand=${brand}`
          );
        }
  //const body = await response.json();
  const body = {
    'data':{
      'meta':{
        'currentPage':currentPagination.currentPage,
        'pageCount':currentPagination.length,
        'pageSize':currentProducts.length,
        'count':currentProducts.length
      },
      'result':await response.json()
    },
    'success':true
  };

    if (body.success !== true) {
      console.error(body);
      return {currentProducts, currentPagination};
    }

    return body.data;
  } catch (error) {
    console.error(error);
    return {currentProducts, currentPagination};
  }
};

function Favorite(uuid){
  if(!favorites.find(x => x['uuid']==uuid)){
    favorites.push(
      allProducts['result'].find(x => x['uuid']==uuid)
    );
  }
  else{
    favorites=favorites.filter(x => x['uuid']!==uuid);
  }
  render(currentProducts, currentPagination);
}

/**
 * Render list of products
 * @param  {Array} products
 */
const renderProducts = (products, setFavorites=false) => {
  const fragment = document.createDocumentFragment();
  const div = document.createElement('div');
  const template = products
    .map(product => {
      return `
      <div class="product" id=${product.uuid}>
        <span>${product.brand}</span>
        <a href="${product.link}" target="_blank">${product.name}</a>
        <span>${product.price}</span>
        <button name="favorite" id="favorite" onclick="Favorite('${product.uuid}')">
          <span>⭐</span>
        </button>
      </div>
    `;
    })
    .join('');

  div.innerHTML = template;
  fragment.appendChild(div);
  if(!setFavorites){
    if(onlyFavorites){
      sectionProducts.innerHTML = '';
    }
    else{
      sectionProducts.innerHTML = '<h2>Products</h2>';
      sectionProducts.appendChild(fragment);    
    }
  }
  if(setFavorites){
    sectionFavorites.innerHTML = '<h2>Favorites</h2>';
    sectionFavorites.appendChild(fragment);
  }
};

/**
 * Render page selector
 * @param  {Object} pagination
 */
 const renderPagination = pagination => {
  const {currentPage, pageCount} = pagination;
  const options = Array.from(
    {'length': pageCount},
    (value, index) => `<option value="${index + 1}">${index + 1}</option>`
  ).join('');
  selectPage.innerHTML = options;
  selectPage.selectedIndex = currentPage - 1;
};

/**
 * Render brands selector
 * @param  {Object} brands
 */
 const renderBrands = brands => {
  const options = Array.from(
    brands,
    (value) =>  `<option value="${value}">${value}</option>`
  ).join('');
  selectBrand.innerHTML = options;
  selectBrand.selectedIndex = currentBrand;
};

/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderIndicators = pagination => {
  const {count} = pagination;
  spanNbProducts.innerHTML = count;
  spanNbNewProducts.innerHTML = newProducts.length;
  spanp50.innerHTML = p50;
  spanp90.innerHTML = p90;
  spanp95.innerHTML = p95;
  spanLastRelease.innerHTML = lastRelease;
};

const renderFavorites = favorites => {
  renderProducts(favorites, true);
}

const render = (products, pagination) => {
  renderProducts(products);
  renderBrands(allBrands);
  renderPagination(pagination);
  renderIndicators(pagination);
  renderFavorites(favorites);
};

/**
 * Declaration of all Listeners
 */

/**
 * Select the number of products to display
 */
 selectShow.addEventListener('change', async (event) => {
  const products = await fetchProducts(currentPagination.currentPage, parseInt(event.target.value), selectedBrand);
  setCurrentProducts(products);
  render(currentProducts, currentPagination);
});

/**
 * Select the page to display
 */
 selectPage.addEventListener('change', async (event) => {
  const products = await fetchProducts(parseInt(event.target.value), currentPagination.length, selectedBrand);
  setCurrentProducts(products);
  render(currentProducts, currentPagination);
});

selectBrand.addEventListener('change', async (event) => {
  selectedBrand = event.target.value;
  const products = await fetchProducts(currentPagination.currentPage, currentPagination.length, selectedBrand);
  setCurrentProducts(products);
  currentBrand = allBrands.indexOf(selectedBrand);
  render(currentProducts, currentPagination);
});

function CompareDates(a,b){
  if(a['released']<b['released']){
    return -1;
  }
  else if(a['released']>b['released']){
    return 1;
  }
  else{
    return 0;
  }
}

function ComparePrices(a,b){
  if(a['price']<b['price']){
    return -1;
  }
  else if(a['price']>b['price']){
    return 1;
  }
  else{
    return 0;
  }
}

selectRecent.addEventListener('change', async () => {
  var products = await fetchProducts(currentPagination.currentPage, currentPagination.length, selectedBrand);
  if(!recentlyReleased){
    products['result']=products['result'].filter(x=>Date.parse(Date())-Date.parse(x['released'])<14*24*3600*1000);
    recentlyReleased=true;
  }
  else{
    recentlyReleased=false;
  }
  setCurrentProducts(products);
  render(currentProducts, currentPagination);
});

selectCheap.addEventListener('change', async () => {
  var products = await fetchProducts(currentPagination.currentPage, currentPagination.length, selectedBrand);
  if(!cheap){
    products['result']=products['result'].filter(x=>x['price']<50);
    cheap=true;
  }
  else{
    cheap=false;
  }
  setCurrentProducts(products);
  render(currentProducts, currentPagination);
});

sort.addEventListener('change', async(event) => {
  if(event.target.value=='price-asc'){
    sortByPrice(false);
  }
  if(event.target.value=='price-desc'){
    sortByPrice(true);
  }
  if(event.target.value=='date-asc'){
    sortByDate(false);
  }
  if(event.target.value=='date-desc'){
    sortByDate(true);
  }
})

favoritesFilter.addEventListener('change', async () => {
  onlyFavorites = !onlyFavorites;
  render(currentProducts, currentPagination);
})

const sortByPrice = async (desc) => {
  var products = await fetchProducts(currentPagination.currentPage, currentPagination.length, selectedBrand);
  if(!desc){
    products['result'].sort(ComparePrices);
  }
  else{
    products['result'].sort(ComparePrices).reverse();
  }
  setCurrentProducts(products);
  render(currentProducts, currentPagination);
};

const sortByDate = async (desc) => {
  var products = await fetchProducts(currentPagination.currentPage, currentPagination.length, selectedBrand);
  if(!desc){
    products['result'].sort(CompareDates);
  }
  else{
    products['result'].sort(CompareDates).reverse();
  }
  setCurrentProducts(products);
  render(currentProducts, currentPagination);
};

document.addEventListener('DOMContentLoaded', async () => {
  const products = await fetchProducts();
  allProducts = await fetchProducts(1,10000);
  console.log(allProducts);
  allBrands.push("All");
  for(let i in allProducts.result){
    allBrands.push(allProducts.result[i].brand);
  }
  allBrands=Array.from(new Set(allBrands));

  newProducts = products['result'].filter(x => Date.parse(Date())-Date.parse(x['released'])<14*24*3600*1000);
  allProductsByPrice = [...allProducts['result']];
  allProductsByPrice.sort(ComparePrices);
  p50 = allProductsByPrice[parseInt(allProductsByPrice.length*0.5)]['price'];
  p90 = allProductsByPrice[parseInt(allProductsByPrice.length*0.9)]['price'];
  p95 = allProductsByPrice[parseInt(allProductsByPrice.length*0.95)]['price'];

  allProductsByDate = [...allProducts['result']];
  allProductsByDate.sort(CompareDates).reverse();
  lastRelease = allProductsByDate[0]['released'];

  setCurrentProducts(products);
  render(currentProducts, currentPagination);
});
