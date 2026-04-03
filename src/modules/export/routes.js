const express = require('express');
const router = express.Router();

const { exportRecords } = require('./controller');
const authenticate = require('../../middleware/auth');

/**
 * @swagger
 * /api/export/records:
 *   get:
 *     summary: Export financial records
 *     description: Export financial records in various formats (JSON, CSV)
 *     tags: [Export]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, csv, excel]
 *           default: json
 *         description: Export format
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for export filter
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for export filter
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [income, expense]
 *         description: Filter by transaction type
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *     responses:
 *       200:
 *         description: Records exported successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *           text/csv:
 *             schema:
 *               type: string
 *       401:
 *         description: Unauthorized - token required or invalid
 *       500:
 *         description: Internal server error
 */
router.get('/records', authenticate, exportRecords);

module.exports = router;
