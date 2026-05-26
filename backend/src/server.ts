import app from './app';
import { env } from './config/env';
import { logger } from './config/logger';
import prisma from './config/database';

const server = app.listen(env.PORT, async () => {
  logger.info(`🚀 PPVC Backend server started on port ${env.PORT}`);
  logger.info(`🌍 Environment: ${env.NODE_ENV}`);
  logger.info(`📦 API available at http://localhost:${env.PORT}/api`);
  logger.info(`❤️  Health check: http://localhost:${env.PORT}/api/health`);

  // Verify DB connection
  try {
    await prisma.$connect();
    logger.info('✅ Database connected successfully');
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
  }
});

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  logger.info(`\n📡 Received ${signal}. Graceful shutdown...`);
  server.close(async () => {
    await prisma.$disconnect();
    logger.info('💾 Database disconnected');
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

export default server;
