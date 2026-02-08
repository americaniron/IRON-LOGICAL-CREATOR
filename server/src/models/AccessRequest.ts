import db from '../config/database';

export interface AccessRequest {
  id: string;
  name: string;
  reason: string;
  status: 'pending' | 'approved' | 'denied';
  generated_pin?: string;
  created_at: Date;
  updated_at: Date;
}

export class AccessRequestModel {
  // Create new access request
  static async create(name: string, reason: string): Promise<AccessRequest> {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    const result = await db.query(
      `INSERT INTO access_requests (id, name, reason, status, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, NOW(), NOW()) 
       RETURNING *`,
      [requestId, name, reason, 'pending']
    );
    
    return result.rows[0];
  }

  // Get all requests (admin only)
  static async getAll(): Promise<AccessRequest[]> {
    const result = await db.query(
      'SELECT * FROM access_requests ORDER BY created_at DESC'
    );
    return result.rows;
  }

  // Get request by name
  static async getByName(name: string): Promise<AccessRequest | null> {
    const result = await db.query(
      `SELECT * FROM access_requests 
       WHERE LOWER(name) = LOWER($1) 
       ORDER BY 
         CASE WHEN status = 'approved' THEN 1 ELSE 2 END,
         created_at DESC 
       LIMIT 1`,
      [name]
    );
    
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  // Approve request
  static async approve(requestId: string, generatedPin: string): Promise<void> {
    await db.query(
      `UPDATE access_requests 
       SET status = 'approved', generated_pin = $1, updated_at = NOW() 
       WHERE id = $2`,
      [generatedPin, requestId]
    );
  }

  // Deny request
  static async deny(requestId: string): Promise<void> {
    await db.query(
      `UPDATE access_requests 
       SET status = 'denied', updated_at = NOW() 
       WHERE id = $1`,
      [requestId]
    );
  }
}
