import dotenv from 'dotenv';
dotenv.config();

/**
 * Brevo Transactional Email Service
 * High-reliability email delivery for GlobeTrotter
 */

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const SENDER_NAME = process.env.BREVO_SENDER_NAME || 'GlobeTrotter Travel';
const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || 'anandkumara.r2020@gmail.com';
const BREVO_API_KEY = process.env.BREVO_API_KEY || '';

/**
 * Helper to dispatch an email via Brevo REST API with smart fallback
 */
async function sendBrevoEmail({ toEmail, toName, subject, htmlContent }) {
  console.log(`\n================== [BREVO EMAIL DISPATCH] ==================`);
  console.log(`To: ${toName || 'User'} <${toEmail}>`);
  console.log(`Sender: ${SENDER_NAME} <${SENDER_EMAIL}>`);
  console.log(`Subject: ${subject}`);

  if (!BREVO_API_KEY || BREVO_API_KEY.includes('your_brevo_api_key')) {
    console.log(`[BREVO DEV MODE] Brevo API Key not configured. Simulating email delivery.`);
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
      console.error('Brevo API Error Response:', data);
      return { success: false, error: data.message || 'Failed to send via Brevo', simulated: true };
    }

    console.log('Brevo Email Delivered Successfully. MessageId:', data.messageId);
    console.log(`============================================================\n`);
    return { success: true, messageId: data.messageId, simulated: false };
  } catch (error) {
    console.error('Network error contacting Brevo API:', error.message);
    return { success: true, error: error.message, simulated: true };
  }
}

/**
 * Send 6-Digit Verification Code Email
 */
export async function sendOtpEmail({ toEmail, toName, otpCode, purpose }) {
  const isForgotPassword = purpose === 'forgot_password';
  const actionTitle = isForgotPassword ? 'Password Reset Verification' : 'Email Account Verification';
  const description = isForgotPassword
    ? 'We received a request to reset your password for your GlobeTrotter account. Please use the 6-digit security code below to complete the verification:'
    : 'Welcome to GlobeTrotter. Please verify your email address to unlock multi-city itineraries, budget tracking, and personalized travel curation:';

  console.log(`\n=================== [VERIFICATION CODE] ===================`);
  console.log(`RECIPIENT : ${toEmail}`);
  console.log(`PURPOSE   : ${purpose}`);
  console.log(`CODE      : >>> ${otpCode} <<<`);
  console.log(`EXPIRES IN: 10 Minutes`);
  console.log(`===========================================================\n`);

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
        .desc { font-size: 14px; color: #475569; line-height: 1.6; margin-bottom: 28px; text-align: left; }
        .otp-container { background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 16px; padding: 24px 20px; margin: 24px 0; text-align: center; }
        .otp-label { font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #0284c7; font-weight: 800; margin-bottom: 8px; }
        .otp-digits { font-size: 40px; font-weight: 900; letter-spacing: 10px; color: #0f172a; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
        .security-badge { display: inline-block; background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; font-size: 12px; font-weight: 600; padding: 6px 14px; border-radius: 8px; margin-top: 16px; }
        .footer-note { font-size: 12px; color: #94a3b8; line-height: 1.6; margin-top: 28px; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 20px; }
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
          
          <div class="otp-container">
            <div class="otp-label">6-Digit Verification Code</div>
            <div class="otp-digits">${otpCode}</div>
          </div>

          <div>
            <span class="security-badge">Valid for 10 Minutes</span>
          </div>

          <p class="footer-note">
            If you did not request this security code, please ignore this email or update your account credentials.
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
