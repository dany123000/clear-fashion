// Invoking strict mode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode#invoking_strict_mode
'use strict';

var currentProducts = [];
var currentProductsAllPages = [];
var allProducts=[];
var allBrands=[];
var selectedBrand="All brands";
var currentBrand=0;
var selectedPage=1;
var selectedSize=12;
var productCount=0;
var pageCount=0;
var selectedCheap=false;
var selectedReverse=false;
var onlyFavorites=false;

// instantiate the selectors
const selectShow = document.querySelector('#show-select');
const selectPage = document.querySelector('#page-number');
const selectBrand = document.querySelector('#brand-select');
const selectCheap = document.querySelector('#cheap');
const sectionAddedToFav = document.querySelector('#added-fav');
const sectionProducts = document.querySelector('#products');
const sectionFavorites = document.querySelector('#favorites');
const spanNbProducts = document.querySelector('#nbProducts');
const sortProducts = document.querySelector('#sort-select');
const favoritesFilter = document.querySelector('#favorites-filter');

/**
 * Set global value
 */
const setCurrentProducts = async(page=selectedPage, size=selectedSize, brand=selectedBrand, cheap=false, reverse=false) => {
  currentProducts = await fetchProducts(page, size, brand, cheap, reverse);
  currentProductsAllPages = await fetchProducts(1, 10000, brand, cheap, reverse);
  productCount = allProducts.length;
  pageCount = parseInt(currentProductsAllPages.length/size) + 1;
  selectedPage = page;
  selectedSize = size;
  selectedBrand = brand;
  currentBrand = allBrands.indexOf(selectedBrand);
  selectedCheap = cheap;
  selectedReverse = reverse;
  render();
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
    return currentProducts;
  }
};

/**
 * Add a favorite or delete it (if it is already a favorite)
 */
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
  render();
}

/**
 * Set cookie with list of favorites
 */
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
  div.setAttribute("class", "row");
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
 const renderPageSelector = () => {
  const range = [selectedPage - 6, selectedPage + 6];
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
  while(selectPage.firstChild){
    selectPage.removeChild(selectPage.firstChild);
  }
  for(let i in finalRange){
    const li = document.createElement('li');
    let template = `
    <a class="page-link" style="color:green;">${finalRange[i]}</a>
    `
    if(finalRange[i]==selectedPage){
      template = `
      <a class="page-link" style="color:white; background-color:green;">${finalRange[i]}</a>
      `  
    }
    li.setAttribute("class", "page-item");
    li.innerHTML = template;
    selectPage.appendChild(li);  
  }
};

/**
 * Render brands selector
 */
 const renderBrands = (brands) => {
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
const renderIndicators = () => {
  spanNbProducts.innerHTML = currentProductsAllPages.length + '/' + productCount;
};

/**
 * Render list of favorites
 */
 const renderFavorites = (favorites) => {
  let products = allProducts.filter(x => favorites.includes(x['_id']));
  renderProducts(products, true);
}

const render = () => {
  renderProducts(currentProducts);
  renderBrands(allBrands);
  renderPageSelector();
  renderIndicators();
  renderFavorites(document.cookie.split(','));
};

/**
 * Select the number of products to display
 */
 selectShow.addEventListener('change', async (event) => {
  setCurrentProducts(1, parseInt(event.target.value), selectedBrand, selectedCheap, selectedReverse);
});

/**
 * Select the page to display
 */
selectPage.addEventListener('click', async (event) => {
  let number = event.target.innerHTML;
  if(number=="First"){
    number = 1;
  }
  if(number=="Last"){
    number = pageCount;
  }
  if(number!=='...'){
    setCurrentProducts(parseInt(number), selectedSize, selectedBrand, selectedCheap, selectedReverse);
  }
})

selectBrand.addEventListener('change', async (event) => {
  setCurrentProducts(1, selectedSize, event.target.value, selectedCheap, selectedReverse);
});

selectCheap.addEventListener('change', async () => {
  setCurrentProducts(1, selectedSize, selectedBrand, !selectedCheap, selectedReverse);
});

sortProducts.addEventListener('change', async(event) => {
  setCurrentProducts(1, selectedSize, selectedBrand, selectedCheap, !selectedReverse);
})

favoritesFilter.addEventListener('change', async () => {
  onlyFavorites = !onlyFavorites;
  render();
})

document.addEventListener('DOMContentLoaded', async () => {
  allProducts = await fetchProducts(1,10000);
  allBrands.push("All brands");
  for(let i in allProducts){
    allBrands.push(allProducts[i].brand);
  }
  allBrands=Array.from(new Set(allBrands));
  setCurrentProducts();
});
