import express from 'express';

const app = express();

// Sécurité : désactivation du header X-Powered-By
app.disable('x-powered-by');

// Sécurité : limitation de la taille du payload JSON (défense DoS)
app.use(express.json({ limit: '10kb' }));

// Route de santé de l'API
app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

export { app };
