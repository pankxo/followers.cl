# Followers.cl - Professional Ecommerce Platform

## 🚀 Professional ecommerce website for selling social media followers with Mercado Pago integration

A complete, professional ecommerce platform built with Node.js and Express for selling social media followers (Instagram, TikTok, YouTube) with secure payment processing through Mercado Pago.

## ✨ Features

### 🛍️ **Complete Ecommerce Functionality**
- Professional responsive design with Bootstrap 5
- Product catalog with filtering by social media platform
- Shopping cart with quantity management
- User registration and authentication system
- Secure checkout process with form validation

### 💳 **Payment Integration**
- **Mercado Pago integration** for secure payments
- Support for credit cards, debit cards, and local payment methods
- Real-time payment status updates via webhooks
- Automatic order status management

### 👤 **User Management**
- User registration and login system
- JWT-based authentication
- Order history for registered users
- Profile management

### 🔧 **Admin Panel**
- Complete admin dashboard with statistics
- Product management (create, edit, activate/deactivate)
- Order management with status updates
- Sales analytics and reporting

### 📱 **Responsive Design**
- Mobile-first responsive design
- Professional UI with custom animations
- Platform-specific branding (Instagram, TikTok, YouTube colors)
- Trust indicators and security badges

## 🛠️ Technology Stack

- **Backend:** Node.js + Express.js
- **Database:** SQLite (easily upgradeable to PostgreSQL/MySQL)
- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **Styling:** Bootstrap 5 + Custom CSS
- **Authentication:** JWT + bcryptjs
- **Payments:** Mercado Pago SDK
- **Validation:** express-validator

## 🚀 Quick Start

### 1. Installation
```bash
npm install
```

### 2. Environment Setup
Copy the environment template and configure your settings:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Mercado Pago Configuration (Get from your Mercado Pago dashboard)
MERCADOPAGO_ACCESS_TOKEN=your_access_token_here
MERCADOPAGO_PUBLIC_KEY=your_public_key_here

# JWT Secret (use a strong random string)
JWT_SECRET=your_super_secret_jwt_key_here

# Admin credentials
ADMIN_EMAIL=admin@followers.cl
ADMIN_PASSWORD=admin123
```

### 3. Start the Server
```bash
npm start
```

The application will be available at `http://localhost:3000`

### 4. Default Admin Access
- **Email:** admin@followers.cl
- **Password:** admin123
- **Admin Panel:** http://localhost:3000/admin

## 📁 Project Structure

```
followers.cl/
├── config/
│   └── database.js          # Database configuration and initialization
├── middleware/
│   └── auth.js              # Authentication middleware
├── routes/
│   ├── admin.js             # Admin panel routes
│   ├── auth.js              # Authentication routes
│   ├── orders.js            # Order management routes
│   ├── payments.js          # Mercado Pago payment routes
│   └── products.js          # Product catalog routes
├── public/
│   ├── css/
│   │   └── style.css        # Custom styles
│   ├── js/
│   │   ├── admin.js         # Admin panel JavaScript
│   │   ├── app.js           # Main application JavaScript
│   │   ├── auth.js          # Authentication JavaScript
│   │   ├── cart.js          # Shopping cart JavaScript
│   │   ├── checkout.js      # Checkout process JavaScript
│   │   └── products.js      # Product catalog JavaScript
│   ├── admin.html           # Admin panel
│   ├── cart.html            # Shopping cart page
│   ├── checkout.html        # Checkout page
│   ├── index.html           # Homepage
│   ├── login.html           # Login/Register page
│   └── products.html        # Product catalog page
├── server.js                # Main server file
├── package.json             # Dependencies and scripts
└── .env.example             # Environment variables template
```

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- SQL injection protection
- Input validation and sanitization
- HTTPS-ready configuration
- Secure cookie handling
- Admin role-based access control

## 💳 Mercado Pago Setup

1. **Create a Mercado Pago Account**
   - Visit [Mercado Pago Developers](https://www.mercadopago.com/developers)
   - Create a developer account

2. **Get Your Credentials**
   - Access Token (for server-side operations)
   - Public Key (for client-side integration)

3. **Configure Webhooks**
   - Set webhook URL to: `https://yourdomain.com/api/payments/webhook`
   - Enable payment status notifications

4. **Test Mode**
   - Use sandbox credentials for testing
   - Switch to production credentials when ready to go live

## 📊 Sample Data

The application comes with sample products:
- Instagram followers packages (1K, 5K, 10K)
- TikTok followers packages (1K, 5K)
- YouTube subscribers package (500)

## 🚀 Deployment

### Environment Variables for Production
```env
NODE_ENV=production
PORT=443
MERCADOPAGO_ACCESS_TOKEN=your_production_access_token
MERCADOPAGO_PUBLIC_KEY=your_production_public_key
JWT_SECRET=your_production_jwt_secret
```

### SSL Certificate
- Obtain SSL certificate for secure HTTPS connections
- Configure your web server (nginx/apache) to serve the application
- Update Mercado Pago webhook URLs to use HTTPS

## 🛡️ Best Practices Implemented

- ✅ Input validation and sanitization
- ✅ Error handling and logging
- ✅ Rate limiting ready
- ✅ Database connection pooling
- ✅ Secure headers configuration
- ✅ Environment-based configuration
- ✅ Clean code architecture
- ✅ Responsive mobile-first design

## 🎨 Customization

### Branding
- Update colors in `/public/css/style.css`
- Replace logo and brand name throughout the application
- Customize email templates and notifications

### Products
- Add new social media platforms in the admin panel
- Modify product categories and pricing
- Update product descriptions and features

### Payment Methods
- Configure additional Mercado Pago payment methods
- Add promotional codes system
- Implement subscription-based products

## 📞 Support

For technical support and customization:
- Review the code documentation
- Check the admin panel for configuration options
- Mercado Pago documentation: https://www.mercadopago.com/developers

## 📄 License

This project is proprietary software developed for followers.cl platform.

---

**Built with ❤️ for professional social media growth services**
