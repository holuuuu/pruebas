document.addEventListener('DOMContentLoaded', () => {
    const searchButton = document.getElementById('search-button');
    const searchInput = document.getElementById('search-input');
    const resultsContainer = document.querySelector('.results-container');
    const filterButton = document.getElementById('filter-button');
    const minPriceInput = document.getElementById('min-price');
    const maxPriceInput = document.getElementById('max-price');
    const conditionSelect = document.getElementById('condition');
    const corsProxy = 'https://cors-anywhere.herokuapp.com/';

    let allProducts = [];

    searchButton.addEventListener('click', () => {
        const searchTerm = searchInput.value.trim();
        if (searchTerm) {
            fetchProducts(searchTerm);
        }
    });

    filterButton.addEventListener('click', () => {
        applyFilters();
    });

    async function fetchProducts(searchTerm) {
        const url = `${corsProxy}https://listado.mercadolibre.com.ve/${searchTerm}`;
        try {
            resultsContainer.innerHTML = '<p>Loading products...</p>';
            const response = await fetch(url);
            const html = await response.text();
            allProducts = parseProducts(html);
            displayProducts(allProducts);
        } catch (error) {
            console.error('Error fetching products:', error);
            resultsContainer.innerHTML = '<p>Error fetching products. Please try again later.</p>';
        }
    }

    function parseProducts(html) {
        try {
            const jsonString = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/)[1];
            const data = JSON.parse(jsonString);
            const results = data.props.pageProps.initialResults.results;

            return results.map(item => ({
                title: item.title,
                price: item.price,
                currency: item.currency_id,
                image: item.thumbnail,
                url: item.permalink,
                sold_quantity: item.sold_quantity,
                seller_reputation: item.seller.power_seller_status,
                condition: item.condition,
                reviews: item.reviews,
            }));
        } catch (error) {
            console.error('Error parsing products:', error);
            return [];
        }
    }

    function applyFilters() {
        let filteredProducts = [...allProducts];
        const minPrice = parseFloat(minPriceInput.value);
        const maxPrice = parseFloat(maxPriceInput.value);
        const condition = conditionSelect.value;

        if (!isNaN(minPrice)) {
            filteredProducts = filteredProducts.filter(p => p.price >= minPrice);
        }
        if (!isNaN(maxPrice)) {
            filteredProducts = filteredProducts.filter(p => p.price <= maxPrice);
        }
        if (condition !== 'all') {
            filteredProducts = filteredProducts.filter(p => p.condition === condition);
        }

        displayProducts(filteredProducts);
    }

    function displayProducts(products) {
        resultsContainer.innerHTML = '';
        if (products.length === 0) {
            resultsContainer.innerHTML = '<p>No products found.</p>';
            return;
        }

        // Sort by popularity (sold quantity)
        products.sort((a, b) => b.sold_quantity - a.sold_quantity);

        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <img src="${product.image.replace('-I.jpg', '-O.jpg')}" alt="${product.title}">
                <h3><a href="${product.url}" target="_blank">${product.title}</a></h3>
                <p>Price: ${product.price} ${product.currency}</p>
                <p>Sold: ${product.sold_quantity}</p>
                <p>Condition: ${product.condition}</p>
                <p>Seller Reputation: ${product.seller_reputation || 'N/A'}</p>
            `;
            resultsContainer.appendChild(productCard);
        });
    }
});
