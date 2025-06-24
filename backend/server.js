import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import supabase from './config/supabaseClient.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'BookWorld API is running' });
});

// Books endpoints
app.get('/api/books', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('BOOK')
      .select('*');

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/books/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ success: false, error: 'Search query is required' });
    }

    const { data, error } = await supabase
      .from('BOOK')
      .select('*')
      .ilike('title', `%${q}%`);

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error searching books:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Customer endpoints
app.get('/api/customers/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('CUSTOMERS')
      .select(`
        customer_id,
        name,
        email,
        phone_no,
        ORDERS (
          order_id,
          order_date,
          status,
          ORDER_ITEM (
            book_id,
            quantity,
            price,
            BOOK (
              title,
              publisher
            )
          )
        )
      `)
      .eq('customer_id', id);

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching customer data:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Orders endpoint
app.post('/api/orders', async (req, res) => {
  try {
    const { customerId, items } = req.body;

    if (!customerId || !items || !Array.isArray(items)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Customer ID and items array are required' 
      });
    }

    // Create order
    const { data: orderData, error: orderError } = await supabase
      .from('ORDERS')
      .insert({
        customer_id: customerId,
        order_date: new Date().toISOString(),
        status: 'pending'
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Create order items
    const orderItems = items.map(item => ({
      order_id: orderData.order_id,
      book_id: item.bookId,
      quantity: item.quantity,
      price: item.price || 0
    }));

    const { data: itemsData, error: itemsError } = await supabase
      .from('ORDER_ITEM')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    res.json({ 
      success: true, 
      data: { order: orderData, items: itemsData } 
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`BookWorld API server running on port ${PORT}`);
});