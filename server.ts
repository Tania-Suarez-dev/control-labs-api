import 'dotenv/config';
import app from './src/app';
import { prisma } from './src/db/prisma';

const PORT = process.env.PORT || 5000;

const shutdown = async (): Promise<void> => {
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

const start = async (): Promise<void> => {
  await prisma.$connect();
  app.listen(PORT, () => {
    console.log(`🚀 Servidor ControlLabs corriendo en http://localhost:${PORT}`);
  });
};

start().catch(async (error) => {
  console.error('No se pudo iniciar el servidor:', error);
  await prisma.$disconnect();
  process.exit(1);
});