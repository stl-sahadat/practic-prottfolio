import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: process.env.GITHUB_PAGES ? '/practic-prottfolio/' : './',
  plugins: [
    react(),
    {
      name: 'contact-api-dev-middleware',
      configureServer(server) {
        server.middlewares.use('/api/contact', (req, res) => {
          if (req.method === 'POST') {
            let body = '';
            req.on('data', (chunk) => (body += chunk));
            req.on('end', () => {
              try {
                const parsed = JSON.parse(body);
                console.log('📬 [Local Dev Contact API] Received note:', parsed);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(
                  JSON.stringify({
                    success: true,
                    message: `Thank you ${parsed.name}! Your note has been securely delivered to Sahadat.`,
                  })
                );
              } catch {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Invalid JSON body' }));
              }
            });
          } else {
            res.writeHead(405, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Method Not Allowed' }));
          }
        });
      },
    },
  ],
  server: {
    port: 5174,
    host: true,
  },
});
