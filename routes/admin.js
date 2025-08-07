const express = require('express');
const { body, validationResult } = require('express-validator');
const { db } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// Get all products (including inactive)
router.get('/products', (req, res) => {
    db.all('SELECT * FROM products ORDER BY created_at DESC', (err, products) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(products);
    });
});

// Create product
router.post('/products', [
    body('name').notEmpty().trim(),
    body('description').optional().trim(),
    body('price').isFloat({ min: 0 }),
    body('quantity').isInt({ min: 0 }),
    body('platform').notEmpty().trim(),
    body('image_url').optional().trim()
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, price, quantity, platform, image_url } = req.body;

    db.run('INSERT INTO products (name, description, price, quantity, platform, image_url) VALUES (?, ?, ?, ?, ?, ?)',
        [name, description || '', price, quantity, platform, image_url || ''], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Error creating product' });
        }

        res.json({
            id: this.lastID,
            message: 'Product created successfully'
        });
    });
});

// Update product
router.put('/products/:id', [
    body('name').optional().notEmpty().trim(),
    body('description').optional().trim(),
    body('price').optional().isFloat({ min: 0 }),
    body('quantity').optional().isInt({ min: 0 }),
    body('platform').optional().notEmpty().trim(),
    body('image_url').optional().trim(),
    body('active').optional().isBoolean()
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updates = req.body;
    
    const fields = [];
    const values = [];
    
    Object.keys(updates).forEach(key => {
        if (updates[key] !== undefined) {
            fields.push(`${key} = ?`);
            values.push(updates[key]);
        }
    });
    
    if (fields.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
    }
    
    values.push(id);
    
    const query = `UPDATE products SET ${fields.join(', ')} WHERE id = ?`;
    
    db.run(query, values, function(err) {
        if (err) {
            return res.status(500).json({ error: 'Error updating product' });
        }
        
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        res.json({ message: 'Product updated successfully' });
    });
});

// Delete product
router.delete('/products/:id', (req, res) => {
    const { id } = req.params;
    
    db.run('UPDATE products SET active = 0 WHERE id = ?', [id], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Error deactivating product' });
        }
        
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        res.json({ message: 'Product deactivated successfully' });
    });
});

// Get all orders
router.get('/orders', (req, res) => {
    const query = `
        SELECT o.*, u.email as user_email, u.name as user_name,
               GROUP_CONCAT(p.name || ' (' || oi.quantity || 'x)') as items
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        LEFT JOIN order_items oi ON o.id = oi.order_id
        LEFT JOIN products p ON oi.product_id = p.id
        GROUP BY o.id
        ORDER BY o.created_at DESC
    `;
    
    db.all(query, (err, orders) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(orders);
    });
});

// Update order status
router.put('/orders/:id/status', [
    body('status').isIn(['pending', 'paid', 'processing', 'completed', 'cancelled'])
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { status } = req.body;
    
    db.run('UPDATE orders SET status = ? WHERE id = ?', [status, id], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Error updating order status' });
        }
        
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        res.json({ message: 'Order status updated successfully' });
    });
});

// Get dashboard stats
router.get('/stats', (req, res) => {
    const stats = {};
    
    // Get total orders
    db.get('SELECT COUNT(*) as total_orders FROM orders', (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        stats.total_orders = row.total_orders;
        
        // Get total revenue
        db.get('SELECT SUM(total_amount) as total_revenue FROM orders WHERE status IN ("paid", "completed")', (err, row) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            stats.total_revenue = row.total_revenue || 0;
            
            // Get total products
            db.get('SELECT COUNT(*) as total_products FROM products WHERE active = 1', (err, row) => {
                if (err) {
                    return res.status(500).json({ error: 'Database error' });
                }
                stats.total_products = row.total_products;
                
                // Get total users
                db.get('SELECT COUNT(*) as total_users FROM users WHERE role != "admin"', (err, row) => {
                    if (err) {
                        return res.status(500).json({ error: 'Database error' });
                    }
                    stats.total_users = row.total_users;
                    
                    res.json(stats);
                });
            });
        });
    });
});

module.exports = router;