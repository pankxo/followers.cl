// Products page JavaScript
class ProductsManager {
    constructor() {
        this.products = [];
        this.filteredProducts = [];
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.loadProducts();
        this.bindEvents();
    }

    bindEvents() {
        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleFilter(e.target.dataset.platform);
            });
        });
    }

    async loadProducts() {
        try {
            const response = await fetch('/api/products');
            this.products = await response.json();
            this.filteredProducts = this.products;
            this.renderProducts();
        } catch (error) {
            console.error('Error loading products:', error);
            this.showError('Error cargando productos. Por favor, recarga la página.');
        }
    }

    handleFilter(platform) {
        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`[data-platform="${platform}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        // Filter products
        this.currentFilter = platform;
        
        if (platform === 'all') {
            this.filteredProducts = this.products;
        } else {
            this.filteredProducts = this.products.filter(product => 
                product.platform === platform
            );
        }

        this.renderProducts();
    }

    renderProducts() {
        const container = document.getElementById('products-container');
        const loading = document.getElementById('products-loading');
        const noProducts = document.getElementById('no-products');

        // Hide loading
        loading.style.display = 'none';

        if (this.filteredProducts.length === 0) {
            container.style.display = 'none';
            noProducts.style.display = 'block';
            return;
        }

        noProducts.style.display = 'none';
        container.style.display = 'flex';

        container.innerHTML = this.filteredProducts.map(product => {
            return this.createProductCard(product);
        }).join('');
    }

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

        const features = this.getProductFeatures(product);

        return `
            <div class="col-lg-4 col-md-6">
                <div class="card product-card shadow-sm h-100">
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
                    
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${product.name}</h5>
                        <p class="card-text text-muted flex-grow-1">${product.description}</p>
                        
                        <div class="features-list mb-3">
                            ${features.map(feature => `
                                <small class="d-block text-success">
                                    <i class="fas fa-check me-1"></i>${feature}
                                </small>
                            `).join('')}
                        </div>
                        
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <div>
                                <span class="price-tag">$${this.formatPrice(product.price)}</span>
                                <small class="d-block text-muted">${this.formatNumber(product.quantity)} seguidores</small>
                            </div>
                            <div class="text-end">
                                <small class="text-success">
                                    <i class="fas fa-clock me-1"></i>Entrega 24h
                                </small>
                            </div>
                        </div>
                        
                        <button class="btn btn-primary w-100 add-to-cart" data-product-id="${product.id}">
                            <i class="fas fa-cart-plus me-2"></i>Agregar al Carrito
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    getProductFeatures(product) {
        const baseFeatures = [
            'Seguidores reales y activos',
            'Sin contraseñas requeridas',
            'Garantía de reposición'
        ];

        if (product.quantity >= 5000) {
            baseFeatures.push('Soporte prioritario');
        }

        if (product.platform === 'instagram') {
            baseFeatures.push('Compatible con cuentas privadas');
        } else if (product.platform === 'youtube') {
            baseFeatures.push('No afecta métricas de visualización');
        } else if (product.platform === 'tiktok') {
            baseFeatures.push('Algoritmo optimizado');
        }

        return baseFeatures.slice(0, 3); // Limit to 3 features
    }

    showError(message) {
        const container = document.getElementById('products-container');
        const loading = document.getElementById('products-loading');
        
        loading.style.display = 'none';
        container.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger text-center">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    ${message}
                </div>
            </div>
        `;
        container.style.display = 'flex';
    }

    formatPrice(price) {
        return new Intl.NumberFormat('es-CL').format(price);
    }

    formatNumber(number) {
        return new Intl.NumberFormat('es-CL').format(number);
    }
}

// Initialize products manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.productsManager = new ProductsManager();
});