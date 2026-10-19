import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'pizzaria-prince-secret-key-change-in-production';

export interface AdminPayload {
  adminId: string;
  email: string;
  name: string;
  role: string;
}

export interface AuthenticatedRequest extends Request {
  admin?: AdminPayload;
}

export function generateToken(payload: AdminPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' });
}

export function verifyToken(token: string): AdminPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AdminPayload;
  } catch {
    return null;
  }
}

// Middleware to enforce administrator authentication
export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  let token: string | undefined;

  // 1. Authorization header: Bearer <token>
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (req.cookies && req.cookies.admin_token) {
    // 2. Cookie fallback
    token = req.cookies.admin_token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Acesso não autorizado. Inicie sessão como administrador.',
    });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({
      success: false,
      error: 'Sessão inválida ou expirada. Inicie sessão novamente.',
    });
  }

  // Check admin still exists in database
  const stmt = db.prepare('SELECT id, email, name, role FROM admins WHERE id = ?');
  const admin = stmt.get(payload.adminId) as AdminPayload | undefined;

  if (!admin) {
    return res.status(403).json({
      success: false,
      error: 'Conta de administrador não encontrada ou inactiva.',
    });
  }

  req.admin = payload;
  next();
}

// Record an audit log for sensitive administrator actions
export function logAuditEvent(params: {
  adminEmail: string;
  action: string;
  targetType: string;
  targetId?: string;
  details: Record<string, unknown>;
}) {
  try {
    const insert = db.prepare(`
      INSERT INTO audit_logs (id, admin_email, action, target_type, target_id, details_json, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const logId = 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
    insert.run(
      logId,
      params.adminEmail,
      params.action,
      params.targetType,
      params.targetId || null,
      JSON.stringify(params.details),
      new Date().toISOString()
    );
  } catch (err) {
    console.error('[Audit Log Error]', err);
  }
}
