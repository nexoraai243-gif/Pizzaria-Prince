import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';

// Ensure data directory exists with serverless (/tmp) fallback
const isServerless = Boolean(
  process.env.VERCEL ||
  process.env.AWS_LAMBDA_FUNCTION_NAME ||
  process.env.LAMBDA_TASK_ROOT
);

const baseDir = isServerless ? '/tmp' : path.resolve(process.cwd(), 'data');
let dataDir = process.env.DB_DIR || baseDir;

try {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
} catch (err) {
  console.warn('[Database] Could not create dataDir at', dataDir, 'falling back to /tmp', err);
  dataDir = '/tmp';
}

const dbPath = path.join(dataDir, 'pizzaria_prince.db');
export const db = new DatabaseSync(dbPath);

let isDbInitialized = false;

// Initialize database schema
export function initDb() {
  if (isDbInitialized) return;
  isDbInitialized = true;
  // Admins table
  db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at TEXT NOT NULL
    );
  `);

  // Settings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // Products table
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      image_url TEXT NOT NULL,
      price REAL NOT NULL,
      sizes_json TEXT NOT NULL,
      available INTEGER NOT NULL DEFAULT 1,
      featured INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // Orders table
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_number TEXT UNIQUE NOT NULL,
      customer_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      normalized_phone TEXT NOT NULL,
      service_type TEXT NOT NULL,
      delivery_address TEXT,
      location_reference TEXT,
      items_json TEXT NOT NULL,
      customer_notes TEXT,
      payment_method TEXT NOT NULL,
      subtotal REAL NOT NULL,
      delivery_fee REAL NOT NULL,
      total REAL NOT NULL,
      status TEXT NOT NULL,
      luanda_date TEXT NOT NULL,
      idempotency_key TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      completed_at TEXT,
      created_by TEXT DEFAULT 'customer'
    );
  `);

  // Audit logs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      admin_email TEXT NOT NULL,
      action TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_id TEXT,
      details_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  // Indexes for high performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_orders_luanda_date ON orders(luanda_date);
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
    CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
    CREATE INDEX IF NOT EXISTS idx_orders_idempotency ON orders(idempotency_key);
  `);

  seedInitialData();
}

// Password hashing helper using crypto PBKDF2
export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const generatedSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, generatedSalt, 10000, 64, 'sha512').toString('hex');
  return { hash, salt: generatedSalt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return verifyHash === hash;
}

// Luanda timezone calculations (Africa/Luanda is UTC+1 all year, no DST)
export function getLuandaDate(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Luanda',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function getLuandaYesterdayDate(): string {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  return getLuandaDate(yesterday);
}

export function getLuandaDateTimeString(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('pt-PT', {
    timeZone: 'Africa/Luanda',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date);
}

// Seed initial administrator and default products & settings if empty
function seedInitialData() {
  // Check admin
  const adminCountStmt = db.prepare('SELECT COUNT(*) as count FROM admins');
  const adminCount = (adminCountStmt.get() as { count: number }).count;

  if (adminCount === 0) {
    const adminEmail = process.env.ADMIN_INITIAL_EMAIL || 'admin@pizzariaprince.ao';
    const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || 'PrincePizza2024!';
    const { hash, salt } = hashPassword(adminPassword);

    const insertAdmin = db.prepare(`
      INSERT INTO admins (id, email, password_hash, salt, name, role, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insertAdmin.run(
      'admin-1',
      adminEmail.toLowerCase().trim(),
      hash,
      salt,
      'Administrador Geral',
      'superadmin',
      new Date().toISOString()
    );

    console.log(`[Database] Initial admin seeded: ${adminEmail}`);
  }

  // Ensure requested administrator account exists with requested password
  const targetEmail = 'nexoraai243@gmail.com';
  const targetPassword = 'kenyseixas243';
  const { hash: targetHash, salt: targetSalt } = hashPassword(targetPassword);

  const existingTarget = db.prepare('SELECT id FROM admins WHERE email = ?').get(targetEmail) as { id: string } | undefined;
  if (existingTarget) {
    db.prepare('UPDATE admins SET password_hash = ?, salt = ?, name = ? WHERE id = ?').run(
      targetHash,
      targetSalt,
      'Administrador Geral',
      existingTarget.id
    );
    console.log(`[Database] Admin credentials updated for ${targetEmail}`);
  } else {
    db.prepare(`
      INSERT INTO admins (id, email, password_hash, salt, name, role, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      'admin-nexora',
      targetEmail,
      targetHash,
      targetSalt,
      'Administrador Geral',
      'superadmin',
      new Date().toISOString()
    );
    console.log(`[Database] Admin created: ${targetEmail}`);
  }

  // Check settings
  const settingsCountStmt = db.prepare('SELECT COUNT(*) as count FROM settings');
  const settingsCount = (settingsCountStmt.get() as { count: number }).count;

  if (settingsCount === 0) {
    const defaultSettings = {
      restaurantName: 'Pizzaria Prince',
      businessType: 'Pizzaria e Restaurante de Pizzas',
      address: '4F8M+R7W, Centralidade de Cacuaco, Angola',
      phone: '+244 939 668 465',
      whatsappPhone: '244939668465',
      googleRating: '3.6',
      reviewCount: 216,
      currency: 'Kz',
      deliveryFee: 1500,
      deliveryEnabled: true,
      takeawayEnabled: true,
      dineInEnabled: true,
      openingHours: {
        weekdays: '11:00 - 20:00',
        weekends: '11:00 - 20:00',
        closingTime: '20:00',
        note: 'Aberto todos os dias até às 20:00',
      },
      disclaimer: 'Os preços apresentados são configuráveis no painel administrativo.',
    };

    const insertSetting = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)');
    insertSetting.run('restaurant_config', JSON.stringify(defaultSettings));
    console.log('[Database] Default restaurant settings seeded');
  }

  // Check products
  const productsCountStmt = db.prepare('SELECT COUNT(*) as count FROM products');
  const productsCount = (productsCountStmt.get() as { count: number }).count;

  if (productsCount === 0) {
    const defaultProducts = [
      {
        id: 'prod-pepperoni',
        name: 'Pizza Pepperoni',
        description: 'Molho de tomate especial da casa, mozzarella derretida em abundância e generosas fatias de pepperoni crocante.',
        category: 'Pizzas Clássicas',
        image_url: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80',
        price: 9500,
        sizes_json: JSON.stringify([
          { name: 'Pequena', multiplier: 0.75, price: 7500 },
          { name: 'Média', multiplier: 1.0, price: 9500, default: true },
          { name: 'Grande', multiplier: 1.35, price: 13000 },
          { name: 'Familiar', multiplier: 1.8, price: 17500 },
        ]),
        available: 1,
        featured: 1,
      },
      {
        id: 'prod-margarita',
        name: 'Pizza Margarita',
        description: 'A clássica italiana com mozzarella fresca, molho de tomate aromático, manjericão fresco e azeite virgem extra.',
        category: 'Pizzas Clássicas',
        image_url: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=800&q=80',
        price: 8500,
        sizes_json: JSON.stringify([
          { name: 'Pequena', multiplier: 0.75, price: 6500 },
          { name: 'Média', multiplier: 1.0, price: 8500, default: true },
          { name: 'Grande', multiplier: 1.35, price: 11500 },
          { name: 'Familiar', multiplier: 1.8, price: 15500 },
        ]),
        available: 1,
        featured: 1,
      },
      {
        id: 'prod-quatro-queijos',
        name: 'Pizza Quatro Queijos',
        description: 'Uma explosão de sabor com mozzarella, gorgonzola cremoso, parmesão envelhecido e catupiry suave.',
        category: 'Pizzas de Queijo',
        image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
        price: 11000,
        sizes_json: JSON.stringify([
          { name: 'Pequena', multiplier: 0.75, price: 8500 },
          { name: 'Média', multiplier: 1.0, price: 11000, default: true },
          { name: 'Grande', multiplier: 1.35, price: 15000 },
          { name: 'Familiar', multiplier: 1.8, price: 19800 },
        ]),
        available: 1,
        featured: 1,
      },
      {
        id: 'prod-vegetariana',
        name: 'Pizza Vegetariana',
        description: 'Cogumelos frescos laminados, pimentos coloridos, cebola roxa crocante, azeitonas pretas e orégãos frescos.',
        category: 'Pizzas Vegetarianas',
        image_url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80',
        price: 9000,
        sizes_json: JSON.stringify([
          { name: 'Pequena', multiplier: 0.75, price: 7000 },
          { name: 'Média', multiplier: 1.0, price: 9000, default: true },
          { name: 'Grande', multiplier: 1.35, price: 12500 },
          { name: 'Familiar', multiplier: 1.8, price: 16500 },
        ]),
        available: 1,
        featured: 0,
      },
      {
        id: 'prod-frango-catupiry',
        name: 'Pizza de Frango com Catupiry',
        description: 'Frango desfiado temperado com ervas finas, mozzarella derretida, catupiry cremoso e milho doce.',
        category: 'Pizzas de Frango',
        image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80',
        price: 10500,
        sizes_json: JSON.stringify([
          { name: 'Pequena', multiplier: 0.75, price: 8000 },
          { name: 'Média', multiplier: 1.0, price: 10500, default: true },
          { name: 'Grande', multiplier: 1.35, price: 14500 },
          { name: 'Familiar', multiplier: 1.8, price: 19000 },
        ]),
        available: 1,
        featured: 1,
      },
      {
        id: 'prod-especial-prince',
        name: 'Pizza Especial da Casa (Prince)',
        description: 'A joia da casa: carne picada especial, pepperoni crocante, cogumelos salteados, pimentos assados e queijo extra.',
        category: 'Pizzas de Carne',
        image_url: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=800&q=80',
        price: 12500,
        sizes_json: JSON.stringify([
          { name: 'Pequena', multiplier: 0.75, price: 9500 },
          { name: 'Média', multiplier: 1.0, price: 12500, default: true },
          { name: 'Grande', multiplier: 1.35, price: 17000 },
          { name: 'Familiar', multiplier: 1.8, price: 22500 },
        ]),
        available: 1,
        featured: 1,
      },
      {
        id: 'prod-pao-alho',
        name: 'Pão de Alho Especial',
        description: 'Baguete artesanal dourada no forno a lenha com manteiga de alho especial, salsa picada e queijo gratinado.',
        category: 'Acompanhamentos',
        image_url: 'https://images.unsplash.com/photo-1619895092538-128341789043?auto=format&fit=crop&w=800&q=80',
        price: 3500,
        sizes_json: JSON.stringify([
          { name: 'Porção (4 unidades)', multiplier: 1.0, price: 3500, default: true },
        ]),
        available: 1,
        featured: 0,
      },
      {
        id: 'prod-asas-frango',
        name: 'Asas de Frango Crocantes',
        description: '8 deliciosas asas marinadas em especiarias, assadas até ficarem crocantes, acompanhadas de molho barbecue ou picante.',
        category: 'Acompanhamentos',
        image_url: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=800&q=80',
        price: 5500,
        sizes_json: JSON.stringify([
          { name: '8 unidades', multiplier: 1.0, price: 5500, default: true },
        ]),
        available: 1,
        featured: 0,
      },
      {
        id: 'prod-palitos-queijo',
        name: 'Palitos de Mozzarella Crocante',
        description: 'Palitos de queijo mozzarella empanados com ervas aromáticas e servidos com molho marinara caseiro quente.',
        category: 'Acompanhamentos',
        image_url: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=800&q=80',
        price: 4500,
        sizes_json: JSON.stringify([
          { name: '6 unidades', multiplier: 1.0, price: 4500, default: true },
        ]),
        available: 1,
        featured: 0,
      },
      {
        id: 'prod-combo-familiar',
        name: 'Combo Familiar Prince',
        description: '2 Pizzas Médias à escolha + 1 Porção de Pão de Alho + 1 Bebida de 1.5L. A combinação ideal para a família reunir-se.',
        category: 'Combos',
        image_url: 'https://images.unsplash.com/photo-1544982503-9f984c14501a?auto=format&fit=crop&w=800&q=80',
        price: 21500,
        sizes_json: JSON.stringify([
          { name: 'Combo Completo', multiplier: 1.0, price: 21500, default: true },
        ]),
        available: 1,
        featured: 1,
      },
    ];

    const insertProd = db.prepare(`
      INSERT INTO products (id, name, description, category, image_url, price, sizes_json, available, featured, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const now = new Date().toISOString();
    for (const p of defaultProducts) {
      insertProd.run(
        p.id,
        p.name,
        p.description,
        p.category,
        p.image_url,
        p.price,
        p.sizes_json,
        p.available,
        p.featured,
        now,
        now
      );
    }
    console.log(`[Database] ${defaultProducts.length} default menu products seeded`);
  }
}

// Automatically ensure schema and seeds on startup
try {
  initDb();
} catch (e) {
  console.error('[Database] Failed to auto-initialize:', e);
}
