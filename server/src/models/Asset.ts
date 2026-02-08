import db from '../config/database';

export interface Asset {
  id: string;
  user_id: string;
  url: string;
  type: 'image' | 'video';
  prompt: string;
  provider: 'Gemini' | 'OpenAI' | 'Grok';
  created_at: Date;
}

export class AssetModel {
  // Get all assets for a user
  static async getByUserId(userId: string, limit: number = 100): Promise<Asset[]> {
    const result = await db.query(
      'SELECT * FROM assets WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2',
      [userId, limit]
    );
    return result.rows;
  }

  // Create new asset
  static async create(
    userId: string,
    url: string,
    type: 'image' | 'video',
    prompt: string,
    provider: 'Gemini' | 'OpenAI' | 'Grok'
  ): Promise<Asset> {
    const assetId = `${provider.toLowerCase()}_${type}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    const result = await db.query(
      `INSERT INTO assets (id, user_id, url, type, prompt, provider, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, NOW()) 
       RETURNING *`,
      [assetId, userId, url, type, prompt, provider]
    );
    
    return result.rows[0];
  }

  // Delete asset
  static async delete(assetId: string, userId: string): Promise<boolean> {
    const result = await db.query(
      'DELETE FROM assets WHERE id = $1 AND user_id = $2',
      [assetId, userId]
    );
    return result.rowCount ? result.rowCount > 0 : false;
  }
}
