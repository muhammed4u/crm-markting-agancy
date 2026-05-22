import { NextRequest } from 'next/server';
import { handleApiRequest } from '@/utils/api-helper';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const approveSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']),
  role: z.enum(['ADMIN', 'SALES', 'INSTRUCTOR', 'ACCOUNTANT', 'STUDENT']),
  permissions: z.array(z.string()),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  return handleApiRequest(
    request,
    async (session, body) => {
      if (!session) throw new Error('Unauthorized');
      if (!body) throw new Error('Request body is missing');

      // Validate input body
      const validated = approveSchema.parse(body);

      // Perform updates inside a Prisma Transaction to guarantee atomic consistency
      const updatedUser = await prisma.$transaction(async (tx) => {
        // 1. Update user role and approval status
        const user = await tx.user.update({
          where: { id },
          data: {
            status: validated.status,
            role: validated.role,
          },
        });

        // 2. Clear old permissions
        await tx.userPermission.deleteMany({
          where: { userId: id },
        });

        // 3. Populate new permissions
        if (validated.permissions.length > 0) {
          await tx.userPermission.createMany({
            data: validated.permissions.map((perm) => ({
              userId: id,
              permission: perm,
            })),
          });
        }

        // Return user with relation
        return tx.user.findUnique({
          where: { id },
          include: {
            permissions: true,
          },
        });
      });

      if (!updatedUser) {
        throw new Error('User not found after transaction update');
      }

      return {
        success: true,
        data: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          status: updatedUser.status,
          permissions: updatedUser.permissions.map((p) => p.permission),
        },
      };
    },
    {
      allowedRoles: ['ADMIN'], // Strictly ADMIN only
    }
  );
}
