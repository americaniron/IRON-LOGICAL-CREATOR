import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import { UserModel } from '../models/User';
import { AccessRequestModel } from '../models/AccessRequest';
import { asyncHandler } from '../middleware/errorHandler';
import { authLimiter } from '../middleware/rateLimiter';
import { AuthRequest, authenticateToken } from '../middleware/auth';

const router = express.Router();

// Login endpoint
router.post(
  '/login',
  authLimiter,
  body('pin').isString().trim().isLength({ min: 5, max: 20 }),
  asyncHandler(async (req: any, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input',
        errors: errors.array(),
      });
    }

    const { pin } = req.body;

    const session = await UserModel.authenticate(pin);

    if (!session) {
      return res.status(401).json({
        success: false,
        message: 'CREDENTIAL_FAILURE: ACCESS_DENIED',
      });
    }

    res.json({
      success: true,
      session,
    });
  })
);

// Check session validity
router.get(
  '/session',
  authenticateToken,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ valid: false });
    }

    const user = await UserModel.getById(req.user.id);
    if (!user) {
      return res.status(401).json({ valid: false });
    }

    res.json({
      valid: true,
      session: {
        id: user.id,
        name: user.name,
        role: user.role,
        credits: user.credits,
        plan: user.plan,
        joinedAt: new Date(user.joined_at).getTime(),
      },
    });
  })
);

// Submit access request
router.post(
  '/request-access',
  authLimiter,
  body('name').isString().trim().isLength({ min: 1, max: 255 }),
  body('reason').isString().trim().isLength({ min: 10, max: 1000 }),
  asyncHandler(async (req: any, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input',
        errors: errors.array(),
      });
    }

    const { name, reason } = req.body;

    await AccessRequestModel.create(name, reason);

    res.json({
      success: true,
      message: 'Access request submitted successfully',
    });
  })
);

// Check request status by name
router.get(
  '/request-status/:name',
  asyncHandler(async (req: any, res: Response) => {
    const { name } = req.params;

    const request = await AccessRequestModel.getByName(name);

    if (!request) {
      return res.status(404).json({
        found: false,
        message: 'No request found for this name',
      });
    }

    res.json({
      found: true,
      request: {
        id: request.id,
        name: request.name,
        reason: request.reason,
        status: request.status,
        timestamp: new Date(request.created_at).getTime(),
        generatedPin: request.generated_pin,
      },
    });
  })
);

export default router;
