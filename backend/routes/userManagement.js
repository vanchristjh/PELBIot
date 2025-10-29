/**
 * PELBIOT User Management API
 * Backend API for User Management System
 * Includes CRUD operations, role management, permissions
 */

import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Mock database (in production, use real database)
const users = [];
const roles = [
  { id: 1, name: 'admin', permissions: ['read', 'write', 'delete', 'manage_users'] },
  { id: 2, name: 'manager', permissions: ['read', 'write', 'manage_teams'] },
  { id: 3, name: 'user', permissions: ['read', 'write'] },
  { id: 4, name: 'viewer', permissions: ['read'] }
];

// ═══════════════════════════════════════════════════════════════════════
// USER MANAGEMENT ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════

/**
 * GET /api/users
 * Get all users (paginated)
 */
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Return paginated users without passwords
    const paginatedUsers = users
      .slice(offset, offset + limit)
      .map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });

    res.json({
      status: 'success',
      data: paginatedUsers,
      pagination: {
        page,
        limit,
        total: users.length,
        totalPages: Math.ceil(users.length / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

/**
 * GET /api/users/:id
 * Get single user by ID
 */
router.get('/users/:id', async (req, res) => {
  try {
    const user = users.find(u => u.id === parseInt(req.params.id));
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    const { password, ...userWithoutPassword } = user;
    res.json({
      status: 'success',
      data: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

/**
 * POST /api/users
 * Create new user
 */
router.post('/users', async (req, res) => {
  try {
    const { email, password, firstName, lastName, roleId } = req.body;

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ status: 'error', message: 'Missing required fields' });
    }

    // Check if user exists
    if (users.some(u => u.email === email)) {
      return res.status(400).json({ status: 'error', message: 'Email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = {
      id: users.length + 1,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      roleId: roleId || 3, // default: user role
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      twoFactorEnabled: false,
      lastLogin: null
    };

    users.push(newUser);

    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({
      status: 'success',
      message: 'User created successfully',
      data: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

/**
 * PUT /api/users/:id
 * Update user
 */
router.put('/users/:id', async (req, res) => {
  try {
    const user = users.find(u => u.id === parseInt(req.params.id));
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    const { email, firstName, lastName, roleId, status } = req.body;

    // Update fields
    if (email && email !== user.email) {
      if (users.some(u => u.email === email && u.id !== user.id)) {
        return res.status(400).json({ status: 'error', message: 'Email already exists' });
      }
      user.email = email;
    }
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (roleId) user.roleId = roleId;
    if (status) user.status = status;

    user.updatedAt = new Date();

    const { password: _, ...userWithoutPassword } = user;
    res.json({
      status: 'success',
      message: 'User updated successfully',
      data: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

/**
 * DELETE /api/users/:id
 * Delete user
 */
router.delete('/users/:id', async (req, res) => {
  try {
    const index = users.findIndex(u => u.id === parseInt(req.params.id));
    if (index === -1) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    const deletedUser = users.splice(index, 1)[0];
    const { password: _, ...userWithoutPassword } = deletedUser;

    res.json({
      status: 'success',
      message: 'User deleted successfully',
      data: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// ROLE MANAGEMENT ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════

/**
 * GET /api/roles
 * Get all available roles
 */
router.get('/roles', (req, res) => {
  res.json({
    status: 'success',
    data: roles
  });
});

/**
 * GET /api/roles/:id
 * Get single role
 */
router.get('/roles/:id', (req, res) => {
  const role = roles.find(r => r.id === parseInt(req.params.id));
  if (!role) {
    return res.status(404).json({ status: 'error', message: 'Role not found' });
  }
  res.json({
    status: 'success',
    data: role
  });
});

// ═══════════════════════════════════════════════════════════════════════
// AUTHENTICATION ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════

/**
 * POST /api/auth/login
 * User login
 */
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ status: 'error', message: 'Email and password required' });
    }

    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
    }

    // Check if 2FA is enabled
    if (user.twoFactorEnabled) {
      return res.json({
        status: 'success',
        requiresTwoFactor: true,
        tempToken: jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '5m' }),
        message: '2FA code required'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, roleId: user.roleId },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    user.lastLogin = new Date();

    const { password: _, ...userWithoutPassword } = user;
    res.json({
      status: 'success',
      message: 'Login successful',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

/**
 * POST /api/auth/register
 * User registration
 */
router.post('/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ status: 'error', message: 'All fields required' });
    }

    if (users.some(u => u.email === email)) {
      return res.status(400).json({ status: 'error', message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = {
      id: users.length + 1,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      roleId: 3, // user role
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      twoFactorEnabled: false,
      lastLogin: null
    };

    users.push(newUser);

    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({
      status: 'success',
      message: 'Registration successful',
      data: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

export default router;
