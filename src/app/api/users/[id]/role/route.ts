import { NextRequest } from 'next/server';
import { handleApiRequest } from '@/utils/api-helper';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateRoleSchema = z.object({
  role: z.enum(['ADMIN', 'SALES', 'INSTRUCTOR', 'ACCOUNTANT', 'STUDENT']),
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

      // Validate body
      const validated = updateRoleSchema.parse(body);

      // Update user
      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          role: validated.role,
        },
      });

      return {
        success: true,
        data: {
          id: updatedUser.id,
          role: updatedUser.role,
        },
      };
    },
    {
      allowedRoles: ['ADMIN'], // Strictly admin only
    }
  );
}
