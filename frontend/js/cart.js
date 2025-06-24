class CartManager {
  constructor() {
    this.cart = JSON.parse(localStorage.getItem('bookworld-cart')) || [];
    this.updateCartDisplay();
  }

  addToCart(bookId, bookData = null) {
    const existingItem = this.cart.find(item => item.bookId === bookId);
    
    if (existingItem) {
      existingItem.quantity++;
    } else {
      this.cart.push({ 
        bookId, 
        quantity: 1,
        bookData: bookData || null
      });
    }
    
    this.saveCart();
    this.updateCartDisplay();
    this.showNotification('Item added to cart!');
  }

  removeFromCart(bookId) {
    this.cart = this.cart.filter(item => item.bookId !== bookId);
    this.saveCart();
    this.updateCartDisplay();
  }

  updateQuantity(bookId, quantity) {
    const item = this.cart.find(item => item.bookId === bookId);
    if (item) {
      item.quantity = Math.max(0, quantity);
      if (item.quantity === 0) {
        this.removeFromCart(bookId);
      } else {
        this.saveCart();
        this.updateCartDisplay();
      }
    }
  }

  clearCart() {
    this.cart = [];
    this.saveCart();
    this.updateCartDisplay();
  }

  saveCart() {
    localStorage.setItem('bookworld-cart', JSON.stringify(this.cart));
  }

  updateCartDisplay() {
    const cartContainer = document.getElementById('cart');
    if (!cartContainer) return;

    cartContainer.innerHTML = '';

    if (this.cart.length === 0) {
      cartContainer.innerHTML = '<p>Your cart is empty.</p>';
      return;
    }

    this.cart.forEach(item => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'cart-item';
      itemDiv.innerHTML = `
        <div class="cart-item-info">
          <p><strong>Book ID:</strong> ${item.bookId}</p>
          ${item.bookData ? `<p><strong>Title:</strong> ${item.bookData.title}</p>` : ''}
          <div class="quantity-controls">
            <button onclick="cart.updateQuantity('${item.bookId}', ${item.quantity - 1})">-</button>
            <span>Quantity: ${item.quantity}</span>
            <button onclick="cart.updateQuantity('${item.bookId}', ${item.quantity + 1})">+</button>
          </div>
        </div>
        <button class="remove-btn" onclick="cart.removeFromCart('${item.bookId}')">Remove</button>
      `;
      cartContainer.appendChild(itemDiv);
    });
  }

  showNotification(message) {
    // Create a simple notification
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4e3b31;
      color: #d1c7b7;
      padding: 10px 20px;
      border-radius: 5px;
      z-index: 1000;
      animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  getCartItems() {
    return this.cart;
  }

  getCartCount() {
    return this.cart.reduce((total, item) => total + item.quantity, 0);
  }
}

export const cart = new CartManager();

// Make cart available globally for onclick handlers
window.cart = cart;