import dotenv from 'dotenv';
dotenv.config();

/**
 * Brevo (Sendinblue) Transactional Email Service
 * Uses Brevo v3 REST API (https://api.brevo.com/v3/smtp/email)
 */

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const SENDER_NAME = process.env.BREVO_SENDER_NAME || 'GlobeTrotter Travel';
const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || 'support@globetrotter.travel';
const BREVO_API_KEY = process.env.BREVO_API_KEY || '';

/**
 * Helper to dispatch an email via Brevo REST API with smart fallback
 */
async function sendBrevoEmail({ toEmail, toName, subject, htmlContent }) {
  console.log(`\n================== [BREVO EMAIL DISPATCH] ==================`);
  console.log(`To: ${toName || 'User'} <${toEmail}>`);
  console.log(`Subject: ${subject}`);

  if (!BREVO_API_KEY || BREVO_API_KEY.includes('your_brevo_api_key')) {
    console.log(`ℹ️ [BREVO DEV MODE] Brevo API Key not configured. Simulating email delivery successfully.`);
    console.log(`============================================================\n`);
    return { success: true, simulated: true, message: 'Email logged in simulation mode' };
  }

  try {
    const payload = {
      sender: {
        name: SENDER_NAME,
        email: SENDER_EMAIL
      },
      to: [
        {
          email: toEmail,
          name: toName || toEmail.split('@')[0]
        }
      ],
      subject: subject,
      htmlContent: htmlContent
    };

    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Brevo API Error:', data);
      return { success: false, error: data.message || 'Failed to send via Brevo', simulated: true };
    }

    console.log('✅ Brevo Email Sent Successfully. MessageId:', data.messageId);
    console.log(`============================================================\n`);
    return { success: true, messageId: data.messageId, simulated: false };
  } catch (error) {
    console.error('❌ Network error contacting Brevo API:', error.message);
    return { success: true, error: error.message, simulated: true };
  }
}

/**
 * Send 6-Digit OTP Email (For signup verification or forgot password)
 */
export async function sendOtpEmail({ toEmail, toName, otpCode, purpose }) {
  const isForgotPassword = purpose === 'forgot_password';
  const actionTitle = isForgotPassword ? 'Password Reset Verification' : 'Verify Your GlobeTrotter Account';
  const description = isForgotPassword
    ? 'We received a request to reset your password. Use the verification code below to proceed:'
    : 'Welcome to GlobeTrotter! Please verify your email address to unlock personalized multi-city trip planning:';

  console.log(`\n🔑 =================== [OTP CODE] ===================`);
  console.log(`🔑 RECIPIENT : ${toEmail}`);
  console.log(`🔑 PURPOSE   : ${purpose}`);
  console.log(`🔑 OTP CODE  : >>> ${otpCode} <<<`);
  console.log(`🔑 EXPIRES IN: 10 Minutes`);
  console.log(`🔑 ====================================================\n`);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f7f6; margin: 0; padding: 20px; color: #1e293b; }
        .container { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 50%, #6366f1 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.5px; }
        .header p { margin: 6px 0 0 0; opacity: 0.9; font-size: 14px; }
        .content { padding: 32px 28px; text-align: center; }
        .greeting { font-size: 18px; font-weight: 600; margin-bottom: 12px; text-align: left; }
        .desc { font-size: 15px; color: #64748b; line-height: 1.6; margin-bottom: 24px; text-align: left; }
        .otp-box { background: #f0fdf4; border: 2px dashed #22c55e; border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center; }
        .otp-label { font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; color: #16a34a; font-weight: 700; margin-bottom: 8px; }
        .otp-digits { font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #0f172a; font-family: monospace; }
        .footer-note { font-size: 13px; color: #94a3b8; line-height: 1.5; margin-top: 24px; }
        .footer { background: #f8fafc; border-top: 1px solid #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🌍 GlobeTrotter</h1>
          <p>Empowering Personalized Travel Planning</p>
        </div>
        <div class="content">
          <div class="greeting">Hello ${toName || 'Traveler'},</div>
          <div class="desc">${description}</div>
          
          <div class="otp-box">
            <div class="otp-label">Your 6-Digit Verification Code</div>
            <div class="otp-digits">${otpCode}</div>
          </div>

          <p class="footer-note">
            ⚠️ This code is valid for <strong>10 minutes</strong>. If you did not request this verification, you can safely ignore this email.
          </p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} GlobeTrotter Inc. Crafted for Odoo Hackathon.
        </div>
      </div>
    </body>
    </html>
  `;

  return sendBrevoEmail({
    toEmail,
    toName,
    subject: `[GlobeTrotter] ${actionTitle} - ${otpCode}`,
    htmlContent
  });
}

/**
 * Send Welcome Email upon successful registration
 */
export async function sendWelcomeEmail({ toEmail, toName }) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f7f6; margin: 0; padding: 20px; color: #1e293b; }
        .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%); padding: 36px 24px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
        .content { padding: 32px 28px; }
        .title { font-size: 20px; font-weight: 700; color: #0f172a; margin-bottom: 16px; }
        .text { font-size: 15px; color: #475569; line-height: 1.6; margin-bottom: 20px; }
        .feature-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 16px; margin-bottom: 12px; display: flex; align-items: center; }
        .feature-icon { font-size: 24px; margin-right: 12px; }
        .feature-text { font-size: 14px; color: #334155; }
        .feature-title { font-weight: 600; color: #0f172a; }
        .btn-container { text-align: center; margin: 28px 0 16px; }
        .btn { background: #0ea5e9; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block; }
        .footer { background: #f8fafc; border-top: 1px solid #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✈️ Welcome to GlobeTrotter!</h1>
        </div>
        <div class="content">
          <div class="title">Hey ${toName || 'Travel Explorer'}, welcome aboard! 🎒</div>
          <p class="text">
            Your travel planning journey just got an upgrade. With GlobeTrotter, designing multi-city vacations, tracking budgets, and visualizing your daily itineraries is effortless.
          </p>

          <div class="feature-card">
            <span class="feature-icon">🗺️</span>
            <div class="feature-text"><span class="feature-title">Multi-City Itinerary Builder:</span> Drag, drop, and arrange stops with automatic day calculations.</div>
          </div>
          <div class="feature-card">
            <span class="feature-icon">💰</span>
            <div class="feature-text"><span class="feature-title">Real-Time Budget Analytics:</span> Track stay, transport, food, and activity costs with visual charts.</div>
          </div>
          <div class="feature-card">
            <span class="feature-icon">🔗</span>
            <div class="feature-text"><span class="feature-title">Collaborative Sharing:</span> Share public links that fellow travelers can view or fork.</div>
          </div>

          <div class="btn-container">
            <a href="http://localhost:5173/dashboard" class="btn">Start Planning Your First Trip &rarr;</a>
          </div>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} GlobeTrotter Inc. • Happy Traveling!
        </div>
      </div>
    </body>
    </html>
  `;

  return sendBrevoEmail({
    toEmail,
    toName,
    subject: `🌍 Welcome to GlobeTrotter, ${toName || 'Explorer'}! Start Planning Your Journey`,
    htmlContent
  });
}
