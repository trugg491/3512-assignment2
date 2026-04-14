/* LUXE Fashion Store JavaScript
   COMP 3512 Assignment 2

   This SPA uses JavaScript only.
   Data is embedded in a <script> tag in index.html
   and parsed with JSON.parse().*/


   /* Global State */
   let products = [];        // all product data from JSON
   let cart = [];            // shopping cart items
   let activeFilters = {     // current browse filters
     gender: [],
     category: [],
     size: [],
     color: []
   };
   let currentSort = "name-asc";  // default sort
   
   
   /* INITIALIZATION */
   
   /* Runs when the page finishes loading.
   Parses product data and sets up all event listeners. */


   document.addEventListener("DOMContentLoaded", function () {
     loadProductData();
     setupNavigation();
     setupHomeView();
     setupBrowseFilters();
     setupBrowseSort();
     setupCartView();
     setupAboutDialog();
     showView("home");
   });
   
   /* Loads product data from the embedded <script> tag
    * and parses it into the products array. */
   function loadProductData() {
     const dataElement = document.querySelector("#product-data");
     products = JSON.parse(dataElement.textContent);
   }
   

   /* NAVIGATION: Switching Between Views */
   
   /* Sets up click handlers for all navigation links. */
   function setupNavigation() {
     document.querySelector("#logo-link").addEventListener("click", function (e) {
       e.preventDefault();
       showView("home");
     });
   
     document.querySelector("#nav-home").addEventListener("click", function (e) {
       e.preventDefault();
       showView("home");
     });
   
     document.querySelector("#nav-browse").addEventListener("click", function (e) {
       e.preventDefault();
       showView("browse");
     });
   
     document.querySelector("#nav-about").addEventListener("click", function (e) {
       e.preventDefault();
       document.querySelector("#about").showModal();
     });
   
     document.querySelector("#nav-cart").addEventListener("click", function (e) {
       e.preventDefault();
       showView("cart");
       renderCart();
     });
   }
   
   /** Shows the specified view and hides all others.
    * @param {string} viewId - The id of the view to show: "home", "browse", "singleproduct", or "cart" */
   function showView(viewId) {
     const views = ["home", "browse", "singleproduct", "cart"];
     for (let i = 0; i < views.length; i++) {
       const el = document.querySelector("#" + views[i]);
       if (views[i] === viewId) {
         el.classList.remove("hidden");
       } else {
         el.classList.add("hidden");
       }
     }
     // Scroll to top when switching views
     window.scrollTo(0, 0);
   }
   

   /* HOME VIEW */
   
   /* Sets up the home view with categories and featured products. */
   function setupHomeView() {
     renderHomeCategories();
     renderHomeFeatured();
   
     document.querySelector("#hero-browse-btn").addEventListener("click", function () {
       showView("browse");
       renderProducts();
     });
   }
   
   /* Renders category cards on the home page.
    * Each card navigates to the browse view filtered by that category. */
   function renderHomeCategories() {
     const categories = getUniqueValues("category");
     const grid = document.querySelector("#home-category-grid");
     grid.innerHTML = "";
   
     for (let i = 0; i < categories.length; i++) {
       const card = document.createElement("div");
       card.className = "category-card";
       card.innerHTML = "<h3>" + categories[i] + "</h3>";
       card.addEventListener("click", function () {
         clearAllFilters();
         activeFilters.category.push(categories[i]);
         showView("browse");
         updateFilterCheckboxes();
         renderProducts();
         renderActiveFilters();
       });
       grid.appendChild(card);
     }
   }
   
   /* Renders featured (top-selling) products on the home page. */
   function renderHomeFeatured() {
     // Sort by total sales and pick top 8
     const sorted = products.slice().sort(function (a, b) {
       return b.sales.total - a.sales.total;
     });
     const featured = sorted.slice(0, 8);
     const grid = document.querySelector("#home-featured-grid");
     grid.innerHTML = "";
   
     for (let i = 0; i < featured.length; i++) {
       const p = featured[i];
       const card = document.createElement("div");
       card.className = "featured-card";
       card.innerHTML =
         '<div class="featured-card-image" style="background-color:' + p.color[0].hex + ';">' +
           '<span class="placeholder-text">Placeholder</span>' +
         '</div>' +
         '<div class="featured-card-info">' +
           '<h3>' + p.name + '</h3>' +
           '<p>$' + p.price.toFixed(2) + '</p>' +
         '</div>';
   
       card.addEventListener("click", function () {
         showSingleProduct(p.id);
       });
       grid.appendChild(card);
     }
   }
   

   /* BROWSE VIEW: Filters */
   
   /**  Extracts unique values for a given field from all products.
    * @param {string} field - The product field (e.g. "category", "gender")
    * @returns {string[]} Sorted array of unique values */
   function getUniqueValues(field) {
     const values = [];
     for (let i = 0; i < products.length; i++) {
       const val = products[i][field];
       if (values.indexOf(val) === -1) {
         values.push(val);
       }
     }
     values.sort();
     return values;
   }
   
   /** Extracts all unique sizes across all products.
    * @returns {string[]} Array of unique sizes */
   function getUniqueSizes() {
     const sizes = [];
     for (let i = 0; i < products.length; i++) {
       for (let j = 0; j < products[i].sizes.length; j++) {
         if (sizes.indexOf(products[i].sizes[j]) === -1) {
           sizes.push(products[i].sizes[j]);
         }
       }
     }
     return sizes;
   }
   
   /** Extracts all unique colors (by name) across all products.
    * @returns {Object[]} Array of {name, hex} objects */
   function getUniqueColors() {
     const colors = [];
     const seen = [];
     for (let i = 0; i < products.length; i++) {
       for (let j = 0; j < products[i].color.length; j++) {
         const c = products[i].color[j];
         if (seen.indexOf(c.name) === -1) {
           seen.push(c.name);
           colors.push(c);
         }
       }
     }
     colors.sort(function (a, b) {
       if (a.name < b.name) return -1;
       if (a.name > b.name) return 1;
       return 0;
     });
     return colors;
   }
   
   /** Sets up all filter checkboxes in the browse sidebar. */
   function setupBrowseFilters() {
     // Gender filters
     const genders = getUniqueValues("gender");
     const genderDiv = document.querySelector("#filter-gender");
     for (let i = 0; i < genders.length; i++) {
       const label = createFilterCheckbox("gender", genders[i], capitalizeGender(genders[i]));
       genderDiv.appendChild(label);
     }
   
     // Category filters
     const categories = getUniqueValues("category");
     const catDiv = document.querySelector("#filter-category");
     for (let i = 0; i < categories.length; i++) {
       const label = createFilterCheckbox("category", categories[i], categories[i]);
       catDiv.appendChild(label);
     }
   
     // Size filters
     const sizes = getUniqueSizes();
     const sizeDiv = document.querySelector("#filter-size");
     for (let i = 0; i < sizes.length; i++) {
       const label = createFilterCheckbox("size", sizes[i], sizes[i]);
       sizeDiv.appendChild(label);
     }
   
     // Color filters
     const colors = getUniqueColors();
     const colorDiv = document.querySelector("#filter-color");
     for (let i = 0; i < colors.length; i++) {
       const label = createColorFilterCheckbox(colors[i]);
       colorDiv.appendChild(label);
     }
   
     // Initial render
     renderProducts();
   }
   
   /** Creates a checkbox filter option element.
    * @param {string} filterType - The filter category ("gender", "category", "size")
    * @param {string} value - The value to filter by
    * @param {string} displayText - Text to show next to checkbox
    * @returns {HTMLElement} The label element containing the checkbox */
   function createFilterCheckbox(filterType, value, displayText) {
     const label = document.createElement("label");
     label.className = "filter-option";
   
     const checkbox = document.createElement("input");
     checkbox.type = "checkbox";
     checkbox.dataset.filterType = filterType;
     checkbox.dataset.filterValue = value;
   
     checkbox.addEventListener("change", function () {
       if (this.checked) {
         activeFilters[filterType].push(value);
       } else {
         const idx = activeFilters[filterType].indexOf(value);
         if (idx > -1) {
           activeFilters[filterType].splice(idx, 1);
         }
       }
       renderProducts();
       renderActiveFilters();
     });
   
     const text = document.createTextNode(displayText);
     label.appendChild(checkbox);
     label.appendChild(text);
     return label;
   }
   
   /** Creates a color filter checkbox with a color swatch.
    * @param {Object} colorObj - Object with name and hex properties
    * @returns {HTMLElement} The label element */
   function createColorFilterCheckbox(colorObj) {
     const label = document.createElement("label");
     label.className = "filter-option";
   
     const checkbox = document.createElement("input");
     checkbox.type = "checkbox";
     checkbox.dataset.filterType = "color";
     checkbox.dataset.filterValue = colorObj.name;
   
     checkbox.addEventListener("change", function () {
       if (this.checked) {
         activeFilters.color.push(colorObj.name);
       } else {
         const idx = activeFilters.color.indexOf(colorObj.name);
         if (idx > -1) {
           activeFilters.color.splice(idx, 1);
         }
       }
       renderProducts();
       renderActiveFilters();
     });
   
     const swatch = document.createElement("span");
     swatch.className = "color-swatch-filter";
     swatch.style.backgroundColor = colorObj.hex;
   
     const text = document.createTextNode(colorObj.name);
   
     label.appendChild(checkbox);
     label.appendChild(swatch);
     label.appendChild(text);
     return label;
   }
   
   /** Capitalizes gender display text.
    * @param {string} gender - "mens" or "womens"
    * @returns {string} "Men's" or "Women's" */
   function capitalizeGender(gender) {
     if (gender === "mens") return "Men's";
     if (gender === "womens") return "Women's";
     return gender;
   }
   
   /** Syncs checkbox states with the activeFilters object.
    * Used when filters are set programmatically (e.g., from home categories). */
   function updateFilterCheckboxes() {
     const checkboxes = document.querySelectorAll(".filter-option input[type='checkbox']");
     for (let i = 0; i < checkboxes.length; i++) {
       const type = checkboxes[i].dataset.filterType;
       const value = checkboxes[i].dataset.filterValue;
       checkboxes[i].checked = activeFilters[type].indexOf(value) > -1;
     }
   }
   
   /** Renders the active filter tags above the product grid. */
   function renderActiveFilters() {
     const container = document.querySelector("#active-filters");
     container.innerHTML = "";
   
     const types = ["gender", "category", "size", "color"];
     let hasFilters = false;
   
     for (let t = 0; t < types.length; t++) {
       const type = types[t];
       for (let i = 0; i < activeFilters[type].length; i++) {
         hasFilters = true;
         const value = activeFilters[type][i];
         const tag = document.createElement("span");
         tag.className = "filter-tag";
   
         const displayVal = (type === "gender") ? capitalizeGender(value) : value;
         tag.innerHTML = displayVal + ' <button class="filter-tag-remove">&times;</button>';
   
         // Closure to capture type and value
         (function (filterType, filterValue) {
           tag.querySelector(".filter-tag-remove").addEventListener("click", function () {
             const idx = activeFilters[filterType].indexOf(filterValue);
             if (idx > -1) {
               activeFilters[filterType].splice(idx, 1);
             }
             updateFilterCheckboxes();
             renderProducts();
             renderActiveFilters();
           });
         })(type, value);
   
         container.appendChild(tag);
       }
     }
   
     // Clear All button
     if (hasFilters) {
       const clearBtn = document.createElement("button");
       clearBtn.className = "clear-all-btn";
       clearBtn.textContent = "Clear All";
       clearBtn.addEventListener("click", function () {
         clearAllFilters();
         updateFilterCheckboxes();
         renderProducts();
         renderActiveFilters();
       });
       container.appendChild(clearBtn);
     }
   }
   
   /** Resets all active filters to empty arrays. */
   function clearAllFilters() {
     activeFilters.gender = [];
     activeFilters.category = [];
     activeFilters.size = [];
     activeFilters.color = [];
   }
   

   /* BROWSE VIEW: Sorting */
   
   /* Sets up the sort dropdown event listener. */
   function setupBrowseSort() {
     document.querySelector("#sort-select").addEventListener("change", function () {
       currentSort = this.value;
       renderProducts();
     });
   }
   
   /** Sorts an array of products based on the current sort selection.
    * @param {Object[]} list - Array of products to sort
    * @returns {Object[]} Sorted array */
   function sortProducts(list) {
     const sorted = list.slice();
     if (currentSort === "name-asc") {
       sorted.sort(function (a, b) {
         if (a.name < b.name) return -1;
         if (a.name > b.name) return 1;
         return 0;
       });
     } else if (currentSort === "name-desc") {
       sorted.sort(function (a, b) {
         if (a.name > b.name) return -1;
         if (a.name < b.name) return 1;
         return 0;
       });
     } else if (currentSort === "price-asc") {
       sorted.sort(function (a, b) { return a.price - b.price; });
     } else if (currentSort === "price-desc") {
       sorted.sort(function (a, b) { return b.price - a.price; });
     }
     return sorted;
   }
   
   /* BROWSE VIEW: Rendering Products */
   
   /* Filters and renders products in the browse grid.
    * Filters are additive (AND): a product must match ALL active filter categories. */
   function renderProducts() {
     let filtered = products.slice();
   
     // gender filter
     if (activeFilters.gender.length > 0) {
       let temp = [];
       for (let i = 0; i < filtered.length; i++) {
         if (activeFilters.gender.indexOf(filtered[i].gender) > -1) {
           temp.push(filtered[i]);
         }
       }
       filtered = temp;
     }
   
     // category filter
     if (activeFilters.category.length > 0) {
       let temp = [];
       for (let i = 0; i < filtered.length; i++) {
         if (activeFilters.category.indexOf(filtered[i].category) > -1) {
           temp.push(filtered[i]);
         }
       }
       filtered = temp;
     }
   
     // size filter
     if (activeFilters.size.length > 0) {
       let temp = [];
       for (let i = 0; i < filtered.length; i++) {
         let matches = false;
         for (let j = 0; j < activeFilters.size.length; j++) {
           if (filtered[i].sizes.indexOf(activeFilters.size[j]) > -1) {
             matches = true;
           }
         }
         if (matches) {
           temp.push(filtered[i]);
         }
       }
       filtered = temp;
     }
   
     // color filter
     if (activeFilters.color.length > 0) {
       let temp = [];
       for (let i = 0; i < filtered.length; i++) {
         let matches = false;
         for (let j = 0; j < filtered[i].color.length; j++) {
           if (activeFilters.color.indexOf(filtered[i].color[j].name) > -1) {
             matches = true;
           }
         }
         if (matches) {
           temp.push(filtered[i]);
         }
       }
       filtered = temp;
     }
   
     // Sort
     filtered = sortProducts(filtered);
   
     // Render
     const grid = document.querySelector("#product-grid");
     const noResults = document.querySelector("#no-results");
     const countEl = document.querySelector("#product-count");
     grid.innerHTML = "";
   
     if (filtered.length === 0) {
       noResults.classList.remove("hidden");
       grid.classList.add("hidden");
       countEl.textContent = "0 products found";
     } else {
       noResults.classList.add("hidden");
       grid.classList.remove("hidden");
       countEl.textContent = filtered.length + " product" + (filtered.length === 1 ? "" : "s") + " found";
   
       for (let i = 0; i < filtered.length; i++) {
         grid.appendChild(createProductCard(filtered[i]));
       }
     }
   }
   
   /** Creates a product card element for the browse grid.
    * @param {Object} product - The product data object
    * @returns {HTMLElement} The product card element */
   function createProductCard(product) {
     const card = document.createElement("div");
     card.className = "product-card";
   
     const imageDiv = document.createElement("div");
     imageDiv.className = "product-card-image";
     imageDiv.style.backgroundColor = product.color[0].hex;
   
     const placeholder = document.createElement("span");
     placeholder.className = "placeholder-text";
     placeholder.textContent = "Placeholder";
     imageDiv.appendChild(placeholder);
   
     imageDiv.addEventListener("click", function () {
       showSingleProduct(product.id);
     });
   
     const infoDiv = document.createElement("div");
     infoDiv.className = "product-card-info";
   
     const title = document.createElement("h3");
     title.className = "product-card-title";
     title.textContent = product.name;
     title.addEventListener("click", function () {
       showSingleProduct(product.id);
     });
   
     const price = document.createElement("p");
     price.className = "product-card-price";
     price.textContent = "$" + product.price.toFixed(2);
   
     const btn = document.createElement("button");
     btn.className = "product-card-btn";
     btn.textContent = "+ Add to Cart";
     btn.addEventListener("click", function () {
       addToCart(product.id, 1, product.sizes[0], product.color[0].name);
       alert(product.name + " added to cart!");
     });
   
     infoDiv.appendChild(title);
     infoDiv.appendChild(price);
     infoDiv.appendChild(btn);
   
     card.appendChild(imageDiv);
     card.appendChild(infoDiv);
   
     return card;
   }
   
   /* SINGLE PRODUCT VIEW */
   
   /** Displays the single product view for a given product ID.
    * @param {string} productId - The product ID (e.g., "P001") */
   function showSingleProduct(productId) {
     const product = findProductById(productId);
     if (!product) return;
   
     // Breadcrumb
     const breadcrumb = document.querySelector("#breadcrumb");
     breadcrumb.innerHTML =
       '<a href="#">Home</a> &gt; ' +
       '<a href="#">' + capitalizeGender(product.gender) + '</a> &gt; ' +
       '<a href="#">' + product.category + '</a> &gt; ' +
       product.name;
   
     // Product details
     document.querySelector("#product-title").textContent = product.name;
     document.querySelector("#product-price").textContent = "$" + product.price.toFixed(2);
     document.querySelector("#product-description").textContent = product.description;
     document.querySelector("#product-material").textContent = product.material;
     document.querySelector("#product-quantity").value = 1;
   
     // Main image (color swatch as placeholder)
     const mainImage = document.querySelector("#product-main-image");
     mainImage.style.backgroundColor = product.color[0].hex;
     mainImage.innerHTML = '<span class="placeholder-text">Placeholder</span>';
   
     // Thumbnails
     const thumbnails = document.querySelector("#product-thumbnails");
     thumbnails.innerHTML = "";
     for (let i = 0; i < product.color.length; i++) {
       const thumb = document.createElement("div");
       thumb.className = "product-thumbnail";
       thumb.style.backgroundColor = product.color[i].hex;
       thumbnails.appendChild(thumb);
     }
   
     // Sizes
     const sizesDiv = document.querySelector("#product-sizes");
     sizesDiv.innerHTML = "";
     let selectedSize = product.sizes[0];
   
     for (let i = 0; i < product.sizes.length; i++) {
       const btn = document.createElement("button");
       btn.className = "size-btn";
       btn.textContent = product.sizes[i];
       if (i === 0) btn.classList.add("selected");
   
       btn.addEventListener("click", function () {
         // Remove selected from all
         const allBtns = sizesDiv.querySelectorAll(".size-btn");
         for (let j = 0; j < allBtns.length; j++) {
           allBtns[j].classList.remove("selected");
         }
         btn.classList.add("selected");
         selectedSize = product.sizes[i];
       });
   
       sizesDiv.appendChild(btn);
     }
   
     // Colors
     const colorsDiv = document.querySelector("#product-colors");
     colorsDiv.innerHTML = "";
     let selectedColor = product.color[0].name;
   
     for (let i = 0; i < product.color.length; i++) {
       const swatch = document.createElement("div");
       swatch.className = "color-swatch";
       swatch.style.backgroundColor = product.color[i].hex;
       if (i === 0) swatch.classList.add("selected");
   
       swatch.addEventListener("click", function () {
         const allSwatches = colorsDiv.querySelectorAll(".color-swatch");
         for (let j = 0; j < allSwatches.length; j++) {
           allSwatches[j].classList.remove("selected");
         }
         swatch.classList.add("selected");
         selectedColor = product.color[i].name;
       });
   
       colorsDiv.appendChild(swatch);
     }
   
     // Hide notification
     document.querySelector("#cart-notification").classList.add("hidden");
   
     // Add to Cart button
     const addBtn = document.querySelector("#btn-add-cart");
     // Remove old listener by replacing the element
     const newBtn = addBtn.cloneNode(true);
     addBtn.parentNode.replaceChild(newBtn, addBtn);
   
     newBtn.addEventListener("click", function () {
       const qty = parseInt(document.querySelector("#product-quantity").value);
       if (qty < 1) return;
   
       // Get currently selected size
       const selectedSizeBtn = sizesDiv.querySelector(".size-btn.selected");
       const size = selectedSizeBtn ? selectedSizeBtn.textContent : product.sizes[0];
   
       // Get currently selected color
       const selectedSwatchEl = colorsDiv.querySelector(".color-swatch.selected");
       let color = product.color[0].name;
       if (selectedSwatchEl) {
         const children = colorsDiv.children;
         for (let k = 0; k < children.length; k++) {
           if (children[k] === selectedSwatchEl) {
             color = product.color[k].name;
           }
         }
       }
   
       addToCart(product.id, qty, size, color);
       document.querySelector("#cart-notification").classList.remove("hidden");
     });
   
     showView("singleproduct");
   }
   
   /**  Finds a product by its ID.
    * @param {string} id - Product ID
    * @returns {Object|null} The product object or null */
   function findProductById(id) {
     for (let i = 0; i < products.length; i++) {
       if (products[i].id === id) {
         return products[i];
       }
     }
     return null;
   }
   
   /* SHOPPING CART */
   
   /** Adds a product to the shopping cart.
    * If the same product/size/color combo exists, increases quantity.
    * @param {string} productId - Product ID
    * @param {number} quantity - Quantity to add
    * @param {string} size - Selected size
    * @param {string} color - Selected color name */
   function addToCart(productId, quantity, size, color) {
     // Check if same item already in cart
     for (let i = 0; i < cart.length; i++) {
       if (cart[i].productId === productId && cart[i].size === size && cart[i].color === color) {
         cart[i].quantity += quantity;
         updateCartBadge();
         return;
       }
     }
   
     cart.push({
       productId: productId,
       quantity: quantity,
       size: size,
       color: color
     });
   
     updateCartBadge();
   }
   
   /**  Removes an item from the cart by index.
    * @param {number} index - Index in the cart array */
   function removeFromCart(index) {
     cart.splice(index, 1);
     updateCartBadge();
     renderCart();
   }
   
   /* Updates the cart badge count in the header. */
   function updateCartBadge() {
     let totalItems = 0;
     for (let i = 0; i < cart.length; i++) {
       totalItems += cart[i].quantity;
     }
     document.querySelector("#cart-badge").textContent = totalItems;
   }
   
   /* Sets up cart view event listeners. */
   function setupCartView() {
     document.querySelector("#cart-empty-browse").addEventListener("click", function () {
       showView("browse");
       renderProducts();
     });
   
     document.querySelector("#shipping-type").addEventListener("change", function () {
       updateCartSummary();
     });
   
     document.querySelector("#shipping-dest").addEventListener("change", function () {
       updateCartSummary();
     });
   
     document.querySelector("#btn-checkout").addEventListener("click", function () {
       alert("Thank you for your purchase! Your order has been placed.");
       cart = [];
       updateCartBadge();
       showView("home");
     });
   }
   
   /*  Renders the full shopping cart view. */
   function renderCart() {
     const emptyEl = document.querySelector("#cart-empty");
     const contentEl = document.querySelector("#cart-content");
   
     if (cart.length === 0) {
       emptyEl.classList.remove("hidden");
       contentEl.classList.add("hidden");
       return;
     }
   
     emptyEl.classList.add("hidden");
     contentEl.classList.remove("hidden");
   
     const tbody = document.querySelector("#cart-items");
     tbody.innerHTML = "";
   
     for (let i = 0; i < cart.length; i++) {
       const item = cart[i];
       const product = findProductById(item.productId);
       if (!product) continue;
   
       // Find the hex color for this item's color
       let colorHex = "#ccc";
       for (let j = 0; j < product.color.length; j++) {
         if (product.color[j].name === item.color) {
           colorHex = product.color[j].hex;
         }
       }
   
       const subtotal = product.price * item.quantity;
   
       const tr = document.createElement("tr");
       tr.innerHTML =
         '<td>' +
           '<div style="display:flex;align-items:center;gap:12px;">' +
             '<div class="cart-item-image" style="background-color:' + colorHex + ';"></div>' +
             '<span>' + product.name + '</span>' +
           '</div>' +
         '</td>' +
         '<td><span class="cart-item-color" style="background-color:' + colorHex + ';" title="' + item.color + '"></span></td>' +
         '<td><span class="cart-item-size">' + item.size + '</span></td>' +
         '<td>$' + product.price.toFixed(2) + '</td>' +
         '<td>' + item.quantity + '</td>' +
         '<td>$' + subtotal.toFixed(2) + '</td>' +
         '<td><button class="cart-delete-btn" data-index="' + i + '">Remove</button></td>';
   
       // Add delete handler
       tr.querySelector(".cart-delete-btn").addEventListener("click", function () {
         const idx = parseInt(this.dataset.index);
         removeFromCart(idx);
       });
   
       tbody.appendChild(tr);
     }
   
     updateCartSummary();
   }
   
   /*  Calculates and displays the cart summary
    * (merchandise, shipping, tax, total). */
   function updateCartSummary() {
     // Calculate merchandise total
     let merchandise = 0;
     for (let i = 0; i < cart.length; i++) {
       const product = findProductById(cart[i].productId);
       if (product) {
         merchandise += product.price * cart[i].quantity;
       }
     }
   
     // Shipping cost
     const shippingType = document.querySelector("#shipping-type").value;
     const destination = document.querySelector("#shipping-dest").value;
     let shipping = 0;
   
     if (merchandise > 500) {
       shipping = 0; // Free shipping over $500
     } else {
       // Shipping costs: [Canada, US, International]
       // Standard: $10, $15, $20
       // Express: $25, $25, $30
       // Priority: $35, $50, $50
       if (shippingType === "standard") {
         if (destination === "canada") shipping = 10;
         else if (destination === "us") shipping = 15;
         else shipping = 20;
       } else if (shippingType === "express") {
         if (destination === "canada") shipping = 25;
         else if (destination === "us") shipping = 25;
         else shipping = 30;
       } else if (shippingType === "priority") {
         if (destination === "canada") shipping = 35;
         else if (destination === "us") shipping = 50;
         else shipping = 50;
       }
     }
   
     // Tax: 5% only for Canada
     let tax = 0;
     if (destination === "canada") {
       tax = merchandise * 0.05;
     }
   
     const total = merchandise + shipping + tax;
   
     document.querySelector("#summary-merchandise").textContent = "$" + merchandise.toFixed(2);
     document.querySelector("#summary-shipping").textContent = shipping === 0 ? "FREE" : "$" + shipping.toFixed(2);
     document.querySelector("#summary-tax").textContent = "$" + tax.toFixed(2);
     document.querySelector("#summary-total").textContent = "$" + total.toFixed(2);
   }
   
   /* ABOUT DIALOG */
   
   /* Sets up event listeners for the About dialog. */
   function setupAboutDialog() {
     document.querySelector("#about-close-x").addEventListener("click", function () {
       document.querySelector("#about").close();
     });
   
     document.querySelector("#about-close-btn").addEventListener("click", function () {
       document.querySelector("#about").close();
     });
   }