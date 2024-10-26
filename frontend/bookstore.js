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

displayBooks();  // Initially display all books

