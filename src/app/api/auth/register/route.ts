import { AuthService } from '@/services/auth.service';
import { handleApiRequest } from '@/utils/api-helper';

export async function POST(request: Request) {
  return handleApiRequest(
    request,
    async (_, body) => {
      if (!body) throw new Error('Request body is missing');
      return AuthService.register(body);
    },
    { rateLimitLimit: 5 } // strict registration rate limit
  );
}
