import { AuthService } from '@/services/auth.service';
import { handleApiRequest } from '@/utils/api-helper';

export async function GET(request: Request) {
  return handleApiRequest(request, async () => {
    const session = await AuthService.getSession();
    return session || { user: null };
  });
}
