import { API_BASE_URL } from './config.js';

class BookWorldAPI {
  async fetchBooks() {
    try {
      const response = await fetch(`${API_BASE_URL}/books`);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result.data;
    } catch (error) {
      console.error('Error fetching books:', error);
      throw error;
    }
  }

  async searchBooks(query) {
    try {
      const response = await fetch(`${API_BASE_URL}/books/search?q=${encodeURIComponent(query)}`);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result.data;
    } catch (error) {
      console.error('Error searching books:', error);
      throw error;
    }
  }

  async fetchCustomerData(customerId) {
    try {
      const response = await fetch(`${API_BASE_URL}/customers/${customerId}`);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result.data;
    } catch (error) {
      console.error('Error fetching customer data:', error);
      throw error;
    }
  }

  async createOrder(customerId, items) {
    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customerId, items }),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }
}

export const api = new BookWorldAPI();