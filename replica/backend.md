# Backend & Email Security Architecture

## 1. Overview
The contact system connects potential clients and enterprise collaborators directly to **Md Sahadat Hossain** (AI Agent Architect & Prompt Engineer) via a multi-tiered, spam-protected, resilient email dispatch architecture.

## 2. Security & Anti-Spam Architecture
- **Honeypot Protection**: A hidden decoy field `website_url_hp` traps automated spam scrapers without affecting legitimate human visitors.
- **Client-Side Cooldown Guard**: Users are rate-limited to 1 submission every 20 seconds using localized timestamps to prevent button spamming.
- **Server Rate Limiting**: The serverless API (`/api/contact`) enforces a strict IP-based rate limit of maximum 5 submissions per 10-minute window.
- **Input Sanitization**: Strip dangerous HTML script tags (`<`, `>`) and enforce RFC 5322 email regex verification before processing.
- **Zero Exposed Secrets**: All sensitive API keys (`RESEND_API_KEY`, `WEB3FORMS_ACCESS_KEY`, `SMTP_PASS`) are loaded strictly from environment variables (`.env`). `.env` is blocked by `.gitignore`.

## 3. Delivery Fallback Tiers
1. **Tier 1 (Serverless / Node API)**: Direct POST to `/api/contact` using official Resend or SMTP dispatch.
2. **Tier 2 (Cloud Dispatch via Web3Forms)**: If hosted statically without backend server (e.g. GitHub Pages), dispatches securely via Web3Forms API.
3. **Tier 3 (Direct Mailto Link)**: If offline or network errors occur, generates a pre-formatted email link opening the user's desktop email client or Gmail web interface so zero messages are ever lost.

## 4. Security Checklist
- [x] Secrets only in env vars, `.env*` in `.gitignore`, nothing secret in client bundles.
- [x] Input validated and sanitized on both client and server routes.
- [x] Rate limits on contact form submissions.
- [x] Honeypot field traps automated spam bots.
- [x] Verified zero credentials in source files.
- [x] `.env.example` created with documentation.
