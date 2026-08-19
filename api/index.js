let app;
let bootError = null;

try {
  app = require('../src/app');
} catch (error) {
  bootError = error;
  console.error('[vercel] API bootstrap failed:', error.message);
}

if (!app) {
  app = (req, res) => res.status(503).json({
    success: false,
    message: 'Le backend VIRELIA est temporairement indisponible. Vérifiez les variables d’environnement de production.',
    code: 'BACKEND_BOOT_FAILED'
  });
}

module.exports = app;
