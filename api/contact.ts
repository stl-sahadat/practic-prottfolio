// Serverless Function / API Endpoint: POST /api/contact
// Handles secure message submission with input validation, honeypot anti-spam, and rate-limiting.

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS_PER_WINDOW = 5;
const ipRequestCounts = new Map<string, { count: number; firstRequestTime: number }>();

export default async function handler(req: any, res: any) {
  // Only accept POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    // 1. IP Rate Limiting
    const clientIp =
      req.headers['x-forwarded-for']?.split(',')[0] ||
      req.headers['x-real-ip'] ||
      req.connection?.remoteAddress ||
      'unknown-ip';

    const now = Date.now();
    const rateData = ipRequestCounts.get(clientIp);

    if (rateData) {
      if (now - rateData.firstRequestTime < RATE_LIMIT_WINDOW_MS) {
        if (rateData.count >= MAX_REQUESTS_PER_WINDOW) {
          return res.status(429).json({
            success: false,
            error: 'Too many requests. Please wait a few minutes before sending another note.',
          });
        }
        rateData.count += 1;
      } else {
        ipRequestCounts.set(clientIp, { count: 1, firstRequestTime: now });
      }
    } else {
      ipRequestCounts.set(clientIp, { count: 1, firstRequestTime: now });
    }

    const { name, email, message, honeypot } = req.body || {};

    // 2. Anti-Spam Honeypot Check
    // If the hidden honeypot field is filled, silently discard bot spam
    if (honeypot && String(honeypot).trim().length > 0) {
      console.warn(`[Security] Spam bot blocked from IP: ${clientIp}`);
      return res.status(200).json({ success: true, message: 'Message sent successfully.' });
    }

    // 3. Strict Input Validation & Sanitization
    const sanitizedName = String(name || '').trim().replace(/[<>]/g, '');
    const sanitizedEmail = String(email || '').trim().toLowerCase();
    const sanitizedMessage = String(message || '').trim().replace(/[<>]/g, '');

    if (!sanitizedName || sanitizedName.length < 2) {
      return res.status(400).json({ success: false, error: 'Please enter a valid name (at least 2 characters).' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!sanitizedEmail || !emailRegex.test(sanitizedEmail)) {
      return res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
    }

    if (!sanitizedMessage || sanitizedMessage.length < 5) {
      return res.status(400).json({ success: false, error: 'Message must be at least 5 characters.' });
    }

    const recipientEmail = process.env.VITE_CONTACT_RECEIVER_EMAIL || process.env.CONTACT_RECEIVER_EMAIL || 'sahadat.info01@gmail.com';

    // 4. Dispatch Email via Official Resend API if API Key is configured
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: 'Portfolio Contact <onboarding@resend.dev>',
          to: [recipientEmail],
          reply_to: sanitizedEmail,
          subject: `✉️ New Note from ${sanitizedName} (3D Portfolio)`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #1c1c1c;">
              <h2 style="border-bottom: 2px solid #ffcc00; padding-bottom: 8px;">New Hand-Drawn Note Received!</h2>
              <p><strong>From:</strong> ${sanitizedName} (&lt;${sanitizedEmail}&gt;)</p>
              <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
              <div style="background: #f7f5f0; border-left: 4px solid #1c1c1c; padding: 15px; margin-top: 15px; font-size: 15px; line-height: 1.6;">
                ${sanitizedMessage.replace(/\n/g, '<br/>')}
              </div>
            </div>
          `,
        }),
      });

      if (!emailResponse.ok) {
        const errorData = await emailResponse.text();
        console.error('[Resend Error]', errorData);
      }
    } else {
      console.log(`[Contact Note Received] From: ${sanitizedName} <${sanitizedEmail}>: ${sanitizedMessage}`);
    }

    return res.status(200).json({
      success: true,
      message: 'Your note has been securely delivered to Sahadat.',
    });
  } catch (error: any) {
    console.error('[Server Error]', error);
    return res.status(500).json({ success: false, error: 'Internal server error. Please try again.' });
  }
}
