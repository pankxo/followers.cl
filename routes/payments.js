const express = require('express');
const mercadopago = require('mercadopago');
const { db } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Configure MercadoPago
mercadopago.configure({
    access_token: process.env.MERCADOPAGO_ACCESS_TOKEN || 'TEST-ACCESS-TOKEN'
});

// Create payment preference
router.post('/create-preference', authenticateToken, async (req, res) => {
    const { order_id } = req.body;
    const userId = req.user.id;

    try {
        // Get order details
        const orderQuery = `
            SELECT o.*, oi.*, p.name as product_name, p.description
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            LEFT JOIN products p ON oi.product_id = p.id
            WHERE o.id = ? AND o.user_id = ? AND o.status = 'pending'
        `;

        db.all(orderQuery, [order_id, userId], async (err, rows) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            if (rows.length === 0) {
                return res.status(404).json({ error: 'Order not found or already processed' });
            }

            const order = rows[0];
            const items = rows.map(row => ({
                title: row.product_name,
                description: row.description || '',
                quantity: row.quantity,
                currency_id: 'CLP',
                unit_price: parseFloat(row.price)
            }));

            const preference = {
                items: items,
                payer: {
                    email: req.user.email
                },
                payment_methods: {
                    excluded_payment_types: [
                        { id: "atm" }
                    ],
                    installments: 12
                },
                back_urls: {
                    success: `${req.protocol}://${req.get('host')}/payment/success?order_id=${order_id}`,
                    failure: `${req.protocol}://${req.get('host')}/payment/failure?order_id=${order_id}`,
                    pending: `${req.protocol}://${req.get('host')}/payment/pending?order_id=${order_id}`
                },
                auto_return: 'approved',
                external_reference: order_id.toString(),
                notification_url: `${req.protocol}://${req.get('host')}/api/payments/webhook`
            };

            try {
                const response = await mercadopago.preferences.create(preference);
                res.json({
                    preference_id: response.body.id,
                    init_point: response.body.init_point,
                    sandbox_init_point: response.body.sandbox_init_point
                });
            } catch (error) {
                console.error('MercadoPago error:', error);
                res.status(500).json({ error: 'Error creating payment preference' });
            }
        });
    } catch (error) {
        console.error('Payment error:', error);
        res.status(500).json({ error: 'Error processing payment' });
    }
});

// Webhook to handle payment notifications
router.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
    const { type, data } = req.body;

    if (type === 'payment') {
        const paymentId = data.id;
        
        // Get payment information from MercadoPago
        mercadopago.payment.findById(paymentId)
            .then(payment => {
                const orderRef = payment.body.external_reference;
                const status = payment.body.status;
                
                let orderStatus = 'pending';
                if (status === 'approved') {
                    orderStatus = 'paid';
                } else if (status === 'rejected') {
                    orderStatus = 'cancelled';
                }

                // Update order status
                db.run('UPDATE orders SET status = ?, payment_id = ? WHERE id = ?',
                    [orderStatus, paymentId, orderRef], (err) => {
                    if (err) {
                        console.error('Error updating order:', err);
                    } else {
                        console.log(`Order ${orderRef} updated to ${orderStatus}`);
                    }
                });
            })
            .catch(err => {
                console.error('Error processing webhook:', err);
            });
    }

    res.status(200).json({ received: true });
});

// Get payment status
router.get('/status/:order_id', authenticateToken, (req, res) => {
    const { order_id } = req.params;
    const userId = req.user.id;

    db.get('SELECT status, payment_id FROM orders WHERE id = ? AND user_id = ?',
        [order_id, userId], (err, order) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json({
            order_id: order_id,
            status: order.status,
            payment_id: order.payment_id
        });
    });
});

module.exports = router;