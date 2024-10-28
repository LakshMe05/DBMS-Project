// script.js
const books = [
    { id: 1, title: "JavaScript: The Good Parts", price: 29.99 },
    { id: 2, title: "Eloquent JavaScript", price: 19.99 },
    { id: 3, title: "You Don't Know JS", price: 24.99 },
    { id: 4, title: "JavaScript & JQuery", price: 39.99 }
];

const cart = [];

function displayBooks() {
    const bookList = document.getElementById('book-list');
    books.forEach(book => {
        const bookElement = document.createElement('div');
        bookElement.classList.add('book');
        bookElement.innerHTML = `
            <h3>${book.title}</h3>
            <p>Price: $${book.price.toFixed(2)}</p>
            <button onclick="addToCart(${book.id})">Add to Cart</button>
        `;
        bookList.appendChild(bookElement);
    });
}

function addToCart(bookId) {
    const book = books.find(b => b.id === bookId);
    cart.push(book);
    displayCart();
}

function displayCart() {
    const cartItems = document.getElementById('cart-items');
    cartItems.innerHTML = '';

    if (cart.length === 0) {
        cartItems.innerHTML = '<p>Your cart is empty.</p>';
        return;
    }

    cart.forEach((item, index) => {
        const cartItem = document.createElement('div');
        cartItem.classList.add('cart-item');
        cartItem.innerHTML = `
            <h3>${item.title}</h3>
            <p>Price: $${item.price.toFixed(2)}</p>
            <button onclick="removeFromCart(${index})">Remove</button>
        `;
        cartItems.appendChild(cartItem);
    });
}

function removeFromCart(index) {
    cart.splice(index, 1);
    displayCart();
}

document.getElementById('checkout').addEventListener('click', () => {
    if (cart.length === 0) {
        alert('Your cart is empty!');
    } else {
        alert('Proceeding to checkout...');
        // Add further checkout process logic here
    }
});

displayBooks();


// Function to display books (with optional filtering)
function displayBooks(filteredBooks = books) {
    const bookList = document.getElementById('book-list');
    bookList.innerHTML = '';  // Clear previous list

    if (filteredBooks.length === 0) {
        bookList.innerHTML = '<p>No books found.</p>';
        return;
    }

    filteredBooks.forEach(book => {
        const bookElement = document.createElement('div');
        bookElement.classList.add('book');
        bookElement.innerHTML = `
            <h3>${book.title}</h3>
            <p>Price: $${book.price.toFixed(2)}</p>
            <button onclick="addToCart(${book.id})">Add to Cart</button>
        `;
        bookList.appendChild(bookElement);
    });
}

// Function to handle search
function searchBooks() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const filteredBooks = books.filter(book =>
        book.title.toLowerCase().includes(searchTerm)
    );
    displayBooks(filteredBooks);
}

// Add event listener to search button
document.getElementById('search-button').addEventListener('click', searchBooks);

// Also add an event listener to handle 'Enter' key press on the search input
document.getElementById('search-input').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        searchBooks();
    }
});


document.getElementById('flipButton').addEventListener('click', function() {
    document.querySelector('.book').classList.toggle('flipped');
  });

displayBooks();  // Initially display all books
