import db from '../config/database';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../config';
import { v4 as uuidv4 } from 'uuid';

export interface User {
  id: string;
  name: string;
  pin?: string;  // Only for internal use, never sent to client
  role: 'admin' | 'user';
  credits: number;
  plan: 'basic' | 'pro' | 'commander';
  joined_at: Date;
  created_at: Date;
  updated_at: Date;
}

export interface UserSession {
  id: string;
  name: string;
  role: 'admin' | 'user';
  credits: number;
  plan: 'basic' | 'pro' | 'commander';
  joinedAt: number;
  token: string;
}

export class UserModel {
  // Initialize default admin user
  static async initializeAdmin(): Promise<void> {
    try {
      const existingAdmin = await db.query(
        'SELECT id FROM users WHERE role = $1 LIMIT 1',
        ['admin']
      );

      if (existingAdmin.rows.length === 0) {
        const hashedPin = await bcrypt.hash(config.admin.defaultPin, config.bcrypt.rounds);
        await db.query(
          `INSERT INTO users (id, name, pin, role, credits, plan, joined_at) 
           VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
          [
            'admin_001',
            config.admin.defaultName,
            hashedPin,
            'admin',
            config.admin.initialCredits,
            'commander'
          ]
        );
        console.log('✅ Default admin user created');
      }
    } catch (error) {
      console.error('Failed to initialize admin user:', error);
      throw error;
    }
  }

  // Authenticate user with PIN
  static async authenticate(pin: string): Promise<UserSession | null> {
    try {
      const result = await db.query(
        'SELECT * FROM users WHERE pin = $1',
        [pin]
      );

      if (result.rows.length === 0) {
        // Try bcrypt comparison for hashed PINs
        const allUsers = await db.query('SELECT * FROM users');
        for (const user of allUsers.rows) {
          const isMatch = await bcrypt.compare(pin, user.pin);
          if (isMatch) {
            return this.createSession(user);
          }
        }
        return null;
      }

      const user = result.rows[0];
      
      // If PIN is not hashed yet, hash it
      if (!user.pin.startsWith('$2')) {
        const hashedPin = await bcrypt.hash(pin, config.bcrypt.rounds);
        await db.query('UPDATE users SET pin = $1 WHERE id = $2', [hashedPin, user.id]);
      }

      return this.createSession(user);
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  }

  private static createSession(user: any): UserSession {
    const token = jwt.sign(
      { id: user.id, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    return {
      id: user.id,
      name: user.name,
      role: user.role,
      credits: user.credits,
      plan: user.plan,
      joinedAt: new Date(user.joined_at).getTime(),
      token,
    };
  }

  // Get user by ID
  static async getById(id: string): Promise<User | null> {
    const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  // Get all users (admin only)
  static async getAll(): Promise<User[]> {
    const result = await db.query(
      'SELECT id, name, role, credits, plan, joined_at, created_at, updated_at FROM users ORDER BY created_at DESC'
    );
    return result.rows;
  }

  // Update user credits
  static async updateCredits(userId: string, amount: number, operation: 'add' | 'subtract'): Promise<boolean> {
    try {
      const query = operation === 'add'
        ? 'UPDATE users SET credits = credits + $1, updated_at = NOW() WHERE id = $2 AND credits + $1 >= 0 RETURNING credits'
        : 'UPDATE users SET credits = credits - $1, updated_at = NOW() WHERE id = $2 AND credits >= $1 RETURNING credits';
      
      const result = await db.query(query, [amount, userId]);
      return result.rows.length > 0;
    } catch (error) {
      console.error('Failed to update credits:', error);
      return false;
    }
  }

  // Get current credits
  static async getCredits(userId: string): Promise<number> {
    const result = await db.query('SELECT credits FROM users WHERE id = $1', [userId]);
    return result.rows.length > 0 ? result.rows[0].credits : 0;
  }

  // Create new user (for approved requests)
  static async create(name: string, pin: string, role: 'admin' | 'user' = 'user'): Promise<User> {
    const hashedPin = await bcrypt.hash(pin, config.bcrypt.rounds);
    const userId = uuidv4();
    
    const result = await db.query(
      `INSERT INTO users (id, name, pin, role, credits, plan, joined_at) 
       VALUES ($1, $2, $3, $4, $5, $6, NOW()) 
       RETURNING *`,
      [userId, name, hashedPin, role, 500, 'basic']
    );
    
    return result.rows[0];
  }
}
