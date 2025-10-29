import { hashPassword } from '../utils/authUtils.js';
import { query } from '../utils/database.js';

/**
 * Get all users with pagination
 */
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, status } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = '';
    const params = [];

    if (role) {
      whereClause += 'WHERE role = ? ';
      params.push(role);
    }

    if (status === 'active') {
      whereClause += whereClause ? 'AND is_active = TRUE' : 'WHERE is_active = TRUE';
    } else if (status === 'inactive') {
      whereClause += whereClause ? 'AND is_active = FALSE' : 'WHERE is_active = FALSE';
    }

    const countResult = await query(`SELECT COUNT(*) as total FROM users ${whereClause}`, params);
    const total = countResult[0]?.total || 0;

    const users = await query(
      `SELECT id, username, email, role, is_active, created_at, last_login FROM users ${whereClause} LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message,
    });
  }
};

/**
 * Get user by ID
 */
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const users = await query(
      'SELECT id, username, email, role, is_active, created_at, last_login FROM users WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      data: users[0],
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error.message,
    });
  }
};

/**
 * Update user
 */
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, role, is_active, first_name, last_name, phone } = req.body;

    const users = await query('SELECT id FROM users WHERE id = ?', [id]);
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check email uniqueness
    if (email) {
      const existing = await query(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, id]
      );
      if (existing.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use',
        });
      }
    }

    const updates = [];
    const values = [];

    if (email !== undefined) {
      updates.push('email = ?');
      values.push(email);
    }
    if (role !== undefined) {
      updates.push('role = ?');
      values.push(role);
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(is_active);
    }
    if (first_name !== undefined) {
      updates.push('first_name = ?');
      values.push(first_name);
    }
    if (last_name !== undefined) {
      updates.push('last_name = ?');
      values.push(last_name);
    }
    if (phone !== undefined) {
      updates.push('phone = ?');
      values.push(phone);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update',
      });
    }

    values.push(id);

    await query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    res.json({
      success: true,
      message: 'User updated successfully',
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message,
    });
  }
};

/**
 * Delete user
 */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting yourself
    if (req.user.id === parseInt(id)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account',
      });
    }

    const users = await query('SELECT id FROM users WHERE id = ?', [id]);
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    await query('DELETE FROM users WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message,
    });
  }
};

/**
 * Reset user password
 */
export const resetUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { new_password } = req.body;

    if (!new_password || new_password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    const users = await query('SELECT id FROM users WHERE id = ?', [id]);
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const hashedPassword = await hashPassword(new_password);

    await query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, id]
    );

    res.json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password',
      error: error.message,
    });
  }
};

/**
 * Get all audit logs
 */
export const getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, user_id, action } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = '';
    const params = [];

    if (user_id) {
      whereClause += 'WHERE user_id = ? ';
      params.push(user_id);
    }

    if (action) {
      whereClause += whereClause ? 'AND action = ? ' : 'WHERE action = ? ';
      params.push(action);
    }

    const countResult = await query(`SELECT COUNT(*) as total FROM audit_logs ${whereClause}`, params);
    const total = countResult[0]?.total || 0;

    const logs = await query(
      `SELECT al.*, u.username FROM audit_logs al
       LEFT JOIN users u ON al.user_id = u.id
       ${whereClause}
       ORDER BY al.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    res.json({
      success: true,
      data: logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit logs',
      error: error.message,
    });
  }
};
