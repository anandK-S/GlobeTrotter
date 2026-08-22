import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from '../config/db.js';
import { JWT_SECRET } from '../middleware/authMiddleware.js';
import { sendOtpEmail, sendWelcomeEmail } from '../services/brevoService.js';

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Register a new user with Profile Photo, Country & Phone Code
 */
export async function register(req, res) {
  try {
    const { name, email, password, role, homeCurrency, avatar_url, country, phone_code, phone_number } = req.body;

    // Strict Validation
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Name must be at least 2 characters long.' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    const db = await getDb();

    // Check existing email
    const existing = await db.get('SELECT id FROM users WHERE LOWER(email) = LOWER(?)', [email.trim()]);
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists. Please log in.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const userId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const userRole = role === 'admin' ? 'admin' : 'traveler';
    const finalCountry = country || 'India';
    const finalPhoneCode = phone_code || '+91';
    const finalPhone = phone_number || '';
    const currency = homeCurrency || (finalCountry === 'India' ? 'INR' : 'USD');
    const defaultAvatar = avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name.trim())}&backgroundColor=b6e3f4`;

    await db.run(`
      INSERT INTO users (id, name, email, password, avatar_url, bio, country, phone_code, phone_number, role, home_currency, preferences, is_verified)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `, [
      userId,
      name.trim(),
      email.trim().toLowerCase(),
      passwordHash,
      defaultAvatar,
      'Passionate traveler exploring the world with GlobeTrotter.',
      finalCountry,
      finalPhoneCode,
      finalPhone,
      userRole,
      currency,
      JSON.stringify(['Culture', 'Foodie', 'Sightseeing'])
    ]);

    // Generate Verification OTP
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    await db.run(`
      INSERT INTO email_verifications (id, email, otp_code, purpose, expires_at)
      VALUES (?, ?, ?, 'signup', ?)
    `, [`otp-${Date.now()}`, email.trim().toLowerCase(), otp, expiresAt]);

    // Send Brevo Emails async
    sendOtpEmail({ toEmail: email.trim().toLowerCase(), toName: name.trim(), otpCode: otp, purpose: 'signup' }).catch(() => {});
    sendWelcomeEmail({ toEmail: email.trim().toLowerCase(), toName: name.trim() }).catch(() => {});

    // Create JWT
    const token = jwt.sign(
      { id: userId, email: email.trim().toLowerCase(), role: userRole, name: name.trim() },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully! Welcome email & OTP dispatched via Brevo.',
      token,
      user: {
        id: userId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        avatar_url: defaultAvatar,
        country: finalCountry,
        phone_code: finalPhoneCode,
        phone_number: finalPhone,
        role: userRole,
        home_currency: currency,
        preferences: ['Culture', 'Foodie', 'Sightseeing'],
        is_verified: 1
      }
    });
  } catch (error) {
    console.error('Registration Error:', error);
    return res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
}

/**
 * Login user
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const db = await getDb();
    const user = await db.get('SELECT * FROM users WHERE LOWER(email) = LOWER(?)', [email.trim()]);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password credentials.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    let parsedPreferences = [];
    try {
      parsedPreferences = JSON.parse(user.preferences || '[]');
    } catch {
      parsedPreferences = [];
    }

    return res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar_url: user.avatar_url,
        bio: user.bio,
        country: user.country || 'India',
        phone_code: user.phone_code || '+91',
        phone_number: user.phone_number || '',
        role: user.role,
        home_currency: user.home_currency,
        preferences: parsedPreferences,
        is_verified: user.is_verified
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ success: false, message: 'Server error during login.' });
  }
}

/**
 * Forgot Password
 */
export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    const db = await getDb();
    const user = await db.get('SELECT id, name, email FROM users WHERE LOWER(email) = LOWER(?)', [email.trim()]);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No registered account found with this email address. Please check your email or create an account.'
      });
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    await db.run('DELETE FROM email_verifications WHERE LOWER(email) = LOWER(?)', [email.trim()]);

    await db.run(`
      INSERT INTO email_verifications (id, email, otp_code, purpose, expires_at)
      VALUES (?, ?, ?, 'forgot_password', ?)
    `, [`otp-${Date.now()}`, email.trim().toLowerCase(), otp, expiresAt]);

    await sendOtpEmail({
      toEmail: user.email,
      toName: user.name,
      otpCode: otp,
      purpose: 'forgot_password'
    });

    return res.json({
      success: true,
      message: 'A 6-digit verification security code has been delivered to your email inbox.'
    });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    return res.status(500).json({ success: false, message: 'Server error initiating password reset.' });
  }
}

/**
 * Reset Password
 */
export async function resetPassword(req, res) {
  try {
    const { email, otpCode, newPassword } = req.body;

    if (!email || !otpCode || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email, OTP code, and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
    }

    const db = await getDb();
    const verification = await db.get(`
      SELECT * FROM email_verifications 
      WHERE LOWER(email) = LOWER(?) AND otp_code = ? AND purpose = 'forgot_password'
      ORDER BY created_at DESC LIMIT 1
    `, [email.trim(), otpCode.trim()]);

    if (!verification) {
      return res.status(400).json({ success: false, message: 'Invalid verification code.' });
    }

    if (new Date(verification.expires_at) < new Date()) {
      return res.status(400).json({ success: false, message: 'Verification code has expired. Please request a new one.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await db.run('UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE LOWER(email) = LOWER(?)', [
      passwordHash,
      email.trim()
    ]);

    await db.run('DELETE FROM email_verifications WHERE id = ?', [verification.id]);

    return res.json({
      success: true,
      message: 'Password has been successfully reset! You can now log in with your new password.'
    });
  } catch (error) {
    console.error('Reset Password Error:', error);
    return res.status(500).json({ success: false, message: 'Server error resetting password.' });
  }
}

/**
 * Verify Signup Email OTP
 */
export async function verifyEmailOtp(req, res) {
  try {
    const { email, otpCode } = req.body;
    if (!email || !otpCode) {
      return res.status(400).json({ success: false, message: 'Email and verification code are required.' });
    }

    const db = await getDb();
    const verification = await db.get(`
      SELECT * FROM email_verifications 
      WHERE LOWER(email) = LOWER(?) AND otp_code = ? AND purpose = 'signup'
      ORDER BY created_at DESC LIMIT 1
    `, [email.trim(), otpCode.trim()]);

    if (!verification) {
      return res.status(400).json({ success: false, message: 'Invalid verification code.' });
    }

    if (new Date(verification.expires_at) < new Date()) {
      return res.status(400).json({ success: false, message: 'Verification code has expired. Please request a new one.' });
    }

    await db.run('UPDATE users SET is_verified = 1 WHERE LOWER(email) = LOWER(?)', [email.trim()]);
    await db.run('DELETE FROM email_verifications WHERE id = ?', [verification.id]);

    const user = await db.get('SELECT * FROM users WHERE LOWER(email) = LOWER(?)', [email.trim()]);
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      message: 'Email successfully verified and account activated!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar_url: user.avatar_url,
        country: user.country,
        phone_code: user.phone_code,
        phone_number: user.phone_number,
        role: user.role,
        home_currency: user.home_currency,
        is_verified: 1
      }
    });
  } catch (error) {
    console.error('Verify Email OTP Error:', error);
    return res.status(500).json({ success: false, message: 'Server error verifying email code.' });
  }
}

/**
 * Get Current User Profile
 */
export async function getProfile(req, res) {
  try {
    const db = await getDb();
    const user = await db.get('SELECT id, name, email, avatar_url, bio, country, phone_code, phone_number, role, home_currency, preferences, is_verified, created_at FROM users WHERE id = ?', [req.user.id]);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const tripStats = await db.get('SELECT COUNT(*) as trip_count, COALESCE(SUM(total_budget), 0) as total_budget FROM trips WHERE user_id = ?', [req.user.id]);
    const wishlistStats = await db.get('SELECT COUNT(*) as wishlist_count FROM saved_wishlist WHERE user_id = ?', [req.user.id]);

    let parsedPreferences = [];
    try {
      parsedPreferences = JSON.parse(user.preferences || '[]');
    } catch {
      parsedPreferences = [];
    }

    return res.json({
      success: true,
      user: {
        ...user,
        preferences: parsedPreferences,
        trip_count: tripStats.trip_count,
        total_budget: tripStats.total_budget,
        wishlist_count: wishlistStats.wishlist_count
      }
    });
  } catch (error) {
    console.error('Get Profile Error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching user profile.' });
  }
}

/**
 * Update Profile
 */
export async function updateProfile(req, res) {
  try {
    const { name, bio, avatar_url, country, phone_code, phone_number, home_currency, preferences } = req.body;
    const db = await getDb();

    const prefsString = Array.isArray(preferences) ? JSON.stringify(preferences) : '[]';

    await db.run(`
      UPDATE users 
      SET name = COALESCE(?, name),
          bio = COALESCE(?, bio),
          avatar_url = COALESCE(?, avatar_url),
          country = COALESCE(?, country),
          phone_code = COALESCE(?, phone_code),
          phone_number = COALESCE(?, phone_number),
          home_currency = COALESCE(?, home_currency),
          preferences = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [name, bio, avatar_url, country, phone_code, phone_number, home_currency, prefsString, req.user.id]);

    return res.json({
      success: true,
      message: 'Profile updated successfully.'
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    return res.status(500).json({ success: false, message: 'Server error updating profile.' });
  }
}

/**
 * Delete Account
 */
export async function deleteAccount(req, res) {
  try {
    const db = await getDb();
    await db.run('DELETE FROM users WHERE id = ?', [req.user.id]);
    return res.json({
      success: true,
      message: 'Your account and all associated trip data have been permanently deleted.'
    });
  } catch (error) {
    console.error('Delete Account Error:', error);
    return res.status(500).json({ success: false, message: 'Server error deleting account.' });
  }
}
