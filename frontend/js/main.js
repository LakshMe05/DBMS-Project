import { api } from './api.js';
import { auth } from './auth.js';
import { cart } from './cart.js';

class BookWorldApp {
  constructor() {
    this.books = [];
    this.isLoading = false;
    this.init();
  }

  async init() {
    this.showLoadingState();
    await this.loadBooks();
    this.setupEventListeners();
    this.updateCartCounter();
    this.setupIntersectionObserver();
    this.hideLoadingState();
  }

  showLoadingState() {
    const bookList = document.getElementById('booklist');
    if (bookList) {
      bookList.innerHTML = this.createSkeletonLoader();
    }
  }

  hideLoadingState() {
    // Loading state will be replaced by actual content
  }

  createSkeletonLoader() {
    return Array(6).fill(0).map(() => `
      <div class="bookitem skeleton">
        <div class="skeleton-title"></div>
        <div class="skeleton-text"></div>
        <div class="skeleton-text"></div>
        <div class="skeleton-text"></div>
        <div class="skeleton-button"></div>
      </div>
    `).join('');
  }

  setupIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, { threshold: 0.1 });

    // Observe all sections for scroll animations
    document.querySelectorAll('.section').forEach(section => {
      section.style.opacity = '0';
      section.style.transform = 'translateY(30px)';
      section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      observer.observe(section);
    });
  }

  async loadBooks() {
    try {
      this.isLoading = true;
      this.books = await api.fetchBooks();
      this.displayBooks(this.books);
    } catch (error) {
      console.error('Error loading books:', error);
      this.showError('Failed to load books. Please try again later.');
    } finally {
      this.isLoading = false;
    }
  }

  displayBooks(books) {
    const bookList = document.getElementById('booklist');
    if (!bookList) return;

    bookList.innerHTML = '';

    if (!books || books.length === 0) {
      bookList.innerHTML = `
        <div class="no-results">
          <div class="no-results-icon">📚</div>
          <h3>No books found</h3>
          <p>Try adjusting your search criteria</p>
        </div>
      `;
      return;
    }

    books.forEach((book, index) => {
      const bookElement = document.createElement('div');
      bookElement.className = 'bookitem';
      bookElement.style.animationDelay = `${index * 0.1}s`;
      
      // Format price
      const price = book.price ? `$${parseFloat(book.price).toFixed(2)}` : 'Price not available';
      
      bookElement.innerHTML = `
        <div class="book-header">
          <h3>${this.escapeHtml(book.title)}</h3>
          <div class="book-price">${price}</div>
        </div>
        <div class="book-details">
          <p><strong>Author ID:</strong> ${book.author_id || 'Unknown'}</p>
          <p><strong>Publisher:</strong> ${this.escapeHtml(book.publisher) || 'Unknown'}</p>
          <p><strong>Book ID:</strong> ${book.book_id}</p>
        </div>
        <button class="add-to-cart-btn" onclick="app.addToCart('${book.book_id}', ${this.escapeHtml(JSON.stringify(book))})">
          <span class="btn-text">Add to Cart</span>
          <span class="btn-icon">🛒</span>
        </button>
      `;
      
      bookList.appendChild(bookElement);
    });

    // Add stagger animation
    this.animateBooks();
  }

  animateBooks() {
    const bookItems = document.querySelectorAll('.bookitem');
    bookItems.forEach((item, index) => {
      item.style.opacity = '0';
      item.style.transform = 'translateY(30px)';
      
      setTimeout(() => {
        item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        item.style.opacity = '1';
        item.style.transform = 'translateY(0)';
      }, index * 100);
    });
  }

  escapeHtml(text) {
    if (typeof text !== 'string') return text;
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  addToCart(bookId, bookData) {
    const button = event.target.closest('.add-to-cart-btn');
    if (button) {
      button.classList.add('loading');
      
      setTimeout(() => {
        cart.addToCart(bookId, bookData);
        this.updateCartCounter();
        button.classList.remove('loading');
        
        // Add success animation
        button.style.background = 'linear-gradient(135deg, #28a745, #20c997)';
        button.querySelector('.btn-text').textContent = 'Added!';
        
        setTimeout(() => {
          button.style.background = '';
          button.querySelector('.btn-text').textContent = 'Add to Cart';
        }, 2000);
      }, 500);
    }
  }

  updateCartCounter() {
    const counter = document.getElementById('cart-counter');
    if (counter) {
      const count = cart.getCartCount();
      counter.textContent = count;
      counter.style.display = count > 0 ? 'inline' : 'none';
      
      // Add bounce animation
      if (count > 0) {
        counter.style.animation = 'none';
        setTimeout(() => {
          counter.style.animation = 'bounce 0.6s ease';
        }, 10);
      }
    }
  }

  async searchBooks() {
    const searchInput = document.getElementById('searchinput');
    const searchButton = document.getElementById('searchbutton');
    const searchTerm = searchInput.value.trim();

    if (this.isLoading) return;

    searchButton.classList.add('loading');

    try {
      this.isLoading = true;
      
      if (!searchTerm) {
        this.displayBooks(this.books);
      } else {
        const filteredBooks = await api.searchBooks(searchTerm);
        this.displayBooks(filteredBooks);
        
        // Show search results message
        this.showNotification(`Found ${filteredBooks.length} book(s) matching "${searchTerm}"`);
      }
    } catch (error) {
      console.error('Error searching books:', error);
      this.showError('Search failed. Please try again.');
    } finally {
      this.isLoading = false;
      searchButton.classList.remove('loading');
    }
  }

  async fetchCustomerData() {
    const customerIdInput = document.getElementById('customerIdInput');
    const fetchButton = document.getElementById('fetchButton');
    const customerId = customerIdInput.value.trim();

    if (!customerId) {
      this.showError('Please enter a valid Customer ID.');
      return;
    }

    fetchButton.classList.add('loading');

    try {
      const customerData = await api.fetchCustomerData(customerId);
      this.displayCustomerData(customerData);
      this.showNotification('Customer data loaded successfully!');
    } catch (error) {
      console.error('Error fetching customer data:', error);
      this.showError('Failed to fetch customer data. Please check the Customer ID.');
    } finally {
      fetchButton.classList.remove('loading');
    }
  }

  displayCustomerData(customers) {
    const customerContainer = document.getElementById('details');
    if (!customerContainer) return;

    customerContainer.innerHTML = '';

    if (!customers || customers.length === 0) {
      customerContainer.innerHTML = `
        <div class="no-results">
          <div class="no-results-icon">👤</div>
          <h3>No customer data found</h3>
          <p>Please check the Customer ID and try again</p>
        </div>
      `;
      return;
    }

    customers.forEach((customer, index) => {
      const customerCard = document.createElement('div');
      customerCard.className = 'customer-card';
      customerCard.style.animationDelay = `${index * 0.2}s`;
      
      customerCard.innerHTML = `
        <div class="customer-info">
          <h3>Customer Information</h3>
          <div class="info-grid">
            <p><strong>ID:</strong> ${customer.customer_id}</p>
            <p><strong>Name:</strong> ${this.escapeHtml(customer.name)}</p>
            <p><strong>Email:</strong> ${this.escapeHtml(customer.email)}</p>
            <p><strong>Phone:</strong> ${customer.phone_no}</p>
          </div>
        </div>
      `;

      if (customer.ORDERS && customer.ORDERS.length > 0) {
        const ordersDiv = document.createElement('div');
        ordersDiv.className = 'orders-info';
        ordersDiv.innerHTML = '<h4>Order History</h4>';

        customer.ORDERS.forEach((order, orderIndex) => {
          const orderDiv = document.createElement('div');
          orderDiv.className = 'order-item';
          orderDiv.style.animationDelay = `${(index + orderIndex) * 0.1}s`;
          
          const orderDate = new Date(order.order_date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
          
          orderDiv.innerHTML = `
            <div class="order-header">
              <h5>Order #${order.order_id}</h5>
              <span class="order-status status-${order.status}">${order.status}</span>
            </div>
            <p><strong>Date:</strong> ${orderDate}</p>
          `;

          if (order.ORDER_ITEM && order.ORDER_ITEM.length > 0) {
            const itemsDiv = document.createElement('div');
            itemsDiv.className = 'order-items';
            itemsDiv.innerHTML = '<h5>Items:</h5>';

            let totalAmount = 0;

            order.ORDER_ITEM.forEach(item => {
              const itemDiv = document.createElement('div');
              itemDiv.className = 'order-item-detail';
              
              const itemTotal = item.quantity * item.price;
              totalAmount += itemTotal;
              
              itemDiv.innerHTML = `
                <div class="item-info">
                  <h6>${item.BOOK ? this.escapeHtml(item.BOOK.title) : 'Unknown Book'}</h6>
                  <p><strong>Publisher:</strong> ${item.BOOK ? this.escapeHtml(item.BOOK.publisher) : 'Unknown'}</p>
                </div>
                <div class="item-details">
                  <p><strong>Quantity:</strong> ${item.quantity}</p>
                  <p><strong>Unit Price:</strong> $${parseFloat(item.price).toFixed(2)}</p>
                  <p><strong>Total:</strong> $${itemTotal.toFixed(2)}</p>
                </div>
              `;
              itemsDiv.appendChild(itemDiv);
            });

            // Add total amount
            const totalDiv = document.createElement('div');
            totalDiv.className = 'order-total';
            totalDiv.innerHTML = `<strong>Order Total: $${totalAmount.toFixed(2)}</strong>`;
            itemsDiv.appendChild(totalDiv);

            orderDiv.appendChild(itemsDiv);
          }

          ordersDiv.appendChild(orderDiv);
        });

        customerCard.appendChild(ordersDiv);
      } else {
        customerCard.innerHTML += `
          <div class="no-orders">
            <p><strong>No orders found for this customer.</strong></p>
          </div>
        `;
      }

      customerContainer.appendChild(customerCard);
    });

    // Animate customer cards
    this.animateCustomerCards();
  }

  animateCustomerCards() {
    const cards = document.querySelectorAll('.customer-card');
    cards.forEach((card, index) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(30px)';
      
      setTimeout(() => {
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, index * 200);
    });
  }

  async checkout() {
    const checkoutButton = document.getElementById('checkout');
    
    if (!auth.isAuthenticated()) {
      this.showError('Please sign in to checkout.');
      return;
    }

    const cartItems = cart.getCartItems();
    if (cartItems.length === 0) {
      this.showError('Your cart is empty. Please add items to checkout.');
      return;
    }

    checkoutButton.classList.add('loading');

    try {
      // For demo purposes, using a default customer ID
      // In a real app, you'd get this from the authenticated user
      const customerId = 'c1';
      
      const orderItems = cartItems.map(item => ({
        bookId: item.bookId,
        quantity: item.quantity,
        price: item.bookData ? item.bookData.price : 0
      }));

      await api.createOrder(customerId, orderItems);
      
      this.showSuccess('🎉 Checkout successful! Your order has been processed.');
      cart.clearCart();
      this.updateCartCounter();
      
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
    } catch (error) {
      console.error('Error during checkout:', error);
      this.showError('Checkout failed. Please try again.');
    } finally {
      checkoutButton.classList.remove('loading');
    }
  }

  setupEventListeners() {
    // Search functionality
    const searchButton = document.getElementById('searchbutton');
    const searchInput = document.getElementById('searchinput');
    
    if (searchButton) {
      searchButton.addEventListener('click', () => this.searchBooks());
    }
    
    if (searchInput) {
      searchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          this.searchBooks();
        }
      });

      // Add search suggestions (debounced)
      let searchTimeout;
      searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          if (searchInput.value.trim()) {
            this.searchBooks();
          } else {
            this.displayBooks(this.books);
          }
        }, 500);
      });
    }

    // Customer data fetch
    const fetchButton = document.getElementById('fetchButton');
    if (fetchButton) {
      fetchButton.addEventListener('click', () => this.fetchCustomerData());
    }

    // Checkout
    const checkoutButton = document.getElementById('checkout');
    if (checkoutButton) {
      checkoutButton.addEventListener('click', () => this.checkout());
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });

    // Add keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === '/' && !e.target.matches('input, textarea')) {
        e.preventDefault();
        searchInput?.focus();
      }
    });
  }

  showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">${type === 'success' ? '✅' : 'ℹ️'}</span>
        <span class="notification-message">${message}</span>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.4s ease forwards';
      setTimeout(() => notification.remove(), 400);
    }, 4000);
  }

  showSuccess(message) {
    this.showNotification(message, 'success');
  }

  showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-notification';
    errorDiv.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">❌</span>
        <span class="notification-message">${message}</span>
      </div>
    `;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
      errorDiv.style.animation = 'slideOutRight 0.4s ease forwards';
      setTimeout(() => errorDiv.remove(), 400);
    }, 5000);
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.app = new BookWorldApp();
});

// Add CSS for additional animations and styles
const additionalStyles = `
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
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);