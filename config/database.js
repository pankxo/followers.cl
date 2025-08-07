const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const init = () => {
    // Create tables
    db.serialize(() => {
        // Users table
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                name TEXT NOT NULL,
                role TEXT DEFAULT 'user',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Products table
        db.run(`
            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                price DECIMAL(10,2) NOT NULL,
                quantity INTEGER NOT NULL,
                platform TEXT NOT NULL,
                image_url TEXT,
                active BOOLEAN DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Orders table
        db.run(`
            CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                total_amount DECIMAL(10,2) NOT NULL,
                status TEXT DEFAULT 'pending',
                payment_id TEXT,
                shipping_info TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        `);

        // Order items table
        db.run(`
            CREATE TABLE IF NOT EXISTS order_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_id INTEGER NOT NULL,
                product_id INTEGER NOT NULL,
                quantity INTEGER NOT NULL,
                price DECIMAL(10,2) NOT NULL,
                FOREIGN KEY (order_id) REFERENCES orders (id),
                FOREIGN KEY (product_id) REFERENCES products (id)
            )
        `);

        // Create admin user if it doesn't exist
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@followers.cl';
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
        
        db.get('SELECT id FROM users WHERE email = ?', [adminEmail], (err, row) => {
            if (err) {
                console.error('Error checking admin user:', err);
                return;
            }
            
            if (!row) {
                const hashedPassword = bcrypt.hashSync(adminPassword, 10);
                db.run('INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)', 
                    [adminEmail, hashedPassword, 'Administrator', 'admin'], (err) => {
                    if (err) {
                        console.error('Error creating admin user:', err);
                    } else {
                        console.log('✅ Admin user created successfully');
                    }
                });
            }
        });

        // Insert sample products
        db.get('SELECT id FROM products LIMIT 1', (err, row) => {
            if (err) {
                console.error('Error checking products:', err);
                return;
            }
            
            if (!row) {
                const sampleProducts = [
                    ['Seguidores Instagram - Paquete Básico', '1000 seguidores reales para Instagram', 9.99, 1000, 'instagram', '/images/instagram-basic.jpg'],
                    ['Seguidores Instagram - Paquete Premium', '5000 seguidores reales para Instagram', 39.99, 5000, 'instagram', '/images/instagram-premium.jpg'],
                    ['Seguidores Instagram - Paquete VIP', '10000 seguidores reales para Instagram', 69.99, 10000, 'instagram', '/images/instagram-vip.jpg'],
                    ['Seguidores TikTok - Paquete Básico', '1000 seguidores reales para TikTok', 8.99, 1000, 'tiktok', '/images/tiktok-basic.jpg'],
                    ['Seguidores TikTok - Paquete Premium', '5000 seguidores reales para TikTok', 34.99, 5000, 'tiktok', '/images/tiktok-premium.jpg'],
                    ['Seguidores YouTube - Paquete Básico', '500 suscriptores reales para YouTube', 14.99, 500, 'youtube', '/images/youtube-basic.jpg']
                ];

                const stmt = db.prepare('INSERT INTO products (name, description, price, quantity, platform, image_url) VALUES (?, ?, ?, ?, ?, ?)');
                
                sampleProducts.forEach(product => {
                    stmt.run(product);
                });
                
                stmt.finalize(() => {
                    console.log('✅ Sample products inserted successfully');
                });
            }
        });
    });

    console.log('✅ Database initialized successfully');
};

module.exports = {
    db,
    init
};