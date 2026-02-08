import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import { UserModel } from '../models/User';
import { AssetModel } from '../models/Asset';
import { ChatMessageModel } from '../models/ChatMessage';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest, authenticateToken } from '../middleware/auth';

const router = express.Router();

// All user routes require authentication
router.use(authenticateToken);

// Get user credits
router.get(
  '/credits',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const credits = await UserModel.getCredits(req.user!.id);
    res.json({ credits });
  })
);

// Deduct credits
router.post(
  '/deduct-credits',
  body('amount').isInt({ min: 1 }),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount } = req.body;
    const success = await UserModel.updateCredits(req.user!.id, amount, 'subtract');

    if (!success) {
      return res.status(400).json({
        success: false,
        error: 'INSUFFICIENT_CREDITS',
        message: 'Not enough credits',
      });
    }

    const newCredits = await UserModel.getCredits(req.user!.id);

    res.json({
      success: true,
      credits: newCredits,
    });
  })
);

// Get user assets
router.get(
  '/assets',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const assets = await AssetModel.getByUserId(req.user!.id);
    res.json(assets);
  })
);

// Add asset
router.post(
  '/assets',
  body('url').isURL(),
  body('type').isIn(['image', 'video']),
  body('prompt').isString(),
  body('provider').isIn(['Gemini', 'OpenAI', 'Grok']),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { url, type, prompt, provider } = req.body;
    const asset = await AssetModel.create(req.user!.id, url, type, prompt, provider);

    res.json(asset);
  })
);

// Delete asset
router.delete(
  '/assets/:id',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const success = await AssetModel.delete(id, req.user!.id);

    if (!success) {
      return res.status(404).json({ error: 'Asset not found or unauthorized' });
    }

    res.json({ success: true });
  })
);

// Get chat histories
router.get(
  '/chats',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const histories = await ChatMessageModel.getAllHistories(req.user!.id);
    res.json(histories);
  })
);

// Get chat history for specific task
router.get(
  '/chats/:taskType',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { taskType } = req.params;
    const history = await ChatMessageModel.getHistory(req.user!.id, taskType);
    res.json(history);
  })
);

// Add message to chat
router.post(
  '/chats/:taskType',
  body('messageId').isString(),
  body('text').isString(),
  body('sender').isIn(['user', 'bot']),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { taskType } = req.params;
    const { messageId, text, sender } = req.body;

    const message = await ChatMessageModel.addMessage(
      req.user!.id,
      taskType,
      messageId,
      text,
      sender
    );

    res.json(message);
  })
);

export default router;
