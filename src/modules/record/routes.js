const express = require('express');
const router = express.Router();

const { 
  createRecord, 
  getRecords, 
  getRecordById, 
  updateRecord, 
  deleteRecord,
  getCategories 
} = require('./controller');
const authenticate = require('../../middleware/auth');
const { authorize } = require('../../middleware/role');
const validate = require('../../middleware/validation');
const { 
  createRecordSchema, 
  updateRecordSchema, 
  getRecordsSchema 
} = require('../../validations/recordValidation');

/**
 * @swagger
 * components:
 *   schemas:
 *     Record:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Record ID
 *         amount:
 *           type: number
 *           description: Transaction amount
 *         type:
 *           type: string
 *           enum: [income, expense]
 *           description: Transaction type
 *         category:
 *           type: string
 *           description: Transaction category
 *         date:
 *           type: string
 *           format: date
 *           description: Transaction date
 *         note:
 *           type: string
 *           description: Transaction note
 *         createdBy:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             name:
 *               type: string
 *             email:
 *               type: string
 *           description: User who created the record
 *         isDeleted:
 *           type: boolean
 *           description: Soft delete flag
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Record creation date
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update date
 *         formattedAmount:
 *           type: string
 *           description: Formatted amount with sign
 */

/**
 * @swagger
 * /api/records:
 *   post:
 *     summary: Create a new record (Admin only)
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - type
 *               - category
 *             properties:
 *               amount:
 *                 type: number
 *                 minimum: 0.01
 *                 description: Transaction amount
 *               type:
 *                 type: string
 *                 enum: [income, expense]
 *                 description: Transaction type
 *               category:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *                 description: Transaction category
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Transaction date in ISO format
 *               note:
 *                 type: string
 *                 maxLength: 200
 *                 description: Transaction note
 *     responses:
 *       201:
 *         description: Record created successfully
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
 *                     record:
 *                       $ref: '#/components/schemas/Record'
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized - token required or invalid
 *       403:
 *         description: Forbidden - admin access required
 *       500:
 *         description: Internal server error
 */
router.post('/', authenticate, authorize('admin'), validate(createRecordSchema), createRecord);

/**
 * @swagger
 * /api/records:
 *   get:
 *     summary: Retrieve financial records with advanced filtering and pagination
 *     description: Retrieve a paginated list of financial records with support for filtering by type, category, date range, and text search. All authenticated users can access their own records.
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *           example: 1
 *         description: Page number for pagination (starts from 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *           example: 10
 *         description: Number of records per page (max 100)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           example: "salary"
 *         description: Search text in notes, category, or description (case-insensitive)
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [income, expense]
 *           example: "income"
 *         description: Filter by transaction type (income or expense)
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           example: "Salary"
 *         description: Filter by transaction category (case-insensitive partial match)
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-01-01"
 *         description: Filter by start date in ISO format (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-12-31"
 *         description: Filter by end date in ISO format (YYYY-MM-DD)
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [date, amount, category, createdAt]
 *           default: date
 *           example: "date"
 *         description: Sort field for records
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *           example: "desc"
 *         description: Sort order ascending or descending
 *     responses:
 *       200:
 *         description: Records retrieved successfully
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
 *                   example: "Records retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     records:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Record'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *                     filters:
 *                       type: object
 *                       description: Applied filters for this request
 *                       example:
 *                         type: "income"
 *                         category: "Salary"
 *                         page: 1
 *                         limit: 10
 *       400:
 *         description: Bad request - Invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Invalid query parameters"
 *               errors: ["page must be a positive integer"]
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
 *               message: "Internal server error"
 *               timestamp: "2026-04-03T12:30:00.000Z"
 */
router.get('/', authenticate, validate(getRecordsSchema, 'query'), getRecords);

/**
 * @swagger
 * /api/records/categories:
 *   get:
 *     summary: Get all unique categories (All roles)
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
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
 *                     categories:
 *                       type: array
 *                       items:
 *                         type: string
 *       401:
 *         description: Unauthorized - token required or invalid
 *       500:
 *         description: Internal server error
 */
router.get('/categories', authenticate, getCategories);

/**
 * @swagger
 * /api/records/{id}:
 *   get:
 *     summary: Get record by ID (All roles)
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Record ID
 *     responses:
 *       200:
 *         description: Record retrieved successfully
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
 *                     record:
 *                       $ref: '#/components/schemas/Record'
 *       401:
 *         description: Unauthorized - token required or invalid
 *       404:
 *         description: Record not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', authenticate, getRecordById);

/**
 * @swagger
 * /api/records/{id}:
 *   put:
 *     summary: Update record (Admin only)
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Record ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 minimum: 0.01
 *                 description: Transaction amount
 *               type:
 *                 type: string
 *                 enum: [income, expense]
 *                 description: Transaction type
 *               category:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *                 description: Transaction category
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Transaction date in ISO format
 *               note:
 *                 type: string
 *                 maxLength: 200
 *                 description: Transaction note
 *     responses:
 *       200:
 *         description: Record updated successfully
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
 *                     record:
 *                       $ref: '#/components/schemas/Record'
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized - token required or invalid
 *       403:
 *         description: Forbidden - admin access required
 *       404:
 *         description: Record not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', authenticate, authorize('admin'), validate(updateRecordSchema), updateRecord);

/**
 * @swagger
 * /api/records/{id}:
 *   delete:
 *     summary: Delete record (Admin only)
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Record ID
 *     responses:
 *       200:
 *         description: Record deleted successfully
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
 *                     record:
 *                       $ref: '#/components/schemas/Record'
 *       401:
 *         description: Unauthorized - token required or invalid
 *       403:
 *         description: Forbidden - admin access required
 *       404:
 *         description: Record not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', authenticate, authorize('admin'), deleteRecord);

module.exports = router;
