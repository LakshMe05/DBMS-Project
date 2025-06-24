class CartManager {
  constructor() {
    this.cart = JSON.parse(localStorage.getItem('bookworld-cart')) || [];
    this.updateCartDisplay();
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Listen for storage changes (for multi-tab sync)
    window.addEventListener('storage', (e) => {
      if (e.key === 'bookworld-cart') {
        this.cart = JSON.parse(e.newValue) || [];
        this.updateCartDisplay();
      }
    });
  }

  addToCart(bookId, bookData = null) {
    const existingItem = this.cart.find(item => item.bookId === bookId);
    
    if (existingItem) {
      existingItem.quantity++;
    } else {
      this.cart.push({ 
        bookId, 
        quantity: 1,
        bookData: bookData || null,
        addedAt: new Date().toISOString()
      });
    }
    
    this.saveCart();
    this.updateCartDisplay();
    this.showNotification('📚 Item added to cart!', 'success');
    this.animateCartIcon();
  }

  removeFromCart(bookId) {
    const itemIndex = this.cart.findIndex(item => item.bookId === bookId);
    if (itemIndex > -1) {
      const removedItem = this.cart[itemIndex];
      this.cart.splice(itemIndex, 1);
      this.saveCart();
      this.updateCartDisplay();
      this.showNotification(`🗑️ "${removedItem.bookData?.title || 'Item'}" removed from cart`, 'info');
    }
  }

  updateQuantity(bookId, quantity) {
    const item = this.cart.find(item => item.bookId === bookId);
    if (item) {
      const oldQuantity = item.quantity;
      item.quantity = Math.max(0, quantity);
      
      if (item.quantity === 0) {
        this.removeFromCart(bookId);
      } else {
        this.saveCart();
        this.updateCartDisplay();
        
        if (quantity > oldQuantity) {
          this.showNotification('📈 Quantity increased', 'info');
        } else {
          this.showNotification('📉 Quantity decreased', 'info');
        }
      }
    }
  }

  clearCart() {
    const itemCount = this.cart.length;
    this.cart = [];
    this.saveCart();
    this.updateCartDisplay();
    
    if (itemCount > 0) {
      this.showNotification(`🧹 Cart cleared (${itemCount} items removed)`, 'info');
    }
  }

  saveCart() {
    localStorage.setItem('bookworld-cart', JSON.stringify(this.cart));
    
    // Dispatch custom event for other components
    window.dispatchEvent(new CustomEvent('cartUpdated', {
      detail: { cart: this.cart, count: this.getCartCount() }
    }));
  }

  updateCartDisplay() {
    const cartContainer = document.getElementById('cart');
    if (!cartContainer) return;

    cartContainer.innerHTML = '';

    if (this.cart.length === 0) {
      cartContainer.innerHTML = this.createEmptyCartHTML();
      return;
    }

    const cartHeader = document.createElement('div');
    cartHeader.className = 'cart-header';
    cartHeader.innerHTML = `
      <div class="cart-summary">
        <span class="cart-count">${this.getCartCount()} items</span>
        <span class="cart-total">Total: $${this.getCartTotal().toFixed(2)}</span>
      </div>
      <button class="clear-cart-btn" onclick="cart.clearCart()">
        <span>Clear All</span>
        <span>🗑️</span>
      </button>
    `;
    cartContainer.appendChild(cartHeader);

    const cartItems = document.createElement('div');
    cartItems.className = 'cart-items';

    this.cart.forEach((item, index) => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'cart-item';
      itemDiv.style.animationDelay = `${index * 0.1}s`;
      
      const price = item.bookData?.price ? parseFloat(item.bookData.price) : 0;
      const itemTotal = price * item.quantity;
      
      itemDiv.innerHTML = `
        <div class="cart-item-image">
          <div class="book-icon">📖</div>
        </div>
        <div class="cart-item-info">
          <h4>${item.bookData?.title || `Book ID: ${item.bookId}`}</h4>
          <p class="item-details">
            <span class="author">Author ID: ${item.bookData?.author_id || 'Unknown'}</span>
            <span class="publisher">Publisher: ${item.bookData?.publisher || 'Unknown'}</span>
          </p>
          <p class="item-price">Unit Price: $${price.toFixed(2)}</p>
          <div class="quantity-controls">
            <button class="quantity-btn" onclick="cart.updateQuantity('${item.bookId}', ${item.quantity - 1})" 
                    ${item.quantity <= 1 ? 'disabled' : ''}>
              <span>−</span>
            </button>
            <span class="quantity-display">
              <span class="quantity-label">Qty:</span>
              <span class="quantity-value">${item.quantity}</span>
            </span>
            <button class="quantity-btn" onclick="cart.updateQuantity('${item.bookId}', ${item.quantity + 1})">
              <span>+</span>
            </button>
          </div>
        </div>
        <div class="cart-item-actions">
          <div class="item-total">$${itemTotal.toFixed(2)}</div>
          <button class="remove-btn" onclick="cart.removeFromCart('${item.bookId}')" title="Remove item">
            <span>Remove</span>
            <span>🗑️</span>
          </button>
        </div>
      `;
      
      cartItems.appendChild(itemDiv);
    });

    cartContainer.appendChild(cartItems);
    this.animateCartItems();
  }

  createEmptyCartHTML() {
    return `
      <div class="empty-cart">
        <div class="empty-cart-icon">🛒</div>
        <h3>Your cart is empty</h3>
        <p>Browse our collection and add some books to get started!</p>
        <button class="browse-books-btn" onclick="document.getElementById('books').scrollIntoView({behavior: 'smooth'})">
          <span>Browse Books</span>
          <span>📚</span>
        </button>
      </div>
    `;
  }

  animateCartItems() {
    const items = document.querySelectorAll('.cart-item');
    items.forEach((item, index) => {
      item.style.opacity = '0';
      item.style.transform = 'translateX(-20px)';
      
      setTimeout(() => {
        item.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        item.style.opacity = '1';
        item.style.transform = 'translateX(0)';
      }, index * 100);
    });
  }

  animateCartIcon() {
    const cartCounter = document.getElementById('cart-counter');
    if (cartCounter) {
      cartCounter.style.animation = 'none';
      setTimeout(() => {
        cartCounter.style.animation = 'cartBounce 0.6s ease';
      }, 10);
    }
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `cart-notification ${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-message">${message}</span>
      </div>
    `;
    
    // Position relative to cart section
    const cartSection = document.getElementById('cart');
    if (cartSection) {
      cartSection.style.position = 'relative';
      notification.style.position = 'absolute';
      notification.style.top = '10px';
      notification.style.right = '10px';
      notification.style.zIndex = '10';
      cartSection.appendChild(notification);
    } else {
      document.body.appendChild(notification);
    }
    
    setTimeout(() => {
      notification.style.animation = 'fadeOut 0.3s ease forwards';
      setTimeout(() => notification.remove(), 300);
    }, 2000);
  }

  getCartItems() {
    return this.cart;
  }

  getCartCount() {
    return this.cart.reduce((total, item) => total + item.quantity, 0);
  }

  getCartTotal() {
    return this.cart.reduce((total, item) => {
      const price = item.bookData?.price ? parseFloat(item.bookData.price) : 0;
      return total + (price * item.quantity);
    }, 0);
  }

  // Get cart statistics
  getCartStats() {
    return {
      itemCount: this.cart.length,
      totalQuantity: this.getCartCount(),
      totalValue: this.getCartTotal(),
      averagePrice: this.cart.length > 0 ? this.getCartTotal() / this.getCartCount() : 0
    };
  }

  // Export cart data
  exportCart() {
    const cartData = {
      items: this.cart,
      stats: this.getCartStats(),
      exportedAt: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(cartData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `bookworld-cart-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    this.showNotification('📄 Cart exported successfully!', 'success');
  }
}

export const cart = new CartManager();

// Make cart available globally for onclick handlers
window.cart = cart;

// Add CSS for cart-specific animations and styles
const cartStyles = `
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
`;

// Inject cart-specific styles
const cartStyleSheet = document.createElement('style');
cartStyleSheet.textContent = cartStyles;
document.head.appendChild(cartStyleSheet);