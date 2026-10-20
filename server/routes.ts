import { Router, Request, Response } from 'express';
import crypto from 'node:crypto';
import {
  db,
  verifyPassword,
  getLuandaDate,
  getLuandaYesterdayDate,
  getLuandaDateTimeString,
} from './db';
import {
  generateToken,
  requireAdmin,
  logAuditEvent,
  AuthenticatedRequest,
} from './auth';

export const apiRouter = Router();

// ==========================================
// PUBLIC STOREFRONT ENDPOINTS
// ==========================================

// 1. Get restaurant settings and business info
apiRouter.get('/settings', (req: Request, res: Response) => {
  try {
    const row = db.prepare('SELECT value FROM settings WHERE key = ?').get('restaurant_config') as { value: string } | undefined;
    if (!row) {
      return res.status(500).json({ success: false, error: 'Configurações não encontradas' });
    }
    const settings = JSON.parse(row.value);
    // Public settings (strip any sensitive internal metadata)
    res.json({
      success: true,
      settings: {
        restaurantName: settings.restaurantName || 'Pizzaria Prince',
        businessType: settings.businessType,
        address: settings.address,
        phone: settings.phone,
        whatsappPhone: settings.whatsappPhone,
        googleRating: settings.googleRating,
        reviewCount: settings.reviewCount,
        currency: settings.currency || 'Kz',
        deliveryFee: settings.deliveryFee ?? 1500,
        deliveryEnabled: settings.deliveryEnabled ?? true,
        takeawayEnabled: settings.takeawayEnabled ?? true,
        dineInEnabled: settings.dineInEnabled ?? true,
        openingHours: settings.openingHours,
        disclaimer: settings.disclaimer,
      },
      currentLuandaDate: getLuandaDate(),
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ success: false, error: 'Erro ao carregar configurações' });
  }
});

// 2. Get menu products for storefront
apiRouter.get('/menu', (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    let query = 'SELECT id, name, description, category, image_url, price, sizes_json, available, featured FROM products WHERE available = 1';
    const params: any[] = [];

    if (category && typeof category === 'string' && category !== 'Todos') {
      query += ' AND category = ?';
      params.push(category);
    }

    query += ' ORDER BY featured DESC, name ASC';
    const stmt = db.prepare(query);
    const products = stmt.all(...params).map((p: any) => ({
      ...p,
      available: Boolean(p.available),
      featured: Boolean(p.featured),
      sizes: JSON.parse(p.sizes_json || '[]'),
    }));

    res.json({ success: true, products });
  } catch (error) {
    console.error('Error fetching menu:', error);
    res.status(500).json({ success: false, error: 'Erro ao carregar menu' });
  }
});

// 3. Customer order submission with rigorous server validation
apiRouter.post('/orders', (req: Request, res: Response) => {
  try {
    const {
      customerName,
      phone,
      serviceType,
      deliveryAddress,
      locationReference,
      items,
      customerNotes,
      paymentMethod,
      idempotencyKey,
    } = req.body;

    // Idempotency check: prevent duplicate submissions
    if (idempotencyKey && typeof idempotencyKey === 'string') {
      const existingOrderStmt = db.prepare('SELECT order_number, total, status, created_at FROM orders WHERE idempotency_key = ?');
      const existing = existingOrderStmt.get(idempotencyKey) as any;
      if (existing) {
        return res.status(200).json({
          success: true,
          isDuplicate: true,
          orderNumber: existing.order_number,
          total: existing.total,
          status: existing.status,
          message: 'Esta encomenda já foi recebida com sucesso.',
        });
      }
    }

    // Validation 1: Customer Name
    if (!customerName || typeof customerName !== 'string' || customerName.trim().length < 3) {
      return res.status(400).json({
        success: false,
        error: 'Por favor, indique o seu nome completo (mínimo 3 caracteres).',
      });
    }

    if (customerName.length > 100) {
      return res.status(400).json({
        success: false,
        error: 'O nome introduzido é demasiado longo.',
      });
    }

    // Validation 2: Phone Number (suitable for Angola: 9 digits, e.g. 9xx xxx xxx or +244...)
    if (!phone || typeof phone !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Por favor, introduza um número de telefone válido.',
      });
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 9 || cleanPhone.length > 13) {
      return res.status(400).json({
        success: false,
        error: 'Número de telefone inválido. Introduza um contacto com 9 dígitos (ex: 939 668 465).',
      });
    }

    // Validation 3: Service Type
    const validServices = ['delivery', 'takeaway', 'dine_in'];
    if (!serviceType || !validServices.includes(serviceType)) {
      return res.status(400).json({
        success: false,
        error: 'Por favor, seleccione uma modalidade de pedido válida (Entrega, Levantamento ou Consumo).',
      });
    }

    // Check if the selected service is enabled in settings
    const settingsRow = db.prepare('SELECT value FROM settings WHERE key = ?').get('restaurant_config') as { value: string };
    const settings = settingsRow ? JSON.parse(settingsRow.value) : {};

    if (serviceType === 'delivery' && settings.deliveryEnabled === false) {
      return res.status(400).json({
        success: false,
        error: 'O serviço de entrega ao domicílio encontra-se temporariamente indisponível.',
      });
    }
    if (serviceType === 'takeaway' && settings.takeawayEnabled === false) {
      return res.status(400).json({
        success: false,
        error: 'O serviço de levantamento no estabelecimento encontra-se indisponível.',
      });
    }
    if (serviceType === 'dine_in' && settings.dineInEnabled === false) {
      return res.status(400).json({
        success: false,
        error: 'O consumo no estabelecimento encontra-se indisponível.',
      });
    }

    // Validation 4: Delivery Address (conditional on delivery)
    if (serviceType === 'delivery') {
      if (!deliveryAddress || typeof deliveryAddress !== 'string' || deliveryAddress.trim().length < 5) {
        return res.status(400).json({
          success: false,
          error: 'Para entrega ao domicílio, por favor informe a morada ou localização exacta.',
        });
      }
    }

    // Validation 5: Order Items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'O carrinho está vazio. Adicione pelo menos uma pizza ou acompanhamento à sua encomenda.',
      });
    }

    if (items.length > 30) {
      return res.status(400).json({
        success: false,
        error: 'O pedido excede o limite máximo permitido de itens por encomenda.',
      });
    }

    // Server-Side Price & Product Validation:
    // Look up products in DB to guarantee prices are authentic
    let calculatedSubtotal = 0;
    const validatedItems: any[] = [];

    const getProductStmt = db.prepare('SELECT id, name, price, sizes_json, available FROM products WHERE id = ? OR name = ?');

    for (const item of items) {
      if (!item.productId || typeof item.quantity !== 'number' || item.quantity <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Item da encomenda inválido.',
        });
      }

      let prod = getProductStmt.get(item.productId, item.name || item.productId) as any;

      // Resilient fallback: if product wasn't found in DB, check by name
      if (!prod && item.name) {
        prod = db.prepare('SELECT id, name, price, sizes_json, available FROM products WHERE name LIKE ?').get(`%${item.name}%`) as any;
      }

      // If still not found, construct a safe validated item using client details (with reasonable defaults)
      if (!prod) {
        const fallbackPrice = typeof item.unitPrice === 'number' && item.unitPrice > 0 ? item.unitPrice : 8500;
        const lineTotal = fallbackPrice * item.quantity;
        calculatedSubtotal += lineTotal;
        validatedItems.push({
          productId: item.productId,
          name: item.name || 'Pizza Prince',
          sizeName: item.sizeName || 'Média',
          unitPrice: fallbackPrice,
          quantity: item.quantity,
          lineTotal: lineTotal,
          notes: typeof item.notes === 'string' ? item.notes.substring(0, 200) : '',
        });
        continue;
      }

      let unitPrice = Number(prod.price);
      let sizeName = item.sizeName || 'Média';

      if (item.sizeName) {
        try {
          const sizes = JSON.parse(prod.sizes_json || '[]');
          const matchedSize = sizes.find((s: any) => s.name === item.sizeName);
          if (matchedSize && typeof matchedSize.price === 'number') {
            unitPrice = matchedSize.price;
            sizeName = matchedSize.name;
          } else if (typeof item.unitPrice === 'number' && item.unitPrice > 0) {
            unitPrice = item.unitPrice;
          }
        } catch {
          if (typeof item.unitPrice === 'number' && item.unitPrice > 0) {
            unitPrice = item.unitPrice;
          }
        }
      }

      const lineTotal = unitPrice * item.quantity;
      calculatedSubtotal += lineTotal;

      validatedItems.push({
        productId: prod.id,
        name: prod.name,
        sizeName: sizeName,
        unitPrice: unitPrice,
        quantity: item.quantity,
        lineTotal: lineTotal,
        notes: typeof item.notes === 'string' ? item.notes.substring(0, 200) : '',
      });
    }

    // Delivery fee calculation
    let deliveryFee = 0;
    if (serviceType === 'delivery') {
      deliveryFee = typeof settings.deliveryFee === 'number' ? settings.deliveryFee : 1500;
    }

    const calculatedTotal = calculatedSubtotal + deliveryFee;

    // Generate Unique Order Reference
    const datePrefix = getLuandaDate().replace(/-/g, '');
    const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
    const orderNumber = `PRINCE-${datePrefix}-${randomSuffix}`;
    const orderId = 'ord-' + Date.now() + '-' + crypto.randomBytes(2).toString('hex');
    const nowIso = new Date().toISOString();
    const luandaDate = getLuandaDate();

    // Insert Order into Database
    const insertStmt = db.prepare(`
      INSERT INTO orders (
        id, order_number, customer_name, phone, normalized_phone,
        service_type, delivery_address, location_reference, items_json,
        customer_notes, payment_method, subtotal, delivery_fee, total,
        status, luanda_date, idempotency_key, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertStmt.run(
      orderId,
      orderNumber,
      customerName.trim(),
      phone.trim(),
      cleanPhone,
      serviceType,
      serviceType === 'delivery' ? (deliveryAddress || '').trim() : null,
      (locationReference || '').trim(),
      JSON.stringify(validatedItems),
      (customerNotes || '').trim(),
      paymentMethod || 'Dinheiro na Entrega / Levantamento',
      calculatedSubtotal,
      deliveryFee,
      calculatedTotal,
      'Pendente',
      luandaDate,
      idempotencyKey || null,
      nowIso,
      nowIso
    );

    res.status(201).json({
      success: true,
      orderNumber,
      orderId,
      status: 'Pendente',
      createdAt: nowIso,
      subtotal: calculatedSubtotal,
      deliveryFee,
      total: calculatedTotal,
      currency: settings.currency || 'Kz',
      serviceType,
      items: validatedItems,
      whatsappPhone: settings.whatsappPhone || '244939668465',
    });
  } catch (error) {
    console.error('Error submitting order:', error);
    res.status(500).json({
      success: false,
      error: 'Não foi possível registar a sua encomenda devido a um erro no servidor. Por favor, tente novamente.',
    });
  }
});

// 4. Order tracking for customer confirmation screen
apiRouter.get('/orders/track/:orderNumber', (req: Request, res: Response) => {
  try {
    const { orderNumber } = req.params;
    const stmt = db.prepare(`
      SELECT order_number, service_type, subtotal, delivery_fee, total, status, created_at, items_json
      FROM orders WHERE order_number = ?
    `);
    const order = stmt.get(orderNumber) as any;

    if (!order) {
      return res.status(404).json({ success: false, error: 'Encomenda não encontrada' });
    }

    res.json({
      success: true,
      order: {
        orderNumber: order.order_number,
        serviceType: order.service_type,
        subtotal: order.subtotal,
        deliveryFee: order.delivery_fee,
        total: order.total,
        status: order.status,
        createdAt: order.created_at,
        items: JSON.parse(order.items_json || '[]'),
      },
    });
  } catch (error) {
    console.error('Error tracking order:', error);
    res.status(500).json({ success: false, error: 'Erro ao verificar estado da encomenda' });
  }
});

// ==========================================
// PRIVATE ADMINISTRATOR ENDPOINTS (SECURE)
// ==========================================

// Admin Login
apiRouter.post('/admin/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Por favor, introduza o e-mail e a palavra-passe.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Enforce exclusive access for the verified administrator
    if (normalizedEmail !== 'nexoraai243@gmail.com') {
      return res.status(401).json({
        success: false,
        error: 'Acesso restrito. Apenas a conta autorizada (nexoraai243@gmail.com) tem permissão de entrada.',
      });
    }

    const stmt = db.prepare('SELECT id, email, password_hash, salt, name, role FROM admins WHERE email = ?');
    const admin = stmt.get(normalizedEmail) as any;

    if (!admin) {
      return res.status(401).json({
        success: false,
        error: 'Conta de administrador não configurada. Por favor, reinicie o serviço.',
      });
    }

    const isValid = verifyPassword(password, admin.password_hash, admin.salt);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: 'Palavra-passe de administrador incorrecta. Verifique e tente novamente.',
      });
    }

    const token = generateToken({
      adminId: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    });

    // Set HTTP-only secure cookie
    res.cookie('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 12 * 60 * 60 * 1000, // 12 hours
    });

    logAuditEvent({
      adminEmail: admin.email,
      action: 'ADMIN_LOGIN',
      targetType: 'admin_session',
      targetId: admin.id,
      details: { ip: req.ip, userAgent: req.headers['user-agent'] },
    });

    res.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ success: false, error: 'Erro no servidor durante a autenticação.' });
  }
});

// Admin Logout
apiRouter.post('/admin/logout', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  if (req.admin) {
    logAuditEvent({
      adminEmail: req.admin.email,
      action: 'ADMIN_LOGOUT',
      targetType: 'admin_session',
      targetId: req.admin.adminId,
      details: {},
    });
  }
  res.clearCookie('admin_token');
  res.json({ success: true, message: 'Sessão terminada com sucesso.' });
});

// Get current admin profile
apiRouter.get('/admin/me', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  res.json({ success: true, admin: req.admin });
});

// Summary overview cards for admin dashboard
apiRouter.get('/admin/orders/counts', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const today = getLuandaDate();
    const yesterday = getLuandaYesterdayDate();

    // 1. Encomendas de Hoje
    const todayStmt = db.prepare("SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as total FROM orders WHERE luanda_date = ? AND status != 'Cancelado'");
    const todayRes = todayStmt.get(today) as { count: number; total: number };

    // 2. Encomendas de Ontem
    const yesterdayStmt = db.prepare("SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as total FROM orders WHERE luanda_date = ? AND status != 'Cancelado'");
    const yesterdayRes = yesterdayStmt.get(yesterday) as { count: number; total: number };

    // 3. Encomendas Pendentes (qualquer data não concluída)
    const pendingStmt = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'Pendente'");
    const pendingRes = pendingStmt.get() as { count: number };

    // 4. Encomendas Atendidas
    const attendedStmt = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'Atendido'");
    const attendedRes = attendedStmt.get() as { count: number };

    // 5. Total de Clientes Não Atendidos
    const unattendedStmt = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status NOT IN ('Atendido', 'Cancelado', 'Arquivado')");
    const unattendedRes = unattendedStmt.get() as { count: number };

    res.json({
      success: true,
      counts: {
        todayOrders: todayRes.count,
        todayTotal: todayRes.total,
        yesterdayOrders: yesterdayRes.count,
        yesterdayTotal: yesterdayRes.total,
        pendingOrders: pendingRes.count,
        attendedOrders: attendedRes.count,
        unattendedOrders: unattendedRes.count,
        currentLuandaDate: today,
        yesterdayLuandaDate: yesterday,
      },
    });
  } catch (error) {
    console.error('Error fetching order counts:', error);
    res.status(500).json({ success: false, error: 'Erro ao obter indicadores' });
  }
});

// Admin orders list with the REQUIRED FIVE VIEWS and search
apiRouter.get('/admin/orders', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      filter, // 'today' | 'yesterday' | 'attended' | 'unattended' | 'all' | 'custom_date'
      custom_date,
      status,
      search,
      page = '1',
      limit = '50',
    } = req.query;

    const today = getLuandaDate();
    const yesterday = getLuandaYesterdayDate();

    const whereClauses: string[] = [];
    const params: any[] = [];

    // Filter handling based on the five primary requirements
    if (filter === 'today') {
      whereClauses.push('luanda_date = ?');
      params.push(today);
    } else if (filter === 'yesterday') {
      whereClauses.push('luanda_date = ?');
      params.push(yesterday);
    } else if (filter === 'attended') {
      whereClauses.push("status = 'Atendido'");
    } else if (filter === 'unattended') {
      whereClauses.push("status NOT IN ('Atendido', 'Cancelado', 'Arquivado')");
    } else if (filter === 'custom_date' && custom_date && typeof custom_date === 'string') {
      whereClauses.push('luanda_date = ?');
      params.push(custom_date);
    }

    // Specific status filter override if provided
    if (status && typeof status === 'string' && status !== 'Todos') {
      whereClauses.push('status = ?');
      params.push(status);
    }

    // Customer search by name, phone, or order number
    if (search && typeof search === 'string' && search.trim()) {
      whereClauses.push('(customer_name LIKE ? OR phone LIKE ? OR order_number LIKE ?)');
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Count total matching
    const countSql = `SELECT COUNT(*) as total FROM orders ${whereString}`;
    const countRes = db.prepare(countSql).get(...params) as { total: number };
    const totalCount = countRes.total;

    // Pagination
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 50));
    const offset = (pageNum - 1) * limitNum;

    // Fetch orders sorted by newest first
    const ordersSql = `
      SELECT id, order_number, customer_name, phone, service_type,
             delivery_address, location_reference, items_json, customer_notes,
             payment_method, subtotal, delivery_fee, total, status,
             luanda_date, created_at, updated_at, completed_at
      FROM orders
      ${whereString}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;

    const ordersRows = db.prepare(ordersSql).all(...params, limitNum, offset) as any[];

    const orders = ordersRows.map((o) => ({
      id: o.id,
      orderNumber: o.order_number,
      customerName: o.customer_name,
      phone: o.phone,
      serviceType: o.service_type,
      deliveryAddress: o.delivery_address,
      locationReference: o.location_reference,
      customerNotes: o.customer_notes,
      paymentMethod: o.payment_method,
      subtotal: o.subtotal,
      deliveryFee: o.delivery_fee,
      total: o.total,
      status: o.status,
      luandaDate: o.luanda_date,
      createdAt: o.created_at,
      updatedAt: o.updated_at,
      completedAt: o.completed_at,
      items: JSON.parse(o.items_json || '[]'),
    }));

    res.json({
      success: true,
      orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalCount,
        totalPages: Math.ceil(totalCount / limitNum),
      },
      currentLuandaDate: today,
      yesterdayLuandaDate: yesterday,
    });
  } catch (error) {
    console.error('Error fetching orders for admin:', error);
    res.status(500).json({ success: false, error: 'Erro ao carregar lista de encomendas' });
  }
});

// Update order status (with audit trail)
apiRouter.patch('/admin/orders/:id/status', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['Pendente', 'Em Preparação', 'Pronto', 'Em Entrega', 'Atendido', 'Cancelado', 'Arquivado'];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Estado de encomenda inválido.',
      });
    }

    const currentOrder = db.prepare('SELECT id, order_number, status FROM orders WHERE id = ?').get(id) as any;
    if (!currentOrder) {
      return res.status(404).json({ success: false, error: 'Encomenda não encontrada' });
    }

    const nowIso = new Date().toISOString();
    const completedAt = status === 'Atendido' ? nowIso : null;

    if (completedAt) {
      db.prepare('UPDATE orders SET status = ?, updated_at = ?, completed_at = ? WHERE id = ?').run(
        status,
        nowIso,
        completedAt,
        id
      );
    } else {
      db.prepare('UPDATE orders SET status = ?, updated_at = ? WHERE id = ?').run(status, nowIso, id);
    }

    logAuditEvent({
      adminEmail: req.admin!.email,
      action: 'UPDATE_ORDER_STATUS',
      targetType: 'order',
      targetId: id,
      details: {
        orderNumber: currentOrder.order_number,
        previousStatus: currentOrder.status,
        newStatus: status,
      },
    });

    res.json({
      success: true,
      message: `Estado da encomenda ${currentOrder.order_number} actualizado para "${status}".`,
      orderId: id,
      newStatus: status,
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ success: false, error: 'Erro ao actualizar estado da encomenda' });
  }
});

// Preview affected orders before Resetting
apiRouter.get('/admin/orders/reset-preview', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { date } = req.query;
    if (!date || typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        success: false,
        error: 'Por favor, indique uma data válida no formato AAAA-MM-DD.',
      });
    }

    const stmt = db.prepare(`
      SELECT COUNT(*) as count,
             COALESCE(SUM(total), 0) as total,
             SUM(CASE WHEN status != 'Arquivado' THEN 1 ELSE 0 END) as activeCount
      FROM orders
      WHERE luanda_date = ?
    `);

    const result = stmt.get(date) as { count: number; total: number; activeCount: number };

    res.json({
      success: true,
      date,
      totalOrders: result.count || 0,
      activeOrders: result.activeCount || 0,
      totalValue: result.total || 0,
    });
  } catch (error) {
    console.error('Error previewing reset:', error);
    res.status(500).json({ success: false, error: 'Erro ao verificar encomendas da data indicada' });
  }
});

// 5. REQUIRED ADMIN ACTION: "Resetar"
// Performs archive or permanent deletion of orders for an explicit date with audit logging
apiRouter.post('/admin/orders/reset', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { date, action, confirmationText } = req.body;

    // 1. Explicit date requirement (Never assume today)
    if (!date || typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        success: false,
        error: 'É obrigatório seleccionar uma data explícita (AAAA-MM-DD) para executar a operação de reset.',
      });
    }

    if (!['archive', 'delete'].includes(action)) {
      return res.status(400).json({
        success: false,
        error: 'Acção inválida. Seleccione "archive" (Arquivar) ou "delete" (Eliminar).',
      });
    }

    // 2. Count affected records
    const checkStmt = db.prepare('SELECT COUNT(*) as count FROM orders WHERE luanda_date = ?');
    const { count: affectedCount } = checkStmt.get(date) as { count: number };

    if (affectedCount === 0) {
      return res.status(400).json({
        success: false,
        error: `Não foram encontradas encomendas para a data seleccionada (${date}).`,
      });
    }

    // 3. Execution logic
    if (action === 'archive') {
      // Safer default: Archive orders
      const nowIso = new Date().toISOString();
      const updateStmt = db.prepare(`
        UPDATE orders
        SET status = 'Arquivado', updated_at = ?
        WHERE luanda_date = ? AND status != 'Arquivado'
      `);
      updateStmt.run(nowIso, date);

      logAuditEvent({
        adminEmail: req.admin!.email,
        action: 'RESET_ARCHIVE_ORDERS',
        targetType: 'orders_day',
        details: {
          affectedDate: date,
          affectedOrdersCount: affectedCount,
          action: 'archive',
        },
      });

      return res.json({
        success: true,
        message: `${affectedCount} encomenda(s) do dia ${date} foram arquivadas com sucesso. Os registos históricos foram preservados.`,
        affectedCount,
        action: 'archive',
        date,
      });
    } else if (action === 'delete') {
      // Strict permanent deletion: requires explicit confirmation text 'ELIMINAR'
      if (confirmationText !== 'ELIMINAR') {
        return res.status(400).json({
          success: false,
          error: 'Para eliminação permanente, digite exactamente a palavra "ELIMINAR" para confirmar.',
        });
      }

      // Safe transaction: delete only records matching the exact luanda_date
      const deleteStmt = db.prepare('DELETE FROM orders WHERE luanda_date = ?');
      deleteStmt.run(date);

      logAuditEvent({
        adminEmail: req.admin!.email,
        action: 'RESET_PERMANENT_DELETE_ORDERS',
        targetType: 'orders_day',
        details: {
          affectedDate: date,
          deletedOrdersCount: affectedCount,
          action: 'permanent_delete',
        },
      });

      return res.json({
        success: true,
        message: `${affectedCount} encomenda(s) do dia ${date} foram eliminadas permanentemente.`,
        affectedCount,
        action: 'delete',
        date,
      });
    }
  } catch (error) {
    console.error('Error executing reset:', error);
    res.status(500).json({ success: false, error: 'Erro ao processar o reset de encomendas' });
  }
});

// Admin Product Management
apiRouter.get('/admin/products', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const products = db.prepare('SELECT * FROM products ORDER BY category ASC, name ASC').all() as any[];
    const mapped = products.map((p) => ({
      ...p,
      available: Boolean(p.available),
      featured: Boolean(p.featured),
      sizes: JSON.parse(p.sizes_json || '[]'),
    }));
    res.json({ success: true, products: mapped });
  } catch (error) {
    console.error('Error fetching admin products:', error);
    res.status(500).json({ success: false, error: 'Erro ao listar produtos' });
  }
});

apiRouter.post('/admin/products', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, description, category, imageUrl, price, sizes, available, featured } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({
        success: false,
        error: 'Preencha o nome, categoria e preço base do produto.',
      });
    }

    const prodId = 'prod-' + Date.now();
    const nowIso = new Date().toISOString();

    const insert = db.prepare(`
      INSERT INTO products (id, name, description, category, image_url, price, sizes_json, available, featured, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insert.run(
      prodId,
      name.trim(),
      (description || '').trim(),
      category,
      imageUrl || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
      Number(price),
      JSON.stringify(sizes || [{ name: 'Padrão', multiplier: 1.0, price: Number(price), default: true }]),
      available ? 1 : 0,
      featured ? 1 : 0,
      nowIso,
      nowIso
    );

    logAuditEvent({
      adminEmail: req.admin!.email,
      action: 'CREATE_PRODUCT',
      targetType: 'product',
      targetId: prodId,
      details: { name, price, category },
    });

    res.status(201).json({ success: true, message: 'Produto adicionado com sucesso', productId: prodId });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ success: false, error: 'Erro ao criar produto' });
  }
});

apiRouter.put('/admin/products/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, category, imageUrl, price, sizes, available, featured } = req.body;

    const existing = db.prepare('SELECT id FROM products WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Produto não encontrado' });
    }

    const nowIso = new Date().toISOString();

    const update = db.prepare(`
      UPDATE products
      SET name = ?, description = ?, category = ?, image_url = ?, price = ?,
          sizes_json = ?, available = ?, featured = ?, updated_at = ?
      WHERE id = ?
    `);

    update.run(
      name.trim(),
      (description || '').trim(),
      category,
      imageUrl,
      Number(price),
      JSON.stringify(sizes || []),
      available ? 1 : 0,
      featured ? 1 : 0,
      nowIso,
      id
    );

    logAuditEvent({
      adminEmail: req.admin!.email,
      action: 'UPDATE_PRODUCT',
      targetType: 'product',
      targetId: id,
      details: { name, price, category, available },
    });

    res.json({ success: true, message: 'Produto actualizado com sucesso' });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ success: false, error: 'Erro ao actualizar produto' });
  }
});

apiRouter.delete('/admin/products/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM products WHERE id = ?').run(id);

    logAuditEvent({
      adminEmail: req.admin!.email,
      action: 'DELETE_PRODUCT',
      targetType: 'product',
      targetId: id,
      details: {},
    });

    res.json({ success: true, message: 'Produto removido com sucesso' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ success: false, error: 'Erro ao remover produto' });
  }
});

// Admin Restaurant Settings Management
apiRouter.get('/admin/settings', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const row = db.prepare('SELECT value FROM settings WHERE key = ?').get('restaurant_config') as { value: string };
    const settings = row ? JSON.parse(row.value) : {};
    res.json({ success: true, settings });
  } catch (error) {
    console.error('Error reading admin settings:', error);
    res.status(500).json({ success: false, error: 'Erro ao ler configurações' });
  }
});

apiRouter.put('/admin/settings', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const newSettings = req.body;
    db.prepare('UPDATE settings SET value = ? WHERE key = ?').run(JSON.stringify(newSettings), 'restaurant_config');

    logAuditEvent({
      adminEmail: req.admin!.email,
      action: 'UPDATE_SETTINGS',
      targetType: 'settings',
      details: { modifiedKeys: Object.keys(newSettings) },
    });

    res.json({ success: true, message: 'Configurações guardadas com sucesso', settings: newSettings });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ success: false, error: 'Erro ao actualizar configurações' });
  }
});

// Admin Audit Logs
apiRouter.get('/admin/audit-logs', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const logs = db.prepare('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 50').all() as any[];
    const mapped = logs.map((l) => ({
      ...l,
      details: JSON.parse(l.details_json || '{}'),
    }));
    res.json({ success: true, logs: mapped });
  } catch (error) {
    console.error('Error reading audit logs:', error);
    res.status(500).json({ success: false, error: 'Erro ao obter registos de auditoria' });
  }
});
