// Services data
const servicesData = {
    followers: [
        {
            id: 'followers-100',
            name: '100 Seguidores',
            description: 'Seguidores reales y activos',
            price: 2990,
            quantity: 100,
            type: 'followers'
        },
        {
            id: 'followers-500',
            name: '500 Seguidores',
            description: 'Seguidores reales y activos',
            price: 9990,
            quantity: 500,
            type: 'followers'
        },
        {
            id: 'followers-1000',
            name: '1,000 Seguidores',
            description: 'Seguidores reales y activos',
            price: 17990,
            quantity: 1000,
            type: 'followers'
        },
        {
            id: 'followers-2500',
            name: '2,500 Seguidores',
            description: 'Seguidores reales y activos',
            price: 39990,
            quantity: 2500,
            type: 'followers'
        },
        {
            id: 'followers-5000',
            name: '5,000 Seguidores',
            description: 'Seguidores reales y activos',
            price: 69990,
            quantity: 5000,
            type: 'followers'
        }
    ],
    comments: [
        {
            id: 'comments-25',
            name: '25 Comentarios',
            description: 'Comentarios auténticos y personalizados',
            price: 4990,
            quantity: 25,
            type: 'comments'
        },
        {
            id: 'comments-50',
            name: '50 Comentarios',
            description: 'Comentarios auténticos y personalizados',
            price: 8990,
            quantity: 50,
            type: 'comments'
        },
        {
            id: 'comments-100',
            name: '100 Comentarios',
            description: 'Comentarios auténticos y personalizados',
            price: 15990,
            quantity: 100,
            type: 'comments'
        },
        {
            id: 'comments-250',
            name: '250 Comentarios',
            description: 'Comentarios auténticos y personalizados',
            price: 34990,
            quantity: 250,
            type: 'comments'
        }
    ],
    views: [
        {
            id: 'views-1000',
            name: '1,000 Vistas',
            description: 'Vistas reales para tus publicaciones',
            price: 1990,
            quantity: 1000,
            type: 'views'
        },
        {
            id: 'views-5000',
            name: '5,000 Vistas',
            description: 'Vistas reales para tus publicaciones',
            price: 7990,
            quantity: 5000,
            type: 'views'
        },
        {
            id: 'views-10000',
            name: '10,000 Vistas',
            description: 'Vistas reales para tus publicaciones',
            price: 14990,
            quantity: 10000,
            type: 'views'
        },
        {
            id: 'views-25000',
            name: '25,000 Vistas',
            description: 'Vistas reales para tus publicaciones',
            price: 29990,
            quantity: 25000,
            type: 'views'
        },
        {
            id: 'views-50000',
            name: '50,000 Vistas',
            description: 'Vistas reales para tus publicaciones',
            price: 49990,
            quantity: 50000,
            type: 'views'
        }
    ]
};

// Shopping cart
let cart = [];
let isCartOpen = false;

// Initialize the website
document.addEventListener('DOMContentLoaded', function() {
    renderServices();
    updateCartDisplay();
    
    // Add smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// Render services in their respective sections
function renderServices() {
    renderServiceCategory('followersServices', servicesData.followers);
    renderServiceCategory('commentsServices', servicesData.comments);
    renderServiceCategory('viewsServices', servicesData.views);
}

function renderServiceCategory(containerId, services) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = services.map(service => `
        <div class="service-item fade-in">
            <div class="service-details">
                <h4>${service.name}</h4>
                <p>${service.description}</p>
                <div class="service-price">$${service.price.toLocaleString('es-CL')}</div>
            </div>
            <button class="add-to-cart" onclick="addToCart('${service.id}')">
                <i class="fas fa-cart-plus"></i>
                Agregar
            </button>
        </div>
    `).join('');
}

// Shopping Cart Functions
function addToCart(serviceId) {
    // Special case: Redirect directly to Mercado Pago for 500 followers
    if (serviceId === 'followers-500') {
        window.open('https://mpago.la/1yH57Po', '_blank');
        return;
    }
    
    const service = findServiceById(serviceId);
    if (!service) return;
    
    const existingItem = cart.find(item => item.id === serviceId);
    
    if (existingItem) {
        existingItem.cartQuantity += 1;
    } else {
        cart.push({
            ...service,
            cartQuantity: 1
        });
    }
    
    updateCartDisplay();
    showCartFeedback();
}

function findServiceById(id) {
    const allServices = [
        ...servicesData.followers,
        ...servicesData.comments,
        ...servicesData.views
    ];
    return allServices.find(service => service.id === id);
}

function removeFromCart(serviceId) {
    cart = cart.filter(item => item.id !== serviceId);
    updateCartDisplay();
}

function updateCartQuantity(serviceId, change) {
    const item = cart.find(item => item.id === serviceId);
    if (!item) return;
    
    item.cartQuantity += change;
    
    if (item.cartQuantity <= 0) {
        removeFromCart(serviceId);
    } else {
        updateCartDisplay();
    }
}

function updateCartDisplay() {
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.cartQuantity, 0);
    cartCount.textContent = totalItems;
    
    // Update cart items
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart" style="font-size: 48px; color: #ccc; margin-bottom: 20px;"></i>
                <p>Tu carrito está vacío</p>
                <p style="font-size: 14px; color: #999;">Agrega algunos servicios para continuar</p>
            </div>
        `;
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p>${item.description}</p>
                    <div style="color: #E4405F; font-weight: bold;">$${item.price.toLocaleString('es-CL')}</div>
                </div>
                <div class="cart-item-controls">
                    <button class="quantity-btn" onclick="updateCartQuantity('${item.id}', -1)">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span style="margin: 0 10px; font-weight: bold;">${item.cartQuantity}</span>
                    <button class="quantity-btn" onclick="updateCartQuantity('${item.id}', 1)">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button class="remove-item" onclick="removeFromCart('${item.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    // Update total
    const total = cart.reduce((sum, item) => sum + (item.price * item.cartQuantity), 0);
    cartTotal.textContent = total.toLocaleString('es-CL');
}

function toggleCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    const cartOverlay = document.getElementById('cartOverlay');
    
    isCartOpen = !isCartOpen;
    
    if (isCartOpen) {
        cartSidebar.classList.add('open');
        cartOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    } else {
        cartSidebar.classList.remove('open');
        cartOverlay.classList.remove('open');
        document.body.style.overflow = 'auto';
    }
}

function showCartFeedback() {
    const cartIcon = document.querySelector('.cart-icon');
    cartIcon.classList.add('pulse');
    
    setTimeout(() => {
        cartIcon.classList.remove('pulse');
    }, 1000);
}

// Checkout function with Mercado Pago integration
function checkout() {
    if (cart.length === 0) {
        alert('Tu carrito está vacío. Agrega algunos servicios antes de continuar.');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.cartQuantity), 0);
    const orderSummary = cart.map(item => `${item.name} x${item.cartQuantity}`).join('\n');
    
    // Create order data for Mercado Pago
    const orderData = {
        items: cart.map(item => ({
            title: item.name,
            description: item.description,
            quantity: item.cartQuantity,
            unit_price: item.price,
            currency_id: 'CLP'
        })),
        payer: {
            email: 'customer@example.com' // This should be collected from user in production
        },
        back_urls: {
            success: window.location.origin + '/success',
            failure: window.location.origin + '/failure',
            pending: window.location.origin + '/pending'
        },
        auto_return: 'approved',
        notification_url: window.location.origin + '/webhook'
    };
    
    // Try Mercado Pago integration first
    processMercadoPagoPayment(orderData, orderSummary, total);
}

// Process payment with Mercado Pago
async function processMercadoPagoPayment(orderData, orderSummary, total) {
    try {
        // Send order to backend to create preference
        const response = await fetch('/create_preference', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData)
        });

        if (response.ok) {
            const data = await response.json();
            
            // TODO: Initialize Mercado Pago with Public Key
            // const mp = new MercadoPago('YOUR_PUBLIC_KEY', {
            //     locale: 'es-CL'
            // });
            
            // Redirect to Mercado Pago checkout
            const preferenceId = data.id;
            
            // TODO: Uncomment when you have your Public Key configured
            // window.location.href = `https://www.mercadopago.com.cl/checkout/v1/redirect?pref_id=${preferenceId}`;
            
            // For now, show success message and clear cart
            alert(`Preferencia creada exitosamente. ID: ${preferenceId}\n\nEn producción, esto redirigiría a Mercado Pago.`);
            
            // Clear cart after creating preference
            cart = [];
            updateCartDisplay();
            toggleCart();
            
        } else {
            console.log('Backend endpoint not available, falling back to WhatsApp');
            // Fall back to WhatsApp if backend is not available
            fallbackToWhatsApp(orderSummary, total);
        }
    } catch (error) {
        console.log('Mercado Pago integration failed:', error);
        // Fall back to WhatsApp on any error
        fallbackToWhatsApp(orderSummary, total);
    }
}

// Fallback to WhatsApp integration
function fallbackToWhatsApp(orderSummary, total) {
    const message = `¡Hola! Me interesa realizar el siguiente pedido:\n\n${orderSummary}\n\nTotal: $${total.toLocaleString('es-CL')}\n\n¿Podrían ayudarme con el proceso de pago?`;
    const whatsappUrl = `https://wa.me/56912345678?text=${encodeURIComponent(message)}`;
    
    if (confirm(`El pago con Mercado Pago no está disponible en este momento.\n\nResumen del pedido:\n\n${orderSummary}\n\nTotal: $${total.toLocaleString('es-CL')}\n\n¿Deseas continuar con WhatsApp para completar tu compra?`)) {
        window.open(whatsappUrl, '_blank');
        
        // Clear cart after successful order
        cart = [];
        updateCartDisplay();
        toggleCart();
    }
}

// Mercado Pago Integration
// TODO: Add your Mercado Pago Public Key here
// const MP_PUBLIC_KEY = 'YOUR_PUBLIC_KEY'; // Replace with your actual public key

function initializeMercadoPago() {
    // TODO: Initialize Mercado Pago SDK with your Public Key
    // This should be called when you have configured your credentials
    
    // Example initialization:
    // const mp = new MercadoPago(MP_PUBLIC_KEY, {
    //     locale: 'es-CL'
    // });
    // return mp;
    
    console.log('Mercado Pago integration ready - add your Public Key to enable');
    return null;
}

// Animation helpers
function addFadeInAnimation() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    });
    
    document.querySelectorAll('.service-item, .service-category').forEach(el => {
        observer.observe(el);
    });
}

// Call animation helper after DOM is loaded
document.addEventListener('DOMContentLoaded', addFadeInAnimation);

// Handle window resize
window.addEventListener('resize', function() {
    if (window.innerWidth > 768 && isCartOpen) {
        // Keep cart functionality on larger screens
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // ESC key to close cart
    if (e.key === 'Escape' && isCartOpen) {
        toggleCart();
    }
});