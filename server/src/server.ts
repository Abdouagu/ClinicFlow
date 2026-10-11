import { env } from './config/env.js';
import { app } from './app.js';

const server = app.listen(env.PORT, () => {
  console.log(`🚀 ClinicFlow API running on http://localhost:${env.PORT} in ${env.NODE_ENV} mode`);
});

export { server };
