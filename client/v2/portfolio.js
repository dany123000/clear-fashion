// Invoking strict mode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode#invoking_strict_mode
'use strict';

// current products on the page
let currentProducts = [];
let currentPagination = {};
var allProducts=[];
var allBrands=new Set();
var selectedBrand='All';

// instantiate the selectors
const selectShow = document.querySelector('#show-select');
const selectPage = document.querySelector('#page-select');
var selectBrand = document.querySelector('#brand-select');
const selectRecent = document.querySelector('#recent');
const sectionProducts = document.querySelector('#products');
const spanNbProducts = document.querySelector('#nbProducts');

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
        `https://clear-fashion-api.vercel.app?page=${page}&size=${size}`
    );
    }
    else{
      response = await fetch(
        `https://clear-fashion-api.vercel.app?page=${page}&size=${size}&brand=${brand}`
          );
    }
  const body = await response.json();

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

/**
 * Render list of products
 * @param  {Array} products
 */
const renderProducts = products => {
  const fragment = document.createDocumentFragment();
  const div = document.createElement('div');
  const template = products
    .map(product => {
      return `
      <div class="product" id=${product.uuid}>
        <span>${product.brand}</span>
        <a href="${product.link}">${product.name}</a>
        <span>${product.price}</span>
      </div>
    `;
    })
    .join('');

  div.innerHTML = template;
  fragment.appendChild(div);
  sectionProducts.innerHTML = '<h2>Products</h2>';
  sectionProducts.appendChild(fragment);
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
  selectBrand = "All";
};

/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderIndicators = pagination => {
  const {count} = pagination;

  spanNbProducts.innerHTML = count;
};

const render = (products, pagination) => {
  renderProducts(products);
  renderBrands(allBrands);
  renderPagination(pagination);
  renderIndicators(pagination);
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
  render(currentProducts, currentPagination);
});

function Compare_dates(a,b){
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

selectRecent.addEventListener('click', async (event) => {
  var products = await fetchProducts(currentPagination.currentPage, currentPagination.length, selectedBrand);
  console.log(products)
  products['result'].sort(Compare_dates);
  console.log(products)
  setCurrentProducts(products);
  render(currentProducts, currentPagination);
});

document.addEventListener('DOMContentLoaded', async () => {
  const products = await fetchProducts();
  allProducts = await fetchProducts(1,139);
  console.log(allProducts);
  allBrands.add("All");
  for(let i in allProducts.result){
    allBrands.add(allProducts.result[i].brand);
  }
  console.log(allBrands);
  setCurrentProducts(products);
  render(currentProducts, currentPagination);
});
