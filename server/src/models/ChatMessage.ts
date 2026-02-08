import db from '../config/database';

export interface ChatMessage {
  id: string;
  user_id: string;
  task_type: string;
  message_id: string;
  text: string;
  sender: 'user' | 'bot';
  created_at: Date;
}

export class ChatMessageModel {
  // Get chat history for a user and task
  static async getHistory(userId: string, taskType: string, limit: number = 100): Promise<ChatMessage[]> {
    const result = await db.query(
      `SELECT * FROM chat_messages 
       WHERE user_id = $1 AND task_type = $2 
       ORDER BY created_at ASC 
       LIMIT $3`,
      [userId, taskType, limit]
    );
    return result.rows;
  }

  // Get all chat histories for a user (grouped by task)
  static async getAllHistories(userId: string): Promise<Record<string, ChatMessage[]>> {
    const result = await db.query(
      'SELECT * FROM chat_messages WHERE user_id = $1 ORDER BY created_at ASC',
      [userId]
    );
    
    const histories: Record<string, ChatMessage[]> = {};
    for (const row of result.rows) {
      if (!histories[row.task_type]) {
        histories[row.task_type] = [];
      }
      histories[row.task_type].push(row);
    }
    
    return histories;
  }

  // Add message to chat history
  static async addMessage(
    userId: string,
    taskType: string,
    messageId: string,
    text: string,
    sender: 'user' | 'bot'
  ): Promise<ChatMessage> {
    const id = `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    const result = await db.query(
      `INSERT INTO chat_messages (id, user_id, task_type, message_id, text, sender, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, NOW()) 
       RETURNING *`,
      [id, userId, taskType, messageId, text, sender]
    );
    
    return result.rows[0];
  }
}
