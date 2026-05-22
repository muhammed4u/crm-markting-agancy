import { AuthService } from '@/services/auth.service';
import { handleApiRequest } from '@/utils/api-helper';

export async function POST(request: Request) {
  return handleApiRequest(request, async () => {
    return AuthService.logout();
  });
}
