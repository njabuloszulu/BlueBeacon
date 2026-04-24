import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const station = await prisma.station.findUnique({ where: { id: '1' } });
  if (!station) {
    await prisma.station.create({
      data: {
        id: '1',
        name: 'BlueBeacon Central Station'
      }
    });
  }

  const existingAdmin = await prisma.user.findUnique({ where: { email: 'admin@bluebeacon.local' } });
  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        fullName: 'System Administrator',
        email: 'admin@bluebeacon.local',
        role: 'admin',
        isVerified: true,
        passwordHash: await bcrypt.hash('ChangeMe123!', 12)
      }
    });
  }
}

void main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
