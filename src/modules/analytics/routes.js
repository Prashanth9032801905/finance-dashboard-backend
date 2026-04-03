const express = require('express');
const router = express.Router();

const { getAdvancedAnalytics } = require('./controller');
const authenticate = require('../../middleware/auth');
const { authorize } = require('../../middleware/role');

/**
 * @swagger
 * /api/analytics/advanced:
 *   get:
 *     summary: Get advanced financial analytics
 *     description: Retrieve detailed analytics with multiple grouping and filtering options
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for analytics period
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for analytics period
 *       - in: query
 *         name: groupBy
 *         schema:
 *           type: string
 *           enum: [category, monthly, trend, overall]
 *           default: overall
 *         description: Group analytics by category, month, trend, or overall
 *       - in: query
 *         name: metric
 *         schema:
 *           type: string
 *           enum: [total_volume, avg_transaction_size, transaction_frequency]
 *         description: Specific metric to calculate
 *     responses:
 *       200:
 *         description: Advanced analytics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     analytics:
 *                       type: object
 *                     filters:
 *                       type: object
 *                     generatedAt:
 *                       type: string
 *       401:
 *         description: Unauthorized - token required or invalid
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get('/advanced', authenticate, authorize('admin', 'analyst'), getAdvancedAnalytics);

module.exports = router;
