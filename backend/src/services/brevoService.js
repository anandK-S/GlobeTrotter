import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
dotenv.config();

/**
 * Brevo Transactional Email Service
 * High-speed email dispatch with HTTPS REST API and Nodemailer SMTP fallback
 */

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const SENDER_NAME = process.env.BREVO_SENDER_NAME || 'GlobeTrotter Travel';
const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || 'anandkumara.r2020@gmail.com';
const BREVO_API_KEY = process.env.BREVO_API_KEY || '';
const BREVO_SMTP_KEY = process.env.BREVO_SMTP_KEY || '';
const BREVO_SMTP_USER = process.env.BREVO_SMTP_USER || process.env.BREVO_SENDER_EMAIL || 'anandkumara.r2020@gmail.com';
const BREVO_SMTP_HOST = process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com';
const BREVO_SMTP_PORT = parseInt(process.env.BREVO_SMTP_PORT || '587', 10);
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Create reusable Nodemailer SMTP transporter
let smtpTransporter = null;
if (BREVO_SMTP_KEY) {
  try {
    smtpTransporter = nodemailer.createTransport({
      host: BREVO_SMTP_HOST,
      port: BREVO_SMTP_PORT,
      secure: false,
      auth: {
        user: BREVO_SMTP_USER,
        pass: BREVO_SMTP_KEY
      },
      tls: {
        rejectUnauthorized: false
      }
    });
    console.log(`📡 Brevo SMTP Transporter configured for: ${BREVO_SMTP_USER}`);
  } catch (err) {
    console.error('Failed to initialize SMTP transporter:', err.message);
  }
}

/**
 * Helper to dispatch an email with automatic fallback (REST API -> SMTP -> Dev Simulation)
 */
async function sendBrevoEmail({ toEmail, toName, subject, htmlContent }) {
  console.log(`\n================== [EMAIL DISPATCH] ==================`);
  console.log(`To: ${toName || 'User'} <${toEmail}>`);
  console.log(`Sender: ${SENDER_NAME} <${SENDER_EMAIL}>`);
  console.log(`Subject: ${subject}`);

  // 1. Try Brevo REST API v3 (Lightning-fast over standard HTTPS port 443)
  if (BREVO_API_KEY && !BREVO_API_KEY.includes('your_brevo_api_key')) {
    try {
      console.log(`[REST API] Dispatching via Brevo v3 API (HTTPS)...`);
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

      if (response.ok) {
        console.log('✅ Email Delivered Successfully via Brevo REST API!');
        console.log('MessageId:', data.messageId);
        console.log(`======================================================\n`);
        return { success: true, messageId: data.messageId, method: 'rest', simulated: false };
      } else {
        console.warn('⚠️ Brevo REST API returned:', data.message || data);
      }
    } catch (apiError) {
      console.warn('⚠️ Network error contacting Brevo REST API:', apiError.message);
    }
  }

  // 2. Try Brevo SMTP Relay via Nodemailer
  if (smtpTransporter) {
    try {
      console.log(`[SMTP] Attempting delivery via ${BREVO_SMTP_HOST}:${BREVO_SMTP_PORT}...`);
      const info = await smtpTransporter.sendMail({
        from: `"${SENDER_NAME}" <${SENDER_EMAIL}>`,
        to: `"${toName || toEmail.split('@')[0]}" <${toEmail}>`,
        subject: subject,
        html: htmlContent
      });

      console.log('✅ Email Delivered Successfully via Brevo SMTP Relay!');
      console.log('MessageId:', info.messageId);
      console.log(`======================================================\n`);
      return { success: true, messageId: info.messageId, method: 'smtp', simulated: false };
    } catch (smtpError) {
      console.warn('⚠️ SMTP relay error:', smtpError.message);
    }
  }

  // 3. Fallback Simulation (Development Mode)
  console.log(`ℹ️ [DEV SIMULATION] Email logged locally for testing.`);
  console.log(`======================================================\n`);
  return { success: true, simulated: true, message: 'Email processed in dev mode' };
}

/**
 * Send 6-Digit Verification Code Email with 1-Click Verification Link
 */
export async function sendOtpEmail({ toEmail, toName, otpCode, purpose }) {
  const isForgotPassword = purpose === 'forgot_password';
  const actionTitle = isForgotPassword ? 'Password Reset Verification' : 'Email Account Verification';
  const description = isForgotPassword
    ? 'We received a request to reset your password for your GlobeTrotter account. Click the button below to automatically verify and set your new password, or use the 6-digit code:'
    : 'Welcome to GlobeTrotter. Click the button below to instantly verify your email address and activate your account:';

  const verifyUrl = isForgotPassword
    ? `${CLIENT_URL}/login?mode=reset&email=${encodeURIComponent(toEmail)}&code=${otpCode}`
    : `${CLIENT_URL}/login?mode=verify_signup&email=${encodeURIComponent(toEmail)}&code=${otpCode}`;

  console.log(`\n🔑 =================== [VERIFICATION CODE] ===================`);
  console.log(`🔑 RECIPIENT : ${toEmail}`);
  console.log(`🔑 PURPOSE   : ${purpose}`);
  console.log(`🔑 CODE      : >>> ${otpCode} <<<`);
  console.log(`🔑 LINK      : ${verifyUrl}`);
  console.log(`🔑 EXPIRES IN: 10 Minutes`);
  console.log(`🔑 ===========================================================\n`);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #0f172a; }
        .wrapper { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); padding: 36px 32px; text-align: center; color: #ffffff; }
        .brand-badge { display: inline-block; background: rgba(255, 255, 255, 0.18); backdrop-filter: blur(8px); padding: 4px 14px; border-radius: 100px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 12px; }
        .header h1 { margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; }
        .header p { margin: 6px 0 0 0; opacity: 0.9; font-size: 13px; }
        .content { padding: 36px 32px; text-align: center; }
        .greeting { font-size: 18px; font-weight: 700; margin-bottom: 12px; text-align: left; color: #0f172a; }
        .desc { font-size: 14px; color: #475569; line-height: 1.6; margin-bottom: 24px; text-align: left; }
        .btn-action { display: inline-block; background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); color: #ffffff !important; text-decoration: none; padding: 15px 36px; border-radius: 12px; font-weight: 800; font-size: 15px; box-shadow: 0 6px 20px rgba(2, 132, 199, 0.35); margin: 8px 0 24px 0; }
        .divider { border-top: 1px solid #e2e8f0; margin: 24px 0; position: relative; }
        .divider-text { position: absolute; top: -10px; left: 50%; transform: translateX(-50%); background: #ffffff; padding: 0 12px; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; }
        .otp-container { background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 16px; padding: 20px 20px; margin: 16px 0; text-align: center; }
        .otp-label { font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #0284c7; font-weight: 800; margin-bottom: 6px; }
        .otp-digits { font-size: 36px; font-weight: 900; letter-spacing: 10px; color: #0f172a; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
        .security-badge { display: inline-block; background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; font-size: 12px; font-weight: 600; padding: 6px 14px; border-radius: 8px; margin-top: 12px; }
        .footer-note { font-size: 12px; color: #94a3b8; line-height: 1.6; margin-top: 24px; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 20px; }
        .footer { background: #f8fafc; border-top: 1px solid #f1f5f9; padding: 20px 32px; text-align: center; font-size: 11px; color: #94a3b8; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <div class="brand-badge">GlobeTrotter Travel</div>
          <h1>${actionTitle}</h1>
          <p>Personalized Multi-City Travel Planning</p>
        </div>
        <div class="content">
          <div class="greeting">Hello ${toName || 'Traveler'},</div>
          <div class="desc">${description}</div>
          
          <!-- 1-Click Verification CTA -->
          <div>
            <a href="${verifyUrl}" target="_blank" class="btn-action">
              ${isForgotPassword ? 'Reset Password Directly' : 'Verify Email & Activate Account'}
            </a>
          </div>

          <div class="divider">
            <span class="divider-text">Or Use Verification Code</span>
          </div>

          <div class="otp-container">
            <div class="otp-label">6-Digit Security Code</div>
            <div class="otp-digits">${otpCode}</div>
          </div>

          <div>
            <span class="security-badge">Valid for 10 Minutes</span>
          </div>

          <p class="footer-note">
            If you did not request this verification, please ignore this email or update your account credentials.
          </p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} GlobeTrotter. Built for Odoo Hackathon.
        </div>
      </div>
    </body>
    </html>
  `;

  return sendBrevoEmail({
    toEmail,
    toName,
    subject: `[GlobeTrotter] ${actionTitle}: ${otpCode}`,
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
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #0f172a; }
        .wrapper { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); padding: 36px 32px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 26px; font-weight: 800; }
        .content { padding: 36px 32px; }
        .title { font-size: 19px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
        .text { font-size: 14px; color: #475569; line-height: 1.6; margin-bottom: 20px; }
        .feature-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 16px; margin-bottom: 10px; }
        .feature-title { font-weight: 700; color: #0f172a; font-size: 13px; margin-bottom: 2px; }
        .feature-desc { font-size: 12px; color: #64748b; }
        .footer { background: #f8fafc; border-top: 1px solid #f1f5f9; padding: 20px 32px; text-align: center; font-size: 11px; color: #94a3b8; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <h1>Welcome to GlobeTrotter</h1>
          <p>Your Intelligent Multi-City Travel Hub</p>
        </div>
        <div class="content">
          <div class="title">Welcome, ${toName || 'Traveler'}!</div>
          <p class="text">
            Your GlobeTrotter account is ready. You can now build multi-destination itineraries, visualize interactive flight routes on Leaflet maps, and forecast travel budgets with real-time analytics.
          </p>

          <div class="feature-card">
            <div class="feature-title">Multi-City Route Builder</div>
            <div class="feature-desc">Connect multiple global destinations with flights, trains, and curated daily agendas.</div>
          </div>

          <div class="feature-card">
            <div class="feature-title">Real-Time Financial Telemetry</div>
            <div class="feature-desc">Interactive category charts and stop-by-stop cost breakdown ledgers.</div>
          </div>

          <div class="feature-card">
            <div class="feature-title">Public Sharing & 1-Click Fork</div>
            <div class="feature-desc">Share unique URLs with fellow travelers and clone public itineraries to your space.</div>
          </div>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} GlobeTrotter. Built for Odoo Hackathon.
        </div>
      </div>
    </body>
    </html>
  `;

  return sendBrevoEmail({
    toEmail,
    toName,
    subject: `Welcome to GlobeTrotter, ${toName || 'Traveler'}`,
    htmlContent
  });
}
