import { NextRequest } from 'next/server';
import { handleApiRequest } from '@/utils/api-helper';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const changePasswordSchema = z.object({
  oldPassword: z.string(),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

export async function POST(request: NextRequest) {
  return handleApiRequest(
    request,
    async (session, body) => {
      if (!session) throw new Error('Unauthorized');
      if (!body) throw new Error('Request body is missing');

      // Validate body
      const validated = changePasswordSchema.parse(body);

      // Fetch user with password hash
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
      });

      if (!user || !user.password) {
        throw new Error('User account error');
      }

      // Verify old password
      const isMatch = await bcrypt.compare(validated.oldPassword, user.password);
      if (!isMatch) {
        throw new Error('Incorrect current password');
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(validated.newPassword, 10);

      // Update password
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          password: hashedPassword,
        },
      });

      return {
        success: true,
        message: 'Password changed successfully',
      };
    },
    {
      allowedRoles: ['ADMIN', 'SALES', 'INSTRUCTOR', 'ACCOUNTANT', 'STUDENT'],
    }
  );
}
