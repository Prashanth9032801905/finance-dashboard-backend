const express = require('express');
const router = express.Router();

const { register, login, getProfile } = require('./controller');
const authenticate = require('../../middleware/auth');
const validate = require('../../middleware/validation');
const { registerSchema, loginSchema } = require('../../validations/authValidation');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: User ID
 *         name:
 *           type: string
 *           description: User name
 *         email:
 *           type: string
 *           description: User email
 *         role:
 *           type: string
 *           enum: [admin, analyst, viewer]
 *           description: User role
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *           description: User status
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Account creation date
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update date
 *     
 *     AuthResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             user:
 *               $ref: '#/components/schemas/User'
 *             token:
 *               type: string
 *               description: JWT token
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 description: User name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: User password
 *               role:
 *                 type: string
 *                 enum: [admin, analyst, viewer]
 *                 default: viewer
 *                 description: User role
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Bad request - validation error or user already exists
 *       500:
 *         description: Internal server error
 */
router.post('/register', validate(registerSchema), register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Authenticate user and obtain JWT token
 *     description: Authenticate a user with email and password credentials. Returns a JWT token that must be included in the Authorization header for subsequent API requests.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           example:
 *             email: "admin@finance.com"
 *             password: "admin123"
 *     responses:
 *       200:
 *         description: Login successful - JWT token provided
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *             example:
 *               success: true
 *               message: "Login successful"
 *               data:
 *                 user:
 *                   _id: "60d5ecb74b24a730e3a3e6c7"
 *                   name: "Admin User"
 *                   email: "admin@finance.com"
 *                   role: "admin"
 *                   status: "active"
 *                   createdAt: "2026-04-01T10:00:00.000Z"
 *                   updatedAt: "2026-04-01T10:00:00.000Z"
 *                 token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYwZDVlY2I3NGIyNGE3MzBlM2EzZTZjNyIsImlhdCI6MTYxNDU2NjQwMCwiZXhwIjoxNjE1MTcxMjAwfQ.signature"
 *               timestamp: "2026-04-03T12:30:00.000Z"
 *       400:
 *         description: Bad request - Invalid credentials or validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalid_credentials:
 *                 summary: Invalid email or password
 *                 value:
 *                   success: false
 *                   message: "Invalid email or password"
 *                   timestamp: "2026-04-03T12:30:00.000Z"
 *               validation_error:
 *                 summary: Validation failed
 *                 value:
 *                   success: false
 *                   message: "Validation failed"
 *                   errors: ["Email is required", "Password must be at least 6 characters"]
 *                   timestamp: "2026-04-03T12:30:00.000Z"
 *       401:
 *         description: Unauthorized - Account inactive or credentials invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Account is inactive. Please contact administrator."
 *               timestamp: "2026-04-03T12:30:00.000Z"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Internal server error during login"
 *               timestamp: "2026-04-03T12:30:00.000Z"
 */
router.post('/login', validate(loginSchema), login);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
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
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - token required or invalid
 *       500:
 *         description: Internal server error
 */
router.get('/profile', authenticate, getProfile);

module.exports = router;
