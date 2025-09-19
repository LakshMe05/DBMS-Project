(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))r(o);new MutationObserver(o=>{for(const a of o)if(a.type==="childList")for(const s of a.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&r(s)}).observe(document,{childList:!0,subtree:!0});function e(o){const a={};return o.integrity&&(a.integrity=o.integrity),o.referrerPolicy&&(a.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?a.credentials="include":o.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function r(o){if(o.ep)return;o.ep=!0;const a=e(o);fetch(o.href,a)}})();const C=void 0,E=void 0;throw new Error("Missing Supabase environment variables");const p=window.supabase.createClient(C,E),g="/api";class I{async fetchBooks(){try{const e=await(await fetch(`${g}/books`)).json();if(!e.success)throw new Error(e.error);return e.data}catch(t){throw console.error("Error fetching books:",t),t}}async searchBooks(t){try{const r=await(await fetch(`${g}/books/search?q=${encodeURIComponent(t)}`)).json();if(!r.success)throw new Error(r.error);return r.data}catch(e){throw console.error("Error searching books:",e),e}}async fetchCustomerData(t){try{const r=await(await fetch(`${g}/customers/${t}`)).json();if(!r.success)throw new Error(r.error);return r.data}catch(e){throw console.error("Error fetching customer data:",e),e}}async createOrder(t,e){try{const o=await(await fetch(`${g}/orders`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({customerId:t,items:e})})).json();if(!o.success)throw new Error(o.error);return o.data}catch(r){throw console.error("Error creating order:",r),r}}}const f=new I;class L{constructor(){this.currentUser=null,this.init()}async init(){const{data:{session:t}}=await p.auth.getSession();t&&(this.currentUser=t.user,this.updateAuthUI()),p.auth.onAuthStateChange((e,r)=>{console.log("Auth state changed:",e),e==="SIGNED_IN"&&r?(this.currentUser=r.user,this.updateAuthUI(),window.location.pathname.includes("login.html")&&(window.location.href="index.html")):e==="SIGNED_OUT"&&(this.currentUser=null,this.updateAuthUI(),window.location.href="login.html")})}async signIn(){try{const{error:t}=await p.auth.signInWithOAuth({provider:"google"});if(t)throw t}catch(t){throw console.error("Error signing in:",t),t}}async signOut(){try{const{error:t}=await p.auth.signOut();if(t)throw t}catch(t){throw console.error("Error signing out:",t),t}}updateAuthUI(){const t=document.getElementById("authButton");t&&(this.currentUser?(t.textContent="Sign Out",t.onclick=()=>this.signOut()):(t.textContent="Sign In",t.onclick=()=>this.signIn()))}isAuthenticated(){return!!this.currentUser}getCurrentUser(){return this.currentUser}}const D=new L;class ${constructor(){this.cart=JSON.parse(localStorage.getItem("bookworld-cart"))||[],this.updateCartDisplay(),this.setupEventListeners()}setupEventListeners(){window.addEventListener("storage",t=>{t.key==="bookworld-cart"&&(this.cart=JSON.parse(t.newValue)||[],this.updateCartDisplay())})}addToCart(t,e=null){const r=this.cart.find(o=>o.bookId===t);r?r.quantity++:this.cart.push({bookId:t,quantity:1,bookData:e||null,addedAt:new Date().toISOString()}),this.saveCart(),this.updateCartDisplay(),this.showNotification("📚 Item added to cart!","success"),this.animateCartIcon()}removeFromCart(t){var r;const e=this.cart.findIndex(o=>o.bookId===t);if(e>-1){const o=this.cart[e];this.cart.splice(e,1),this.saveCart(),this.updateCartDisplay(),this.showNotification(`🗑️ "${((r=o.bookData)==null?void 0:r.title)||"Item"}" removed from cart`,"info")}}updateQuantity(t,e){const r=this.cart.find(o=>o.bookId===t);if(r){const o=r.quantity;r.quantity=Math.max(0,e),r.quantity===0?this.removeFromCart(t):(this.saveCart(),this.updateCartDisplay(),e>o?this.showNotification("📈 Quantity increased","info"):this.showNotification("📉 Quantity decreased","info"))}}clearCart(){const t=this.cart.length;this.cart=[],this.saveCart(),this.updateCartDisplay(),t>0&&this.showNotification(`🧹 Cart cleared (${t} items removed)`,"info")}saveCart(){localStorage.setItem("bookworld-cart",JSON.stringify(this.cart)),window.dispatchEvent(new CustomEvent("cartUpdated",{detail:{cart:this.cart,count:this.getCartCount()}}))}updateCartDisplay(){const t=document.getElementById("cart");if(!t)return;if(t.innerHTML="",this.cart.length===0){t.innerHTML=this.createEmptyCartHTML();return}const e=document.createElement("div");e.className="cart-header",e.innerHTML=`
      <div class="cart-summary">
        <span class="cart-count">${this.getCartCount()} items</span>
        <span class="cart-total">Total: $${this.getCartTotal().toFixed(2)}</span>
      </div>
      <button class="clear-cart-btn" onclick="cart.clearCart()">
        <span>Clear All</span>
        <span>🗑️</span>
      </button>
    `,t.appendChild(e);const r=document.createElement("div");r.className="cart-items",this.cart.forEach((o,a)=>{var i,h,c,d;const s=document.createElement("div");s.className="cart-item",s.style.animationDelay=`${a*.1}s`;const n=(i=o.bookData)!=null&&i.price?parseFloat(o.bookData.price):0,y=n*o.quantity;s.innerHTML=`
        <div class="cart-item-image">
          <div class="book-icon">📖</div>
        </div>
        <div class="cart-item-info">
          <h4>${((h=o.bookData)==null?void 0:h.title)||`Book ID: ${o.bookId}`}</h4>
          <p class="item-details">
            <span class="author">Author ID: ${((c=o.bookData)==null?void 0:c.author_id)||"Unknown"}</span>
            <span class="publisher">Publisher: ${((d=o.bookData)==null?void 0:d.publisher)||"Unknown"}</span>
          </p>
          <p class="item-price">Unit Price: $${n.toFixed(2)}</p>
          <div class="quantity-controls">
            <button class="quantity-btn" onclick="cart.updateQuantity('${o.bookId}', ${o.quantity-1})" 
                    ${o.quantity<=1?"disabled":""}>
              <span>−</span>
            </button>
            <span class="quantity-display">
              <span class="quantity-label">Qty:</span>
              <span class="quantity-value">${o.quantity}</span>
            </span>
            <button class="quantity-btn" onclick="cart.updateQuantity('${o.bookId}', ${o.quantity+1})">
              <span>+</span>
            </button>
          </div>
        </div>
        <div class="cart-item-actions">
          <div class="item-total">$${y.toFixed(2)}</div>
          <button class="remove-btn" onclick="cart.removeFromCart('${o.bookId}')" title="Remove item">
            <span>Remove</span>
            <span>🗑️</span>
          </button>
        </div>
      `,r.appendChild(s)}),t.appendChild(r),this.animateCartItems()}createEmptyCartHTML(){return`
      <div class="empty-cart">
        <div class="empty-cart-icon">🛒</div>
        <h3>Your cart is empty</h3>
        <p>Browse our collection and add some books to get started!</p>
        <button class="browse-books-btn" onclick="document.getElementById('books').scrollIntoView({behavior: 'smooth'})">
          <span>Browse Books</span>
          <span>📚</span>
        </button>
      </div>
    `}animateCartItems(){document.querySelectorAll(".cart-item").forEach((e,r)=>{e.style.opacity="0",e.style.transform="translateX(-20px)",setTimeout(()=>{e.style.transition="opacity 0.4s ease, transform 0.4s ease",e.style.opacity="1",e.style.transform="translateX(0)"},r*100)})}animateCartIcon(){const t=document.getElementById("cart-counter");t&&(t.style.animation="none",setTimeout(()=>{t.style.animation="cartBounce 0.6s ease"},10))}showNotification(t,e="info"){const r=document.createElement("div");r.className=`cart-notification ${e}`,r.innerHTML=`
      <div class="notification-content">
        <span class="notification-message">${t}</span>
      </div>
    `;const o=document.getElementById("cart");o?(o.style.position="relative",r.style.position="absolute",r.style.top="10px",r.style.right="10px",r.style.zIndex="10",o.appendChild(r)):document.body.appendChild(r),setTimeout(()=>{r.style.animation="fadeOut 0.3s ease forwards",setTimeout(()=>r.remove(),300)},2e3)}getCartItems(){return this.cart}getCartCount(){return this.cart.reduce((t,e)=>t+e.quantity,0)}getCartTotal(){return this.cart.reduce((t,e)=>{var o;const r=(o=e.bookData)!=null&&o.price?parseFloat(e.bookData.price):0;return t+r*e.quantity},0)}getCartStats(){return{itemCount:this.cart.length,totalQuantity:this.getCartCount(),totalValue:this.getCartTotal(),averagePrice:this.cart.length>0?this.getCartTotal()/this.getCartCount():0}}exportCart(){const t={items:this.cart,stats:this.getCartStats(),exportedAt:new Date().toISOString()},e=JSON.stringify(t,null,2),r=new Blob([e],{type:"application/json"}),o=document.createElement("a");o.href=URL.createObjectURL(r),o.download=`bookworld-cart-${new Date().toISOString().split("T")[0]}.json`,o.click(),this.showNotification("📄 Cart exported successfully!","success")}}const u=new $;window.cart=u;const B=`
  @keyframes cartBounce {
    0%, 20%, 53%, 80%, 100% { transform: scale(1); }
    40%, 43% { transform: scale(1.3); }
    70% { transform: scale(1.1); }
    90% { transform: scale(1.05); }
  }

  @keyframes fadeOut {
    to {
      opacity: 0;
      transform: translateY(-10px);
    }
  }

  .cart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding: 1.5rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: var(--border-radius-small);
    border: 1px solid var(--glass-border);
  }

  .cart-summary {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .cart-count {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--accent-color);
  }

  .cart-total {
    font-size: 1.3rem;
    font-weight: 700;
    color: var(--text-light);
  }

  .clear-cart-btn {
    background: linear-gradient(135deg, #dc3545, #c82333);
    color: white;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: var(--border-radius-small);
    cursor: pointer;
    font-weight: 600;
    transition: var(--transition);
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .clear-cart-btn:hover {
    background: linear-gradient(135deg, #c82333, #a71e2a);
    transform: translateY(-2px);
  }

  .cart-items {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .cart-item {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 1rem;
    padding: 1.5rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: var(--border-radius-small);
    border: 1px solid var(--glass-border);
    transition: var(--transition);
    align-items: center;
  }

  .cart-item:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateX(5px);
    border-color: var(--accent-color);
  }

  .cart-item-image {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .book-icon {
    font-size: 2rem;
    padding: 1rem;
    background: var(--gradient-primary);
    border-radius: 50%;
    color: var(--text-dark);
  }

  .cart-item-info {
    min-width: 0; /* Allows text to truncate */
  }

  .cart-item-info h4 {
    color: var(--text-light);
    margin-bottom: 0.5rem;
    font-weight: 600;
    font-size: 1.1rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .item-details {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
    color: var(--text-muted);
  }

  .item-price {
    font-weight: 600;
    color: var(--accent-color);
    margin-bottom: 1rem;
  }

  .quantity-controls {
    display: flex;
    align-items: center;
    gap: 1rem;
    background: rgba(255, 255, 255, 0.05);
    padding: 0.5rem;
    border-radius: var(--border-radius-small);
    border: 1px solid var(--glass-border);
  }

  .quantity-btn {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 1px solid var(--accent-color);
    background: var(--glass-bg);
    color: var(--accent-color);
    cursor: pointer;
    transition: var(--transition);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 1.1rem;
  }

  .quantity-btn:hover:not(:disabled) {
    background: var(--accent-color);
    color: var(--text-dark);
    transform: scale(1.1);
  }

  .quantity-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .quantity-display {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 60px;
  }

  .quantity-label {
    font-size: 0.8rem;
    color: var(--text-muted);
  }

  .quantity-value {
    font-weight: 700;
    color: var(--text-light);
    font-size: 1.1rem;
  }

  .cart-item-actions {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 1rem;
  }

  .item-total {
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--accent-color);
    text-align: right;
  }

  .empty-cart {
    text-align: center;
    padding: 4rem 2rem;
  }

  .empty-cart-icon {
    font-size: 4rem;
    margin-bottom: 1.5rem;
    opacity: 0.5;
  }

  .empty-cart h3 {
    font-family: 'Playfair Display', serif;
    font-size: 1.8rem;
    margin-bottom: 1rem;
    color: var(--text-light);
  }

  .empty-cart p {
    color: var(--text-muted);
    font-size: 1.1rem;
    margin-bottom: 2rem;
    line-height: 1.6;
  }

  .browse-books-btn {
    background: var(--gradient-primary);
    color: var(--text-dark);
    padding: 1rem 2rem;
    border: none;
    border-radius: var(--border-radius-small);
    cursor: pointer;
    font-weight: 600;
    transition: var(--transition);
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1rem;
  }

  .browse-books-btn:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-light);
  }

  .cart-notification {
    background: var(--glass-bg);
    backdrop-filter: blur(10px);
    border: 1px solid var(--glass-border);
    padding: 0.75rem 1rem;
    border-radius: var(--border-radius-small);
    color: var(--text-light);
    font-size: 0.9rem;
    font-weight: 500;
    animation: slideInRight 0.3s ease;
    max-width: 250px;
  }

  .cart-notification.success {
    border-color: #28a745;
    background: rgba(40, 167, 69, 0.1);
  }

  .cart-notification.info {
    border-color: var(--accent-color);
    background: rgba(212, 175, 55, 0.1);
  }

  /* Responsive design for cart */
  @media (max-width: 768px) {
    .cart-header {
      flex-direction: column;
      gap: 1rem;
      text-align: center;
    }

    .cart-item {
      grid-template-columns: 1fr;
      text-align: center;
      gap: 1rem;
    }

    .cart-item-actions {
      align-items: center;
    }

    .quantity-controls {
      justify-content: center;
    }

    .item-details {
      align-items: center;
    }
  }

  @media (max-width: 480px) {
    .cart-item {
      padding: 1rem;
    }

    .book-icon {
      font-size: 1.5rem;
      padding: 0.75rem;
    }

    .cart-item-info h4 {
      font-size: 1rem;
    }

    .quantity-controls {
      flex-wrap: wrap;
      justify-content: center;
    }
  }
`,w=document.createElement("style");w.textContent=B;document.head.appendChild(w);class T{constructor(){this.books=[],this.isLoading=!1,this.init()}async init(){this.showLoadingState(),await this.loadBooks(),this.setupEventListeners(),this.updateCartCounter(),this.setupIntersectionObserver(),this.hideLoadingState()}showLoadingState(){const t=document.getElementById("booklist");t&&(t.innerHTML=this.createSkeletonLoader())}hideLoadingState(){}createSkeletonLoader(){return Array(6).fill(0).map(()=>`
      <div class="bookitem skeleton">
        <div class="skeleton-title"></div>
        <div class="skeleton-text"></div>
        <div class="skeleton-text"></div>
        <div class="skeleton-text"></div>
        <div class="skeleton-button"></div>
      </div>
    `).join("")}setupIntersectionObserver(){const t=new IntersectionObserver(e=>{e.forEach(r=>{r.isIntersecting&&(r.target.style.opacity="1",r.target.style.transform="translateY(0)")})},{threshold:.1});document.querySelectorAll(".section").forEach(e=>{e.style.opacity="0",e.style.transform="translateY(30px)",e.style.transition="opacity 0.6s ease, transform 0.6s ease",t.observe(e)})}async loadBooks(){try{this.isLoading=!0,this.books=await f.fetchBooks(),this.displayBooks(this.books)}catch(t){console.error("Error loading books:",t),this.showError("Failed to load books. Please try again later.")}finally{this.isLoading=!1}}displayBooks(t){const e=document.getElementById("booklist");if(e){if(e.innerHTML="",!t||t.length===0){e.innerHTML=`
        <div class="no-results">
          <div class="no-results-icon">📚</div>
          <h3>No books found</h3>
          <p>Try adjusting your search criteria</p>
        </div>
      `;return}t.forEach((r,o)=>{const a=document.createElement("div");a.className="bookitem",a.style.animationDelay=`${o*.1}s`;const s=r.price?`$${parseFloat(r.price).toFixed(2)}`:"Price not available";a.innerHTML=`
        <div class="book-header">
          <h3>${this.escapeHtml(r.title)}</h3>
          <div class="book-price">${s}</div>
        </div>
        <div class="book-details">
          <p><strong>Author ID:</strong> ${r.author_id||"Unknown"}</p>
          <p><strong>Publisher:</strong> ${this.escapeHtml(r.publisher)||"Unknown"}</p>
          <p><strong>Book ID:</strong> ${r.book_id}</p>
        </div>
        <button class="add-to-cart-btn" onclick="app.addToCart('${r.book_id}', ${this.escapeHtml(JSON.stringify(r))})">
          <span class="btn-text">Add to Cart</span>
          <span class="btn-icon">🛒</span>
        </button>
      `,e.appendChild(a)}),this.animateBooks()}}animateBooks(){document.querySelectorAll(".bookitem").forEach((e,r)=>{e.style.opacity="0",e.style.transform="translateY(30px)",setTimeout(()=>{e.style.transition="opacity 0.6s ease, transform 0.6s ease",e.style.opacity="1",e.style.transform="translateY(0)"},r*100)})}escapeHtml(t){if(typeof t!="string")return t;const e=document.createElement("div");return e.textContent=t,e.innerHTML}addToCart(t,e){const r=event.target.closest(".add-to-cart-btn");r&&(r.classList.add("loading"),setTimeout(()=>{u.addToCart(t,e),this.updateCartCounter(),r.classList.remove("loading"),r.style.background="linear-gradient(135deg, #28a745, #20c997)",r.querySelector(".btn-text").textContent="Added!",setTimeout(()=>{r.style.background="",r.querySelector(".btn-text").textContent="Add to Cart"},2e3)},500))}updateCartCounter(){const t=document.getElementById("cart-counter");if(t){const e=u.getCartCount();t.textContent=e,t.style.display=e>0?"inline":"none",e>0&&(t.style.animation="none",setTimeout(()=>{t.style.animation="bounce 0.6s ease"},10))}}async searchBooks(){const t=document.getElementById("searchinput"),e=document.getElementById("searchbutton"),r=t.value.trim();if(!this.isLoading){e.classList.add("loading");try{if(this.isLoading=!0,!r)this.displayBooks(this.books);else{const o=await f.searchBooks(r);this.displayBooks(o),this.showNotification(`Found ${o.length} book(s) matching "${r}"`)}}catch(o){console.error("Error searching books:",o),this.showError("Search failed. Please try again.")}finally{this.isLoading=!1,e.classList.remove("loading")}}}async fetchCustomerData(){const t=document.getElementById("customerIdInput"),e=document.getElementById("fetchButton"),r=t.value.trim();if(!r){this.showError("Please enter a valid Customer ID.");return}e.classList.add("loading");try{const o=await f.fetchCustomerData(r);this.displayCustomerData(o),this.showNotification("Customer data loaded successfully!")}catch(o){console.error("Error fetching customer data:",o),this.showError("Failed to fetch customer data. Please check the Customer ID.")}finally{e.classList.remove("loading")}}displayCustomerData(t){const e=document.getElementById("details");if(e){if(e.innerHTML="",!t||t.length===0){e.innerHTML=`
        <div class="no-results">
          <div class="no-results-icon">👤</div>
          <h3>No customer data found</h3>
          <p>Please check the Customer ID and try again</p>
        </div>
      `;return}t.forEach((r,o)=>{const a=document.createElement("div");if(a.className="customer-card",a.style.animationDelay=`${o*.2}s`,a.innerHTML=`
        <div class="customer-info">
          <h3>Customer Information</h3>
          <div class="info-grid">
            <p><strong>ID:</strong> ${r.customer_id}</p>
            <p><strong>Name:</strong> ${this.escapeHtml(r.name)}</p>
            <p><strong>Email:</strong> ${this.escapeHtml(r.email)}</p>
            <p><strong>Phone:</strong> ${r.phone_no}</p>
          </div>
        </div>
      `,r.ORDERS&&r.ORDERS.length>0){const s=document.createElement("div");s.className="orders-info",s.innerHTML="<h4>Order History</h4>",r.ORDERS.forEach((n,y)=>{const i=document.createElement("div");i.className="order-item",i.style.animationDelay=`${(o+y)*.1}s`;const h=new Date(n.order_date).toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"});if(i.innerHTML=`
            <div class="order-header">
              <h5>Order #${n.order_id}</h5>
              <span class="order-status status-${n.status}">${n.status}</span>
            </div>
            <p><strong>Date:</strong> ${h}</p>
          `,n.ORDER_ITEM&&n.ORDER_ITEM.length>0){const c=document.createElement("div");c.className="order-items",c.innerHTML="<h5>Items:</h5>";let d=0;n.ORDER_ITEM.forEach(l=>{const v=document.createElement("div");v.className="order-item-detail";const k=l.quantity*l.price;d+=k,v.innerHTML=`
                <div class="item-info">
                  <h6>${l.BOOK?this.escapeHtml(l.BOOK.title):"Unknown Book"}</h6>
                  <p><strong>Publisher:</strong> ${l.BOOK?this.escapeHtml(l.BOOK.publisher):"Unknown"}</p>
                </div>
                <div class="item-details">
                  <p><strong>Quantity:</strong> ${l.quantity}</p>
                  <p><strong>Unit Price:</strong> $${parseFloat(l.price).toFixed(2)}</p>
                  <p><strong>Total:</strong> $${k.toFixed(2)}</p>
                </div>
              `,c.appendChild(v)});const b=document.createElement("div");b.className="order-total",b.innerHTML=`<strong>Order Total: $${d.toFixed(2)}</strong>`,c.appendChild(b),i.appendChild(c)}s.appendChild(i)}),a.appendChild(s)}else a.innerHTML+=`
          <div class="no-orders">
            <p><strong>No orders found for this customer.</strong></p>
          </div>
        `;e.appendChild(a)}),this.animateCustomerCards()}}animateCustomerCards(){document.querySelectorAll(".customer-card").forEach((e,r)=>{e.style.opacity="0",e.style.transform="translateY(30px)",setTimeout(()=>{e.style.transition="opacity 0.6s ease, transform 0.6s ease",e.style.opacity="1",e.style.transform="translateY(0)"},r*200)})}async checkout(){const t=document.getElementById("checkout");if(!D.isAuthenticated()){this.showError("Please sign in to checkout.");return}const e=u.getCartItems();if(e.length===0){this.showError("Your cart is empty. Please add items to checkout.");return}t.classList.add("loading");try{const r="c1",o=e.map(a=>({bookId:a.bookId,quantity:a.quantity,price:a.bookData?a.bookData.price:0}));await f.createOrder(r,o),this.showSuccess("🎉 Checkout successful! Your order has been processed."),u.clearCart(),this.updateCartCounter(),window.scrollTo({top:0,behavior:"smooth"})}catch(r){console.error("Error during checkout:",r),this.showError("Checkout failed. Please try again.")}finally{t.classList.remove("loading")}}setupEventListeners(){const t=document.getElementById("searchbutton"),e=document.getElementById("searchinput");if(t&&t.addEventListener("click",()=>this.searchBooks()),e){e.addEventListener("keydown",s=>{s.key==="Enter"&&this.searchBooks()});let a;e.addEventListener("input",()=>{clearTimeout(a),a=setTimeout(()=>{e.value.trim()?this.searchBooks():this.displayBooks(this.books)},500)})}const r=document.getElementById("fetchButton");r&&r.addEventListener("click",()=>this.fetchCustomerData());const o=document.getElementById("checkout");o&&o.addEventListener("click",()=>this.checkout()),document.querySelectorAll('a[href^="#"]').forEach(a=>{a.addEventListener("click",function(s){s.preventDefault();const n=document.querySelector(this.getAttribute("href"));n&&n.scrollIntoView({behavior:"smooth",block:"start"})})}),document.addEventListener("keydown",a=>{a.key==="/"&&!a.target.matches("input, textarea")&&(a.preventDefault(),e==null||e.focus())})}showNotification(t,e="success"){const r=document.createElement("div");r.className=`notification ${e}`,r.innerHTML=`
      <div class="notification-content">
        <span class="notification-icon">${e==="success"?"✅":"ℹ️"}</span>
        <span class="notification-message">${t}</span>
      </div>
    `,document.body.appendChild(r),setTimeout(()=>{r.style.animation="slideOutRight 0.4s ease forwards",setTimeout(()=>r.remove(),400)},4e3)}showSuccess(t){this.showNotification(t,"success")}showError(t){const e=document.createElement("div");e.className="error-notification",e.innerHTML=`
      <div class="notification-content">
        <span class="notification-icon">❌</span>
        <span class="notification-message">${t}</span>
      </div>
    `,document.body.appendChild(e),setTimeout(()=>{e.style.animation="slideOutRight 0.4s ease forwards",setTimeout(()=>e.remove(),400)},5e3)}}document.addEventListener("DOMContentLoaded",()=>{window.app=new T});const S=`
  @keyframes bounce {
    0%, 20%, 53%, 80%, 100% { transform: scale(1); }
    40%, 43% { transform: scale(1.2); }
    70% { transform: scale(1.1); }
    90% { transform: scale(1.05); }
  }

  @keyframes slideOutRight {
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }

  .skeleton {
    background: rgba(255, 255, 255, 0.05) !important;
    pointer-events: none;
  }

  .skeleton-title,
  .skeleton-text,
  .skeleton-button {
    background: linear-gradient(90deg, rgba(255, 255, 255, 0.1) 25%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0.1) 75%);
    background-size: 200% 100%;
    animation: shimmer 2s infinite;
    border-radius: 4px;
    margin-bottom: 1rem;
  }

  .skeleton-title {
    height: 24px;
    width: 80%;
  }

  .skeleton-text {
    height: 16px;
    width: 60%;
  }

  .skeleton-button {
    height: 40px;
    width: 120px;
    border-radius: 8px;
  }

  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }

  .no-results {
    text-align: center;
    padding: 4rem 2rem;
    grid-column: 1 / -1;
  }

  .no-results-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }

  .no-results h3 {
    font-family: 'Playfair Display', serif;
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    color: var(--text-light);
  }

  .no-results p {
    color: var(--text-muted);
    font-size: 1rem;
  }

  .book-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
  }

  .book-price {
    background: var(--gradient-primary);
    color: var(--text-dark);
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-weight: 700;
    font-size: 1.1rem;
  }

  .book-details {
    margin-bottom: 1.5rem;
  }

  .add-to-cart-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: all 0.3s ease;
  }

  .add-to-cart-btn:hover .btn-icon {
    transform: scale(1.2);
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }

  .order-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .order-status {
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
  }

  .status-pending {
    background: rgba(255, 193, 7, 0.2);
    color: #ffc107;
    border: 1px solid #ffc107;
  }

  .status-completed {
    background: rgba(40, 167, 69, 0.2);
    color: #28a745;
    border: 1px solid #28a745;
  }

  .status-cancelled {
    background: rgba(220, 53, 69, 0.2);
    color: #dc3545;
    border: 1px solid #dc3545;
  }

  .item-info h6 {
    color: var(--accent-color);
    margin-bottom: 0.5rem;
    font-weight: 600;
  }

  .item-details {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 0.5rem;
    margin-top: 0.5rem;
  }

  .order-total {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--glass-border);
    text-align: right;
    color: var(--accent-color);
    font-size: 1.1rem;
  }

  .notification-content {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .notification-icon {
    font-size: 1.2rem;
  }

  .notification-message {
    flex: 1;
  }

  .no-orders {
    text-align: center;
    padding: 2rem;
    color: var(--text-muted);
    font-style: italic;
  }
`,x=document.createElement("style");x.textContent=S;document.head.appendChild(x);
