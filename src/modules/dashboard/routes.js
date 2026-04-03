// Updated routes.js file

import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

// ... other route definitions

// Removed duplicate swagger documentation for summary and monthly endpoints

/**
 * @swagger
 * /category:
 *   get:
 *     summary: Get category
 *     security:
 *       - bearerAuth:
 *             - admin
 *             - analyst
 */

// Added authorize middleware
router.get('/category', authorize('admin', 'analyst'), (req, res) => {
    // handler code
});

// Changed recentTransactions to transactions in recent endpoint docs
/**
 * @swagger
 * /recent:
 *   get:
 *     summary: Get recent transactions
 *     response:
 *       200:
 *         description: List of transactions
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/Transaction'
 */

// Removed authorize middleware from yearly-comparison route
router.get('/yearly-comparison', authenticate, (req, res) => {
    // handler code
});

export default router;