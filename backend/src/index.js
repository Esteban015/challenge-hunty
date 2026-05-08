import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectToWhatsApp, getClient } from './services/whatsapp.js';
import vacancyRoutes from './routes/vacancies.js';
import candidateRoutes from './routes/candidates.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/vacancies', vacancyRoutes);
app.use('/api/vacancies/:id/candidates', candidateRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`[Server] Running on http://localhost:${PORT}`);
  connectToWhatsApp();
});

// Graceful shutdown — lets Chromium flush session data to disk before exiting
async function shutdown(signal) {
  console.log(`\n[Server] ${signal} received, shutting down gracefully…`);
  const client = getClient();
  if (client) {
    try {
      await client.destroy();
      console.log('[WhatsApp] Client destroyed, session saved ✓');
    } catch {
      // ignore
    }
  }
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
