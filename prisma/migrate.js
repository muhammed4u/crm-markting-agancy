const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Default permissions mapping per role
const DEFAULT_PERMISSIONS = {
  ADMIN: [
    'leads:read', 'leads:write',
    'students:read', 'students:write',
    'courses:read', 'courses:write',
    'payments:read', 'payments:write',
    'attendance:read', 'attendance:write',
    'tasks:read', 'tasks:write',
    'reports:read', 'reports:write',
    'users:read', 'users:write',
    'settings:read', 'settings:write'
  ],
  SALES: [
    'leads:read', 'leads:write',
    'students:read',
    'courses:read',
    'tasks:read', 'tasks:write'
  ],
  INSTRUCTOR: [
    'students:read',
    'courses:read', 'courses:write',
    'attendance:read', 'attendance:write',
    'tasks:read', 'tasks:write'
  ],
  ACCOUNTANT: [
    'payments:read', 'payments:write',
    'reports:read',
    'tasks:read', 'tasks:write'
  ],
  STUDENT: [
    'courses:read',
    'payments:read',
    'attendance:read'
  ]
};

async function main() {
  console.log('Running user access control and permissions migration...');

  const users = await prisma.user.findMany({
    include: {
      permissions: true
    }
  });

  console.log(`Found ${users.length} existing user(s) to check.`);

  let updatedCount = 0;
  for (const user of users) {
    const defaultPerms = DEFAULT_PERMISSIONS[user.role] || [];
    
    // Determine missing permissions
    const existingPermSet = new Set(user.permissions.map(p => p.permission));
    const missingPerms = defaultPerms.filter(p => !existingPermSet.has(p));

    // Update user status and insert missing permissions
    await prisma.$transaction(async (tx) => {
      // 1. Update status to APPROVED
      await tx.user.update({
        where: { id: user.id },
        data: { status: 'APPROVED' }
      });

      // 2. Add default permissions
      if (missingPerms.length > 0) {
        await tx.userPermission.createMany({
          data: missingPerms.map(p => ({
            userId: user.id,
            permission: p
          }))
        });
      }
    });

    console.log(`Migrated user: ${user.email} (${user.role}) - Added ${missingPerms.length} permissions.`);
    updatedCount++;
  }

  console.log(`Migration completed successfully! Processed ${updatedCount} users.`);
}

main()
  .catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
