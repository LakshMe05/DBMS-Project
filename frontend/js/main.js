import { api } from './api.js';
import { auth } from './auth.js';
import { cart } from './cart.js';

class BookWorldApp {
  constructor() {
    this.books = [];
    this.init();
  }

  async init() {
    await this.loadBooks();
    this.setupEventListeners();
    this.updateCartCounter();
  }

  async loadBooks() {
    try {
      this.books = await api.fetchBooks();
      this.displayBooks(this.books);
    } catch (error) {
      console.error('Error loading books:', error);
      this.showError('Failed to load books. Please try again later.');
    }
  }

  displayBooks(books) {
    const bookList = document.getElementById('booklist');
    if (!bookList) return;

    bookList.innerHTML = '';

    if (!books || books.length === 0) {
      bookList.innerHTML = '<p>No books found.</p>';
      return;
    }

    books.forEach(book => {
      const bookElement = document.createElement('div');
      bookElement.className = 'bookitem';
      bookElement.innerHTML = `
        <h3>${book.title}</h3>
        <p><strong>Author ID:</strong> ${book.author_id || 'Unknown'}</p>
        <p><strong>Publisher:</strong> ${book.publisher || 'Unknown'}</p>
        <p><strong>Price:</strong> $${book.price}</p>
        <button class="add-to-cart" onclick="app.addToCart('${book.book_id}', ${JSON.stringify(book).replace(/"/g, '&quot;')})">
          Add to Cart
        </button>
      `;
      bookList.appendChild(bookElement);
    });
  }

  addToCart(bookId, bookData) {
    cart.addToCart(bookId, bookData);
    this.updateCartCounter();
  }

  updateCartCounter() {
    const counter = document.getElementById('cart-counter');
    if (counter) {
      const count = cart.getCartCount();
      counter.textContent = count;
      counter.style.display = count > 0 ? 'inline' : 'none';
    }
  }

  async searchBooks() {
    const searchInput = document.getElementById('searchinput');
    const searchTerm = searchInput.value.trim();

    if (!searchTerm) {
      this.displayBooks(this.books);
      return;
    }

    try {
      const filteredBooks = await api.searchBooks(searchTerm);
      this.displayBooks(filteredBooks);
    } catch (error) {
      console.error('Error searching books:', error);
      this.showError('Search failed. Please try again.');
    }
  }

  async fetchCustomerData() {
    const customerIdInput = document.getElementById('customerIdInput');
    const customerId = customerIdInput.value.trim();

    if (!customerId) {
      alert('Please enter a valid Customer ID.');
      return;
    }

    try {
      const customerData = await api.fetchCustomerData(customerId);
      this.displayCustomerData(customerData);
    } catch (error) {
      console.error('Error fetching customer data:', error);
      this.showError('Failed to fetch customer data.');
    }
  }

  displayCustomerData(customers) {
    const customerContainer = document.getElementById('details');
    if (!customerContainer) return;

    customerContainer.innerHTML = '';

    if (!customers || customers.length === 0) {
      customerContainer.innerHTML = '<p>No customer data available.</p>';
      return;
    }

    customers.forEach(customer => {
      const customerCard = document.createElement('div');
      customerCard.className = 'customer-card';
      
      customerCard.innerHTML = `
        <div class="customer-info">
          <h3>Customer Information</h3>
          <p><strong>ID:</strong> ${customer.customer_id}</p>
          <p><strong>Name:</strong> ${customer.name}</p>
          <p><strong>Email:</strong> ${customer.email}</p>
          <p><strong>Phone:</strong> ${customer.phone_no}</p>
        </div>
      `;

      if (customer.ORDERS && customer.ORDERS.length > 0) {
        const ordersDiv = document.createElement('div');
        ordersDiv.className = 'orders-info';
        ordersDiv.innerHTML = '<h4>Orders:</h4>';

        customer.ORDERS.forEach(order => {
          const orderDiv = document.createElement('div');
          orderDiv.className = 'order-item';
          orderDiv.innerHTML = `
            <p><strong>Order ID:</strong> ${order.order_id}</p>
            <p><strong>Date:</strong> ${new Date(order.order_date).toLocaleDateString()}</p>
            <p><strong>Status:</strong> ${order.status}</p>
          `;

          if (order.ORDER_ITEM && order.ORDER_ITEM.length > 0) {
            const itemsDiv = document.createElement('div');
            itemsDiv.className = 'order-items';
            itemsDiv.innerHTML = '<h5>Items:</h5>';

            order.ORDER_ITEM.forEach(item => {
              const itemDiv = document.createElement('div');
              itemDiv.className = 'order-item-detail';
              itemDiv.innerHTML = `
                <p>Book: ${item.BOOK ? item.BOOK.title : 'Unknown'}</p>
                <p>Quantity: ${item.quantity}</p>
                <p>Price: $${item.price}</p>
              `;
              itemsDiv.appendChild(itemDiv);
            });

            orderDiv.appendChild(itemsDiv);
          }

          ordersDiv.appendChild(orderDiv);
        });

        customerCard.appendChild(ordersDiv);
      } else {
        customerCard.innerHTML += '<p><strong>No orders found.</strong></p>';
      }

      customerContainer.appendChild(customerCard);
    });
  }

  async checkout() {
    if (!auth.isAuthenticated()) {
      alert('Please sign in to checkout.');
      return;
    }

    const cartItems = cart.getCartItems();
    if (cartItems.length === 0) {
      alert('Your cart is empty. Please add items to checkout.');
      return;
    }

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
      
      alert('Checkout successful! Your order has been processed.');
      cart.clearCart();
      this.updateCartCounter();
    } catch (error) {
      console.error('Error during checkout:', error);
      this.showError('Checkout failed. Please try again.');
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
  }

  showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-notification';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #d32f2f;
      color: white;
      padding: 10px 20px;
      border-radius: 5px;
      z-index: 1000;
    `;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
      errorDiv.remove();
    }, 5000);
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.app = new BookWorldApp();
});