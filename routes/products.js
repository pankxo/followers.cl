const express = require('express');
const { db } = require('../config/database');

const router = express.Router();

// Get all products
router.get('/', (req, res) => {
    const { platform, limit = 50 } = req.query;
    
    let query = 'SELECT * FROM products WHERE active = 1';
    const params = [];
    
    if (platform) {
        query += ' AND platform = ?';
        params.push(platform);
    }
    
    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(parseInt(limit));

    db.all(query, params, (err, products) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(products);
    });
});

// Get product by ID
router.get('/:id', (req, res) => {
    const { id } = req.params;
    
    db.get('SELECT * FROM products WHERE id = ? AND active = 1', [id], (err, product) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        res.json(product);
    });
});

// Get products by platform
router.get('/platform/:platform', (req, res) => {
    const { platform } = req.params;
    
    db.all('SELECT * FROM products WHERE platform = ? AND active = 1 ORDER BY price ASC', 
        [platform], (err, products) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(products);
    });
});

module.exports = router;