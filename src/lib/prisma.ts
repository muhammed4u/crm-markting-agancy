import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let prismaClientOptions = {};

// On serverless environments like Vercel, copy the SQLite database to /tmp (which is writable)
if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
  const dbName = 'dev.db';
  const sourcePath = path.join(process.cwd(), 'prisma', dbName);
  const targetPath = path.join('/tmp', dbName);

  try {
    if (!fs.existsSync(targetPath)) {
      if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, targetPath);
        fs.chmodSync(targetPath, 0o666);
        console.log(`Successfully copied SQLite database to /tmp`);
      } else {
        console.error(`Source database file not found at ${sourcePath}`);
      }
    }
    prismaClientOptions = {
      datasources: {
        db: {
          url: `file:${targetPath}`,
        },
      },
    };
  } catch (error) {
    console.error('Failed to copy SQLite database to /tmp:', error);
  }
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    ...prismaClientOptions,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
