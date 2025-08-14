# Mercado Pago Integration Guide

This file contains information about integrating Mercado Pago with the followers.cl e-commerce platform.

## Prerequisites

1. Mercado Pago Developer Account
2. API Keys (Public Key and Access Token)
3. Server-side implementation (Node.js, PHP, Python, etc.)

## Integration Steps

### 1. Client-side Integration

```html
<!-- Include Mercado Pago SDK -->
<script src="https://sdk.mercadopago.com/js/v2"></script>
```

### 2. Initialize Mercado Pago

```javascript
// Initialize Mercado Pago with your public key
const mp = new MercadoPago('YOUR_PUBLIC_KEY', {
    locale: 'es-CL'
});
```

### 3. Server-side Payment Processing

Create a complete backend endpoint to handle payment preferences. Here's a full Node.js/Express example:

```javascript
// server.js - Complete Node.js backend example
const express = require('express');
const cors = require('cors');
const mercadopago = require('mercadopago');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static('public')); // Serve static files

// TODO: Configure your Mercado Pago Access Token
// IMPORTANT: Never expose this token on the client side
// Add your Access Token to environment variables or config file
mercadopago.configure({
    access_token: process.env.MP_ACCESS_TOKEN || 'YOUR_ACCESS_TOKEN' // Replace with your actual access token
});

// Create payment preference endpoint
app.post('/create_preference', async (req, res) => {
    try {
        const { items, payer, back_urls, auto_return, notification_url } = req.body;
        
        // Validate request data
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Items array is required' });
        }
        
        const preference = {
            items: items.map(item => ({
                title: item.title,
                description: item.description || '',
                quantity: parseInt(item.quantity),
                unit_price: parseFloat(item.unit_price),
                currency_id: item.currency_id || 'CLP'
            })),
            payer: {
                email: payer?.email || 'test_user@test.com'
            },
            back_urls: {
                success: back_urls?.success || "https://followers.cl/success",
                failure: back_urls?.failure || "https://followers.cl/failure",
                pending: back_urls?.pending || "https://followers.cl/pending"
            },
            auto_return: auto_return || "approved",
            notification_url: notification_url || "https://followers.cl/webhook",
            statement_descriptor: "FOLLOWERS.CL",
            external_reference: `order_${Date.now()}` // Generate unique reference
        };

        const response = await mercadopago.preferences.create(preference);
        
        res.json({
            id: response.body.id,
            init_point: response.body.init_point,
            sandbox_init_point: response.body.sandbox_init_point
        });
        
    } catch (error) {
        console.error('Error creating preference:', error);
        res.status(500).json({ 
            error: 'Error creating payment preference',
            details: error.message 
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Make sure to configure your Mercado Pago Access Token!');
});
```

**Package.json dependencies:**
```json
{
  "name": "followers-cl-backend",
  "version": "1.0.0",
  "dependencies": {
    "express": "^4.18.0",
    "cors": "^2.8.5",
    "mercadopago": "^1.5.17"
  },
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

### 4. Webhook Implementation

Complete webhook implementation to handle payment notifications:

```javascript
// Webhook endpoint to receive payment notifications
app.post('/webhook', async (req, res) => {
    try {
        const { type, data } = req.body;
        
        // Only process payment notifications
        if (type === 'payment') {
            const paymentId = data.id;
            
            // Get payment details from Mercado Pago
            const payment = await mercadopago.payment.findById(paymentId);
            const paymentData = payment.body;
            
            console.log('Payment notification received:', {
                id: paymentData.id,
                status: paymentData.status,
                external_reference: paymentData.external_reference,
                transaction_amount: paymentData.transaction_amount
            });
            
            // Process payment based on status
            switch(paymentData.status) {
                case 'approved':
                    // Payment successful - fulfill order
                    await processSuccessfulPayment(paymentData);
                    console.log('Payment approved:', paymentData.id);
                    break;
                    
                case 'pending':
                    // Payment pending - wait for completion
                    await processPendingPayment(paymentData);
                    console.log('Payment pending:', paymentData.id);
                    break;
                    
                case 'rejected':
                    // Payment failed - notify user
                    await processRejectedPayment(paymentData);
                    console.log('Payment rejected:', paymentData.id);
                    break;
                    
                case 'cancelled':
                    // Payment cancelled - handle cancellation
                    await processCancelledPayment(paymentData);
                    console.log('Payment cancelled:', paymentData.id);
                    break;
            }
        }
        
        // Always respond with 200 to acknowledge receipt
        res.status(200).send('OK');
        
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Helper functions to process different payment statuses
async function processSuccessfulPayment(paymentData) {
    // TODO: Implement your business logic here
    // - Update order status in database
    // - Send confirmation email to customer
    // - Trigger service delivery (followers, comments, views)
    // - Update inventory if needed
    
    console.log(`Processing successful payment: ${paymentData.id}`);
    // Example: updateOrderStatus(paymentData.external_reference, 'completed');
}

async function processPendingPayment(paymentData) {
    // TODO: Handle pending payments
    // - Update order status to 'pending'
    // - Notify customer about pending status
    
    console.log(`Processing pending payment: ${paymentData.id}`);
}

async function processRejectedPayment(paymentData) {
    // TODO: Handle rejected payments
    // - Update order status to 'failed'
    // - Send failure notification to customer
    // - Log failure reason for analysis
    
    console.log(`Processing rejected payment: ${paymentData.id}`);
}

async function processCancelledPayment(paymentData) {
    // TODO: Handle cancelled payments
    // - Update order status to 'cancelled'
    // - Release reserved inventory if applicable
    
    console.log(`Processing cancelled payment: ${paymentData.id}`);
}
```

## Setup Instructions

### Step 1: Get Your Mercado Pago Credentials

1. Create a [Mercado Pago Developer Account](https://www.mercadopago.com.cl/developers)
2. Go to your Applications dashboard
3. Create a new application or select an existing one
4. Copy your credentials:
   - **Public Key** (for frontend): `TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
   - **Access Token** (for backend): `TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

### Step 2: Configure Frontend

In your `script.js` file, add your Public Key:

```javascript
// Replace YOUR_PUBLIC_KEY with your actual public key
const MP_PUBLIC_KEY = 'TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';

// Initialize Mercado Pago
const mp = new MercadoPago(MP_PUBLIC_KEY, {
    locale: 'es-CL'
});
```

### Step 3: Configure Backend

**Option A: Environment Variables (Recommended)**
```bash
# Set environment variable
export MP_ACCESS_TOKEN="TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

**Option B: Configuration File**
```javascript
// config.js
module.exports = {
    mercadoPago: {
        accessToken: process.env.MP_ACCESS_TOKEN || 'TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
    }
};
```

### Step 4: Install and Run Backend

```bash
# Install dependencies
npm install express cors mercadopago

# Run development server
npm run dev

# Or run production server
npm start
```

### Step 5: Test the Integration

1. Add items to cart on followers.cl
2. Click "Pagar con Mercado Pago"
3. Verify preference creation works
4. Test webhook notifications using ngrok or similar tool

## Current Implementation

The current implementation uses a simplified approach with WhatsApp integration for demo purposes. For production, you should:

1. Set up a proper backend server
2. Implement secure payment processing
3. Add user authentication
4. Store orders in a database
5. Send confirmation emails

## Security Considerations

- Never expose your Access Token on the client side
- Always validate payments server-side
- Use HTTPS for all transactions
- Implement proper error handling
- Log all transactions for auditing

## Testing

Use Mercado Pago's sandbox environment for testing:

- Test Public Key: `TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
- Test Access Token: `TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

## Support

For issues with Mercado Pago integration:
- Documentation: https://www.mercadopago.com.cl/developers
- Support: https://www.mercadopago.com.cl/ayuda