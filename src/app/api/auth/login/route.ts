import { AuthService } from '@/services/auth.service';
import { handleApiRequest } from '@/utils/api-helper';

export async function POST(request: Request) {
  return handleApiRequest(
    request,
    async (_, body) => {
      if (!body) throw new Error('Request body is missing');
      return AuthService.login(body);
    },
    { rateLimitLimit: 10 } // strict limit for login attempts (10 requests per minute)
  );
}
