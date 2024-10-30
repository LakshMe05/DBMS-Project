// script.js
document.addEventListener('DOMContentLoaded', () => {
    const supabaseUrl = 'https://hdjnmdfpwwhstfqznjzd.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhkam5tZGZwd3doc3RmcXpuanpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc3MDUzMDAsImV4cCI6MjA0MzI4MTMwMH0.6Subl2RE-c1VAozTLcD4o8oWfPHHsjHE8Y1cPei9KsQ';
    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

    //checkout.onclick = fetchData;
    let cart = []; // Array to hold cart items
    let books = []; // Initialize books as an array

    
        fetchData(); // Fetch books on page load

     // Set up checkout button
     document.getElementById('checkout').onclick = checkout;
     async function fetchData() {
        try {
            const { data, error } = await supabase.from('BOOK').select('*');

            if (error) {
                console.error('Error fetching data:', error);
                return; // Exit if there's an error
            }
    
            if (!data || data.length === 0) {
                console.log('No records found in BOOK table.'); // Log if no records found
                return; // Exit if no data
            }
    
            console.log('Fetched data:', data);
            books = data; // Store fetched data in books
            console.log('Fetched data:', data); // Check if the data is fetched correctly

            displayData(books); // Display all books initially
        } catch (err) {
            console.error('Unexpected error:', err);
        }
    }



    function displayData(data) {
        const dataContainer = document.getElementById('booklist');
        if (!dataContainer) {
            console.error('Data container element not found');
            return; // Exit if the container is not found
        }
    
        dataContainer.innerHTML = ''; // Clear existing data
    
        if (Array.isArray(data) && data.length > 0) {
            data.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.classList.add('bookitem');
                console.log(`Displaying ${data.length} books.`); // Log how many books to display

                itemDiv.innerHTML = `
                    <h3>${item.title}</h3>
                    <p>Author ID: ${item.author_id || 'Unknown'}</p>
                    <p>Publisher: ${item.publisher || 'Unknown'}</p>
                    <p>Price: ${item.price}</p>
                    <button class="add-to-cart" data-id="${item.book_id}">Add to Cart</button>
                `;
                dataContainer.appendChild(itemDiv); // Append each itemDiv to the dataContainer
    
                // Attach event listener to the button inside the loop
                const button = itemDiv.querySelector('.add-to-cart');
                button.addEventListener('click', () => addToCart(item.book_id)); // Attach event listener here
            });
        } else {
            console.log('No records found in BOOK table.');
            dataContainer.innerHTML = '<p>No data found.</p>'; // Show no data message
        }
    }
    
  
   



    // Add an item to the cart
    function addToCart(bookId) {
        const book = cart.find(item => item.bookId === bookId);
        if (book) {
            book.quantity++;
        } else {
            cart.push({ bookId, quantity: 1 });
        }
        displayCart();
    }

    // Remove an item from the cart
    function removeFromCart(bookId) {
        cart = cart.filter(item => item.bookId !== bookId);
        displayCart();
    }

    // Display cart items
    function displayCart() {
        const cartContainer = document.getElementById('cart');
        cartContainer.innerHTML = ''; // Clear existing cart content

        if (cart.length === 0) {
            cartContainer.innerHTML = '<p>Your cart is empty.</p>';
            return;
        }

        cart.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.innerHTML = `
                <p>Book ID: ${item.bookId} | Quantity: ${item.quantity}</p>
                <button class="remove-from-cart" data-id="${item.bookId}">Remove</button>
            `;
            cartContainer.appendChild(itemDiv);
        });

        // Add event listeners to "Remove" buttons
        document.querySelectorAll('.remove-from-cart').forEach(button => {
            button.onclick = () => removeFromCart(button.dataset.id);
        });
    }

    // Handle checkout process
    function checkout() {
        if (cart.length === 0) {
            alert('Your cart is empty. Please add items to checkout.');
            return;
        }
        
        // You can implement actual checkout logic here (e.g., processing payment)
        alert('Checkout successful! Your items have been processed.');
        cart = []; // Clear the cart after checkout
        displayCart(); // Update cart display
    }



// Function to search and filter books
function searchBooks() {
    const searchTerm = document.getElementById('searchinput').value.toLowerCase();

    // Check if books is an array before filtering
    if (Array.isArray(books)) {
        const filteredBooks = books.filter(book => 
            book.title.toLowerCase().includes(searchTerm)
        );
        displayBooks(filteredBooks); // Call to display filtered results
    } else {
        console.error('Books is not an array:', books);
    }
}

function displayBooks(filteredBooks) {
    const bookList = document.getElementById('booklist');
    bookList.innerHTML = ''; // Clear previous list

    if (filteredBooks.length === 0) {
        bookList.innerHTML = '<p>No books found.</p>'; // Display message if no books match
        return;
    }

    filteredBooks.forEach(book => {
        const bookElement = document.createElement('div');
        bookElement.classList.add('book');
        bookElement.innerHTML = `
            <h3>${book.title}</h3>
            <p>Price: ${book.price}</p>
            <button class="add-to-cart" data-id="${book.book_id}">Add to Cart</button>
        `;

        // Attach event listener to the button here
        const button = bookElement.querySelector('.add-to-cart');
        button.addEventListener('click', () => addToCart(book.book_id)); // Attach event listener here

        bookList.appendChild(bookElement); // Append the book element to the list
    });
}

document.getElementById('searchbutton').addEventListener('click', searchBooks);

document.getElementById('searchinput').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        searchBooks(); // Call search on Enter key
    }
});


 // Assuming you have initialized your Supabase client before this code

// Function to fetch user data
async function fetchCustomerOrderData(customerId) {
    console.log(`Fetching customer order data for ID: ${customerId}`);
    try {
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
            .eq('customer_id', customerId); // Filter by customer ID

        if (error) throw error;

        console.log('Fetched data:', data);
        return data;
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
}

// Function to display customer order data
function displayCustomerOrderData(customers) {
    console.log('Displaying customer order data:', customers);
    const customerContainer = document.getElementById('details');
    customerContainer.innerHTML = ''; // Clear existing content

    // Check if customers is an array
    if (!Array.isArray(customers) || customers.length === 0) {
        customerContainer.innerHTML = '<p>No customer data available.</p>';
        return;
    }

    customers.forEach(customer => {
        const customerCard = document.createElement('div');
        customerCard.className = 'customer-card';
        
        // Customer information
        customerCard.innerHTML = `
            <strong>Customer ID:</strong> ${customer.customer_id} <br>
            <strong>Name:</strong> ${customer.name} <br>
            <strong>Email:</strong> ${customer.email} <br>
            <strong>Phone No:</strong> ${customer.phone_no} <br>
        `;

        // Check for orders
        if (customer.ORDERS && customer.ORDERS.length > 0) {
            customerCard.innerHTML += '<strong>Orders:</strong>';
            customerCard.innerHTML += '<div class="order-info">';

            customer.ORDERS.forEach(order => {
                customerCard.innerHTML += `
                    <div>
                        <strong>Order ID:</strong> ${order.order_id} <br>
                        <strong>Order Date:</strong> ${order.order_date} <br>
                        <strong>Status:</strong> ${order.status} <br>
                        <strong>Order Items:</strong>
                        <div class="book-info">`;

                // Display order items
                if (order.ORDER_ITEM && order.ORDER_ITEM.length > 0) {
                    order.ORDER_ITEM.forEach(orderItem => {
                        customerCard.innerHTML += `
                            <div>
                                <strong>Book ID:</strong> ${orderItem.book_id} <br>
                                <strong>Quantity:</strong> ${orderItem.quantity} <br>
                                <strong>Price:</strong> ₹${orderItem.price} <br>`;
                        
                        // Check for book data
                        if (orderItem.BOOK) {
                            customerCard.innerHTML += `
                                <strong>Title:</strong> ${orderItem.BOOK.title} <br>
                                <strong>Publisher:</strong> ${orderItem.BOOK.publisher} <br>`;
                        } else {
                            customerCard.innerHTML += '<strong>Title:</strong> Not Available <br>';
                        }
                        customerCard.innerHTML += '</div>'; // Close book info div
                    });
                } else {
                    customerCard.innerHTML += '<div>No items found.</div>';
                }
                customerCard.innerHTML += '</div></div>'; // Close book-info div
            });

            customerCard.innerHTML += '</div>'; // Close order-info div
        } else {
            customerCard.innerHTML += '<strong>No orders found.</strong>';
        }

        customerContainer.appendChild(customerCard); // Append customer card to container
    });
}

// Fetch button event listener
document.getElementById('fetchButton').addEventListener('click', async () => {
    const customerId = document.getElementById('customerIdInput').value.trim(); // Get customer ID
    if (customerId) {
        const customerData = await fetchCustomerOrderData(customerId);
        displayCustomerOrderData(customerData); // Pass the fetched data to the display function
    } else {
        alert('Please enter a valid Customer ID.');
    }
});


});