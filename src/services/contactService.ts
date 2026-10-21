// Client-side Contact Service with Validation, Honeypot, Rate-Limiting & Multi-Tier Fallback

export interface ContactPayload {
  name: string;
  email: string;
  message: string;
  honeypot?: string;
}

export interface SendResult {
  success: boolean;
  message: string;
  isMailtoFallback?: boolean;
}

const LAST_SENT_KEY = 'portfolio_last_contact_ts';
const MIN_COOLDOWN_SECONDS = 20;

export async function sendContactMessage(payload: ContactPayload): Promise<SendResult> {
  const { name, email, message, honeypot } = payload;

  // 1. Bot Honeypot Check
  if (honeypot && honeypot.trim().length > 0) {
    // Pretend success to bot
    return { success: true, message: 'Message sent successfully.' };
  }

  // 2. Client-side Validation
  const trimmedName = name.trim();
  const trimmedEmail = email.trim();
  const trimmedMessage = message.trim();

  if (trimmedName.length < 2) {
    throw new Error('Please enter a valid name (at least 2 characters).');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    throw new Error('Please enter a valid email address.');
  }

  if (trimmedMessage.length < 5) {
    throw new Error('Message must be at least 5 characters long.');
  }

  // 3. Client-side Rate Limiting (Cooldown between sends)
  const now = Date.now();
  const lastSent = localStorage.getItem(LAST_SENT_KEY);
  if (lastSent) {
    const elapsedSeconds = (now - parseInt(lastSent, 10)) / 1000;
    if (elapsedSeconds < MIN_COOLDOWN_SECONDS) {
      const waitTime = Math.ceil(MIN_COOLDOWN_SECONDS - elapsedSeconds);
      throw new Error(`Please wait ${waitTime} seconds before sending another note.`);
    }
  }

  const receiverEmail = import.meta.env.VITE_CONTACT_RECEIVER_EMAIL || 'sahadat.info01@gmail.com';
  const apiEndpoint = import.meta.env.VITE_CONTACT_API_ENDPOINT || '/api/contact';
  const web3formsKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;

  // 4. Primary Attempt: Send to Backend / Serverless Endpoint
  try {
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: trimmedName,
        email: trimmedEmail,
        message: trimmedMessage,
        honeypot: honeypot || '',
      }),
    });

    if (response.ok) {
      localStorage.setItem(LAST_SENT_KEY, now.toString());
      const data = await response.json();
      return {
        success: true,
        message: data.message || 'Your note has been securely delivered to Sahadat.',
      };
    }
  } catch {
    // Backend API unreachable or running on static hosting like GitHub Pages
  }

  // 5. Secondary Attempt: Direct Web3Forms API if Key configured
  if (web3formsKey) {
    try {
      const w3Response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: web3formsKey,
          name: trimmedName,
          email: trimmedEmail,
          message: trimmedMessage,
          subject: `✉️ Portfolio Inquiry from ${trimmedName}`,
        }),
      });

      if (w3Response.ok) {
        localStorage.setItem(LAST_SENT_KEY, now.toString());
        return {
          success: true,
          message: 'Note delivered directly to Sahadat via secure cloud dispatch.',
        };
      }
    } catch {
      // Fall through to mailto
    }
  }

  // 6. Graceful Fail-Safe: Pre-filled Mailto link to guarantee delivery
  localStorage.setItem(LAST_SENT_KEY, now.toString());
  const subject = encodeURIComponent(`Portfolio Inquiry from ${trimmedName}`);
  const body = encodeURIComponent(
    `Hi Sahadat,\n\nName: ${trimmedName}\nEmail: ${trimmedEmail}\n\nMessage:\n${trimmedMessage}\n\n---\nSent from 3D Sketch Portfolio`
  );
  const mailtoUrl = `mailto:${receiverEmail}?subject=${subject}&body=${body}`;

  // Open email client
  window.open(mailtoUrl, '_blank');

  return {
    success: true,
    message: 'Your default email client has been opened with your note pre-filled to guarantee delivery!',
    isMailtoFallback: true,
  };
}
