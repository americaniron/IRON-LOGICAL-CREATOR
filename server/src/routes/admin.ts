import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import { UserModel } from '../models/User';
import { AccessRequestModel } from '../models/AccessRequest';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest, authenticateToken, requireAdmin } from '../middleware/auth';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticateToken, requireAdmin);

// Get all access requests
router.get(
  '/requests',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const requests = await AccessRequestModel.getAll();
    res.json(requests);
  })
);

// Get all users
router.get(
  '/users',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const users = await UserModel.getAll();
    // Remove sensitive data
    const sanitizedUsers = users.map(u => ({
      id: u.id,
      name: u.name,
      role: u.role,
      credits: u.credits,
      plan: u.plan,
      joinedAt: new Date(u.joined_at).getTime(),
    }));
    res.json(sanitizedUsers);
  })
);

// Approve access request
router.post(
  '/approve-request/:id',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    // Get the request
    const requests = await AccessRequestModel.getAll();
    const request = requests.find(r => r.id === id);

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Request already processed' });
    }

    // Generate unique PIN
    let newPin = Math.floor(10000 + Math.random() * 90000).toString();
    const allUsers = await UserModel.getAll();
    
    // Ensure PIN is unique (very unlikely collision but better safe)
    while (allUsers.some(u => u.pin === newPin)) {
      newPin = Math.floor(10000 + Math.random() * 90000).toString();
    }

    // Create new user
    await UserModel.create(request.name, newPin, 'user');

    // Update request status
    await AccessRequestModel.approve(id, newPin);

    res.json({
      success: true,
      message: 'Request approved and user created',
    });
  })
);

// Deny access request
router.post(
  '/deny-request/:id',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    await AccessRequestModel.deny(id);

    res.json({
      success: true,
      message: 'Request denied',
    });
  })
);

// Add credits to user
router.post(
  '/allocate-credits',
  body('userId').isString(),
  body('amount').isInt({ min: 1 }),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId, amount } = req.body;

    const success = await UserModel.updateCredits(userId, amount, 'add');

    if (!success) {
      return res.status(400).json({ error: 'Failed to allocate credits' });
    }

    res.json({
      success: true,
      message: 'Credits allocated successfully',
    });
  })
);

export default router;
