// Cart page JavaScript
class CartManager {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('cart') || '[]');
        this.products = {};
        this.init();
    }

    init() {
        this.loadCartProducts();
        this.bindEvents();
    }

    bindEvents() {
        // Proceed to checkout
        document.getElementById('proceed-checkout').addEventListener('click', () => {
            this.proceedToCheckout();
        });
    }

    async loadCartProducts() {
        if (this.cart.length === 0) {
            this.showEmptyCart();
            return;
        }

        try {
            // Load product details for cart items
            const productPromises = this.cart.map(async (item) => {
                const response = await fetch(`/api/products/${item.product_id}`);
                const product = await response.json();
                this.products[item.product_id] = product;
                return product;
            });

            await Promise.all(productPromises);
            this.renderCart();
            this.loadRecommendedProducts();
        } catch (error) {
            console.error('Error loading cart products:', error);
            this.showError('Error cargando el carrito. Por favor, recarga la página.');
        }
    }

    renderCart() {
        const container = document.getElementById('cart-items-container');
        const summary = document.getElementById('cart-summary');
        
        if (this.cart.length === 0) {
            this.showEmptyCart();
            return;
        }

        // Show cart items
        container.innerHTML = this.cart.map(item => {
            const product = this.products[item.product_id];
            return this.createCartItemHTML(item, product);
        }).join('');

        // Show summary
        this.renderSummary();
        summary.style.display = 'block';

        // Hide empty cart message
        document.getElementById('empty-cart').style.display = 'none';
    }

    createCartItemHTML(item, product) {
        const platformIcons = {
            instagram: 'fab fa-instagram',
            tiktok: 'fab fa-tiktok',
            youtube: 'fab fa-youtube'
        };

        const platformColors = {
            instagram: '#e4405f',
            tiktok: '#ff0050',
            youtube: '#ff0000'
        };

        const subtotal = product.price * item.quantity;

        return `
            <div class="cart-item" data-product-id="${product.id}">
                <div class="row align-items-center">
                    <div class="col-md-2">
                        <div class="product-icon d-flex align-items-center justify-content-center"
                             style="width: 80px; height: 80px; background: ${platformColors[product.platform] || '#6c757d'}; border-radius: 10px; color: white;">
                            <i class="${platformIcons[product.platform] || 'fas fa-users'} fa-2x"></i>
                        </div>
                    </div>
                    
                    <div class="col-md-4">
                        <h6 class="mb-1">${product.name}</h6>
                        <small class="text-muted">
                            <i class="fas fa-tag me-1"></i>${product.platform.charAt(0).toUpperCase() + product.platform.slice(1)}
                        </small>
                        <br>
                        <small class="text-muted">${product.quantity.toLocaleString()} seguidores</small>
                    </div>
                    
                    <div class="col-md-2">
                        <strong>$${this.formatPrice(product.price)}</strong>
                        <br>
                        <small class="text-muted">c/u</small>
                    </div>
                    
                    <div class="col-md-2">
                        <div class="quantity-controls">
                            <button type="button" class="quantity-decrease" data-product-id="${product.id}">
                                <i class="fas fa-minus"></i>
                            </button>
                            <input type="number" value="${item.quantity}" min="1" max="99" 
                                   class="quantity-input" data-product-id="${product.id}">
                            <button type="button" class="quantity-increase" data-product-id="${product.id}">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="col-md-2">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <strong>$${this.formatPrice(subtotal)}</strong>
                                <br>
                                <small class="text-muted">subtotal</small>
                            </div>
                            <button type="button" class="btn btn-outline-danger btn-sm remove-from-cart" 
                                    data-product-id="${product.id}" title="Eliminar">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderSummary() {
        const summaryItems = document.getElementById('summary-items');
        const total = document.getElementById('cart-total');
        
        let cartTotal = 0;
        let summaryHTML = '';

        this.cart.forEach(item => {
            const product = this.products[item.product_id];
            const subtotal = product.price * item.quantity;
            cartTotal += subtotal;

            summaryHTML += `
                <div class="summary-item">
                    <span>${product.name} (${item.quantity}x)</span>
                    <span>$${this.formatPrice(subtotal)}</span>
                </div>
            `;
        });

        summaryItems.innerHTML = summaryHTML;
        total.textContent = `$${this.formatPrice(cartTotal)}`;
    }

    showEmptyCart() {
        document.getElementById('empty-cart').style.display = 'block';
        document.getElementById('cart-summary').style.display = 'none';
        document.getElementById('cart-items-container').innerHTML = '';
    }

    async loadRecommendedProducts() {
        try {
            const response = await fetch('/api/products?limit=3');
            const products = await response.json();
            
            const container = document.getElementById('recommended-products');
            container.innerHTML = products
                .filter(product => !this.cart.some(item => item.product_id === product.id))
                .slice(0, 3)
                .map(product => window.followersApp.createProductCard(product))
                .join('');
        } catch (error) {
            console.error('Error loading recommended products:', error);
        }
    }

    async proceedToCheckout() {
        if (this.cart.length === 0) {
            window.followersApp.showNotification('El carrito está vacío', 'warning');
            return;
        }

        // Check authentication
        try {
            await window.authManager.requireAuth();
            window.location.href = '/checkout';
        } catch (error) {
            // User will be redirected to login
        }
    }

    showError(message) {
        const container = document.getElementById('cart-items-container');
        container.innerHTML = `
            <div class="alert alert-danger text-center">
                <i class="fas fa-exclamation-triangle me-2"></i>
                ${message}
            </div>
        `;
    }

    formatPrice(price) {
        return new Intl.NumberFormat('es-CL').format(price);
    }
}

// Initialize cart manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.cartManager = new CartManager();
});