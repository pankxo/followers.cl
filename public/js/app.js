// Main application JavaScript
class FollowersApp {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('cart') || '[]');
        this.user = null;
        this.init();
    }

    init() {
        this.updateCartUI();
        this.loadPopularProducts();
        this.checkAuth();
        this.bindEvents();
    }

    // Event bindings
    bindEvents() {
        // Add to cart buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-cart')) {
                e.preventDefault();
                const productId = e.target.dataset.productId;
                this.addToCart(productId);
            }
        });

        // Cart quantity changes
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('quantity-increase')) {
                const productId = e.target.dataset.productId;
                this.updateCartQuantity(productId, 1);
            } else if (e.target.classList.contains('quantity-decrease')) {
                const productId = e.target.dataset.productId;
                this.updateCartQuantity(productId, -1);
            }
        });

        // Remove from cart
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-from-cart')) {
                const productId = e.target.dataset.productId;
                this.removeFromCart(productId);
            }
        });

        // Logout
        document.addEventListener('click', (e) => {
            if (e.target.id === 'logout-btn') {
                e.preventDefault();
                this.logout();
            }
        });
    }

    // Authentication check
    async checkAuth() {
        try {
            const response = await fetch('/api/auth/me');
            if (response.ok) {
                this.user = await response.json();
                this.updateAuthUI();
            }
        } catch (error) {
            console.log('Not authenticated');
        }
    }

    // Update authentication UI
    updateAuthUI() {
        const authSection = document.getElementById('auth-section');
        if (this.user) {
            authSection.innerHTML = `
                <div class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                        <i class="fas fa-user me-1"></i>${this.user.name}
                    </a>
                    <ul class="dropdown-menu">
                        <li><a class="dropdown-item" href="/orders">Mis Pedidos</a></li>
                        ${this.user.role === 'admin' ? '<li><a class="dropdown-item" href="/admin">Admin</a></li>' : ''}
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item" href="#" id="logout-btn">Cerrar Sesión</a></li>
                    </ul>
                </div>
            `;
        }
    }

    // Logout
    async logout() {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            this.user = null;
            localStorage.removeItem('cart');
            this.cart = [];
            this.updateCartUI();
            window.location.href = '/';
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    // Load popular products for homepage
    async loadPopularProducts() {
        const container = document.getElementById('popular-products');
        if (!container) return;

        try {
            const response = await fetch('/api/products?limit=6');
            const products = await response.json();
            
            container.innerHTML = products.map(product => this.createProductCard(product)).join('');
        } catch (error) {
            console.error('Error loading products:', error);
            container.innerHTML = '<div class="col-12"><p class="text-center">Error loading products</p></div>';
        }
    }

    // Create product card HTML
    createProductCard(product) {
        const platformIcons = {
            instagram: 'fab fa-instagram',
            tiktok: 'fab fa-tiktok',
            youtube: 'fab fa-youtube',
            twitter: 'fab fa-twitter'
        };

        const platformColors = {
            instagram: 'linear-gradient(45deg, #f09433, #dc2743)',
            tiktok: 'linear-gradient(45deg, #ff0050, #00f2ea)',
            youtube: '#ff0000',
            twitter: '#1da1f2'
        };

        return `
            <div class="col-lg-4 col-md-6">
                <div class="card product-card shadow-sm">
                    <div class="position-relative">
                        <div class="card-img-top d-flex align-items-center justify-content-center" 
                             style="background: ${platformColors[product.platform] || '#6c757d'}">
                            <i class="${platformIcons[product.platform] || 'fas fa-users'}"></i>
                        </div>
                        <span class="badge platform-badge" 
                              style="background: ${platformColors[product.platform] || '#6c757d'}">
                            ${product.platform.charAt(0).toUpperCase() + product.platform.slice(1)}
                        </span>
                    </div>
                    
                    <div class="card-body">
                        <h5 class="card-title">${product.name}</h5>
                        <p class="card-text text-muted">${product.description}</p>
                        
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <span class="price-tag">$${product.price}</span>
                            <small class="text-muted">${product.quantity.toLocaleString()} seguidores</small>
                        </div>
                        
                        <button class="btn btn-primary w-100 add-to-cart" data-product-id="${product.id}">
                            <i class="fas fa-cart-plus me-2"></i>Agregar al Carrito
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Cart functionality
    addToCart(productId) {
        // Check if product already in cart
        const existingItem = this.cart.find(item => item.product_id == productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({ product_id: parseInt(productId), quantity: 1 });
        }
        
        this.saveCart();
        this.updateCartUI();
        this.showNotification('Producto agregado al carrito', 'success');
    }

    updateCartQuantity(productId, change) {
        const item = this.cart.find(item => item.product_id == productId);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                this.removeFromCart(productId);
                return;
            }
            this.saveCart();
            this.updateCartUI();
        }
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.product_id != productId);
        this.saveCart();
        this.updateCartUI();
        this.showNotification('Producto eliminado del carrito', 'info');
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }

    updateCartUI() {
        const cartCount = document.getElementById('cart-count');
        if (cartCount) {
            const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'inline' : 'none';
        }
    }

    // Notification system
    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification-toast');
        existingNotifications.forEach(n => n.remove());

        // Create notification
        const notification = document.createElement('div');
        notification.className = `notification-toast alert alert-${type} alert-dismissible position-fixed`;
        notification.style.cssText = 'top: 100px; right: 20px; z-index: 9999; min-width: 300px;';
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    // Utility functions
    formatPrice(price) {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP'
        }).format(price);
    }

    formatNumber(number) {
        return new Intl.NumberFormat('es-CL').format(number);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.followersApp = new FollowersApp();
});

// Utility function for API calls
async function apiCall(url, options = {}) {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const config = { ...defaultOptions, ...options };
    
    try {
        const response = await fetch(url, config);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'API call failed');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Loading spinner utility
function showLoading() {
    const spinner = document.createElement('div');
    spinner.className = 'spinner-overlay';
    spinner.id = 'loading-spinner';
    spinner.innerHTML = `
        <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
            <span class="visually-hidden">Cargando...</span>
        </div>
    `;
    document.body.appendChild(spinner);
}

function hideLoading() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
        spinner.remove();
    }
}