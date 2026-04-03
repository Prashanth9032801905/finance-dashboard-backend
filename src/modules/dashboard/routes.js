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
 *     description: Retrieve a comprehensive financial summary including total income, expenses, balance, transaction counts, and key financial metrics. This endpoint provides an overview of the user's financial status.
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
 *                   example: "Summary retrieved successfully"
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
 *                           description: Savings rate as percentage (balance/totalIncome * 100)
 *                           example: 69.13
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2026-04-03T12:30:00.000Z"
 *             example:
 *               success: true
 *               message: "Summary retrieved successfully"
 *               data:
 *                 summary:
 *                   totalIncome: 11500
 *                   totalExpense: 3550
 *                   balance: 7950
 *                   totalTransactions: 10
 *                   incomeCount: 4
 *                   expenseCount: 6
 *                   avgIncome: 2875
 *                   avgExpense: 591.67
 *                   savingsRate: 69.13
 *               timestamp: "2026-04-03T12:30:00.000Z"
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Access denied. No token provided."
 *               timestamp: "2026-04-03T12:30:00.000Z"
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Access denied. Insufficient permissions."
 *               timestamp: "2026-04-03T12:30:00.000Z"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Server error while retrieving summary"
 *               timestamp: "2026-04-03T12:30:00.000Z"
 */
router.get('/summary', authenticate, getSummary);

/**
 * @swagger
 * /api/dashboard/monthly:
 *   get:
 *     summary: Get monthly financial trends
 *     description: Retrieve monthly financial trends showing income and expenses over time. This endpoint helps track financial patterns and identify seasonal variations.
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
 *           example: 2024
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
 *                     trends:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           month:
 *                             type: string
 *                             example: "January"
 *                           monthNumber:
 *                             type: integer
 *                             example: 1
 *                           income:
 *                             type: number
 *                             example: 5000
 *                           expense:
 *                             type: number
 *                             example: 3500
 *                           balance:
 *                             type: number
 *                             example: 1500
 *                     year:
 *                       type: integer
 *                       example: 2024
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2026-04-03T12:30:00.000Z"
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Insufficient permissions (Analyst/Admin only)
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
 *                   properties:
 *                     summary:
 *                       $ref: '#/components/schemas/Summary'
 *       401:
 *         description: Unauthorized - token required or invalid
 *       500:
 *         description: Internal server error
 */
/**
 * @swagger
 * /api/dashboard/summary:
 *   get:
 *     summary: Get financial summary
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Summary retrieved successfully
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
 *                     summary:
 *                       $ref: '#/components/schemas/Summary'
 *       401:
 *         description: Unauthorized - token required or invalid
 *       500:
 *         description: Internal server error
 */
router.get('/summary', authenticate, getSummary);

/**
 * @swagger
 * /api/dashboard/monthly:
 *   get:
 *     summary: Get monthly trends (Admin and Analyst only)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *           default: current year
 *         description: Year for monthly trends
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
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     monthlyTrends:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/MonthlyTrend'
 *                     year:
 *                       type: integer
 *                       description: Year of the data
 *       401:
 *         description: Unauthorized - token required or invalid
 *       403:
 *         description: Forbidden - analyst or admin access required
 *       500:
 *         description: Internal server error
 */
router.get('/monthly', authenticate, authorize('admin', 'analyst'), getMonthlyTrends);

/**
 * @swagger
 * /api/dashboard/category:
 *   get:
 *     summary: Get category-wise totals (All roles)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [income, expense]
 *         description: Filter by transaction type
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
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     categoryTotals:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/CategoryTotal'
 *                     overallCategories:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           category:
 *                             type: string
 *                           total:
 *                             type: number
 *                           count:
 *                             type: integer
 *                           income:
 *                             type: number
 *                           expense:
 *                             type: number
 *                           balance:
 *                             type: number
 *       401:
 *         description: Unauthorized - token required or invalid
 *       500:
 *         description: Internal server error
 */
router.get('/category', authenticate, getCategoryWiseTotals);

/**
 * @swagger
 * /api/dashboard/recent:
 *   get:
 *     summary: Get recent transactions (All roles)
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
 *           default: 5
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
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     recentTransactions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Record'
 *                     limit:
 *                       type: integer
 *                       description: Number of transactions returned
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
 *     summary: Get yearly comparison (Admin and Analyst only)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
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
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     comparison:
 *                       type: object
 *                       properties:
 *                         lastYear:
 *                           type: object
 *                           properties:
 *                             income:
 *                               type: number
 *                             expense:
 *                               type: number
 *                             total:
 *                               type: number
 *                         currentYear:
 *                           type: object
 *                           properties:
 *                             income:
 *                               type: number
 *                             expense:
 *                               type: number
 *                             total:
 *                               type: number
 *                     growth:
 *                       type: object
 *                       properties:
 *                         income:
 *                           type: number
 *                           description: Income growth percentage
 *                         expense:
 *                           type: number
 *                           description: Expense growth percentage
 *                         total:
 *                           type: number
 *                           description: Total growth percentage
 *                     years:
 *                       type: array
 *                       items:
 *                         type: integer
 *                       description: Years compared
 *       401:
 *         description: Unauthorized - token required or invalid
 *       403:
 *         description: Forbidden - analyst or admin access required
 *       500:
 *         description: Internal server error
 */
router.get('/yearly-comparison', authenticate, authorize('admin', 'analyst'), getYearlyComparison);

module.exports = router;
