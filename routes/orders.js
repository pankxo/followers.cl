const express = require('express');
const { body, validationResult } = require('express-validator');
const { db } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Create order
router.post('/', authenticateToken, [
    body('items').isArray({ min: 1 }),
    body('shipping_info').optional().isString()
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { items, shipping_info = '' } = req.body;
    const userId = req.user.id;

    // Calculate total amount
    let totalAmount = 0;
    let validItems = [];

    const checkItems = items.map((item, index) => {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM products WHERE id = ? AND active = 1', 
                [item.product_id], (err, product) => {
                if (err) return reject(err);
                if (!product) return reject(new Error(`Product ${item.product_id} not found`));
                
                const itemTotal = product.price * item.quantity;
                totalAmount += itemTotal;
                validItems.push({
                    product_id: item.product_id,
                    quantity: item.quantity,
                    price: product.price
                });
                resolve();
            });
        });
    });

    Promise.all(checkItems)
        .then(() => {
            // Create order
            db.run('INSERT INTO orders (user_id, total_amount, status, shipping_info) VALUES (?, ?, ?, ?)',
                [userId, totalAmount, 'pending', shipping_info], function(err) {
                if (err) {
                    return res.status(500).json({ error: 'Error creating order' });
                }

                const orderId = this.lastID;
                
                // Insert order items
                const stmt = db.prepare('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)');
                
                validItems.forEach(item => {
                    stmt.run([orderId, item.product_id, item.quantity, item.price]);
                });
                
                stmt.finalize((err) => {
                    if (err) {
                        return res.status(500).json({ error: 'Error creating order items' });
                    }
                    
                    res.json({
                        order_id: orderId,
                        total_amount: totalAmount,
                        status: 'pending',
                        message: 'Order created successfully'
                    });
                });
            });
        })
        .catch(error => {
            res.status(400).json({ error: error.message });
        });
});

// Get user orders
router.get('/', authenticateToken, (req, res) => {
    const userId = req.user.id;
    
    const query = `
        SELECT o.*, 
               GROUP_CONCAT(p.name || ' (' || oi.quantity || 'x)') as items
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE o.user_id = ?
        GROUP BY o.id
        ORDER BY o.created_at DESC
    `;
    
    db.all(query, [userId], (err, orders) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(orders);
    });
});

// Get order by ID
router.get('/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    
    const query = `
        SELECT o.*, oi.*, p.name as product_name, p.platform
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE o.id = ? AND o.user_id = ?
    `;
    
    db.all(query, [id, userId], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        const order = {
            id: rows[0].id,
            user_id: rows[0].user_id,
            total_amount: rows[0].total_amount,
            status: rows[0].status,
            payment_id: rows[0].payment_id,
            shipping_info: rows[0].shipping_info,
            created_at: rows[0].created_at,
            items: rows.map(row => ({
                product_id: row.product_id,
                product_name: row.product_name,
                platform: row.platform,
                quantity: row.quantity,
                price: row.price
            }))
        };
        
        res.json(order);
    });
});

module.exports = router;