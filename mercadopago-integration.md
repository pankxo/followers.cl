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

```javascript
// Node.js example with Express
const mercadopago = require('mercadopago');

mercadopago.configure({
    access_token: 'YOUR_ACCESS_TOKEN'
});

app.post('/create_preference', (req, res) => {
    let preference = {
        items: [
            {
                title: req.body.title,
                unit_price: parseInt(req.body.unit_price),
                quantity: parseInt(req.body.quantity),
            }
        ],
        back_urls: {
            "success": "https://followers.cl/success",
            "failure": "https://followers.cl/failure",
            "pending": "https://followers.cl/pending"
        },
        auto_return: "approved",
        notification_url: "https://followers.cl/webhook"
    };

    mercadopago.preferences.create(preference)
        .then(function(response){
            res.json({
                id: response.body.id
            });
        }).catch(function(error){
            console.log(error);
        });
});
```

### 4. Webhook Implementation

```javascript
app.post('/webhook', (req, res) => {
    const paymentId = req.body.data.id;
    
    mercadopago.payment.findById(paymentId)
        .then(function(response) {
            const payment = response.body;
            
            switch(payment.status) {
                case 'approved':
                    // Process successful payment
                    console.log('Payment approved:', payment);
                    break;
                case 'pending':
                    // Handle pending payment
                    console.log('Payment pending:', payment);
                    break;
                case 'rejected':
                    // Handle rejected payment
                    console.log('Payment rejected:', payment);
                    break;
            }
            
            res.status(200).send('OK');
        })
        .catch(function(error) {
            console.log('Error:', error);
            res.status(500).send('Error');
        });
});
```

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