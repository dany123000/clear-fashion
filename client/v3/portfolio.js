// Invoking strict mode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode#invoking_strict_mode
'use strict';

// current products on the page
let currentProducts = [];
let currentPagination = {};
var allProducts=[];
var allBrands=[];
var selectedBrand="All brands";
var selectedPage=1;
var selectedSize=12;
var currentBrand=0;
var cheap=false;
var onlyFavorites=false;

// instantiate the selectors
const selectShow = document.querySelector('#show-select');
const selectPage = document.querySelector('#page-select');
const pageNumber = document.querySelector('#page-number');
const selectBrand = document.querySelector('#brand-select');
const selectCheap = document.querySelector('#cheap');
const sectionAddedToFav = document.querySelector('#added-fav');
const sectionProducts = document.querySelector('#products');
const sectionFavorites = document.querySelector('#favorites');
const spanNbProducts = document.querySelector('#nbProducts');
const sort = document.querySelector('#sort-select');
const favoritesFilter = document.querySelector('#favorites-filter');

/**
 * Set global value
 * @param {Array} result - products to display
 * @param {Object} meta - pagination meta info
 */
const setCurrentProducts = (result, page=selectedPage, size=selectedSize) => {
  currentProducts = result;
  currentPagination = {
    "count":allProducts.length,
    "currentPage":page,
    "pageCount":parseInt(allProducts.length/size),
    "pageSize":size
  };
  selectedPage=page;
  selectedSize=size;
};

/**
 * Fetch products from api
 * @param  {Number}  [page=1] - current page to fetch
 * @param  {Number}  [size=12] - size of the page
 * @param  {String}  [brand="All brands"] - selected brand
 * @return {Object}
 */
const fetchProducts = async (page = 1, size = 12, brand = 'All brands', cheap=false) => {
  try {
    //var query=`http://localhost:8092/products/search?page=${page}&size=${size}`;
    var query=`https://clear-fashion-dany123000.vercel.app/products/search?page=${page}&size=${size}`;
    var response='';
    if(brand!='All brands'){
      query+=`&brand=${brand}`;
    }
    if(cheap){
      query+=`&price=50`;
    }
    response = await fetch(query);


  const body = await response.json();

  return body;
  } catch (error) {
    console.error(error);
    return {currentProducts, currentPagination};
  }
};

const styleAlert = `
<style>
.alert {
  position: fixed;
  z-index:1;
  top: 0;
  width: 500px;
  margin: 0 auto;
  background: white;
  padding: 10px;
  background-color: #f44336;
  color: white;
  opacity: 1;
  transition: opacity 0.6s;
  }

.alert.success {background-color: #04AA6D;}
.alert.info {background-color: #2196F3;}
.alert.warning {background-color: #ff9800;}

.closebtn {
  margin-left: 15px;
  color: white;
  font-weight: bold;
  float: right;
  font-size: 22px;
  line-height: 20px;
  cursor: pointer;
  transition: 0.3s;
}

.closebtn:hover {
  color: black;
}
</style>
`;

function Favorite(id){
  if(!document.cookie.split(',').find(x => x == id)){
    setCookie(id, 7, true);
    sectionAddedToFav.removeChild(sectionAddedToFav.firstChild);
    const div = document.createElement('div');
    const template = `
    <span class="closebtn">&times;</span>  
    Article added to favorites!
    ${styleAlert}
    `
    div.setAttribute("class", "alert success");
    div.innerHTML = template;
    sectionAddedToFav.appendChild(div);
  }
  else{
    if (confirm("Remove this article from favorites ?")) {
      let favorites = [...document.cookie.split(',')];
      favorites = favorites.filter(x => x !== id);
      let favoritesStr = favorites.toString();
      setCookie(favoritesStr, 7, false);
      sectionAddedToFav.removeChild(sectionAddedToFav.firstChild);
      const div = document.createElement('div');
      const template = `
      <span class="closebtn">&times;</span>  
      Article removed from favorites!
      ${styleAlert}
      `
      div.setAttribute("class", "alert");
      div.innerHTML = template;
      sectionAddedToFav.appendChild(div);
      }
  }
  var close = document.getElementsByClassName("closebtn");
  var i;
  for (i = 0; i < close.length; i++) {
    close[i].onclick = function(){
      var div = this.parentElement;
      div.style.opacity = "0";
      setTimeout(function(){ div.style.display = "none"; }, 600);
    }
  }
  render(currentProducts, currentPagination);
}

function setCookie(cvalue, exdays, append) {
  const d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  let expires = "expires="+ d.toUTCString();
  if(append){
    if(document.cookie||document.cookie=='empty'){
      document.cookie = document.cookie + ',' + cvalue + ";" + expires + ";path=/";
    }
    else{
      document.cookie = cvalue + ";" + expires + ";path=/";
    }
  }
  else{
    if(cvalue=='')
    {
      cvalue = 'empty';
    }
    document.cookie = cvalue + ";" + expires + ";path=/";
  }
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
      let image = `<img src="https://www.celio.com/medias/sys_master/productMedias/productMediasImport/h22/h6b/10120899035166/t-shirt-col-rond-coton-stretch-blanc-1061351-1-product.jpg">`;
      if(product.hasOwnProperty('image')){
        image = `<img src="${product.image}">`;
      }
      return `
      <div class="col-sm-3 p-3 bg-white text-white card" >
      <span style="color:black; font-weight:bold; text-align:center;">${product.brand.toUpperCase()}</span>
      ${image}
      <a href="${product.link}" target="_blank" style="text-align:center;">${product.name}</a>
      <span style="color:black; text-align:right;">${product.price} €
      <button name="favorite" id="favorite" onclick="Favorite('${product._id}')">
        <span>⭐</span>
      </button>
      </span>
      </div>
    `;
    })
    .join('');
  div.setAttribute( "class", "row" );
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
 * Render page number
 * @param  {Object} pagination
 */
 const renderPageNumber = pagination => {
  const {currentPage, pageCount} = pagination;
  const range = [currentPage - 5, currentPage + 5];
  if(range[0] < 1){
    range[0] = 1;
  }
  if(range[1] > pageCount){
    range[1] = pageCount;
  }
  const finalRange = ['Previous'];
  for(let i = range[0]; i <= range[1]; i++)
  {
    finalRange.push(i);
  }
  finalRange.push('Next');
  while(pageNumber.firstChild){
    pageNumber.removeChild(pageNumber.firstChild);
  }
  for(let i in finalRange){
    const li = document.createElement('li');
    var template = `
    <a class="page-link">${finalRange[i]}</a>
    `
    if(finalRange[i]==currentPage){
      template = `
      <a class="page-link" style="color:white; background-color:blue;">${finalRange[i]}</a>
      `  
    }
    li.setAttribute("class", "page-item");
    li.innerHTML = template;
    pageNumber.appendChild(li);  
  }
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
};

const renderFavorites = favorites => {
  let products = allProducts.filter(x => favorites.includes(x['_id']));
  renderProducts(products, true);
}

const render = (products, pagination) => {
  renderProducts(products);
  renderBrands(allBrands);
  renderPagination(pagination);
  renderPageNumber(pagination);
  renderIndicators(pagination);
  renderFavorites(document.cookie.split(','));
};

/**
 * Declaration of all Listeners
 */

/**
 * Select the number of products to display
 */
 selectShow.addEventListener('change', async (event) => {
  const products = await fetchProducts(1, parseInt(event.target.value), selectedBrand, cheap);
  setCurrentProducts(products,1,parseInt(event.target.value));
  render(currentProducts, currentPagination);
});

/**
 * Select the page to display
 */
 selectPage.addEventListener('change', async (event) => {
  const products = await fetchProducts(parseInt(event.target.value), selectedSize, selectedBrand, cheap);
  setCurrentProducts(products,parseInt(event.target.value),selectedSize);
  render(currentProducts, currentPagination);
});

pageNumber.addEventListener('click', async (event) => {
  const products = await fetchProducts(parseInt(event.target.innerHTML), selectedSize, selectedBrand, cheap);
  setCurrentProducts(products,parseInt(event.target.innerHTML),selectedSize);
  render(currentProducts, currentPagination);
})

selectBrand.addEventListener('change', async (event) => {
  selectedBrand = event.target.value;
  const products = await fetchProducts(1, selectedSize, selectedBrand, cheap);
  setCurrentProducts(products,1,selectedSize);
  currentBrand = allBrands.indexOf(selectedBrand);
  render(currentProducts, currentPagination);
});

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

selectCheap.addEventListener('change', async () => {
  cheap=!cheap;
  var products = await fetchProducts(1, selectedSize, selectedBrand, cheap);
  setCurrentProducts(products,1);
  render(currentProducts, currentPagination);
});

sort.addEventListener('change', async(event) => {
  if(event.target.value=='price-asc'){
    sortByPrice(false);
  }
  if(event.target.value=='price-desc'){
    sortByPrice(true);
  }
})

favoritesFilter.addEventListener('change', async () => {
  onlyFavorites = !onlyFavorites;
  render(currentProducts, currentPagination);
})

const sortByPrice = async (desc) => {
  var products = await fetchProducts(1, selectedSize, selectedBrand, cheap);
  if(!desc){
    products.sort(ComparePrices);
  }
  else{
    products.sort(ComparePrices).reverse();
  }
  setCurrentProducts(products,1,selectedSize);
  render(currentProducts, currentPagination);
};

document.addEventListener('DOMContentLoaded', async () => {
  const products = await fetchProducts();
  allProducts = await fetchProducts(1,10000);
  allBrands.push("All brands");
  for(let i in allProducts){
    allBrands.push(allProducts[i].brand);
  }
  allBrands=Array.from(new Set(allBrands));

  setCurrentProducts(products,selectedPage,selectedSize);
  render(currentProducts, currentPagination);
});
