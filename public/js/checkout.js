// Checkout page JavaScript
class CheckoutManager {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('cart') || '[]');
        this.products = {};
        this.user = null;
        this.init();
    }

    async init() {
        // Check authentication
        try {
            await window.authManager.requireAuth();
            await this.loadUserInfo();
            await this.loadCartProducts();
            this.renderOrderSummary();
            this.renderSocialAccounts();
            this.bindEvents();
        } catch (error) {
            // User will be redirected to login
        }
    }

    async loadUserInfo() {
        try {
            const response = await fetch('/api/auth/me');
            if (response.ok) {
                this.user = await response.json();
                this.fillUserInfo();
            }
        } catch (error) {
            console.error('Error loading user info:', error);
        }
    }

    fillUserInfo() {
        if (this.user) {
            document.getElementById('customer-name').value = this.user.name || '';
            document.getElementById('customer-email').value = this.user.email || '';
        }
    }

    async loadCartProducts() {
        if (this.cart.length === 0) {
            window.location.href = '/cart';
            return;
        }

        try {
            const productPromises = this.cart.map(async (item) => {
                const response = await fetch(`/api/products/${item.product_id}`);
                const product = await response.json();
                this.products[item.product_id] = product;
                return product;
            });

            await Promise.all(productPromises);
        } catch (error) {
            console.error('Error loading cart products:', error);
            this.showError('Error cargando los productos del carrito.');
        }
    }

    renderOrderSummary() {
        const container = document.getElementById('order-items');
        const totalElement = document.getElementById('order-total');
        
        let total = 0;
        let itemsHTML = '';

        this.cart.forEach(item => {
            const product = this.products[item.product_id];
            if (product) {
                const subtotal = product.price * item.quantity;
                total += subtotal;

                itemsHTML += `
                    <div class="summary-item">
                        <div>
                            <strong>${product.name}</strong>
                            <small class="d-block text-muted">
                                ${product.platform.charAt(0).toUpperCase() + product.platform.slice(1)} • 
                                Cantidad: ${item.quantity}
                            </small>
                        </div>
                        <span>$${this.formatPrice(subtotal)}</span>
                    </div>
                `;
            }
        });

        container.innerHTML = itemsHTML;
        totalElement.textContent = `$${this.formatPrice(total)}`;
    }

    renderSocialAccounts() {
        const container = document.getElementById('social-accounts');
        const uniquePlatforms = [...new Set(this.cart.map(item => {
            const product = this.products[item.product_id];
            return product ? product.platform : null;
        }))].filter(Boolean);

        const platformLabels = {
            instagram: 'Instagram',
            tiktok: 'TikTok',
            youtube: 'YouTube',
            twitter: 'Twitter'
        };

        const platformPlaceholders = {
            instagram: '@miusuario o https://instagram.com/miusuario',
            tiktok: '@miusuario o https://tiktok.com/@miusuario',
            youtube: 'Mi Canal o https://youtube.com/c/micanal',
            twitter: '@miusuario o https://twitter.com/miusuario'
        };

        container.innerHTML = uniquePlatforms.map(platform => `
            <div class="mb-3">
                <label for="${platform}-account" class="form-label">
                    <i class="fab fa-${platform} me-2"></i>${platformLabels[platform]} *
                </label>
                <input type="text" class="form-control" id="${platform}-account" 
                       placeholder="${platformPlaceholders[platform]}" required>
                <small class="text-muted">
                    Ingresa tu nombre de usuario o el enlace a tu perfil
                </small>
            </div>
        `).join('');
    }

    bindEvents() {
        document.getElementById('proceed-payment').addEventListener('click', () => {
            this.processPayment();
        });
    }

    async processPayment() {
        if (!this.validateForm()) {
            return;
        }

        try {
            this.showLoading();

            // Create order
            const orderData = this.prepareOrderData();
            const orderResponse = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            if (!orderResponse.ok) {
                throw new Error('Error creating order');
            }

            const order = await orderResponse.json();

            // Create MercadoPago preference
            const preferenceResponse = await fetch('/api/payments/create-preference', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ order_id: order.order_id })
            });

            if (!preferenceResponse.ok) {
                throw new Error('Error creating payment preference');
            }

            const preference = await preferenceResponse.json();

            // Redirect to MercadoPago
            if (preference.sandbox_init_point) {
                window.location.href = preference.sandbox_init_point;
            } else if (preference.init_point) {
                window.location.href = preference.init_point;
            } else {
                throw new Error('No payment URL received');
            }

        } catch (error) {
            console.error('Payment error:', error);
            this.showError('Error procesando el pago. Por favor, intenta de nuevo.');
        } finally {
            this.hideLoading();
        }
    }

    validateForm() {
        const requiredFields = [
            'customer-name',
            'customer-email'
        ];

        // Add social media accounts
        const uniquePlatforms = [...new Set(this.cart.map(item => {
            const product = this.products[item.product_id];
            return product ? product.platform : null;
        }))].filter(Boolean);

        uniquePlatforms.forEach(platform => {
            requiredFields.push(`${platform}-account`);
        });

        let isValid = true;

        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field && !field.value.trim()) {
                field.classList.add('is-invalid');
                isValid = false;
            } else if (field) {
                field.classList.remove('is-invalid');
            }
        });

        if (!isValid) {
            this.showError('Por favor, completa todos los campos requeridos.');
        }

        return isValid;
    }

    prepareOrderData() {
        const uniquePlatforms = [...new Set(this.cart.map(item => {
            const product = this.products[item.product_id];
            return product ? product.platform : null;
        }))].filter(Boolean);

        const socialAccounts = {};
        uniquePlatforms.forEach(platform => {
            const accountInput = document.getElementById(`${platform}-account`);
            if (accountInput) {
                socialAccounts[platform] = accountInput.value.trim();
            }
        });

        return {
            items: this.cart,
            shipping_info: JSON.stringify({
                customer_name: document.getElementById('customer-name').value.trim(),
                customer_email: document.getElementById('customer-email').value.trim(),
                social_accounts: socialAccounts
            })
        };
    }

    showLoading() {
        document.getElementById('checkout-loading').style.display = 'block';
        document.getElementById('checkout-form').style.display = 'none';
        document.getElementById('payment-error').style.display = 'none';
    }

    hideLoading() {
        document.getElementById('checkout-loading').style.display = 'none';
        document.getElementById('checkout-form').style.display = 'block';
    }

    showError(message) {
        const errorElement = document.getElementById('payment-error');
        const messageElement = document.getElementById('error-message');
        
        messageElement.textContent = message;
        errorElement.style.display = 'block';
        
        // Scroll to error
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    formatPrice(price) {
        return new Intl.NumberFormat('es-CL').format(price);
    }
}

// Initialize checkout manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.checkoutManager = new CheckoutManager();
});