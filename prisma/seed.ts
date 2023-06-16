import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcrypt';

const ADMIN_USER = 'b1@e.com';
const ADMIN_PASSWORD = 'change-me';

const prisma = new PrismaClient()

async function getHashFromPassword(password: string): Promise<string | null> {
  function generateHash(password: string, salt: string): Promise<string | null> {
    return new Promise((resolve) => {
      bcrypt.hash(password, salt, (err, hash) => {
        if (err) resolve(null);
        resolve(hash);
      });
    });
  }

  const salt = await bcrypt.genSalt();
  const hash = await generateHash(password, salt);
  return hash
}

async function main() {
  // Create admin user
  const adminHashPassword = await getHashFromPassword(ADMIN_PASSWORD);
  if (!adminHashPassword) {
    throw new Error('Could not create admin user');
  }
  const admin = await prisma.user.create({
    data: {
      email: ADMIN_USER,
      name: ADMIN_USER,
      password: adminHashPassword,
      role: 'ADMIN',
    }
  });

  await prisma.restriction.create({
    data: {
      name: 'Root',
      rootPath: '/',
      permissions: 7,
      userRestrictions: {
        create: {
          userId: admin.id,
        }
      }
    },
  });

}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
