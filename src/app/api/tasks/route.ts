import { CrmService } from '@/services/crm.service';
import { handleApiRequest } from '@/utils/api-helper';

export async function GET(request: Request) {
  return handleApiRequest(
    request,
    async (session) => {
      const { searchParams } = new URL(request.url);
      const status = searchParams.get('status') || undefined;
      const search = searchParams.get('search') || undefined;

      return CrmService.getTasks({ status, search }, session!.user);
    },
    { allowedRoles: ['ADMIN', 'SALES', 'INSTRUCTOR', 'ACCOUNTANT'] }
  );
}

export async function POST(request: Request) {
  return handleApiRequest(
    request,
    async (session, body) => {
      if (!body) throw new Error('Request body is missing');
      return CrmService.createTask(body, session!.user);
    },
    { allowedRoles: ['ADMIN', 'SALES', 'INSTRUCTOR'] }
  );
}
