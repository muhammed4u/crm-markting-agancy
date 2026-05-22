import { NextRequest } from 'next/server';
import { handleApiRequest } from '@/utils/api-helper';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
});

export async function POST(request: NextRequest) {
  return handleApiRequest(
    request,
    async (session, body) => {
      if (!session) throw new Error('Unauthorized');
      if (!body) throw new Error('Request body is missing');

      // Validate body
      const validated = updateProfileSchema.parse(body);

      // Update user profile in database
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          name: validated.name,
          phone: validated.phone || null,
        },
      });

      return {
        success: true,
        message: 'Profile updated successfully',
      };
    },
    {
      allowedRoles: ['ADMIN', 'SALES', 'INSTRUCTOR', 'ACCOUNTANT', 'STUDENT'],
    }
  );
}
