/**
 * PELBIOT Two-Factor Authentication (2FA) Module
 * TOTP-based authentication with Google Authenticator support
 * Includes backup codes and SMS fallback
 */

import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';

/**
 * Generate 2FA Secret and QR Code
 * @param {string} userEmail - User email for QR code
 * @returns {Promise} Secret and QR code data
 */
export async function generate2FASecret(userEmail) {
  try {
    // Generate TOTP secret
    const secret = speakeasy.generateSecret({
      name: `PELBIOT (${userEmail})`,
      issuer: 'PELBIOT',
      length: 32
    });

    // Generate QR code
    const qrCode = await QRCode.toDataURL(secret.otpauth_url);

    return {
      status: 'success',
      secret: secret.base32,
      qrCode,
      backupCodes: generateBackupCodes(),
      manualEntry: secret.otpauth_url
    };
  } catch (error) {
    return {
      status: 'error',
      message: error.message
    };
  }
}

/**
 * Verify TOTP Code
 * @param {string} secret - User's secret
 * @param {string} token - TOTP token to verify
 * @returns {boolean} Is token valid
 */
export function verify2FAToken(secret, token) {
  try {
    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2 // Allow 2 time windows (60 seconds total)
    });

    return verified;
  } catch (error) {
    console.error('2FA Verification Error:', error);
    return false;
  }
}

/**
 * Generate backup codes for account recovery
 * @returns {Array} Array of 10 backup codes
 */
export function generateBackupCodes() {
  const codes = [];
  for (let i = 0; i < 10; i++) {
    // Generate 8-character alphanumeric code
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    codes.push(`${code.substring(0, 4)}-${code.substring(4, 8)}`);
  }
  return codes;
}

/**
 * Verify backup code
 * @param {string} code - Backup code to verify
 * @param {Array} backupCodes - User's backup codes
 * @returns {boolean} Is code valid
 */
export function verifyBackupCode(code, backupCodes) {
  const normalizedCode = code.toUpperCase().replace(/\s/g, '');
  return backupCodes.some(bc => bc.replace(/-/g, '') === normalizedCode);
}

/**
 * Remove used backup code
 * @param {string} code - Backup code to remove
 * @param {Array} backupCodes - User's backup codes
 * @returns {Array} Updated backup codes
 */
export function removeUsedBackupCode(code, backupCodes) {
  const normalizedCode = code.toUpperCase().replace(/\s/g, '');
  return backupCodes.filter(bc => bc.replace(/-/g, '') !== normalizedCode);
}

// ═══════════════════════════════════════════════════════════════════════
// 2FA MIDDLEWARE
// ═══════════════════════════════════════════════════════════════════════

/**
 * Middleware to enforce 2FA verification
 */
export function require2FA(req, res, next) {
  const user = req.user;

  if (!user) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized' });
  }

  if (user.twoFactorEnabled && !user.twoFactorVerified) {
    return res.status(403).json({
      status: 'error',
      message: '2FA verification required'
    });
  }

  next();
}

/**
 * Session tracker for 2FA
 */
export class TwoFactorSessionManager {
  constructor() {
    this.sessions = new Map();
  }

  /**
   * Create temporary session for 2FA
   */
  createSession(userId, email) {
    const sessionId = crypto.randomBytes(16).toString('hex');
    const session = {
      userId,
      email,
      createdAt: Date.now(),
      attempts: 0,
      maxAttempts: 5
    };

    this.sessions.set(sessionId, session);

    // Auto-cleanup after 10 minutes
    setTimeout(() => this.sessions.delete(sessionId), 10 * 60 * 1000);

    return sessionId;
  }

  /**
   * Get session
   */
  getSession(sessionId) {
    return this.sessions.get(sessionId);
  }

  /**
   * Increment failed attempts
   */
  incrementAttempts(sessionId) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.attempts++;
      return session.attempts;
    }
    return -1;
  }

  /**
   * Check if session is locked
   */
  isLocked(sessionId) {
    const session = this.sessions.get(sessionId);
    return session && session.attempts >= session.maxAttempts;
  }

  /**
   * Clear session
   */
  clearSession(sessionId) {
    this.sessions.delete(sessionId);
  }
}

// ═══════════════════════════════════════════════════════════════════════
// 2FA RECOVERY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════

/**
 * Validate 2FA setup
 */
export function validate2FASetup(secret, verificationCode) {
  if (!secret || !verificationCode) {
    return { valid: false, message: 'Secret and code required' };
  }

  if (verificationCode.length !== 6 || !/^\d+$/.test(verificationCode)) {
    return { valid: false, message: 'Invalid code format' };
  }

  const isValid = verify2FAToken(secret, verificationCode);
  if (!isValid) {
    return { valid: false, message: 'Invalid verification code' };
  }

  return { valid: true, message: 'Setup successful' };
}

/**
 * Generate 2FA recovery codes (emergency access)
 */
export function generate2FARecoveryCodes() {
  const codes = [];
  for (let i = 0; i < 5; i++) {
    const code = crypto.randomBytes(6).toString('hex').toUpperCase();
    codes.push(code);
  }
  return codes;
}

export default {
  generate2FASecret,
  verify2FAToken,
  generateBackupCodes,
  verifyBackupCode,
  removeUsedBackupCode,
  require2FA,
  TwoFactorSessionManager,
  validate2FASetup,
  generate2FARecoveryCodes
};
