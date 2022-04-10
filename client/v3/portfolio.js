// Invoking strict mode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode#invoking_strict_mode
'use strict';

// current products on the page
var currentProducts = [];
var currentProductsAllPages = [];
var currentPagination = {};
var allProducts=[];
var allBrands=[];
var selectedBrand="All brands";
var selectedPage=1;
var selectedSize=12;
var currentBrand=0;
var cheap=false;
var reverse=false;
var onlyFavorites=false;

// instantiate the selectors
const selectShow = document.querySelector('#show-select');
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
 */
const setCurrentProducts = (result, page=selectedPage, size=selectedSize) => {
  currentProducts = result;
  currentPagination = {
    "count":allProducts.length,
    "currentPage":page,
    "pageCount":parseInt(currentProductsAllPages.length/size) + 1,
    "pageSize":size
  };
  selectedPage=page;
  selectedSize=size;
};

/**
 * Fetch products from api
 */
const fetchProducts = async (page = 1, size = 12, brand = 'All brands', cheap=false, reverse=false) => {
  try {
    //let query=`http://localhost:8092/products/search?page=${page}&size=${size}`;
    let query=`https://clear-fashion-dany123000.vercel.app/products/search?page=${page}&size=${size}`;
    let response='';
    if(brand!='All brands'){
      query+=`&brand=${brand}`;
    }
    if(cheap){
      query+=`&price=50`;
    }
    if(reverse){
      query+=`&reverse`;
    }
    response = await fetch(query);


  const body = await response.json();

  return body;
  } catch (error) {
    console.error(error);
    return {currentProducts, currentPagination};
  }
};

function Favorite(id){
  if(!document.cookie.split(',').find(x => x == id)){
    setCookie(id, 7, true);
    sectionAddedToFav.removeChild(sectionAddedToFav.firstChild);
    const div = document.createElement('div');
    const template = `
    <span class="closebtn">&times;</span>  
    🛒 Article added to favorites!
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
      🗑️ Article removed from favorites!
      `
      div.setAttribute("class", "alert");
      div.innerHTML = template;
      sectionAddedToFav.appendChild(div);
      }
  }
  let close = document.getElementsByClassName("closebtn");
  for (let i = 0; i < close.length; i++) {
    close[i].onclick = function(){
      let div = this.parentElement;
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
    if(products.length==0){
      sectionFavorites.append(`You don't have any favorite for the moment 😢`);
    }
    sectionFavorites.appendChild(fragment);
  }
};

/**
 * Render page selector
 */
 const renderPageNumber = pagination => {
  const {currentPage, pageCount} = pagination;
  const range = [currentPage - 6, currentPage + 6];
  if(range[0] < 1){
    range[0] = 1;
  }
  if(range[1] > pageCount){
    range[1] = pageCount;
  }
  const finalRange = ['First'];
  if(range[0]!==1){
    finalRange.push('...');
  }
  for(let i = range[0]; i <= range[1]; i++)
  {
    finalRange.push(i);
  }
  if(range[1]!==pageCount){
    finalRange.push('...');
  }
  finalRange.push('Last');
  while(pageNumber.firstChild){
    pageNumber.removeChild(pageNumber.firstChild);
  }
  for(let i in finalRange){
    const li = document.createElement('li');
    let template = `
    <a class="page-link" style="color:green;">${finalRange[i]}</a>
    `
    if(finalRange[i]==currentPage){
      template = `
      <a class="page-link" style="color:white; background-color:green;">${finalRange[i]}</a>
      `  
    }
    li.setAttribute("class", "page-item");
    li.innerHTML = template;
    pageNumber.appendChild(li);  
  }
};

/**
 * Render brands selector
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
 */
const renderIndicators = pagination => {
  const {count} = pagination;
  spanNbProducts.innerHTML = currentProductsAllPages.length + '/' + count;
};

const renderFavorites = favorites => {
  let products = allProducts.filter(x => favorites.includes(x['_id']));
  renderProducts(products, true);
}

const render = (products, pagination) => {
  renderProducts(products);
  renderBrands(allBrands);
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
  const products = await fetchProducts(1, parseInt(event.target.value), selectedBrand, cheap, reverse);
  currentProductsAllPages = await fetchProducts(1, 10000, selectedBrand, cheap, reverse);
  setCurrentProducts(products,1,parseInt(event.target.value));
  render(currentProducts, currentPagination);
});

/**
 * Select the page to display
 */
pageNumber.addEventListener('click', async (event) => {
  let number = event.target.innerHTML;
  if(number=="First"){
    number = 1;
  }
  if(number=="Last"){
    number = currentPagination.pageCount;
  }
  if(number!=='...'){
    const products = await fetchProducts(parseInt(number), selectedSize, selectedBrand, cheap, reverse);
    currentProductsAllPages = await fetchProducts(1, 10000, selectedBrand, cheap, reverse);
    setCurrentProducts(products,parseInt(number),selectedSize);
    render(currentProducts, currentPagination);  
  }
})

selectBrand.addEventListener('change', async (event) => {
  selectedBrand = event.target.value;
  const products = await fetchProducts(1, selectedSize, selectedBrand, cheap, reverse);
  currentProductsAllPages = await fetchProducts(1, 10000, selectedBrand, cheap, reverse);
  setCurrentProducts(products,1,selectedSize);
  currentBrand = allBrands.indexOf(selectedBrand);
  render(currentProducts, currentPagination);
});

selectCheap.addEventListener('change', async () => {
  cheap=!cheap;
  var products = await fetchProducts(1, selectedSize, selectedBrand, cheap, reverse);
  currentProductsAllPages = await fetchProducts(1, 10000, selectedBrand, cheap, reverse);
  setCurrentProducts(products,1);
  render(currentProducts, currentPagination);
});

sort.addEventListener('change', async(event) => {
  reverse=!reverse;
  var products = await fetchProducts(1, selectedSize, selectedBrand, cheap, reverse);
  currentProductsAllPages = await fetchProducts(1, 10000, selectedBrand, cheap, reverse);
  setCurrentProducts(products,1,selectedSize);
  render(currentProducts, currentPagination);
})

favoritesFilter.addEventListener('change', async () => {
  onlyFavorites = !onlyFavorites;
  render(currentProducts, currentPagination);
})

document.addEventListener('DOMContentLoaded', async () => {
  const products = await fetchProducts();
  currentProductsAllPages = await fetchProducts(1, 10000, selectedBrand, cheap, reverse);
  allProducts = await fetchProducts(1,10000);
  allBrands.push("All brands");
  for(let i in allProducts){
    allBrands.push(allProducts[i].brand);
  }
  allBrands=Array.from(new Set(allBrands));

  setCurrentProducts(products,selectedPage,selectedSize);
  render(currentProducts, currentPagination);
});
