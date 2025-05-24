const fs = require('fs');
const http = require('http');
const url = require('url');
const slugify = require('slugify');
const replaceTemplate = require('./modules/replaceTemplate');

// Environment variables
const PORT = process.env.PORT || 8000;
const HOST = process.env.HOST || '0.0.0.0';

// Error handling for file reading
const readFile = (filePath) => {
    try {
        return fs.readFileSync(filePath, 'utf-8');
    } catch (err) {
        console.error(`Error reading file ${filePath}:`, err);
        process.exit(1);
    }
};

// Read template files
const tempOverview = readFile(`${__dirname}/templates/template-overview.html`);
const tempCard = readFile(`${__dirname}/templates/template-card.html`);
const tempProduct = readFile(`${__dirname}/templates/template-product.html`);
const tempCart = readFile(`${__dirname}/templates/template-cart.html`);
const tempCheckout = readFile(`${__dirname}/templates/template-checkout.html`);
const tempPlaceOrder = readFile(`${__dirname}/templates/template-place-order.html`);

// Read data file
let data;
try {
    data = readFile(`${__dirname}/dev-data/data.json`);
} catch (err) {
    console.error('Error reading data file:', err);
    process.exit(1);
}

const dataObj = JSON.parse(data);
const slugs = dataObj.map(el => slugify(el.productName, { lower: true }));
console.log(slugs);

// Cart data structure
let cart = [];

const server = http.createServer((req, res) => {
    const { query, pathname } = url.parse(req.url, true);
    
    //overview page
    if (pathname === '/' || pathname === '/overview') {
        res.writeHead(200, { 'Content-type': 'text/html' });
        const cardsHtml = dataObj.map(el => replaceTemplate(tempCard, el)).join('');
        const output = tempOverview.replace('{%PRODUCT_CARDS%}', cardsHtml);
        res.end(output);

    //product page
    } else if (pathname === '/product') {
        res.writeHead(200, { 'Content-type': 'text/html' });
        const product = dataObj[query.id];
        if (!product) {
            res.writeHead(404, { 'Content-type': 'text/html' });
            return res.end('<h1>Product not found</h1>');
        }
        const output = replaceTemplate(tempProduct, product);
        res.end(output);

    // Add to cart
    } else if (pathname === '/add-to-cart') {
        const product = dataObj[query.id];
        if (!product) {
            res.writeHead(404, { 'Content-type': 'text/html' });
            return res.end('<h1>Product not found</h1>');
        }

        const existingItem = cart.find(item => item.id === query.id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: query.id,
                name: product.productName,
                price: product.price,
                image: product.image,
                quantity: 1
            });
        }

        res.writeHead(302, { 'Location': '/cart' });
        res.end();

    // Update cart quantity
    } else if (pathname === '/update-cart') {
        const { id, action } = query;
        const item = cart.find(item => item.id === id);
        
        if (item) {
            if (action === 'increase') {
                item.quantity += 1;
            } else if (action === 'decrease') {
                item.quantity -= 1;
                if (item.quantity <= 0) {
                    cart = cart.filter(cartItem => cartItem.id !== id);
                }
            }
        }

        res.writeHead(302, { 'Location': '/cart' });
        res.end();

    // Remove from cart
    } else if (pathname === '/remove-from-cart') {
        const { id } = query;
        cart = cart.filter(item => item.id !== id);
        
        res.writeHead(302, { 'Location': '/cart' });
        res.end();

    // Cart page
    } else if (pathname === '/cart') {
        res.writeHead(200, { 'Content-type': 'text/html' });
        
        let cartItemsHtml = '';
        let total = 0;

        if (cart.length === 0) {
            cartItemsHtml = `
                <div class="empty-cart">
                    <div class="empty-cart__emoji">🛒</div>
                    <div class="empty-cart__text">Your cart is empty</div>
                    <a href="/" class="btn">Start Shopping</a>
                </div>
            `;
        } else {
            cartItemsHtml = cart.map(item => `
                <div class="cart-item">
                    <div class="cart-item__emoji">${item.image}</div>
                    <div class="cart-item__details">
                        <div class="cart-item__name">${item.name}</div>
                        <div class="cart-item__price">$${item.price}</div>
                        <div class="cart-item__quantity">
                            <button class="quantity-btn" onclick="window.location.href='/update-cart?id=${item.id}&action=decrease'">-</button>
                            <span class="quantity-number">${item.quantity}</span>
                            <button class="quantity-btn" onclick="window.location.href='/update-cart?id=${item.id}&action=increase'">+</button>
                        </div>
                    </div>
                    <a href="/remove-from-cart?id=${item.id}" class="cart-item__remove">Remove</a>
                </div>
            `).join('');
            
            total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        }

        const output = tempCart
            .replace('{%CART_ITEMS%}', cartItemsHtml)
            .replace('{%CART_TOTAL%}', total.toFixed(2));
        
        res.end(output);

    // Checkout page
    } else if (pathname === '/checkout') {
        if (cart.length === 0) {
            res.writeHead(302, { 'Location': '/cart' });
            return res.end();
        }

        res.writeHead(200, { 'Content-type': 'text/html' });
        
        const orderItemsHtml = cart.map(item => `
            <div class="order-item">
                <div class="order-item__emoji">${item.image}</div>
                <div class="order-item__details">
                    <div class="order-item__name">${item.name}</div>
                    <div class="order-item__price">$${item.price} × ${item.quantity}</div>
                </div>
            </div>
        `).join('');
        
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        const output = tempCheckout
            .replace('{%ORDER_ITEMS%}', orderItemsHtml)
            .replace('{%ORDER_TOTAL%}', total.toFixed(2));
        
        res.end(output);

    // Place order page
    } else if (pathname === '/place-order') {
        if (cart.length === 0) {
            res.writeHead(302, { 'Location': '/cart' });
            return res.end();
        }

        res.writeHead(200, { 'Content-type': 'text/html' });
        
        const orderItemsHtml = cart.map(item => `
            <div class="order__item">
                <div class="order__item-emoji">${item.image}</div>
                <div class="order__item-details">
                    <h3 class="order__item-name">${item.name}</h3>
                    <div class="order__item-price">
                        $${item.price}
                        <span class="order__item-quantity">× ${item.quantity}</span>
                    </div>
                </div>
            </div>
        `).join('');
        
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        const output = tempPlaceOrder
            .replace('{%ORDER_ITEMS%}', orderItemsHtml)
            .replace('{%ORDER_TOTAL%}', total.toFixed(2));
        
        res.end(output);

    // Process order
    } else if (pathname === '/process-order') {
        if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', () => {
                // Here you would typically process the order and save it to a database
                // For now, we'll just clear the cart and redirect to a success page
                cart = [];
                res.writeHead(302, { 'Location': '/order-success' });
                res.end();
            });
        } else {
            res.writeHead(405, { 'Content-type': 'text/html' });
            res.end('<h1>Method not allowed</h1>');
        }

    // Order success page
    } else if (pathname === '/order-success') {
        res.writeHead(200, { 'Content-type': 'text/html' });
        res.end(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <link href="https://fonts.googleapis.com/css?family=Megrim|Nunito+Sans:400,900" rel="stylesheet" />
                <style>
                    body {
                        font-family: 'Nunito Sans', sans-serif;
                        background: linear-gradient(to bottom right, #9be15d, #00e3ae);
                        min-height: 100vh;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin: 0;
                        padding: 2rem;
                    }
                    .success {
                        background: white;
                        padding: 4rem;
                        border-radius: 1rem;
                        text-align: center;
                        box-shadow: 0 3rem 6rem 1rem rgba(0, 0, 0, 0.2);
                    }
                    .success__emoji {
                        font-size: 8rem;
                        margin-bottom: 2rem;
                    }
                    .success__title {
                        font-family: 'Megrim', sans-serif;
                        font-size: 4rem;
                        color: #333;
                        margin-bottom: 2rem;
                    }
                    .success__text {
                        font-size: 1.8rem;
                        color: #666;
                        margin-bottom: 3rem;
                    }
                    .btn {
                        display: inline-block;
                        background-color: #79e17b;
                        color: white;
                        font-size: 1.8rem;
                        font-weight: 900;
                        text-transform: uppercase;
                        text-decoration: none;
                        padding: 1.5rem 3rem;
                        border-radius: 0.5rem;
                        transition: all 0.3s;
                    }
                    .btn:hover {
                        background-color: #9be15d;
                        transform: translateY(-2px);
                        box-shadow: 0 1rem 2rem rgba(0, 0, 0, 0.1);
                    }
                </style>
            </head>
            <body>
                <div class="success">
                    <div class="success__emoji">🎉</div>
                    <h1 class="success__title">Order Successful!</h1>
                    <p class="success__text">Thank you for your order. We'll start processing it right away.</p>
                    <a href="/" class="btn">Continue Shopping</a>
                </div>
            </body>
            </html>
        `);

    //API
    } else if (pathname === '/api') {
        res.writeHead(200, { 'Content-type': 'application/json' });
        res.end(data);
    //Not Found
    } else {
        res.writeHead(404, {
            'Content-type': 'text/html',
            'my-own-header': 'hello-world'
        });
        res.end('<h1>Page not Found</h1>');
    }
});
    
server.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
});














