// Admin panel JavaScript
class AdminManager {
    constructor() {
        this.currentSection = 'dashboard';
        this.init();
    }

    async init() {
        try {
            // Check admin authentication
            const response = await fetch('/api/auth/me');
            if (!response.ok) {
                window.location.href = '/login?redirect=' + encodeURIComponent('/admin');
                return;
            }

            const user = await response.json();
            if (user.role !== 'admin') {
                window.location.href = '/';
                return;
            }

            document.getElementById('admin-name').textContent = user.name;
            this.bindEvents();
            this.loadDashboard();
        } catch (error) {
            console.error('Admin init error:', error);
            window.location.href = '/login';
        }
    }

    bindEvents() {
        // Navigation
        document.querySelectorAll('[data-section]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.showSection(e.target.dataset.section);
            });
        });

        // Product form
        document.getElementById('saveProduct').addEventListener('click', () => {
            this.saveProduct();
        });

        // Logout
        document.getElementById('logout-btn').addEventListener('click', (e) => {
            e.preventDefault();
            this.logout();
        });
    }

    showSection(sectionName) {
        // Update navigation
        document.querySelectorAll('[data-section]').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

        // Hide all sections
        document.querySelectorAll('.admin-section').forEach(section => {
            section.style.display = 'none';
        });

        // Show selected section
        document.getElementById(`${sectionName}-section`).style.display = 'block';
        this.currentSection = sectionName;

        // Load section data
        switch (sectionName) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'products':
                this.loadProducts();
                break;
            case 'orders':
                this.loadOrders();
                break;
            case 'analytics':
                // Analytics loaded on demand
                break;
        }
    }

    async loadDashboard() {
        try {
            // Load stats
            const statsResponse = await fetch('/api/admin/stats');
            const stats = await statsResponse.json();

            document.getElementById('total-orders').textContent = stats.total_orders || '0';
            document.getElementById('total-revenue').textContent = '$' + this.formatPrice(stats.total_revenue || 0);
            document.getElementById('total-products').textContent = stats.total_products || '0';
            document.getElementById('total-users').textContent = stats.total_users || '0';

            // Load recent orders
            const ordersResponse = await fetch('/api/admin/orders');
            const orders = await ordersResponse.json();

            this.renderRecentOrders(orders.slice(0, 5));
        } catch (error) {
            console.error('Error loading dashboard:', error);
        }
    }

    renderRecentOrders(orders) {
        const container = document.getElementById('recent-orders');
        
        if (orders.length === 0) {
            container.innerHTML = '<p class="text-muted text-center">No hay órdenes recientes</p>';
            return;
        }

        const tableHTML = `
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Cliente</th>
                            <th>Productos</th>
                            <th>Total</th>
                            <th>Estado</th>
                            <th>Fecha</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${orders.map(order => `
                            <tr>
                                <td>#${order.id}</td>
                                <td>${order.user_name || order.user_email}</td>
                                <td>
                                    <small class="text-muted">${order.items || 'N/A'}</small>
                                </td>
                                <td>$${this.formatPrice(order.total_amount)}</td>
                                <td>
                                    <span class="badge bg-${this.getStatusColor(order.status)}">${this.getStatusLabel(order.status)}</span>
                                </td>
                                <td>${this.formatDate(order.created_at)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        container.innerHTML = tableHTML;
    }

    async loadProducts() {
        try {
            const response = await fetch('/api/admin/products');
            const products = await response.json();
            this.renderProductsTable(products);
        } catch (error) {
            console.error('Error loading products:', error);
            document.getElementById('products-table').innerHTML = 
                '<div class="alert alert-danger">Error cargando productos</div>';
        }
    }

    renderProductsTable(products) {
        const container = document.getElementById('products-table');
        
        if (products.length === 0) {
            container.innerHTML = '<p class="text-muted text-center">No hay productos</p>';
            return;
        }

        const tableHTML = `
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Plataforma</th>
                            <th>Precio</th>
                            <th>Cantidad</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${products.map(product => `
                            <tr>
                                <td>${product.id}</td>
                                <td>${product.name}</td>
                                <td>
                                    <span class="badge bg-secondary">${product.platform}</span>
                                </td>
                                <td>$${this.formatPrice(product.price)}</td>
                                <td>${this.formatNumber(product.quantity)}</td>
                                <td>
                                    <span class="badge bg-${product.active ? 'success' : 'danger'}">
                                        ${product.active ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                                <td>
                                    <button class="btn btn-sm btn-outline-primary me-1" onclick="adminManager.editProduct(${product.id})">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-sm btn-outline-${product.active ? 'danger' : 'success'}" 
                                            onclick="adminManager.toggleProduct(${product.id}, ${!product.active})">
                                        <i class="fas fa-${product.active ? 'times' : 'check'}"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        container.innerHTML = tableHTML;
    }

    async loadOrders() {
        try {
            const response = await fetch('/api/admin/orders');
            const orders = await response.json();
            this.renderOrdersTable(orders);
        } catch (error) {
            console.error('Error loading orders:', error);
            document.getElementById('orders-table').innerHTML = 
                '<div class="alert alert-danger">Error cargando órdenes</div>';
        }
    }

    renderOrdersTable(orders) {
        const container = document.getElementById('orders-table');
        
        if (orders.length === 0) {
            container.innerHTML = '<p class="text-muted text-center">No hay órdenes</p>';
            return;
        }

        const tableHTML = `
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Cliente</th>
                            <th>Email</th>
                            <th>Productos</th>
                            <th>Total</th>
                            <th>Estado</th>
                            <th>Fecha</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${orders.map(order => `
                            <tr>
                                <td>#${order.id}</td>
                                <td>${order.user_name || 'N/A'}</td>
                                <td>${order.user_email}</td>
                                <td>
                                    <small class="text-muted">${order.items || 'N/A'}</small>
                                </td>
                                <td>$${this.formatPrice(order.total_amount)}</td>
                                <td>
                                    <select class="form-select form-select-sm" onchange="adminManager.updateOrderStatus(${order.id}, this.value)">
                                        <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pendiente</option>
                                        <option value="paid" ${order.status === 'paid' ? 'selected' : ''}>Pagado</option>
                                        <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Procesando</option>
                                        <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Completado</option>
                                        <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelado</option>
                                    </select>
                                </td>
                                <td>${this.formatDate(order.created_at)}</td>
                                <td>
                                    <button class="btn btn-sm btn-outline-info" onclick="adminManager.viewOrderDetails(${order.id})">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        container.innerHTML = tableHTML;
    }

    async saveProduct() {
        const formData = {
            name: document.getElementById('productName').value,
            description: document.getElementById('productDescription').value,
            price: parseFloat(document.getElementById('productPrice').value),
            quantity: parseInt(document.getElementById('productQuantity').value),
            platform: document.getElementById('productPlatform').value,
            image_url: document.getElementById('productImage').value
        };

        try {
            const response = await fetch('/api/admin/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                // Close modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('productModal'));
                modal.hide();
                
                // Reset form
                document.getElementById('productForm').reset();
                
                // Reload products
                this.loadProducts();
                
                this.showNotification('Producto creado exitosamente', 'success');
            } else {
                const error = await response.json();
                this.showNotification(error.error || 'Error creando producto', 'danger');
            }
        } catch (error) {
            console.error('Error saving product:', error);
            this.showNotification('Error creando producto', 'danger');
        }
    }

    async updateOrderStatus(orderId, newStatus) {
        try {
            const response = await fetch(`/api/admin/orders/${orderId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                this.showNotification('Estado actualizado exitosamente', 'success');
            } else {
                this.showNotification('Error actualizando estado', 'danger');
            }
        } catch (error) {
            console.error('Error updating order status:', error);
            this.showNotification('Error actualizando estado', 'danger');
        }
    }

    async toggleProduct(productId, newStatus) {
        try {
            const response = await fetch(`/api/admin/products/${productId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ active: newStatus })
            });

            if (response.ok) {
                this.loadProducts();
                this.showNotification('Producto actualizado exitosamente', 'success');
            } else {
                this.showNotification('Error actualizando producto', 'danger');
            }
        } catch (error) {
            console.error('Error toggling product:', error);
            this.showNotification('Error actualizando producto', 'danger');
        }
    }

    viewOrderDetails(orderId) {
        // TODO: Implement order details modal
        console.log('View order details:', orderId);
    }

    editProduct(productId) {
        // TODO: Implement product editing
        console.log('Edit product:', productId);
    }

    async logout() {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            window.location.href = '/';
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    showNotification(message, type) {
        // Create notification
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible position-fixed`;
        notification.style.cssText = 'top: 80px; right: 20px; z-index: 9999; min-width: 300px;';
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

    getStatusColor(status) {
        const colors = {
            pending: 'warning',
            paid: 'info',
            processing: 'primary',
            completed: 'success',
            cancelled: 'danger'
        };
        return colors[status] || 'secondary';
    }

    getStatusLabel(status) {
        const labels = {
            pending: 'Pendiente',
            paid: 'Pagado',
            processing: 'Procesando',
            completed: 'Completado',
            cancelled: 'Cancelado'
        };
        return labels[status] || status;
    }

    formatPrice(price) {
        return new Intl.NumberFormat('es-CL').format(price);
    }

    formatNumber(number) {
        return new Intl.NumberFormat('es-CL').format(number);
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('es-CL', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

// Initialize admin manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminManager = new AdminManager();
});