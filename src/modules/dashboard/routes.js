const express = require('express');
const router = express.Router();

const { 
  getSummary, 
  getMonthlyTrends, 
  getCategoryWiseTotals, 
  getRecentTransactions,
  getYearlyComparison
} = require('./controller');
const authenticate = require('../../middleware/auth');
const { authorize } = require('../../middleware/role');

/**
 * @swagger
 * /api/dashboard/summary:
 *   get:
 *     summary: Get comprehensive financial summary
 *     description: Retrieve a comprehensive financial summary including total income, expenses, balance, transaction counts, and key financial metrics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Financial summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Financial summary retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalIncome:
 *                           type: number
 *                           description: Total income amount across all records
 *                           example: 11500
 *                         totalExpense:
 *                           type: number
 *                           description: Total expense amount across all records
 *                           example: 3550
 *                         balance:
 *                           type: number
 *                           description: Net balance (totalIncome - totalExpense)
 *                           example: 7950
 *                         totalTransactions:
 *                           type: integer
 *                           description: Total number of financial transactions
 *                           example: 10
 *                         incomeCount:
 *                           type: integer
 *                           description: Number of income transactions
 *                           example: 4
 *                         expenseCount:
 *                           type: integer
 *                           description: Number of expense transactions
 *                           example: 6
 *                         avgIncome:
 *                           type: number
 *                           description: Average income per transaction
 *                           example: 2875
 *                         avgExpense:
 *                           type: number
 *                           description: Average expense per transaction
 *                           example: 591.67
 *                         savingsRate:
 *                           type: number
 *                           description: Savings rate as percentage
 *                           example: 69.13
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                       example: "2026-04-03T12:30:00.000Z"
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/summary', authenticate, getSummary);

/**
 * @swagger
 * /api/dashboard/monthly:
 *   get:
 *     summary: Get monthly financial trends
 *     description: Retrieve monthly financial trends showing income and expenses over time
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *           minimum: 2020
 *           maximum: 2030
 *           default: 2024
 *         description: Year for which to retrieve monthly trends
 *     responses:
 *       200:
 *         description: Monthly trends retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Monthly trends retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     monthlyTrends:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           month:
 *                             type: string
 *                             example: "January"
 *                           income:
 *                             type: number
 *                             example: 5000
 *                           expense:
 *                             type: number
 *                             example: 1200
 *                           balance:
 *                             type: number
 *                             example: 3800
 *                     year:
 *                       type: integer
 *                       description: Year of the data
 *                       example: 2024
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                       example: "2026-04-03T12:30:00.000Z"
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/monthly', authenticate, authorize('admin', 'analyst'), getMonthlyTrends);

/**
 * @swagger
 * /api/dashboard/category:
 *   get:
 *     summary: Get category-wise financial totals
 *     description: Retrieve financial totals broken down by category
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Category totals retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Category totals retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     categoryTotals:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           category:
 *                             type: string
 *                             example: "Salary"
 *                           type:
 *                             type: string
 *                             enum: [income, expense]
 *                             example: "income"
 *                           total:
 *                             type: number
 *                             example: 5000
 *                           count:
 *                             type: integer
 *                             example: 1
 *       401:
 *         description: Unauthorized - token required or invalid
 *       500:
 *         description: Internal server error
 */
router.get('/category', authenticate, authorize('admin', 'analyst'), getCategoryWiseTotals);

/**
 * @swagger
 * /api/dashboard/recent:
 *   get:
 *     summary: Get recent financial transactions
 *     description: Retrieve most recent financial transactions
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Number of recent transactions to retrieve
 *     responses:
 *       200:
 *         description: Recent transactions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Recent transactions retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     transactions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Record'
 *                     count:
 *                       type: integer
 *                       example: 10
 *       401:
 *         description: Unauthorized - token required or invalid
 *       500:
 *         description: Internal server error
 */
router.get('/recent', authenticate, getRecentTransactions);

/**
 * @swagger
 * /api/dashboard/yearly-comparison:
 *   get:
 *     summary: Get yearly financial comparison
 *     description: Retrieve year-over-year financial comparison data
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: years
 *         schema:
 *           type: string
 *           pattern: '^(20[2-9][0-9],?)+$'
 *         description: Comma-separated list of years to compare
 *     responses:
 *       200:
 *         description: Yearly comparison retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Yearly comparison retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     comparison:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           year:
 *                             type: integer
 *                             example: 2024
 *                           totalIncome:
 *                             type: number
 *                             example: 11500
 *                           totalExpense:
 *                             type: number
 *                             example: 3550
 *                           balance:
 *                             type: number
 *                             example: 7950
 *       401:
 *         description: Unauthorized - token required or invalid
 *       500:
 *         description: Internal server error
 */
router.get('/yearly-comparison', authenticate, authorize('admin', 'analyst'), getYearlyComparison);

module.exports = router;