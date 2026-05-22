import { CrmService } from '@/services/crm.service';
import { handleApiRequest } from '@/utils/api-helper';

export async function GET(request: Request) {
  return handleApiRequest(
    request,
    async (session) => {
      const { searchParams } = new URL(request.url);
      const studentId = searchParams.get('studentId') || undefined;
      const status = searchParams.get('status') || undefined;
      const method = searchParams.get('method') || undefined;
      const page = Number(searchParams.get('page')) || 1;
      const limit = Number(searchParams.get('limit')) || 10;

      return CrmService.getPayments({ studentId, status, method, page, limit }, session!.user);
    },
    { allowedRoles: ['ADMIN', 'ACCOUNTANT', 'STUDENT'] }
  );
}

export async function POST(request: Request) {
  return handleApiRequest(
    request,
    async (session, body) => {
      if (!body) throw new Error('Request body is missing');
      return CrmService.createPayment(body, session!.user);
    },
    { allowedRoles: ['ADMIN', 'ACCOUNTANT'] }
  );
}
